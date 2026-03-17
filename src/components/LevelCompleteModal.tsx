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
            colors={['#0F2027', '#203A43', '#2C5364']}
            style={styles.gradientContainer}
          >
            {/* Title */}
            <Text style={styles.title}>🏁 LEVEL COMPLETE!</Text>
            
            {/* Stars */}
            {renderStars()}
            
            {/* Star Rating Text */}
            <LinearGradient
              colors={starsEarned === 3 ? ['#FFD700', '#FFA500', '#FF8C00'] : ['rgba(76, 175, 80, 0.4)', 'rgba(46, 204, 113, 0.3)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
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
                colors={['#FFD700', '#FFA500', '#FF8C00']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
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
                  colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.12)', 'rgba(255, 255, 255, 0.06)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={styles.button}
                >
                  <Text style={styles.buttonText}>↻ RETRY</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.nextButtonWrapper}
                onPress={onNextLevel}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#00FF88', '#00D96C', '#00B359']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.button}
                >
                  <Text style={[styles.buttonText, styles.nextButtonText]}>
                    {isLastLevel ? '🏠 HOME' : '→ NEXT'}
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
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '88%',
    maxWidth: 420,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.6,
    shadowRadius: 35,
    elevation: 20,
  },
  gradientContainer: {
    padding: 35,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(0, 217, 255, 0.6)',
    borderRadius: 28,
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    color: '#00FF88',
    marginBottom: 24,
    letterSpacing: 2,
    textAlign: 'center',
    textShadowColor: '#00FF88',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 24,
    paddingVertical: 10,
  },
  star: {
    fontSize: 58,
  },
  starFilled: {
    color: '#FFD700',
    textShadowColor: '#FFD700',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  starEmpty: {
    color: '#333',
  },
  ratingBadge: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginBottom: 24,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 6,
  },
  ratingText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  statsContainer: {
    width: '100%',
    backgroundColor: 'rgba(0, 217, 255, 0.1)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'rgba(0, 217, 255, 0.3)',
    shadowColor: '#00D9FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  statLabel: {
    fontSize: 17,
    color: '#B0C4DE',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  newBestBadge: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 28,
    marginBottom: 24,
    borderWidth: 3,
    borderColor: '#FFF',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.7,
    shadowRadius: 12,
    elevation: 10,
  },
  newBestText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1a1a2e',
    letterSpacing: 2,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 14,
    width: '100%',
  },
  retryButtonWrapper: {
    flex: 1,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonWrapper: {
    flex: 1,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.7,
    shadowRadius: 12,
    elevation: 8,
  },
  button: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  nextButtonText: {
    fontWeight: '900',
    letterSpacing: 1.5,
  },
});
