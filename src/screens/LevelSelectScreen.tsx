import React from 'react';
import { StyleSheet, ImageBackground, View, Image } from 'react-native';
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
        <View style={{ flex: 1 }} />
      </SafeAreaView>
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
});



