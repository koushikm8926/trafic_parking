import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface ConfettiParticleProps {
  index: number;
}

const COLORS = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#F7B731', '#5F27CD', '#00D2D3'];

function ConfettiParticle({ index }: ConfettiParticleProps) {
  const translateY = useSharedValue(-20);
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    const startX = (Math.random() - 0.5) * width;
    const endX = startX + (Math.random() - 0.5) * 100;
    const duration = 2000 + Math.random() * 1000;

    translateY.value = withTiming(height + 50, {
      duration,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });

    translateX.value = withSequence(
      withTiming(startX, { duration: 0 }),
      withTiming(endX, { duration, easing: Easing.linear })
    );

    rotate.value = withRepeat(
      withTiming(360, { duration: 1000, easing: Easing.linear }),
      -1
    );

    opacity.value = withSequence(
      withTiming(1, { duration: duration * 0.7 }),
      withTiming(0, { duration: duration * 0.3 })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: translateY.value },
        { translateX: translateX.value },
        { rotate: `${rotate.value}deg` },
      ],
      opacity: opacity.value,
    } as any;
  });

  const color = COLORS[index % COLORS.length];

  return (
    <Animated.View
      style={[
        styles.particle,
        animatedStyle,
        { backgroundColor: color },
      ]}
    />
  );
}

interface ConfettiEffectProps {
  particleCount?: number;
}

export default function ConfettiEffect({ particleCount = 50 }: ConfettiEffectProps) {
  return (
    <View style={styles.container} pointerEvents="none">
      {Array.from({ length: particleCount }).map((_, index) => (
        <ConfettiParticle key={index} index={index} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    top: 0,
    left: width / 2,
  },
});
