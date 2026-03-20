// src/components/Vehicle.tsx
import React, { memo, useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withSpring, runOnJS, withSequence, withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { CELL_WIDTH, CELL_HEIGHT, GRID_OFFSET_X, GRID_SIZE } from '../utils/gridUtils';
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
  const pixelX = GRID_OFFSET_X + x * CELL_WIDTH;
  const pixelY = gridOffsetY + y * CELL_HEIGHT;

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
    sharedX.value = withSpring(GRID_OFFSET_X + x * CELL_WIDTH, SPRING_CONFIG);
    sharedY.value = withSpring(gridOffsetY + y * CELL_HEIGHT, SPRING_CONFIG);
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
        const maxX = GRID_OFFSET_X + (GRID_SIZE - length) * CELL_WIDTH;
        sharedX.value = Math.max(minX, Math.min(
          maxX,
          dragStart.value.x + e.translationX
        ));
      } else {
        const minY = gridOffsetY;
        const maxY = gridOffsetY + (GRID_SIZE - length) * CELL_HEIGHT;
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
        ? (sharedX.value - dragStart.value.x) / CELL_WIDTH
        : (sharedY.value - dragStart.value.y) / CELL_HEIGHT;

      const steps = Math.round(delta);

      if (steps !== 0) {
        // Delegate collision check + commit to JS
        runOnJS(onMoveCommit)(id, steps);
      } else {
        // Snap back to current position with spring
        sharedX.value = withSpring(GRID_OFFSET_X + x * CELL_WIDTH, SPRING_CONFIG);
        sharedY.value = withSpring(gridOffsetY + y * CELL_HEIGHT, SPRING_CONFIG);
      }
    });

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: sharedX.value },
      { translateY: sharedY.value },
      { scale: scale.value * hintPulse.value },
    ],
  }));

  const w = direction === 'horizontal' ? CELL_WIDTH * length : CELL_WIDTH;
  const h = direction === 'vertical' ? CELL_HEIGHT * length : CELL_HEIGHT;

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[
        styles.vehicle,
        { width: w - 6, height: h - 6, backgroundColor: color },
        isTarget && styles.targetVehicle,
        isHinted && styles.hinted,
        animStyle,
      ]}>
        {/* Car body shine/highlight */}
        <View style={[
          styles.carShine,
          direction === 'horizontal' ? styles.carShineHorizontal : styles.carShineVertical
        ]} />
        
        {/* Windows */}
        <View style={[
          styles.windowsContainer,
          direction === 'horizontal' ? styles.windowsHorizontal : styles.windowsVertical
        ]}>
          <View style={styles.window} />
          {length > 2 && <View style={styles.window} />}
        </View>
        
        {/* Headlights/Taillights */}
        <View style={[
          styles.lightsContainer,
          direction === 'horizontal' ? styles.lightsHorizontal : styles.lightsVertical
        ]}>
          <View style={styles.light} />
          <View style={styles.light} />
        </View>
        
        {/* Target indicator */}
        {isTarget && (
          <View style={styles.targetBadge}>
            <Text style={styles.targetStar}>⭐</Text>
          </View>
        )}
      </Animated.View>
    </GestureDetector>
  );
});

const styles = StyleSheet.create({
  vehicle: {
    position: 'absolute',
    top: 3,
    left: 3,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 12,
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.4)',
    overflow: 'hidden',
  },
  targetVehicle: {
    borderWidth: 5,
    borderColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 18,
  },
  carShine: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    borderRadius: 6,
  },
  carShineHorizontal: {
    top: 6,
    left: 10,
    right: 10,
    height: '35%',
  },
  carShineVertical: {
    left: 6,
    top: 10,
    bottom: 10,
    width: '35%',
  },
  windowsContainer: {
    position: 'absolute',
    flexDirection: 'row',
    gap: 5,
  },
  windowsHorizontal: {
    top: '25%',
    left: '20%',
    right: '20%',
    height: '50%',
  },
  windowsVertical: {
    flexDirection: 'column',
    left: '25%',
    top: '20%',
    bottom: '20%',
    width: '50%',
  },
  window: {
    flex: 1,
    backgroundColor: 'rgba(70, 130, 180, 0.5)',
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 0, 0, 0.4)',
  },
  lightsContainer: {
    position: 'absolute',
  },
  lightsHorizontal: {
    right: 5,
    top: '25%',
    bottom: '25%',
    width: 10,
    justifyContent: 'space-between',
  },
  lightsVertical: {
    bottom: 5,
    left: '25%',
    right: '25%',
    height: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  light: {
    width: 7,
    height: 7,
    backgroundColor: '#FFF59D',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.3)',
    shadowColor: '#FFEB3B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
  },
  targetBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFF',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 15,
  },
  targetStar: {
    fontSize: 16,
  },
  hinted: {
    borderWidth: 5,
    borderColor: '#00FF88',
    shadowColor: '#00FF88',
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 20,
  },
});

export default Vehicle;
