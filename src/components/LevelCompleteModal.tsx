import React, { useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getStarRatingText } from '../utils/gameLogic';
import ConfettiEffect from './ConfettiEffect';

interface Props {
  visible: boolean;
  levelNumber: number;
  moveCount: number;
  optimalMoves: number;
  starsEarned: number;
  isNewBest: boolean;
  isLastLevel: boolean;
  onRetry: () => void;
  onNextLevel: () => void;
}

export default function LevelCompleteModal({
  visible,
  levelNumber,
  moveCount,
  optimalMoves,
  starsEarned,
  isNewBest,
  isLastLevel,
  onRetry,
  onNextLevel,
}: Props) {
  const scaleAnim = React.useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();
    } else {
      scaleAnim.setValue(0);
    }
  }, [visible]);
  
  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3].map((star) => (
          <Text
            key={star}
            style={[
              styles.star,
              star <= starsEarned ? styles.starFilled : styles.starEmpty,
            ]}
          >
            ★
          </Text>
        ))}
      </View>
    );
  };
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        {/* Confetti Effect */}
        {visible && <ConfettiEffect particleCount={40} />}
        
        <Animated.View
          style={[
            styles.container,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={['#1a1a2e', '#16213e', '#0f3460']}
            style={styles.gradientContainer}
          >
            {/* Title */}
            <Text style={styles.title}>🏁 LEVEL COMPLETE!</Text>
            
            {/* Stars */}
            {renderStars()}
            
            {/* Star Rating Text */}
            <LinearGradient
              colors={starsEarned === 3 ? ['#FFD700', '#FFA500'] : ['rgba(76, 175, 80, 0.3)', 'rgba(46, 204, 113, 0.2)']}
              style={styles.ratingBadge}
            >
              <Text style={styles.ratingText}>
                {getStarRatingText(starsEarned)}
              </Text>
            </LinearGradient>
            
            {/* Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Your Moves:</Text>
                <Text style={[
                  styles.statValue, 
                  { color: moveCount <= optimalMoves ? '#4CAF50' : '#FF9800' }
                ]}>
                  {moveCount}
                </Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Target:</Text>
                <Text style={styles.statValue}>{optimalMoves}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Efficiency:</Text>
                <Text style={[
                  styles.statValue,
                  { color: moveCount <= optimalMoves ? '#4CAF50' : '#FF9800' }
                ]}>
                  {Math.round((optimalMoves / moveCount) * 100)}%
                </Text>
              </View>
            </View>
            
            {/* New Best Badge */}
            {isNewBest && (
              <LinearGradient
                colors={['#FFD700', '#FFA500']}
                style={styles.newBestBadge}
              >
                <Text style={styles.newBestText}>🏆 NEW BEST SCORE!</Text>
              </LinearGradient>
            )}
            
            {/* Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.retryButtonWrapper}
                onPress={onRetry}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.05)']}
                  style={styles.button}
                >
                  <Text style={styles.buttonText}>↻ Retry</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.nextButtonWrapper}
                onPress={onNextLevel}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#4CAF50', '#45a049']}
                  style={styles.button}
                >
                  <Text style={[styles.buttonText, styles.nextButtonText]}>
                    {isLastLevel ? '🏠 Home' : '→ Next'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '85%',
    maxWidth: 400,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 15,
  },
  gradientContainer: {
    padding: 30,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 215, 0, 0.5)',
    borderRadius: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFD700',
    marginBottom: 20,
    letterSpacing: 1,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  star: {
    fontSize: 52,
  },
  starFilled: {
    color: '#FFD700',
    textShadowColor: 'rgba(255, 215, 0, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  starEmpty: {
    color: '#444',
  },
  ratingBadge: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  ratingText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 1,
  },
  statsContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 16,
    color: '#B0C4DE',
    fontWeight: '600',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  newBestBadge: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginBottom: 20,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 8,
  },
  newBestText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1a1a2e',
    letterSpacing: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  retryButtonWrapper: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  nextButtonWrapper: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 6,
  },
  button: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  nextButtonText: {
    fontWeight: '900',
  },
});
