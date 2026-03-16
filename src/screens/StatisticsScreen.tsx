import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
        <Text style={styles.headerTitle}>Statistics</Text>
        <View style={styles.placeholder} />
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
  content: {
    flex: 1,
    padding: 16,
  },
  progressCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: '#e0e0e0',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 6,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  hintCard: {
    backgroundColor: '#FFF9E6',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  hintIcon: {
    fontSize: 32,
  },
  hintText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});
