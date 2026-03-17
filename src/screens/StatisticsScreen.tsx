import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { getStatistics, getTotalStars, getAllLevelProgress } from '../utils/storage';
import { getTotalLevels } from '../levels';

interface Props {
  navigation: any;
}

export default function StatisticsScreen({ navigation }: Props) {
  const stats = getStatistics();
  const totalStars = getTotalStars();
  const allProgress = getAllLevelProgress();
  const completedLevels = Object.values(allProgress).filter(p => p.completed).length;
  const totalLevels = getTotalLevels();
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };
  
  const statItems = [
    { label: 'Levels Completed', value: `${completedLevels}/${totalLevels}`, icon: '🏁' },
    { label: 'Total Stars', value: `${totalStars}/${totalLevels * 3}`, icon: '⭐' },
    { label: 'Total Moves', value: stats.totalMoves.toString(), icon: '🎯' },
    { label: 'Hints Used', value: stats.totalHintsUsed.toString(), icon: '💡' },
    { label: 'Undos Used', value: stats.totalUndos.toString(), icon: '↶' },
    { label: 'Levels Reset', value: stats.totalResets.toString(), icon: '↻' },
  ];
  
  return (
    <LinearGradient
      colors={['#0F2027', '#203A43', '#2C5364']}
      locations={[0, 0.5, 1]}
      style={styles.container}
    >
      <View style={styles.bgDecoration}>
        <View style={[styles.bgCircle, { top: '8%', right: '10%', width: 110, height: 110 }]} />
        <View style={[styles.bgCircle, { bottom: '20%', left: '8%', width: 150, height: 150 }]} />
      </View>
      
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
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
              <Text style={styles.headerEmoji}>📊</Text>
              <Text style={styles.headerTitle}>STATISTICS</Text>
            </View>
            
            <View style={styles.placeholder} />
          </LinearGradient>
        </View>
      
      {/* Content */}
      <ScrollView style={styles.content}>
        {/* Completion Progress */}
        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>Overall Progress</Text>
          <View style={styles.progressBarContainer}>
            <View 
              style={[
                styles.progressBar, 
                { width: `${(completedLevels / totalLevels) * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {completedLevels} of {totalLevels} levels completed ({Math.round((completedLevels / totalLevels) * 100)}%)
          </Text>
        </View>
        
        {/* Statistics Grid */}
        <View style={styles.statsGrid}>
          {statItems.map((item, index) => (
            <View key={index} style={styles.statCard}>
              <Text style={styles.statIcon}>{item.icon}</Text>
              <Text style={styles.statValue}>{item.value}</Text>
              <Text style={styles.statLabel}>{item.label}</Text>
            </View>
          ))}
        </View>
        
        {/* Achievement Hint */}
        <View style={styles.hintCard}>
          <Text style={styles.hintIcon}>🏆</Text>
          <Text style={styles.hintText}>
            Keep playing to unlock achievements and earn rewards!
          </Text>
        </View>
      </ScrollView>
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
  content: {
    flex: 1,
    padding: 16,
  },
  progressCard: {
    borderRadius: 18,
    padding: 24,
    marginBottom: 24,
    backgroundColor: 'rgba(0, 217, 255, 0.12)',
    borderWidth: 2,
    borderColor: 'rgba(0, 217, 255, 0.3)',
    shadowColor: '#00D9FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  progressTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 16,
    letterSpacing: 1,
  },
  progressBarContainer: {
    height: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#00FF88',
    borderRadius: 7,
    shadowColor: '#00FF88',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
  progressText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 217, 255, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  statIcon: {
    fontSize: 36,
    marginBottom: 10,
  },
  statValue: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  hintCard: {
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  hintIcon: {
    fontSize: 36,
  },
  hintText: {
    flex: 1,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 22,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
