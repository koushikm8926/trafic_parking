import React from 'react';
import { StyleSheet, ImageBackground, View, Text, TouchableOpacity, Image } from 'react-native';

interface Props {
  navigation: any;
}

export default function HomeScreen({ navigation }: Props) {
  return (
    <ImageBackground
      source={require('../../assets/home.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.centerContainer}>
        <TouchableOpacity
          onPress={() => navigation.navigate('LevelSelect')}
          activeOpacity={0.8}
        >
          <Image
            source={require('../../play.png')}
            style={styles.playButton}
            resizeMode="contain"
          />
        </TouchableOpacity>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 200,
    height: 200,
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
