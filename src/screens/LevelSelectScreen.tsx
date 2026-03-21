import React from 'react';
import { StyleSheet, ImageBackground, View, Image, TouchableOpacity, Text } from 'react-native';
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
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.headerContainer}>
          <Image 
            source={require('../../level-header.png')}
            style={styles.headerImage}
            resizeMode="contain"
          />
        </View>
        
        <View style={styles.centerContainer}>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Game', { levelId: 1 })}
            activeOpacity={0.8}
          >
            <Image 
              source={require('../../play.png')}
              style={styles.playButton}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        <View style={{ flex: 1 }} />
      </SafeAreaView>
      
      <TouchableOpacity 
        style={styles.backButtonContainer}
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}
      >
        <Image 
          source={require('../../araw.png')}
          style={styles.arrowImage}
          resizeMode="contain"
        />
        <Text style={styles.backText}>BACK</Text>
      </TouchableOpacity>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
  },
  headerContainer: {
    paddingTop: 40,
    alignItems: 'center',
    width: '100%',
    // Shadow properties
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  headerImage: {
    width: '75%',
    height: 75,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 200,
    height: 70,
  },
  backButtonContainer: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowImage: {
    width: 60,
    height: 60,
  },
  backText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    marginTop: -5,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
});
