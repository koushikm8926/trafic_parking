import React, { memo, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
  runOnJS,
  withSequence,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { GridMetrics } from '../utils/gridUtils';
import { VehicleData } from '../types';

export interface PhysicsEntity {
  getX: () => number;
  getY: () => number;
  w: number;
  h: number;
}

interface Props extends VehicleData {
  metrics: GridMetrics;
  onSwipe?: (id: string, dir: number) => void;
  isHinted?: boolean;
  onRegister?: (id: string, entity: PhysicsEntity) => void;
  onUnregister?: (id: string) => void;
}

const SPRING_CONFIG = { damping: 15, stiffness: 200, mass: 0.8 };

const Vehicle = memo(({
  id, x, y, direction, length, color, isTarget,
  metrics, onSwipe, isHinted, onRegister, onUnregister
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
    const newPixelX = metrics.offsetX + x * metrics.cellWidth;
    const newPixelY = metrics.offsetY + y * metrics.cellHeight;
    
    // Tween animation based on distance for smooth slide
    const distCells = Math.max(
      Math.abs(sharedX.value - newPixelX) / metrics.cellWidth,
      Math.abs(sharedY.value - newPixelY) / metrics.cellHeight
    );
    
    if (distCells > 0) {
      const duration = Math.max(250, distCells * 40); 
      sharedX.value = withTiming(newPixelX, { duration, easing: Easing.out(Easing.quad) });
      sharedY.value = withTiming(newPixelY, { duration, easing: Easing.out(Easing.quad) });
    } else {
      sharedX.value = newPixelX;
      sharedY.value = newPixelY;
    }
  }, [x, y, metrics.offsetX, metrics.offsetY, metrics.cellWidth, metrics.cellHeight]);

  const w = direction === 'horizontal' ? metrics.cellWidth * length : metrics.cellWidth;
  const h = direction === 'vertical' ? metrics.cellHeight * length : metrics.cellHeight;

  useEffect(() => {
    if (onRegister) {
      onRegister(id, {
        getX: () => sharedX.value,
        getY: () => sharedY.value,
        w: w - 6,
        h: h - 6,
      });
    }
    return () => {
      if (onUnregister) onUnregister(id);
    };
  }, [id, w, h, onRegister, onUnregister]);

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
      
      const swipeThreshold = 5;
      let dir = 0;

      if (direction === 'horizontal') {
        if (e.translationX > swipeThreshold) dir = 1;
        else if (e.translationX < -swipeThreshold) dir = -1;
      } else {
        if (e.translationY > swipeThreshold) dir = 1;
        else if (e.translationY < -swipeThreshold) dir = -1;
      }

      if (dir !== 0 && onSwipe) {
        runOnJS(onSwipe)(id, dir);
      } else {
        // Snap back to current position
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
