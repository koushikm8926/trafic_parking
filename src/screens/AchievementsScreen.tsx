import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
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
              <Text style={styles.headerEmoji}>🏆</Text>
              <Text style={styles.headerTitle}>ACHIEVEMENTS</Text>
            </View>
            
            <View style={styles.placeholder} />
          </LinearGradient>
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
    </LinearGradient>
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
  progressSection: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 24,
    borderRadius: 20,
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
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 14,
    textAlign: 'center',
    letterSpacing: 1,
  },
  progressBarContainer: {
    height: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 10,
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
  progressPercent: {
    fontSize: 16,
    color: '#00FF88',
    textAlign: 'center',
    fontWeight: '800',
  },
  scrollView: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
    gap: 14,
    paddingBottom: 30,
  },
  card: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 18,
    backgroundColor: 'rgba(0, 217, 255, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 12,
  },
  cardLocked: {
    opacity: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  iconCircle: {
    width: 65,
    height: 65,
    borderRadius: 33,
    backgroundColor: 'rgba(0, 255, 136, 0.25)',
    borderWidth: 3,
    borderColor: '#00FF88',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#00FF88',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  iconCircleLocked: {
    backgroundColor: 'rgba(100, 100, 100, 0.3)',
    borderColor: '#666',
    shadowOpacity: 0,
  },
  icon: {
    fontSize: 34,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  cardDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 8,
    lineHeight: 20,
  },
  textLocked: {
    color: 'rgba(255, 255, 255, 0.4)',
  },
  progressContainer: {
    marginTop: 10,
  },
  progressBarSmall: {
    height: 7,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  progressBarFillSmall: {
    height: '100%',
    backgroundColor: '#4CAF50',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '700',
  },
  unlockedText: {
    fontSize: 11,
    color: '#00FF88',
    fontWeight: '700',
    marginTop: 6,
    letterSpacing: 0.5,
  },
});
