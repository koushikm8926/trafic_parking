import React, { useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { getStarRatingText } from '../utils/gameLogic';

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
        <Animated.View
          style={[
            styles.container,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Title */}
          <Text style={styles.title}>Level Complete!</Text>
          
          {/* Stars */}
          {renderStars()}
          
          {/* Star Rating Text */}
          <Text style={styles.ratingText}>
            {getStarRatingText(starsEarned)}
          </Text>
          
          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Moves:</Text>
              <Text style={styles.statValue}>{moveCount}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Optimal:</Text>
              <Text style={styles.statValue}>{optimalMoves}</Text>
            </View>
          </View>
          
          {/* New Best Badge */}
          {isNewBest && (
            <View style={styles.newBestBadge}>
              <Text style={styles.newBestText}>🏆 New Best!</Text>
            </View>
          )}
          
          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.retryButton]}
              onPress={onRetry}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Retry</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.nextButton]}
              onPress={onNextLevel}
              activeOpacity={0.8}
            >
              <Text style={[styles.buttonText, styles.nextButtonText]}>
                {isLastLevel ? 'Level Select' : 'Next Level'}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '85%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  star: {
    fontSize: 48,
  },
  starFilled: {
    color: '#FFD700',
  },
  starEmpty: {
    color: '#ddd',
  },
  ratingText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 20,
  },
  statsContainer: {
    width: '100%',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 16,
    color: '#666',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  newBestBadge: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
  },
  newBestText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F57C00',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  retryButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  nextButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  nextButtonText: {
    color: '#fff',
  },
});
