import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Level</Text>
        <View style={styles.placeholder} />
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
              style={[
                styles.levelCard,
                !isUnlocked && styles.levelCardLocked,
                isCompleted && styles.levelCardCompleted,
              ]}
              onPress={() => {
                if (isUnlocked) {
                  navigation.navigate('Game', { levelId: level.id });
                }
              }}
              disabled={!isUnlocked}
              activeOpacity={0.7}
            >
              {/* Level Number */}
              <View style={styles.levelNumberContainer}>
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
                    Optimal: {level.minMoves}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 32,
    color: '#333',
    marginTop: -4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  levelGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 16,
  },
  levelCard: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  levelCardLocked: {
    backgroundColor: '#e0e0e0',
    opacity: 0.6,
  },
  levelCardCompleted: {
    borderColor: '#4CAF50',
  },
  levelNumberContainer: {
    marginBottom: 8,
  },
  levelNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  levelNumberLocked: {
    fontSize: 24,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: 4,
  },
  difficultyEasy: {
    backgroundColor: '#4CAF50',
  },
  difficultyMedium: {
    backgroundColor: '#FF9800',
  },
  difficultyHard: {
    backgroundColor: '#F44336',
  },
  difficultyExpert: {
    backgroundColor: '#9C27B0',
  },
  difficultyText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.5,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 4,
  },
  star: {
    fontSize: 20,
  },
  starFilled: {
    color: '#FFD700',
  },
  starEmpty: {
    color: '#ddd',
  },
  bestMoves: {
    fontSize: 11,
    color: '#4CAF50',
    fontWeight: '600',
    marginTop: 4,
  },
  optimalMoves: {
    fontSize: 10,
    color: '#999',
  },
});
