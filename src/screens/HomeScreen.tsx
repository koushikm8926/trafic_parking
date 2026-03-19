import React, { useEffect } from 'react';
import { StyleSheet, ImageBackground, View, Text, Image, Pressable } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withRepeat
} from 'react-native-reanimated';

interface Props {
  navigation: any;
}

export default function HomeScreen({ navigation }: Props) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(scale.value, { damping: 10, stiffness: 120 }) }],
    opacity: withSpring(opacity.value, { damping: 15, stiffness: 150 }),
  }));

  const handlePressIn = () => {
    scale.value = 0.85;
    opacity.value = 0.8;
  };

  const handlePressOut = () => {
    scale.value = 1;
    opacity.value = 1;
  };




  const handlePress = () => {
    // Add a slight delay so the user can feel the button animation
    setTimeout(() => {
      navigation.navigate('LevelSelect');
    }, 200);
  };

  return (
    <ImageBackground
      source={require('../../assets/home.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.topContainer}>
        <Image
          source={require('../../top.png')}
          style={styles.headerImage}
          resizeMode="contain"
        />
      </View>

      <View style={styles.centerContainer}>
        <Animated.View style={animatedStyle}>
          <Pressable
            onPress={handlePress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            hitSlop={0}
            style={styles.pressableContainer}
          >
            <Image
              source={require('../../play.png')}
              style={styles.playButton}
              resizeMode="contain"
            />
          </Pressable>
        </Animated.View>
      </View>


      <View style={styles.footer}>
        <Text style={styles.footerText}>Privacy Policy  •  Terms of Service</Text>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topContainer: {
    paddingTop: 100,
    alignItems: 'center',
    width: '100%',
  },
  headerImage: {
    width: '80%',
    height: 120,
  },

  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pressableContainer: {
    width: 240,
    height: 75,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16, // rounded rectangle
    // Shadow properties
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  playButton: {
    width: '100%',
    height: '100%',
  },
  footer: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
});



