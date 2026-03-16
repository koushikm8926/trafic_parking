// src/components/Vehicle.tsx
import React, { memo, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withSpring, runOnJS, withSequence, withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { CELL_SIZE, GRID_OFFSET_X, GRID_SIZE } from '../utils/gridUtils';
import { VehicleData } from '../types';

interface Props extends VehicleData {
  gridOffsetY: number;
  onMoveCommit: (id: string, deltaSteps: number) => void;
  isHinted?: boolean;
}

const SPRING_CONFIG = { damping: 15, stiffness: 200, mass: 0.8 };

const Vehicle = memo(({
  id, x, y, direction, length, color, isTarget,
  gridOffsetY, onMoveCommit, isHinted,
}: Props) => {
  const pixelX = GRID_OFFSET_X + x * CELL_SIZE;
  const pixelY = gridOffsetY + y * CELL_SIZE;

  const sharedX = useSharedValue(pixelX);
  const sharedY = useSharedValue(pixelY);
  const dragStart = useSharedValue({ x: pixelX, y: pixelY });
  const scale = useSharedValue(1);
  const hintPulse = useSharedValue(1);

  // Animate hint pulsing effect
  useEffect(() => {
    if (isHinted) {
      hintPulse.value = withSequence(
        withTiming(1.1, { duration: 300 }),
        withTiming(1, { duration: 300 }),
        withTiming(1.1, { duration: 300 }),
        withTiming(1, { duration: 300 })
      );
    } else {
      hintPulse.value = 1;
    }
  }, [isHinted]);

  // Sync position when committed move changes x/y props
  useEffect(() => {
    sharedX.value = withSpring(GRID_OFFSET_X + x * CELL_SIZE, SPRING_CONFIG);
    sharedY.value = withSpring(gridOffsetY + y * CELL_SIZE, SPRING_CONFIG);
  }, [x, y, gridOffsetY]);

  const gesture = Gesture.Pan()
    .onBegin(() => {
      dragStart.value = { x: sharedX.value, y: sharedY.value };
      // Scale up slightly when dragging
      scale.value = withSpring(1.05, SPRING_CONFIG);
    })
    .onUpdate((e) => {
      // Strict axis lock — ignore cross-axis delta entirely
      if (direction === 'horizontal') {
        const minX = GRID_OFFSET_X; // leftmost grid edge
        const maxX = GRID_OFFSET_X + (GRID_SIZE - length) * CELL_SIZE;
        sharedX.value = Math.max(minX, Math.min(
          maxX,
          dragStart.value.x + e.translationX
        ));
      } else {
        const minY = gridOffsetY;
        const maxY = gridOffsetY + (GRID_SIZE - length) * CELL_SIZE;
        sharedY.value = Math.max(minY, Math.min(
          maxY,
          dragStart.value.y + e.translationY
        ));
      }
    })
    .onEnd((e) => {
      // Scale back to normal
      scale.value = withSpring(1, SPRING_CONFIG);
      
      // Calculate snapped grid steps
      const delta = direction === 'horizontal'
        ? (sharedX.value - dragStart.value.x) / CELL_SIZE
        : (sharedY.value - dragStart.value.y) / CELL_SIZE;

      const steps = Math.round(delta);

      if (steps !== 0) {
        // Delegate collision check + commit to JS
        runOnJS(onMoveCommit)(id, steps);
      } else {
        // Snap back to current position with spring
        sharedX.value = withSpring(GRID_OFFSET_X + x * CELL_SIZE, SPRING_CONFIG);
        sharedY.value = withSpring(gridOffsetY + y * CELL_SIZE, SPRING_CONFIG);
      }
    });

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: sharedX.value },
      { translateY: sharedY.value },
      { scale: scale.value * hintPulse.value },
    ],
  }));

  const w = direction === 'horizontal' ? CELL_SIZE * length : CELL_SIZE;
  const h = direction === 'vertical' ? CELL_SIZE * length : CELL_SIZE;

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[
        styles.vehicle,
        { width: w - 4, height: h - 4, backgroundColor: color },
        isTarget && styles.targetVehicle,
        isHinted && styles.hinted,
        animStyle,
      ]}>
        {isTarget && (
          <View style={styles.targetLabel}>
            <View style={styles.starIcon} />
          </View>
        )}
      </Animated.View>
    </GestureDetector>
  );
});

const styles = StyleSheet.create({
  vehicle: {
    position: 'absolute',
    top: 2, left: 2,
    borderRadius: 6,
    elevation: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  targetVehicle: {
    borderWidth: 3,
    borderColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 5,
  },
  targetLabel: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  starIcon: {
    width: 20,
    height: 20,
    backgroundColor: '#FFD700',
    transform: [{ rotate: '45deg' }],
  },
  hinted: {
    borderWidth: 3,
    borderColor: '#00FF00',
    shadowColor: '#00FF00',
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
});

export default Vehicle;
