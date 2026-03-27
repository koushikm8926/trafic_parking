import React, { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  withSequence,
} from 'react-native-reanimated';
import { GuardData } from '../types';

interface Props {
  guard: GuardData;
  cellSize: number;
  gridWidth: number;
  gridHeight: number;
  onPositionUpdate: (guardId: string, position: number) => void;
}

export const Guard: React.FC<Props> = ({
  guard,
  cellSize,
  gridWidth,
  gridHeight,
  onPositionUpdate,
}) => {
  const position = useSharedValue(guard.startCell);

  useEffect(() => {
    // Calculate the distance and duration for the animation
    const distance = Math.abs(guard.endCell - guard.startCell);
    const duration = (distance / guard.speed) * 1000; // Convert to milliseconds

    // Animate the guard moving back and forth
    position.value = withRepeat(
      withSequence(
        withTiming(guard.endCell, {
          duration: duration,
          easing: Easing.linear,
        }),
        withTiming(guard.startCell, {
          duration: duration,
          easing: Easing.linear,
        })
      ),
      -1, // Infinite repeat
      false
    );
  }, [guard.startCell, guard.endCell, guard.speed]);

  const animatedStyle = useAnimatedStyle(() => {
    let left = 0;
    let top = 0;

    switch (guard.side) {
      case 'right':
        // Guard walks vertically on the right side (last column)
        left = (gridWidth - 1) * cellSize;
        top = position.value * cellSize;
        break;
      case 'left':
        // Guard walks vertically on the left side (first column)
        left = 0;
        top = position.value * cellSize;
        break;
      case 'top':
        // Guard walks horizontally on the top (first row)
        left = position.value * cellSize;
        top = 0;
        break;
      case 'bottom':
        // Guard walks horizontally on the bottom (last row)
        left = position.value * cellSize;
        top = (gridHeight - 1) * cellSize;
        break;
    }

    return {
      transform: [{ translateX: left }, { translateY: top }],
    };
  });

  return (
    <Animated.View
      style={[
        styles.guard,
        {
          width: cellSize * 0.8,
          height: cellSize * 0.8,
        },
        animatedStyle,
      ]}
    >
      <Text style={styles.guardEmoji}>👮</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  guard: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  guardEmoji: {
    fontSize: 30,
  },
});
