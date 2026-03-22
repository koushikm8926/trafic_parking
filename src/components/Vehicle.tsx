import React, { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
  runOnJS,
  SharedValue,
} from 'react-native-reanimated';
import { VehicleData, CellValue } from '../types';
import { canMove } from '../engine/Grid';
import { haptics } from '../utils/haptics';
import { Image } from 'react-native';

const GREEN_BUS_IMAGE = require('../../assets/vehicles/green-bus.png');

interface Props {
  vehicle: VehicleData;
  cellSize: number;
  onCommitMove: (vehicleId: string, deltaX: number, deltaY: number) => void;
  onEscape: (vehicleId: string) => void;
  // SharedValues for UI-thread access
  vehiclesSV: SharedValue<VehicleData[]>;
  occupancyMapSV: SharedValue<Record<string, string>>;
  backgroundGridSV: SharedValue<CellValue[][]>;
  gridWidth: number;
  gridHeight: number;
  isHinted?: boolean;
}

export const Vehicle: React.FC<Props> = ({
  vehicle,
  cellSize,
  onCommitMove,
  onEscape,
  vehiclesSV,
  occupancyMapSV,
  backgroundGridSV,
  gridWidth,
  gridHeight,
  isHinted
}) => {
  const isHorizontal = vehicle.direction === 'horizontal';

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotation  = useSharedValue(0);

  const committedX = useSharedValue(vehicle.x);
  const committedY = useSharedValue(vehicle.y);
  const wasEscaping = React.useRef(false);

  // Sync to store when vehicle moves normally
  useEffect(() => {
    committedX.value = vehicle.x;
    committedY.value = vehicle.y;
    if (!vehicle.isEscaping) {
      translateX.value = 0;
      translateY.value = 0;
      rotation.value  = 0;
      wasEscaping.current = false;
    }
  }, [vehicle.x, vehicle.y, vehicle.isEscaping]);

  // ─── Lane-Exit Animation ───────────────────────────────────────────
  useEffect(() => {
    if (!vehicle.isEscaping || wasEscaping.current) return;
    wasEscaping.current = true;

    const W  = cellSize;
    const L  = vehicle.length;
    const ef = vehicle.escapedFrom; // 'top' | 'bottom' | 'left' | 'right'

    // Current visual center of the car in grid units (relative to its top-left x,y)
    const carCx = vehicle.x + (isHorizontal ? L / 2 : 0.5);
    const carCy = vehicle.y + (isHorizontal ? 0.5 : L / 2);

    // Helper: animate one waypoint and continue chain
    const animate = (
      dxPx: number,           // accumulated translateX target in pixels
      dyPx: number,           // accumulated translateY target in pixels
      rotRad: number,         // target rotation in radians
      durationMs: number,
      next: () => void
    ) => {
      'worklet';
      rotation.value  = withTiming(rotRad, { duration: durationMs });
      translateX.value = withTiming(dxPx,  { duration: durationMs });
      translateY.value = withTiming(dyPx,  { duration: durationMs, easing: Easing.out(Easing.quad) }, (done) => {
        'worklet';
        if (done) next();
      });
    };

    // ── VERTICAL CAR hits TOP or BOTTOM road ──────────────────────────
    if (!isHorizontal && (ef === 'top' || ef === 'bottom')) {
      // Which side does the car exit?  left-half → left exit, right-half → right exit
      const goRight = carCx >= gridWidth / 2;

      // Step 1: rotate 90° to become horizontal, slide to road center y
      const roadY   = ef === 'top' ? 0.5 : gridHeight - 0.5; // center of top/bottom road row
      const targetDy = (roadY - carCy) * W;                  // delta from original position
      const targetRot = goRight ? Math.PI / 2 : -Math.PI / 2; // face right or left

      // Step 2: slide off-screen horizontally
      const exitDx = goRight ? (gridWidth + L) * W : -(gridWidth + L) * W;

      animate(0, targetDy, targetRot, 350, () => {
        'worklet';
        const offScreenDx = exitDx - (carCx - (vehicle.x + (isHorizontal ? L / 2 : 0.5))) * W;
        // After rotation the car is visually horizontal; slide it off
        translateX.value = withTiming(exitDx, { duration: 700, easing: Easing.in(Easing.quad) }, (done) => {
          'worklet';
          if (done) runOnJS(onEscape)(vehicle.id);
        });
      });
      return;
    }

    // ── HORIZONTAL CAR hits LEFT or RIGHT road ────────────────────────
    if (isHorizontal && (ef === 'left' || ef === 'right')) {
      const goTop    = carCy <= gridHeight / 2;       // nearest horizontal highway
      const roadX    = ef === 'left' ? 0.5 : gridWidth - 0.5;  // center of left/right road lane
      const targetDx = (roadX - carCx) * W;          // snap car centre to road lane x

      // Choose nearer corner (top row centre y=0.5 or bottom row centre y=gridHeight-0.5)
      const cornerY   = goTop ? 0.5 : gridHeight - 0.5;
      const targetDy1 = (cornerY - carCy) * W;       // drive to the corner

      // After turning at corner: same exit side → left or right
      const exitRight = ef === 'right';
      const exitRot   = exitRight ? 0 : Math.PI;     // face right or left again
      const exitDx    = exitRight ? (gridWidth + L) * W : -(gridWidth + L) * W;

      const vertRot = goTop ? -Math.PI / 2 : Math.PI / 2; // face up or down

      // Step 1: rotate vertical, snap to road lane x, start driving to corner
      animate(targetDx, 0, vertRot, 300, () => {
        'worklet';
        // Step 2: drive along vertical lane to top/bottom road
        translateX.value = withTiming(targetDx, { duration: 50 });
        translateY.value = withTiming(targetDy1, { duration: Math.abs(targetDy1) / W * 180 + 200, easing: Easing.linear }, (done) => {
          'worklet';
          if (!done) return;
          // Step 3: rotate back to horizontal (facing exit direction)
          rotation.value  = withTiming(exitRot, { duration: 300 });
          // Step 4: drive off-screen
          translateX.value = withTiming(exitDx + targetDx, { duration: 700, easing: Easing.in(Easing.quad) }, (done2) => {
            'worklet';
            if (done2) runOnJS(onEscape)(vehicle.id);
          });
        });
      });
      return;
    }

    // Fallback: just remove immediately
    runOnJS(onEscape)(vehicle.id);
  }, [vehicle.isEscaping]);
  // ──────────────────────────────────────────────────────────────────

  const isEscapingShared = useSharedValue(false);
  const lastBlockedStep  = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .enabled(!vehicle.isEscaping)  // disable dragging while escaping
    .onBegin(() => {
      'worklet';
      runOnJS(haptics.selection)();
    })
    .onUpdate((event) => {
      'worklet';

      if (isHorizontal) {
        const maxRight = canMove(vehicle.id, gridWidth,  0, vehiclesSV.value, occupancyMapSV.value, gridWidth, gridHeight, backgroundGridSV.value);
        const maxLeft  = canMove(vehicle.id, -gridWidth, 0, vehiclesSV.value, occupancyMapSV.value, gridWidth, gridHeight, backgroundGridSV.value);
        const limitRight = maxRight * cellSize;
        const limitLeft  = maxLeft  * cellSize;
        translateX.value = Math.max(limitLeft, Math.min(event.translationX, limitRight));

        const steps = Math.round(translateX.value / cellSize);
        if (lastBlockedStep.value !== steps) {
          if (translateX.value === limitRight || translateX.value === limitLeft) {
            runOnJS(haptics.impact)('light');
          }
          lastBlockedStep.value = steps;
        }
      } else {
        const maxDown = canMove(vehicle.id, 0,  gridHeight, vehiclesSV.value, occupancyMapSV.value, gridWidth, gridHeight, backgroundGridSV.value);
        const maxUp   = canMove(vehicle.id, 0, -gridHeight, vehiclesSV.value, occupancyMapSV.value, gridWidth, gridHeight, backgroundGridSV.value);
        const limitDown = maxDown * cellSize;
        const limitUp   = maxUp   * cellSize;
        translateY.value = Math.max(limitUp, Math.min(event.translationY, limitDown));

        const steps = Math.round(translateY.value / cellSize);
        if (lastBlockedStep.value !== steps) {
          if (translateY.value === limitDown || translateY.value === limitUp) {
            runOnJS(haptics.impact)('light');
          }
          lastBlockedStep.value = steps;
        }
      }
    })
    .onEnd((event) => {
      'worklet';

      const finalTranslateX = translateX.value;
      const finalTranslateY = translateY.value;
      const vx = event.velocityX;
      const vy = event.velocityY;

      let deltaX = 0;
      let deltaY = 0;

      const translationThreshold = cellSize * 0.15;
      const velocityThreshold = 100;

      if (isHorizontal) {
        let direction = 0;
        if (Math.abs(finalTranslateX) > translationThreshold)      direction = Math.sign(finalTranslateX);
        else if (Math.abs(vx) > velocityThreshold)                  direction = Math.sign(vx);

        if (direction !== 0) {
          deltaX = canMove(vehicle.id, direction * gridWidth, 0, vehiclesSV.value, occupancyMapSV.value, gridWidth, gridHeight, backgroundGridSV.value);
        }
      } else {
        let direction = 0;
        if (Math.abs(finalTranslateY) > translationThreshold)      direction = Math.sign(finalTranslateY);
        else if (Math.abs(vy) > velocityThreshold)                  direction = Math.sign(vy);

        if (direction !== 0) {
          deltaY = canMove(vehicle.id, 0, direction * gridHeight, vehiclesSV.value, occupancyMapSV.value, gridWidth, gridHeight, backgroundGridSV.value);
        }
      }

      if (deltaX !== 0 || deltaY !== 0) {
        const targetX = deltaX * cellSize;
        const targetY = deltaY * cellSize;
        const distance = Math.abs(isHorizontal ? (targetX - finalTranslateX) : (targetY - finalTranslateY));
        const cellsMoved = distance / cellSize;
        const calculatedDuration = Math.max(200, cellsMoved * 200);

        const onFinish = (finished?: boolean) => {
          'worklet';
          if (finished) {
            runOnJS(haptics.selection)();
            runOnJS(onCommitMove)(vehicle.id, deltaX, deltaY);
          }
        };

        const config = {
          duration: calculatedDuration,
          easing: Easing.out(Easing.cubic),
        };

        if (isHorizontal) {
          translateX.value = withTiming(targetX, config, onFinish);
          translateY.value = withTiming(targetY, config);
        } else {
          translateX.value = withTiming(targetX, config);
          translateY.value = withTiming(targetY, config, onFinish);
        }
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }

      lastBlockedStep.value = 0;
    });

  const animatedStyle = useAnimatedStyle(() => {
    const offsetX = (vehicle.x - committedX.value) * cellSize;
    const offsetY = (vehicle.y - committedY.value) * cellSize;
    return {
      transform: [
        { translateX: translateX.value - offsetX },
        { translateY: translateY.value - offsetY },
        { rotateZ: `${rotation.value}rad` },
      ] as any,
    };
  });

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={[
          styles.vehicle,
          {
            width: isHorizontal ? vehicle.length * cellSize - 4 : cellSize - 4,
            height: isHorizontal ? cellSize - 4 : vehicle.length * cellSize - 4,
            top: vehicle.y * cellSize + 2,
            left: vehicle.x * cellSize + 2,
            backgroundColor: (vehicle.color === '#34C759') ? 'transparent' : vehicle.color,
          },
          isHinted && styles.hintedVehicle,
          animatedStyle,
        ]}
      >
        {(vehicle.color === '#34C759') ? (
          <Image 
            source={GREEN_BUS_IMAGE}
            style={[
              styles.vehicleImage,
              {
                // The image source is vertical (length > width)
                width: cellSize - 4,
                height: vehicle.length * cellSize - 4,
                transform: [{ rotate: isHorizontal ? '-90deg' : '0deg' }]
              }
            ]}
            resizeMode="stretch"
          />
        ) : (
          <Animated.View style={styles.inner}>
            <Text style={styles.idText}>{vehicle.id.toUpperCase()}</Text>
          </Animated.View>
        )}
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  vehicle: {
    position: 'absolute',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  vehicleImage: {
    position: 'absolute',
  },
  inner: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
  },
  idText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '900',
    opacity: 0.6,
  },
  hintedVehicle: {
    borderWidth: 4,
    borderColor: '#FFCC00',
    shadowColor: '#FFCC00',
    shadowRadius: 10,
    shadowOpacity: 1,
    elevation: 10,
  },
});
