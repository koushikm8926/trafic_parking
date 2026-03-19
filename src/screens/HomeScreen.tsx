import React from 'react';
import { StyleSheet, ImageBackground } from 'react-native';

interface Props {
  navigation: any;
}

export default function HomeScreen({ navigation }: Props) {
  return (
    <ImageBackground
      source={require('../../assets/home.png')}
      style={styles.container}
      resizeMode="cover"
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
