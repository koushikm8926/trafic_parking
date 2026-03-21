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

interface Props {
  vehicle: VehicleData;
  cellSize: number;
  onCommitMove: (vehicleId: string, deltaX: number, deltaY: number) => void;
  onEscape: (vehicleId: string, direction: string) => void;
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
  vehiclesSV,
  occupancyMapSV,
  backgroundGridSV,
  gridWidth,
  gridHeight,
  isHinted
}) => {
  const isHorizontal = vehicle.direction === 'horizontal';
  
  // Shared values for the gesture translation
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  
  // Track the position that's currently 'committed' in the store
  // to prevent flickering when the base position jumps
  const committedX = useSharedValue(vehicle.x);
  const committedY = useSharedValue(vehicle.y);

  // Sync committed shared values when props change
  useEffect(() => {
    committedX.value = vehicle.x;
    committedY.value = vehicle.y;
    // Reset translation as the base position has updated
    translateX.value = 0;
    translateY.value = 0;
  }, [vehicle.x, vehicle.y]);

  // Track if we've committed an escape to prevent double triggers
  const isEscaping = useSharedValue(false);
  
  // Track last blocked step to avoid excessive haptics
  const lastBlockedStep = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      'worklet';
      runOnJS(haptics.selection)();
    })
    .onUpdate((event) => {
      'worklet';
      
      if (isHorizontal) {
        // Find maximum integer steps in both directions for collision boundaries
        const maxRight = canMove(vehicle.id, gridWidth, 0, vehiclesSV.value, occupancyMapSV.value, gridWidth, gridHeight, backgroundGridSV.value);
        const maxLeft = canMove(vehicle.id, -gridWidth, 0, vehiclesSV.value, occupancyMapSV.value, gridWidth, gridHeight, backgroundGridSV.value);
        
        // Clamp the raw translation between the allowed boundaries
        const limitRight = maxRight * cellSize;
        const limitLeft = maxLeft * cellSize;
        translateX.value = Math.max(limitLeft, Math.min(event.translationX, limitRight));

        // Haptic on boundary hit
        const steps = Math.round(translateX.value / cellSize);
        if (lastBlockedStep.value !== steps) {
          if (translateX.value === limitRight || translateX.value === limitLeft) {
            runOnJS(haptics.impact)('light');
          }
          lastBlockedStep.value = steps;
        }
      } else {
        // Find maximum integer steps in both directions for collision boundaries
        const maxDown = canMove(vehicle.id, 0, gridHeight, vehiclesSV.value, occupancyMapSV.value, gridWidth, gridHeight, backgroundGridSV.value);
        const maxUp = canMove(vehicle.id, 0, -gridHeight, vehiclesSV.value, occupancyMapSV.value, gridWidth, gridHeight, backgroundGridSV.value);
        
        // Clamp the raw translation between the allowed boundaries
        const limitDown = maxDown * cellSize;
        const limitUp = maxUp * cellSize;
        translateY.value = Math.max(limitUp, Math.min(event.translationY, limitDown));

        // Haptic on boundary hit
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

      // Thresholds to trigger slide
      const translationThreshold = cellSize * 0.15;
      const velocityThreshold = 100;

      if (isHorizontal) {
        let direction = 0;
        if (Math.abs(finalTranslateX) > translationThreshold) {
          direction = Math.sign(finalTranslateX);
        } else if (Math.abs(vx) > velocityThreshold) {
          direction = Math.sign(vx);
        }

        if (direction !== 0) {
          deltaX = canMove(vehicle.id, direction * gridWidth, 0, vehiclesSV.value, occupancyMapSV.value, gridWidth, gridHeight, backgroundGridSV.value);
        }
      } else {
        let direction = 0;
        if (Math.abs(finalTranslateY) > translationThreshold) {
          direction = Math.sign(finalTranslateY);
        } else if (Math.abs(vy) > velocityThreshold) {
          direction = Math.sign(vy);
        }

        if (direction !== 0) {
          deltaY = canMove(vehicle.id, 0, direction * gridHeight, vehiclesSV.value, occupancyMapSV.value, gridWidth, gridHeight, backgroundGridSV.value);
        }
      }

      if (deltaX !== 0 || deltaY !== 0) {
        // Find final position in pixels
        const targetX = deltaX * cellSize;
        const targetY = deltaY * cellSize;

        // Calculate dynamic duration based on distance to ensure constant speed
        const distance = Math.abs(isHorizontal ? (targetX - finalTranslateX) : (targetY - finalTranslateY));
        const cellsMoved = distance / cellSize;
        // 200ms per cell for a consistent, deliberate slide without a maximum time cap
        const calculatedDuration = Math.max(200, cellsMoved * 200);

        // Slide animation
        const onFinish = (finished?: boolean) => {
          'worklet';
          if (finished) {
            runOnJS(haptics.selection)();
            runOnJS(onCommitMove)(vehicle.id, deltaX, deltaY);
            // translateX/Y will be reset in useEffect when props change
          }
        };

        const config = {
          duration: calculatedDuration,
          easing: Easing.out(Easing.cubic), // Suited for a smoother stop
        };

        if (isHorizontal) {
          translateX.value = withTiming(targetX, config, onFinish);
          translateY.value = withTiming(targetY, config);
        } else {
          translateX.value = withTiming(targetX, config);
          translateY.value = withTiming(targetY, config, onFinish);
        }
      } else {
        // Snap back if no move was made
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
      
      lastBlockedStep.value = 0;
    });

  const animatedStyle = useAnimatedStyle(() => {
    // Compensation logic:
    // If vehicle.x changed on JS thread but translateX hasn't been reset to 0 yet on UI thread,
    // we subtract the difference to keep the visual position stable.
    const offsetX = (vehicle.x - committedX.value) * cellSize;
    const offsetY = (vehicle.y - committedY.value) * cellSize;

    return {
      transform: [
        { translateX: translateX.value - offsetX },
        { translateY: translateY.value - offsetY },
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
            backgroundColor: vehicle.color,
          },
          isHinted && styles.hintedVehicle,
          animatedStyle,
        ]}
      >
        <Animated.View style={styles.inner}>
          <Text style={styles.idText}>{vehicle.id.toUpperCase()}</Text>
        </Animated.View>
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
