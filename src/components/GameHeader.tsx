import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Props {
  levelNumber: number;
  moveCount: number;
  optimalMoves: number;
  isSoundEnabled: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onReset: () => void;
  onToggleSound: () => void;
  onBack: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onHint: () => void;
  onHelp: () => void;
}

export default function GameHeader({
  levelNumber,
  moveCount,
  optimalMoves,
  isSoundEnabled,
  canUndo,
  canRedo,
  onReset,
  onToggleSound,
  onBack,
  onUndo,
  onRedo,
  onHelp,
  onHint,
}: Props) {
  return (
    <View style={styles.container}>
      {/* Left: Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={onBack}
        activeOpacity={0.7}
      >
        <Text style={styles.backButtonText}>‹</Text>
      </TouchableOpacity>
      
      {/* Center: Level Info */}
      <View style={styles.levelInfo}>
        <Text style={styles.levelText}>Level {levelNumber}</Text>
        <Text style={styles.movesText}>
          Moves: {moveCount} / {optimalMoves}
        </Text>
      </View>
      
      {/* Right: Controls */}
      <View style={styles.controls}>
        {/* Help Button */}
        <TouchableOpacity
          style={styles.button}
          onPress={onHelp}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>❓</Text>
        </TouchableOpacity>
        
        {/* Hint Button */}
        <TouchableOpacity
          style={styles.button}
          onPress={onHint}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>💡</Text>
        </TouchableOpacity>
        
        {/* Undo Button */}
        <TouchableOpacity
          style={[styles.button, !canUndo && styles.buttonDisabled]}
          onPress={onUndo}
          disabled={!canUndo}
          activeOpacity={0.7}
        >
          <Text style={[styles.buttonText, !canUndo && styles.buttonTextDisabled]}>
            ↶
          </Text>
        </TouchableOpacity>
        
        {/* Redo Button */}
        <TouchableOpacity
          style={[styles.button, !canRedo && styles.buttonDisabled]}
          onPress={onRedo}
          disabled={!canRedo}
          activeOpacity={0.7}
        >
          <Text style={[styles.buttonText, !canRedo && styles.buttonTextDisabled]}>
            ↷
          </Text>
        </TouchableOpacity>
        
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
  levelInfo: {
    flex: 1,
    marginLeft: 16,
  },
  levelText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  movesText: {
    fontSize: 13,
    color: '#666',
  },
  controls: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  buttonDisabled: {
    backgroundColor: '#f5f5f5',
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 20,
    color: '#333',
  },
  buttonTextDisabled: {
    color: '#999',
  },
});
