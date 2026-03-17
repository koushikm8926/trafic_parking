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
  const performance = moveCount <= optimalMoves ? 'EXCELLENT' : moveCount <= optimalMoves * 1.5 ? 'GOOD' : 'KEEP TRYING';
  
  return (
    <View style={styles.outerContainer}>
      <LinearGradient
        colors={['rgba(0,217,255,0.12)', 'rgba(0,180,216,0.08)', 'rgba(0,150,199,0.04)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
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
        
        {/* Level & Moves Info - Enhanced */}
        <View style={styles.infoContainer}>
          <LinearGradient
            colors={['rgba(76, 175, 80, 0.25)', 'rgba(76, 175, 80, 0.15)']}
            style={styles.levelBadge}
          >
            <View style={styles.badgeContent}>
              <Text style={styles.levelLabel}>LEVEL</Text>
              <Text style={styles.levelNumber}>{levelNumber}</Text>
            </View>
          </LinearGradient>
          
          <LinearGradient
            colors={[`${moveColor}20`, `${moveColor}10`]}
            style={styles.movesContainer}
          >
            <View style={styles.badgeContent}>
              <Text style={styles.movesLabel}>{performance}</Text>
              <View style={styles.movesDisplay}>
                <Text style={[styles.moveCount, { color: moveColor }]}>{moveCount}</Text>
                <Text style={styles.movesSlash}>/</Text>
                <Text style={styles.optimalMoves}>{optimalMoves}</Text>
              </View>
            </View>
          </LinearGradient>
        </View>
        
        {/* Action Buttons - Enhanced */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onHelp}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={['rgba(33, 150, 243, 0.3)', 'rgba(33, 150, 243, 0.15)']}
              style={styles.iconButtonGradient}
            >
              <Text style={styles.iconText}>❓</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onHint}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={['rgba(255, 152, 0, 0.3)', 'rgba(255, 152, 0, 0.15)']}
              style={styles.iconButtonGradient}
            >
              <Text style={styles.iconText}>💡</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.iconButton, !canUndo && styles.iconButtonDisabled]}
            onPress={onUndo}
            disabled={!canUndo}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={canUndo ? ['rgba(156, 39, 176, 0.3)', 'rgba(156, 39, 176, 0.15)'] : ['rgba(50, 50, 50, 0.2)', 'rgba(50, 50, 50, 0.1)']}
              style={styles.iconButtonGradient}
            >
              <Text style={[styles.iconText, !canUndo && styles.iconTextDisabled]}>↶</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.iconButton, !canRedo && styles.iconButtonDisabled]}
            onPress={onRedo}
            disabled={!canRedo}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={canRedo ? ['rgba(156, 39, 176, 0.3)', 'rgba(156, 39, 176, 0.15)'] : ['rgba(50, 50, 50, 0.2)', 'rgba(50, 50, 50, 0.1)']}
              style={styles.iconButtonGradient}
            >
              <Text style={[styles.iconText, !canRedo && styles.iconTextDisabled]}>↷</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onToggleSound}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={['rgba(76, 175, 80, 0.3)', 'rgba(76, 175, 80, 0.15)']}
              style={styles.iconButtonGradient}
            >
              <Text style={styles.iconText}>{isSoundEnabled ? '🔊' : '🔇'}</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onReset}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={['rgba(244, 67, 54, 0.3)', 'rgba(244, 67, 54, 0.15)']}
              style={styles.iconButtonGradient}
            >
              <Text style={styles.iconText}>↻</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#00D9FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 18,
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
  infoContainer: {
    flex: 1,
    flexDirection: 'row',
    marginLeft: 10,
    gap: 8,
  },
  levelBadge: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 2,
    borderColor: 'rgba(76, 175, 80, 0.4)',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  movesContainer: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  badgeContent: {
    alignItems: 'center',
  },
  levelLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: '#81C784',
    letterSpacing: 1.2,
  },
  levelNumber: {
    fontSize: 18,
    fontWeight: '900',
    color: '#A5D6A7',
    marginTop: 1,
    textShadowColor: 'rgba(129, 199, 132, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  movesLabel: {
    fontSize: 7,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 1,
  },
  movesDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 2,
  },
  moveCount: {
    fontSize: 18,
    fontWeight: '900',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  movesSlash: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.4)',
    marginHorizontal: 3,
  },
  optimalMoves: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  controls: {
    flexDirection: 'row',
    gap: 6,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  iconButtonDisabled: {
    opacity: 0.35,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  iconButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 18,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  iconTextDisabled: {
    color: '#666',
    opacity: 0.5,
  },
});
