import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { GridMetrics } from '../utils/gridUtils';
import { HazardData } from '../types';

import { PhysicsEntity } from './Vehicle';

interface Props {
  data: HazardData;
  metrics: GridMetrics;
  onRegister?: (id: string, entity: PhysicsEntity) => void;
  onUnregister?: (id: string) => void;
}

export default function Hazard({ data, metrics, onRegister, onUnregister }: Props) {
  const startPixelX = metrics.offsetX + data.startX * metrics.cellWidth;
  const startPixelY = metrics.offsetY + data.startY * metrics.cellHeight;
  const endPixelX = metrics.offsetX + data.endX * metrics.cellWidth;
  const endPixelY = metrics.offsetY + data.endY * metrics.cellHeight;

  // 1D path distance since hazard is horizontal or vertical
  const distCells = Math.max(Math.abs(data.endX - data.startX), Math.abs(data.endY - data.startY));
  
  // Convert speed (cells/sec) to animation duration (ms)
  const duration = (distCells / data.speed) * 1000;

  const sharedX = useSharedValue(startPixelX);
  const sharedY = useSharedValue(startPixelY);

  useEffect(() => {
    // Snap back to start initially or on layout change
    sharedX.value = startPixelX;
    sharedY.value = startPixelY;

    if (startPixelX !== endPixelX) {
      sharedX.value = withRepeat(
        withTiming(endPixelX, { duration, easing: Easing.linear }),
        -1, // Infinite loops
        data.loopType === 'reverse'
      );
    }
    if (startPixelY !== endPixelY) {
      sharedY.value = withRepeat(
        withTiming(endPixelY, { duration, easing: Easing.linear }),
        -1,
        data.loopType === 'reverse'
      );
    }
    
    // Cleanup on unmount safely
    return () => {
      cancelAnimation(sharedX);
      cancelAnimation(sharedY);
    };
  }, [startPixelX, startPixelY, endPixelX, endPixelY, duration, data.loopType]);

  const w = metrics.cellWidth - 10;
  const h = metrics.cellHeight - 10;

  useEffect(() => {
    if (onRegister) {
      onRegister(data.id, {
        getX: () => sharedX.value,
        getY: () => sharedY.value,
        w,
        h,
      });
    }
    return () => {
      if (onUnregister) onUnregister(data.id);
    };
  }, [data.id, w, h, onRegister, onUnregister]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: sharedX.value },
        { translateY: sharedY.value },
      ] as any,
    };
  });

  return (
    <Animated.View style={[
      styles.hazard,
      {
        width: metrics.cellWidth - 10,
        height: metrics.cellHeight - 10,
      },
      animatedStyle
    ]} />
  );
}

const styles = StyleSheet.create({
  hazard: {
    position: 'absolute',
    backgroundColor: '#FF2A2A', // Aggressive bright red
    borderRadius: 8,
    margin: 5,
    borderWidth: 2,
    borderColor: '#7A0000',
    shadowColor: '#FF0000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 15,
    elevation: 8,
  },
});
