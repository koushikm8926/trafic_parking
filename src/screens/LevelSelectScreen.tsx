import React from 'react';
import { StyleSheet, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Props {
  navigation: any;
}

export default function LevelSelectScreen({ navigation }: Props) {
  return (
    <ImageBackground
      source={require('../../levels.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safeArea} edges={['top']} />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
});


