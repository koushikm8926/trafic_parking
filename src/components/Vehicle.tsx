import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  SharedValue,
} from 'react-native-reanimated';
import { VehicleData, CellValue } from '../types';
import { canMove } from '../engine/Grid';

interface Props {
  vehicle: VehicleData;
  cellSize: number;
  onCommitMove: (vehicleId: string, deltaX: number, deltaY: number) => void;
  onEscape: (vehicleId: string, direction: string) => void;
  // SharedValues for UI-thread access
  vehiclesSV: SharedValue<VehicleData[]>;
  occupancyMapSV: SharedValue<Map<string, string>>;
  backgroundGridSV: SharedValue<CellValue[][]>;
  gridWidth: number;
  gridHeight: number;
}

export const Vehicle: React.FC<Props> = ({ 
  vehicle, 
  cellSize, 
  onCommitMove, 
  vehiclesSV,
  occupancyMapSV,
  backgroundGridSV,
  gridWidth,
  gridHeight
}) => {
  const isHorizontal = vehicle.direction === 'horizontal';
  
  // Shared values for the gesture translation
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  
  // Track if we've committed an escape to prevent double triggers
  const isEscaping = useSharedValue(false);

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      'worklet';
      
      if (isHorizontal) {
        const deltaX = event.translationX / cellSize;
        const steps = canMove(
          vehicle.id,
          deltaX,
          0,
          vehiclesSV.value,
          occupancyMapSV.value,
          gridWidth,
          gridHeight,
          backgroundGridSV.value
        );
        translateX.value = steps * cellSize;
      } else {
        const deltaY = event.translationY / cellSize;
        const steps = canMove(
          vehicle.id,
          0,
          deltaY,
          vehiclesSV.value,
          occupancyMapSV.value,
          gridWidth,
          gridHeight,
          backgroundGridSV.value
        );
        translateY.value = steps * cellSize;
      }
    })
    .onEnd(() => {
      'worklet';

      const deltaX = Math.round(translateX.value / cellSize);
      const deltaY = Math.round(translateY.value / cellSize);

      if (deltaX !== 0 || deltaY !== 0) {
        runOnJS(onCommitMove)(vehicle.id, deltaX, deltaY);
      }
      
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
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
});
