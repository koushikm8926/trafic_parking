import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getTotalStars, getCurrentLevelId } from '../utils/storage';
import { getTotalLevels } from '../levels';
import HelpModal from '../components/HelpModal';

interface Props {
  navigation: any;
}

export default function HomeScreen({ navigation }: Props) {
  const totalStars = getTotalStars();
  const currentLevel = getCurrentLevelId();
  const totalLevels = getTotalLevels();
  const [showHelp, setShowHelp] = useState(false);
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Top Action Buttons */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.topButton}
            onPress={() => navigation.navigate('Achievements')}
            activeOpacity={0.7}
          >
            <Text style={styles.topButtonText}>🏆</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.topButton}
            onPress={() => navigation.navigate('Statistics')}
            activeOpacity={0.7}
          >
            <Text style={styles.topButtonText}>📊</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.topButton}
            onPress={() => setShowHelp(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.topButtonText}>❓</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.topButton}
            onPress={() => navigation.navigate('Settings')}
            activeOpacity={0.7}
          >
            <Text style={styles.topButtonText}>⚙️</Text>
          </TouchableOpacity>
        </View>
        
        {/* Title */}
        <Text style={styles.title}>Traffic Parking</Text>
        <Text style={styles.subtitle}>Puzzle Rush</Text>
        
        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{totalStars}</Text>
            <Text style={styles.statLabel}>⭐ Stars</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{currentLevel}/{totalLevels}</Text>
            <Text style={styles.statLabel}>Levels</Text>
          </View>
        </View>
        
        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={() => navigation.navigate('LevelSelect')}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Play</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => {
              // Navigate to current level directly
              navigation.navigate('Game', { levelId: currentLevel });
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>Continue Level {currentLevel}</Text>
          </TouchableOpacity>
        </View>
        
        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>v1.0.0</Text>
        </View>
      </View>
      
      <HelpModal
        visible={showHelp}
        onClose={() => setShowHelp(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  topBar: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'row',
    gap: 12,
  },
  topButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  topButtonText: {
    fontSize: 22,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#D85A30',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 24,
    color: '#666',
    marginBottom: 60,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 60,
  },
  statBox: {
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
    gap: 16,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  primaryButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
});
