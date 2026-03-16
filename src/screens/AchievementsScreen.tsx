import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { achievements, Achievement } from '../utils/achievements';
import { getAchievement } from '../utils/storage';

interface Props {
  navigation: any;
}

export default function AchievementsScreen({ navigation }: Props) {
  // Load achievement states from storage
  const achievementStates = achievements.map(achievement => {
    const saved = getAchievement(achievement.id);
    return {
      ...achievement,
      unlocked: saved?.unlocked || false,
      unlockedAt: saved?.unlockedAt,
    };
  });

  const unlockedCount = achievementStates.filter(a => a.unlocked).length;
  const totalCount = achievements.length;
  const progress = (unlockedCount / totalCount) * 100;

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
        <Text style={styles.headerTitle}>Achievements</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Progress Summary */}
      <View style={styles.progressSection}>
        <Text style={styles.progressTitle}>
          {unlockedCount} of {totalCount} Unlocked
        </Text>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
      </View>

      {/* Achievements List */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.listContainer}>
        {achievementStates.map((achievement) => (
          <AchievementCard key={achievement.id} achievement={achievement} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

interface AchievementCardProps {
  achievement: Achievement;
}

function AchievementCard({ achievement }: AchievementCardProps) {
  const isLocked = !achievement.unlocked;

  return (
    <View style={[styles.card, isLocked && styles.cardLocked]}>
      <View style={[styles.iconCircle, isLocked && styles.iconCircleLocked]}>
        <Text style={styles.icon}>{isLocked ? '🔒' : achievement.icon}</Text>
      </View>
      <View style={styles.cardContent}>
        <Text style={[styles.cardTitle, isLocked && styles.textLocked]}>
          {achievement.title}
        </Text>
        <Text style={[styles.cardDescription, isLocked && styles.textLocked]}>
          {achievement.description}
        </Text>
        {achievement.maxProgress && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBarSmall}>
              <View
                style={[
                  styles.progressBarFillSmall,
                  {
                    width: `${((achievement.progress || 0) / achievement.maxProgress) * 100}%`,
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {achievement.progress || 0} / {achievement.maxProgress}
            </Text>
          </View>
        )}
        {achievement.unlocked && achievement.unlockedAt && (
          <Text style={styles.unlockedText}>
            Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
          </Text>
        )}
      </View>
    </View>
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
    borderBottomColor: '#eee',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 36,
    color: '#333',
    fontWeight: '300',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  progressSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
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
  progressPercent: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 12,
  },
  cardLocked: {
    opacity: 0.6,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  iconCircleLocked: {
    backgroundColor: '#ccc',
  },
  icon: {
    fontSize: 32,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  textLocked: {
    color: '#999',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBarSmall: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBarFillSmall: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  progressText: {
    fontSize: 12,
    color: '#666',
  },
  unlockedText: {
    fontSize: 11,
    color: '#4CAF50',
    fontStyle: 'italic',
    marginTop: 4,
  },
});
