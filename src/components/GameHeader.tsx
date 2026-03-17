import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

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
  const moveColor = moveCount <= optimalMoves ? '#4CAF50' : moveCount <= optimalMoves * 1.5 ? '#FF9800' : '#F44336';
  
  return (
    <View style={styles.outerContainer}>
      <LinearGradient
        colors={['rgba(20, 30, 48, 0.92)', 'rgba(36, 59, 85, 0.88)']}
        style={styles.container}
      >
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={['#FF6B6B', '#EE5A6F']}
            style={styles.backButtonGradient}
          >
            <Text style={styles.backButtonText}>‹</Text>
          </LinearGradient>
        </TouchableOpacity>
        
        {/* Level & Moves Info */}
        <View style={styles.infoContainer}>
          <View style={styles.levelBadge}>
            <Text style={styles.levelLabel}>LVL</Text>
            <Text style={styles.levelNumber}>{levelNumber}</Text>
          </View>
          
          <View style={styles.movesContainer}>
            <Text style={styles.movesLabel}>MOVES</Text>
            <View style={styles.movesDisplay}>
              <Text style={[styles.moveCount, { color: moveColor }]}>{moveCount}</Text>
              <Text style={styles.movesSlash}>/</Text>
              <Text style={styles.optimalMoves}>{optimalMoves}</Text>
            </View>
          </View>
        </View>
        
        {/* Action Buttons */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onHelp}
            activeOpacity={0.7}
          >
            <Text style={styles.iconText}>❓</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onHint}
            activeOpacity={0.7}
          >
            <Text style={styles.iconText}>💡</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.iconButton, !canUndo && styles.iconButtonDisabled]}
            onPress={onUndo}
            disabled={!canUndo}
            activeOpacity={0.7}
          >
            <Text style={[styles.iconText, !canUndo && styles.iconTextDisabled]}>↶</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.iconButton, !canRedo && styles.iconButtonDisabled]}
            onPress={onRedo}
            disabled={!canRedo}
            activeOpacity={0.7}
          >
            <Text style={[styles.iconText, !canRedo && styles.iconTextDisabled]}>↷</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onToggleSound}
            activeOpacity={0.7}
          >
            <Text style={styles.iconText}>{isSoundEnabled ? '🔊' : '🔇'}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onReset}
            activeOpacity={0.7}
          >
            <Text style={styles.iconText}>↻</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    marginHorizontal: 8,
    marginTop: 4,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
  },
  backButton: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  backButtonGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 28,
    color: '#fff',
    marginTop: -3,
    fontWeight: 'bold',
  },
  infoContainer: {
    flex: 1,
    flexDirection: 'row',
    marginLeft: 8,
    gap: 8,
  },
  levelBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1.5,
    borderColor: 'rgba(76, 175, 80, 0.5)',
  },
  levelLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#81C784',
    letterSpacing: 1,
  },
  levelNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#A5D6A7',
    marginTop: 1,
  },
  movesContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  movesLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 1,
  },
  movesDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 1,
  },
  moveCount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  movesSlash: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 3,
  },
  optimalMoves: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  controls: {
    flexDirection: 'row',
    gap: 5,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  iconButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderColor: 'rgba(255, 255, 255, 0.05)',
    opacity: 0.4,
  },
  iconText: {
    fontSize: 16,
    color: '#E0E0E0',
  },
  iconTextDisabled: {
    color: '#555',
    opacity: 0.4,
  },
});
