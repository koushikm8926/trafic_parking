import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { allLevels } from '../levels';
import { getLevelProgress, isLevelUnlocked } from '../utils/storage';

interface Props {
  navigation: any;
}

export default function LevelSelectScreen({ navigation }: Props) {
  const renderStars = (starsEarned: number) => {
    return (
      <View style={styles.starsRow}>
        {[1, 2, 3].map((star) => (
          <Text
            key={star}
            style={[
              styles.star,
              star <= starsEarned ? styles.starFilled : styles.starEmpty,
            ]}
          >
            ★
          </Text>
        ))}
      </View>
    );
  };
  
  return (
    <LinearGradient
      colors={['#87CEEB', '#B0C4DE', '#6D7D8B', '#4A4A4A', '#3D3D3D']}
      locations={[0, 0.15, 0.35, 0.6, 1]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.headerOuter}>
          <LinearGradient
            colors={['rgba(20, 30, 48, 0.92)', 'rgba(36, 59, 85, 0.88)']}
            style={styles.header}
          >
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#FF6B6B', '#EE5A6F']}
                style={styles.backButtonGradient}
              >
                <Text style={styles.backButtonText}>‹</Text>
              </LinearGradient>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>SELECT LEVEL</Text>
            <View style={styles.placeholder} />
          </LinearGradient>
        </View>
        
        {/* Level Grid */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.levelGrid}
        >
          {allLevels.map((level) => {
            const isUnlocked = isLevelUnlocked(level.id);
            const progress = getLevelProgress(level.id);
            const starsEarned = progress?.starsEarned || 0;
            const isCompleted = progress?.completed || false;
            
            return (
              <TouchableOpacity
                key={level.id}
                onPress={() => {
                  if (isUnlocked) {
                    navigation.navigate('Game', { levelId: level.id });
                  }
                }}
                disabled={!isUnlocked}
                activeOpacity={0.8}
                style={styles.levelCardWrapper}
              >
                <LinearGradient
                  colors={
                    !isUnlocked 
                      ? ['rgba(50, 50, 50, 0.7)', 'rgba(30, 30, 30, 0.7)']
                      : isCompleted
                      ? ['rgba(76, 175, 80, 0.25)', 'rgba(46, 125, 50, 0.15)']
                      : ['rgba(255, 255, 255, 0.12)', 'rgba(255, 255, 255, 0.04)']
                  }
                  style={[
                    styles.levelCard,
                    !isUnlocked && styles.levelCardLocked,
                    isCompleted && styles.levelCardCompleted,
                  ]}
                >
                  {/* Parking spot number painted on asphalt */}
                  <View style={styles.spotNumber}>
                    <Text style={[
                      styles.levelNumber,
                      !isUnlocked && styles.levelNumberLocked,
                    ]}>
                      {isUnlocked ? level.id : '🔒'}
                    </Text>
                  </View>
                  
                  {/* Difficulty Badge */}
                  {isUnlocked && level.difficulty && (
                    <View style={[
                      styles.difficultyBadge,
                      level.difficulty === 'easy' && styles.difficultyEasy,
                      level.difficulty === 'medium' && styles.difficultyMedium,
                      level.difficulty === 'hard' && styles.difficultyHard,
                      level.difficulty === 'expert' && styles.difficultyExpert,
                    ]}>
                      <Text style={styles.difficultyText}>
                        {level.difficulty.toUpperCase()}
                      </Text>
                    </View>
                  )}
                  
                  {/* Stars */}
                  {isUnlocked && (
                    <>
                      {renderStars(starsEarned)}
                      
                      {/* Best Moves */}
                      {progress?.bestMoves && (
                        <Text style={styles.bestMoves}>
                          Best: {progress.bestMoves} moves
                        </Text>
                      )}
                      
                      {/* Optimal Moves */}
                      <Text style={styles.optimalMoves}>
                        Target: {level.minMoves}
                      </Text>
                    </>
                  )}

                  {/* Parking spot white lines */}
                  {isUnlocked && (
                    <>
                      <View style={styles.spotLineLeft} />
                      <View style={styles.spotLineRight} />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  headerOuter: {
    marginHorizontal: 8,
    marginTop: 4,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
  },
  backButton: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  backButtonGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 28,
    color: '#fff',
    marginTop: -3,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  placeholder: {
    width: 36,
  },
  scrollView: {
    flex: 1,
  },
  levelGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 14,
    gap: 10,
    justifyContent: 'space-between',
  },
  levelCardWrapper: {
    width: '31%',
    aspectRatio: 1,
    marginBottom: 6,
  },
  levelCard: {
    flex: 1,
    borderRadius: 12,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    overflow: 'hidden',
  },
  levelCardLocked: {
    opacity: 0.4,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  levelCardCompleted: {
    borderWidth: 2,
    borderColor: 'rgba(76, 175, 80, 0.6)',
    shadowColor: '#4CAF50',
    shadowOpacity: 0.3,
  },
  spotNumber: {
    marginBottom: 6,
  },
  levelNumber: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  levelNumberLocked: {
    fontSize: 26,
    color: '#666',
  },
  spotLineLeft: {
    position: 'absolute',
    left: 0,
    top: 4,
    bottom: 4,
    width: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  spotLineRight: {
    position: 'absolute',
    right: 0,
    top: 4,
    bottom: 4,
    width: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  difficultyBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4,
  },
  difficultyEasy: {
    backgroundColor: 'rgba(76, 175, 80, 0.8)',
  },
  difficultyMedium: {
    backgroundColor: 'rgba(255, 152, 0, 0.8)',
  },
  difficultyHard: {
    backgroundColor: 'rgba(244, 67, 54, 0.8)',
  },
  difficultyExpert: {
    backgroundColor: 'rgba(156, 39, 176, 0.8)',
  },
  difficultyText: {
    fontSize: 7,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 0.5,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: 4,
  },
  star: {
    fontSize: 16,
  },
  starFilled: {
    color: '#FFD700',
    textShadowColor: 'rgba(255, 215, 0, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  starEmpty: {
    color: 'rgba(255, 255, 255, 0.2)',
  },
  bestMoves: {
    fontSize: 9,
    color: '#81C784',
    fontWeight: '700',
    marginTop: 3,
  },
  optimalMoves: {
    fontSize: 8,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '600',
    marginTop: 1,
  },
});
