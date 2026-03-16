import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Props {
  levelNumber: number;
  moveCount: number;
  optimalMoves: number;
  isSoundEnabled: boolean;
  onReset: () => void;
  onToggleSound: () => void;
}

export default function GameHeader({
  levelNumber,
  moveCount,
  optimalMoves,
  isSoundEnabled,
  onReset,
  onToggleSound,
}: Props) {
  return (
    <View style={styles.container}>
      {/* Level Info */}
      <View style={styles.levelInfo}>
        <Text style={styles.levelText}>Level {levelNumber}</Text>
        <Text style={styles.movesText}>
          Moves: {moveCount} / {optimalMoves}
        </Text>
      </View>
      
      {/* Controls */}
      <View style={styles.controls}>
        {/* Sound Toggle */}
        <TouchableOpacity
          style={styles.button}
          onPress={onToggleSound}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>
            {isSoundEnabled ? '🔊' : '🔇'}
          </Text>
        </TouchableOpacity>
        
        {/* Reset Button */}
        <TouchableOpacity
          style={styles.button}
          onPress={onReset}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>↻</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  levelInfo: {
    flex: 1,
  },
  levelText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  movesText: {
    fontSize: 14,
    color: '#666',
  },
  controls: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  buttonText: {
    fontSize: 24,
    color: '#333',
  },
});
