import React, { memo, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { GridMetrics } from '../utils/gridUtils';
import { VehicleData } from '../types';

interface Props extends VehicleData {
  metrics: GridMetrics;
  onMoveCommit: (id: string, deltaSteps: number) => void;
  isHinted?: boolean;
}

const SPRING_CONFIG = { damping: 15, stiffness: 200, mass: 0.8 };

const Vehicle = memo(({
  id, x, y, direction, length, color, isTarget,
  metrics, onMoveCommit, isHinted,
}: Props) => {
  const pixelX = metrics.offsetX + x * metrics.cellWidth;
  const pixelY = metrics.offsetY + y * metrics.cellHeight;

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
    sharedX.value = withSpring(metrics.offsetX + x * metrics.cellWidth, SPRING_CONFIG);
    sharedY.value = withSpring(metrics.offsetY + y * metrics.cellHeight, SPRING_CONFIG);
  }, [x, y, metrics.offsetX, metrics.offsetY, metrics.cellWidth, metrics.cellHeight]);

  const gesture = Gesture.Pan()
    .onBegin(() => {
      dragStart.value = { x: sharedX.value, y: sharedY.value };
      // Scale up slightly when dragging
      scale.value = withSpring(1.05, SPRING_CONFIG);
    })
    .onUpdate((e) => {
      // Strict axis lock — ignore cross-axis delta entirely
      if (direction === 'horizontal') {
        const minX = metrics.offsetX; // leftmost grid edge
        const maxX = metrics.offsetX + (metrics.gridWidth - length) * metrics.cellWidth;
        sharedX.value = Math.max(minX, Math.min(
          maxX,
          dragStart.value.x + e.translationX
        ));
      } else {
        const minY = metrics.offsetY;
        const maxY = metrics.offsetY + (metrics.gridHeight - length) * metrics.cellHeight;
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
        ? (sharedX.value - dragStart.value.x) / metrics.cellWidth
        : (sharedY.value - dragStart.value.y) / metrics.cellHeight;

      const steps = Math.round(delta);

      if (steps !== 0) {
        // Delegate collision check + commit to JS
        runOnJS(onMoveCommit)(id, steps);
      } else {
        // Snap back to current position with spring
        sharedX.value = withSpring(metrics.offsetX + x * metrics.cellWidth, SPRING_CONFIG);
        sharedY.value = withSpring(metrics.offsetY + y * metrics.cellHeight, SPRING_CONFIG);
      }
    });

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: sharedX.value },
      { translateY: sharedY.value },
      { scale: scale.value * hintPulse.value },
    ] as any,
  }));

  const w = direction === 'horizontal' ? metrics.cellWidth * length : metrics.cellWidth;
  const h = direction === 'vertical' ? metrics.cellHeight * length : metrics.cellHeight;

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[
        styles.vehicle,
        { width: w - 6, height: h - 6, backgroundColor: color },
        animStyle,
      ]} />
    </GestureDetector>
  );
});

const styles = StyleSheet.create({
  vehicle: {
    position: 'absolute',
    borderRadius: 8,
    // Add a slight top-left padding to center within cell (account for -6 in w/h)
    margin: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
});

export default Vehicle;
