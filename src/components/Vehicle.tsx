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
const WHITE_VAN_IMAGE = require('../../assets/vehicles/white-van.png');

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

    // The key to realistic turning: during the turn phase, the car moves in BOTH
    // the old direction AND the new exit direction simultaneously, tracing an arc.
    // Spring rotation gives the organic, steering-wheel "snap" feel.

    // ── VERTICAL CAR hits TOP or BOTTOM road ──────────────────────────
    if (!isHorizontal && (ef === 'top' || ef === 'bottom')) {
      const goRight   = carCx >= gridWidth / 2;
      const roadY     = ef === 'top' ? 0.5 : gridHeight - 0.5;
      const targetDy  = (roadY - carCy) * W;
      const targetRot = goRight ? Math.PI / 2 : -Math.PI / 2;
      const exitDx    = goRight ? (gridWidth + L + 2) * W : -(gridWidth + L + 2) * W;

      // Front-Pivot Logic: When turning 90deg, the center shifts by half-length
      // To keep the 'front' on the road centerline:
      const pivotOffsetX = goRight ? (L/2) * W : -(L/2) * W;
      
      const arcDuration = 450;

      rotation.value = withSpring(targetRot, { damping: 20, stiffness: 150 });

      // Move center to front-aligned position — body follows front into lane
      translateY.value = withTiming(targetDy, { duration: arcDuration, easing: Easing.out(Easing.quad) });
      translateX.value = withTiming(pivotOffsetX, {
        duration: arcDuration,
        easing: Easing.inOut(Easing.quad),
      }, (done) => {
        'worklet';
        if (done) {
          translateX.value = withTiming(exitDx, {
            duration: 600,
            easing: Easing.in(Easing.cubic),
          }, (done2) => {
            'worklet';
            if (done2) runOnJS(onEscape)(vehicle.id);
          });
        }
      });
      return;
    }

    // ── HORIZONTAL CAR hits LEFT or RIGHT road ────────────────────────
    if (isHorizontal && (ef === 'left' || ef === 'right')) {
      const goTop     = carCy <= gridHeight / 2;
      const roadX     = ef === 'left' ? 0.5 : gridWidth - 0.5;
      const targetDx  = (roadX - carCx) * W;
      const cornerY   = goTop ? 0.5 : gridHeight - 0.5;
      const targetDy  = (cornerY - carCy) * W;
      const exitRight = ef === 'right';
      const exitRot   = exitRight ? 0 : Math.PI;
      const exitDx    = exitRight ? (gridWidth + L + 2) * W : -(gridWidth + L + 2) * W;
      const vertRot   = goTop ? -Math.PI / 2 : Math.PI / 2;

      // Front-Pivot Logic for entering vertical lane
      const pivotOffsetY = goTop ? -(L/2) * W : (L/2) * W;
      const arcDuration = 450;

      rotation.value = withSpring(vertRot, { damping: 20, stiffness: 150 });

      // Phase 1: Front-pivot arc into the vertical road lane
      translateX.value = withTiming(targetDx, { duration: arcDuration, easing: Easing.out(Easing.quad) });
      translateY.value = withTiming(pivotOffsetY, {
        duration: arcDuration,
        easing: Easing.inOut(Easing.quad),
      }, (done) => {
        'worklet';
        if (done) {
          // Cruise along vertical lane
          const cruiseDuration = Math.max(150, Math.abs(targetDy - pivotOffsetY) / W * 150);
          translateY.value = withTiming(targetDy, {
            duration: cruiseDuration,
            easing: Easing.linear,
          }, (done2) => {
            'worklet';
            if (!done2) return;
            
            // Phase 3: Final turn to exit orientation
            const finalPivotX = exitRight ? (L/2) * W : -(L/2) * W;
            rotation.value = withSpring(exitRot, { damping: 20, stiffness: 150 });
            
            translateX.value = withTiming(targetDx + finalPivotX, {
              duration: 350,
              easing: Easing.out(Easing.quad),
            }, (done3) => {
              'worklet';
              if (!done3) return;
              translateX.value = withTiming(exitDx + targetDx, {
                duration: 600,
                easing: Easing.in(Easing.cubic),
              }, (done4) => {
                'worklet';
                if (done4) runOnJS(onEscape)(vehicle.id);
              });
            });
          });
        }
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
        rotation.value = withSpring(0);
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
            backgroundColor: (vehicle.color === '#34C759' || vehicle.color === '#007AFF') ? 'transparent' : vehicle.color,
          },
          isHinted && styles.hintedVehicle,
          animatedStyle,
        ]}
      >
        {(vehicle.color === '#34C759' || vehicle.color === '#007AFF') ? (
          <Image 
            source={vehicle.color === '#34C759' ? GREEN_BUS_IMAGE : WHITE_VAN_IMAGE}
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
