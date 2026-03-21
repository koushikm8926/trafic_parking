import React, { useState, useCallback } from 'react';
import { StyleSheet, ImageBackground, View, Image, TouchableOpacity, Text, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { isLevelUnlocked, getLevelStats, LevelStats } from '../utils/storage';

interface Props {
  navigation: any;
}

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 4;
const ITEM_SIZE = (width - 60) / COLUMN_COUNT;

export default function LevelSelectScreen({ navigation }: Props) {
  const [levelData, setLevelData] = useState<Record<number, { unlocked: boolean, stats: LevelStats | null }>>({});

  useFocusEffect(
    useCallback(() => {
      const data: Record<number, { unlocked: boolean, stats: LevelStats | null }> = {};
      for (let i = 1; i <= 20; i++) {
        data[i] = {
          unlocked: isLevelUnlocked(i),
          stats: getLevelStats(i),
        };
      }
      setLevelData(data);
    }, [])
  );

  const renderLevels = () => {
    const levels = [];
    for (let i = 1; i <= 20; i++) {
      const isUnlocked = levelData[i]?.unlocked ?? false;
      const stats = levelData[i]?.stats;

      levels.push(
        <TouchableOpacity
          key={`level-${i}`}
          style={[styles.levelItem, !isUnlocked && styles.levelItemLocked]}
          onPress={() => isUnlocked && navigation.navigate('Game', { levelId: i })}
          activeOpacity={isUnlocked ? 0.7 : 1}
        >
          {isUnlocked ? (
            <>
              <Text style={styles.levelNumber}>{i}</Text>
              {stats && (
                <View style={styles.starsContainer}>
                  <Text style={styles.starText}>{'⭐'.repeat(stats.stars)}</Text>
                </View>
              )}
            </>
          ) : (
            <Text style={styles.lockIcon}>🔒</Text>
          )}
        </TouchableOpacity>
      );
    }
    return levels;
  };

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
        
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.levelGrid}>
            {renderLevels()}
          </View>
        </ScrollView>

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
    paddingBottom: 20,
  },
  headerImage: {
    width: '75%',
    height: 75,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  levelGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    justifyContent: 'space-between',
  },
  levelItem: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  levelItemLocked: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  levelNumber: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '900',
  },
  lockIcon: {
    fontSize: 24,
    opacity: 0.5,
  },
  starsContainer: {
    marginTop: 4,
  },
  starText: {
    fontSize: 10,
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
  },
});
