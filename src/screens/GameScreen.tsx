import React, { useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getLevelById } from '../levels';
import { GameGrid } from '../components/GameGrid';
import { Vehicle } from '../components/Vehicle';

interface Props {
  navigation: any;
  route: any;
}

const { width: screenWidth } = Dimensions.get('window');

export default function GameScreen({ navigation, route }: Props) {
  const levelId = route.params?.levelId || 1;
  const level = useMemo(() => getLevelById(levelId), [levelId]);

  const cellSize = useMemo(() => {
    if (!level) return 0;
    // Standard horizontal margin is 20px on each side (total 40px)
    // We want the grid to fit comfortably.
    return (screenWidth - 40) / level.gridWidth;
  }, [level]);

  if (!level) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Level not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Level {levelId}</Text>
      </View>

      <View style={styles.gameArea}>
        <View style={styles.gridWrapper}>
          <GameGrid
            gridWidth={level.gridWidth}
            gridHeight={level.gridHeight}
            backgroundGrid={level.backgroundGrid}
            cellSize={cellSize}
          />
          {level.vehicles.map((vehicle) => (
            <Vehicle key={vehicle.id} vehicle={vehicle} cellSize={cellSize} />
          ))}
        </View>
      </View>

      <TouchableOpacity 
        style={styles.winButton}
        onPress={() => navigation.navigate('Win', {
          levelId,
          moves: 12,
          stars: 3
        })}
      >
        <Text style={styles.winButtonText}>Simulate Win</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E2C',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginRight: 40, // offset back button
  },
  gameArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  gridWrapper: {
    position: 'relative',
    // The grid itself handles size via props, but the wrapper helps center it.
  },
  winButton: {
    margin: 20,
    padding: 16,
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    alignItems: 'center',
  },
  winButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
  },
});

