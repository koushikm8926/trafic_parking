import React, { useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { saveLevelResult, unlockLevel } from '../utils/storage';

interface Props {
  navigation: any;
  route: any;
}

export default function WinScreen({ navigation, route }: Props) {
  const { levelId, moves, stars } = route.params || { levelId: 1, moves: 0, stars: 0 };

  useEffect(() => {
    // Save current level stats
    saveLevelResult(levelId, moves, stars);
    
    // Unlock next level (up to 20)
    if (levelId < 20) {
      unlockLevel(levelId + 1);
    }
  }, [levelId, moves, stars]);

  const handleNextLevel = () => {
    if (levelId < 20) {
      navigation.replace('Game', { levelId: levelId + 1 });
    } else {
      navigation.navigate('LevelSelect');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>LEVEL {levelId} CLEARED!</Text>
        
        <View style={styles.statsContainer}>
          <Text style={styles.statLine}>Moves: {moves}</Text>
          <View style={styles.starsRow}>
             <Text style={styles.starsText}>{'⭐'.repeat(stars)}</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]}
            onPress={() => navigation.navigate('LevelSelect')}
          >
            <Text style={styles.buttonText}>LEVELS</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.primaryButton]}
            onPress={handleNextLevel}
          >
            <Text style={styles.buttonText}>
              {levelId < 20 ? 'NEXT LEVEL' : 'FINISH'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E2C', 
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    color: '#FFD700',
    fontSize: 32,
    fontWeight: '900',
    marginBottom: 40,
    textAlign: 'center',
  },
  statsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 30,
    borderRadius: 24,
    width: '100%',
    alignItems: 'center',
    marginBottom: 50,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statLine: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  starsRow: {
    marginTop: 10,
  },
  starsText: {
    fontSize: 40,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
