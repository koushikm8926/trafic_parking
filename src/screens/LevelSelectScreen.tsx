import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { allLevels } from '../levels';
import { getLevelProgress, isLevelUnlocked } from '../utils/storage';

interface Props {
  navigation: any;
}

export default function LevelSelectScreen({ navigation }: Props) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);
  
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
      colors={['#0F2027', '#203A43', '#2C5364']}
      locations={[0, 0.5, 1]}
      style={styles.container}
    >
      {/* Background decoration */}
      <View style={styles.bgDecoration}>
        <View style={[styles.bgCircle, { top: '5%', right: '10%', width: 120, height: 120 }]} />
        <View style={[styles.bgCircle, { bottom: '15%', left: '5%', width: 160, height: 160 }]} />
      </View>
      
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Enhanced Header */}
        <View style={styles.headerOuter}>
          <LinearGradient
            colors={['rgba(0,217,255,0.15)', 'rgba(0,180,216,0.1)', 'rgba(0,150,199,0.05)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#FF6B6B', '#EE5A6F', '#D63447']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.backButtonGradient}
              >
                <Text style={styles.backButtonText}>←</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <View style={styles.titleContainer}>
              <Text style={styles.headerEmoji}>🎮</Text>
              <Text style={styles.headerTitle}>LEVELS</Text>
            </View>
            
            <View style={styles.placeholder} />
          </LinearGradient>
        </View>
        
        {/* Level Grid with animation */}
        <Animated.View style={[{ flex: 1, opacity: fadeAnim }]}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.levelGrid}
            showsVerticalScrollIndicator={false}
          >
            {allLevels.map((level, index) => {
              const isUnlocked = isLevelUnlocked(level.id);
              const progress = getLevelProgress(level.id);
              const starsEarned = progress?.starsEarned || 0;
              const isCompleted = progress?.completed || false;
              const isPerfect = starsEarned === 3;
              
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
                        ? ['rgba(40, 40, 40, 0.7)', 'rgba(20, 20, 20, 0.7)']
                        : isPerfect
                        ? ['rgba(255,215,0,0.25)', 'rgba(255,165,0,0.15)', 'rgba(255,140,0,0.05)']
                        : isCompleted
                        ? ['rgba(76, 175, 80, 0.3)', 'rgba(46, 125, 50, 0.2)', 'rgba(27, 94, 32, 0.1)']
                        : ['rgba(0,217,255,0.15)', 'rgba(0,180,216,0.1)', 'rgba(0,150,199,0.05)']
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={[
                      styles.levelCard,
                      !isUnlocked && styles.levelCardLocked,
                      isPerfect && styles.levelCardPerfect,
                      isCompleted && !isPerfect && styles.levelCardCompleted,
                    ]}
                  >
                    {/* Perfect badge */}
                    {isPerfect && (
                      <View style={styles.perfectBadge}>
                        <Text style={styles.perfectText}>👑</Text>
                      </View>
                    )}
                    
                    {/* Parking spot number */}
                    <View style={styles.spotNumber}>
                      <Text style={[
                        styles.levelNumber,
                        !isUnlocked && styles.levelNumberLocked,
                        isPerfect && styles.levelNumberPerfect,
                      ]}>
                        {isUnlocked ? level.id : '🔒'}
                      </Text>
                    </View>
                    
                    {/* Difficulty Badge */}
                    {isUnlocked && level.difficulty && (
                      <LinearGradient
                        colors={
                          level.difficulty === 'easy' ? ['#4CAF50', '#388E3C'] :
                          level.difficulty === 'medium' ? ['#FF9800', '#F57C00'] :
                          level.difficulty === 'hard' ? ['#F44336', '#D32F2F'] :
                          ['#9C27B0', '#7B1FA2']
                        }
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.difficultyBadge}
                      >
                        <Text style={styles.difficultyText}>
                          {level.difficulty === 'easy' ? '●' :
                           level.difficulty === 'medium' ? '●●' :
                           level.difficulty === 'hard' ? '●●●' : '●●●●'}
                        </Text>
                      </LinearGradient>
                    )}
                    
                    {/* Stars */}
                    {isUnlocked && (
                      <>
                        {renderStars(starsEarned)}
                        
                        {/* Best Moves */}
                        {progress?.bestMoves && (
                          <View style={styles.movesContainer}>
                            <Text style={styles.bestMoves}>
                              🎯 {progress.bestMoves}
                            </Text>
                          </View>
                        )}
                        
                        {/* Target indicator */}
                        <View style={styles.targetContainer}>
                          <Text style={styles.targetLabel}>Target</Text>
                          <Text style={styles.optimalMoves}>{level.minMoves}</Text>
                        </View>
                      </>
                    )}

                    {/* Parking spot lines - enhanced */}
                    {isUnlocked && (
                      <>
                        <View style={[styles.spotLine, styles.spotLineLeft, isPerfect && styles.spotLineGold]} />
                        <View style={[styles.spotLine, styles.spotLineRight, isPerfect && styles.spotLineGold]} />
                        <View style={[styles.spotLine, styles.spotLineTop, isPerfect && styles.spotLineGold]} />
                        <View style={[styles.spotLine, styles.spotLineBottom, isPerfect && styles.spotLineGold]} />
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bgDecoration: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  bgCircle: {
    position: 'absolute',
    borderRadius: 1000,
    backgroundColor: 'rgba(0, 217, 255, 0.06)',
  },
  safeArea: {
    flex: 1,
  },
  headerOuter: {
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 12,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#00D9FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 18,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerEmoji: {
    fontSize: 24,
  },
  backButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  backButtonGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  backButtonText: {
    fontSize: 26,
    color: '#fff',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 3,
    textShadowColor: '#00D9FF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
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
    gap: 12,
    justifyContent: 'space-between',
    paddingBottom: 30,
  },
  levelCardWrapper: {
    width: '31%',
    aspectRatio: 0.95,
    marginBottom: 8,
  },
  levelCard: {
    flex: 1,
    borderRadius: 16,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    overflow: 'hidden',
    position: 'relative',
  },
  levelCardLocked: {
    opacity: 0.35,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  levelCardCompleted: {
    borderWidth: 2.5,
    borderColor: 'rgba(76, 175, 80, 0.7)',
    shadowColor: '#4CAF50',
    shadowOpacity: 0.4,
  },
  levelCardPerfect: {
    borderWidth: 3,
    borderColor: 'rgba(255, 215, 0, 0.8)',
    shadowColor: '#FFD700',
    shadowOpacity: 0.6,
    shadowRadius: 12,
  },
  perfectBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: 'rgba(255, 215, 0, 0.9)',
    borderRadius: 12,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  perfectText: {
    fontSize: 16,
  },
  spotNumber: {
    marginBottom: 6,
  },
  levelNumber: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
  },
  levelNumberLocked: {
    fontSize: 28,
    color: '#666',
    textShadowRadius: 0,
  },
  levelNumberPerfect: {
    color: '#FFD700',
    textShadowColor: '#FFD700',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  spotLine: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  spotLineLeft: {
    left: 0,
    top: 6,
    bottom: 6,
    width: 3,
  },
  spotLineRight: {
    right: 0,
    top: 6,
    bottom: 6,
    width: 3,
  },
  spotLineTop: {
    top: 0,
    left: 6,
    right: 6,
    height: 3,
  },
  spotLineBottom: {
    bottom: 0,
    left: 6,
    right: 6,
    height: 3,
  },
  spotLineGold: {
    backgroundColor: 'rgba(255, 215, 0, 0.5)',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  difficultyText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 3,
    marginBottom: 6,
  },
  star: {
    fontSize: 18,
  },
  starFilled: {
    color: '#FFD700',
    textShadowColor: '#FFD700',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  starEmpty: {
    color: 'rgba(255, 255, 255, 0.2)',
  },
  movesContainer: {
    backgroundColor: 'rgba(129, 199, 132, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
    borderWidth: 1,
    borderColor: 'rgba(129, 199, 132, 0.4)',
  },
  bestMoves: {
    fontSize: 10,
    color: '#81C784',
    fontWeight: '800',
  },
  targetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  targetLabel: {
    fontSize: 8,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '700',
  },
  optimalMoves: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '800',
  },
});
