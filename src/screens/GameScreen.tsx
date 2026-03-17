import React, { useState, useCallback, useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import GameGrid from '../components/GameGrid';
import Vehicle from '../components/Vehicle';
import GameHeader from '../components/GameHeader';
import LevelCompleteModal from '../components/LevelCompleteModal';
import HelpModal from '../components/HelpModal';
import AchievementToast from '../components/AchievementToast';
import { buildOccupancyMap } from '../utils/gridUtils';
import { canMove } from '../utils/collision';
import { hasReachedExit, calculateStars, isNewBest } from '../utils/gameLogic';
import { playSound, initSounds } from '../utils/soundManager';
import { MoveHistory } from '../utils/moveHistory';
import { getHint, Hint } from '../utils/hintSystem';
import { GameHaptics } from '../utils/haptics';
import { checkAchievements, getAchievementById, Achievement } from '../utils/achievements';
import {
  getLevelProgress,
  saveLevelProgress,
  getSoundEnabled,
  setSoundEnabled,
  setCurrentLevelId,
  updateStatistics,
  getStatistics,
  saveAchievement,
  isAchievementUnlocked,
} from '../utils/storage';
import { getLevelById, getNextLevel, isLastLevel } from '../levels';
import { LevelData, VehicleData } from '../types';

const GRID_OFFSET_Y = 100;

interface Props {
  navigation: any;
  route: any;
}

export default function GameScreen({ navigation, route }: Props) {
  const levelId = route.params?.levelId || 1;
  const [level, setLevel] = useState<LevelData>(getLevelById(levelId)!);
  const [vehicles, setVehicles] = useState<VehicleData[]>(level.vehicles);
  const [isCompleted, setIsCompleted] = useState(false);
  const [starsEarned, setStarsEarned] = useState(0);
  const [isSoundEnabled, setIsSoundEnabled] = useState(getSoundEnabled());
  const [showModal, setShowModal] = useState(false);
  const [isNewBestScore, setIsNewBestScore] = useState(false);
  const [hintedVehicleId, setHintedVehicleId] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [achievementToShow, setAchievementToShow] = useState<Achievement | null>(null);
  
  const moveHistory = useRef(new MoveHistory()).current;
  const hintsUsedThisLevel = useRef(0);
  const startTime = useRef<number>(Date.now());
  const timerInterval = useRef<NodeJS.Timeout | null>(null);

  // Initialize sounds and timer on mount
  useEffect(() => {
    initSounds();
    setCurrentLevelId(levelId);
    startTime.current = Date.now();
    
    // Start timer
    timerInterval.current = setInterval(() => {
      if (!isCompleted) {
        setElapsedTime(Math.floor((Date.now() - startTime.current) / 1000));
      }
    }, 1000);
    
    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    };
  }, [levelId]);
  
  // Stop timer when completed
  useEffect(() => {
    if (isCompleted && timerInterval.current) {
      clearInterval(timerInterval.current);
    }
  }, [isCompleted]);

  // Check win condition after every move
  useEffect(() => {
    if (!isCompleted && hasReachedExit(vehicles, level)) {
      handleLevelComplete();
    }
  }, [vehicles, isCompleted]);

  const handleLevelComplete = useCallback(() => {
    const moveCount = moveHistory.getMoveCount();
    const stars = calculateStars(moveCount, level.stars);
    
    const previousProgress = getLevelProgress(level.id);
    const isNewBestScore = isNewBest(moveCount, previousProgress?.bestMoves || null);
    
    saveLevelProgress({
      levelId: level.id,
      completed: true,
      bestMoves: moveCount,
      starsEarned: stars,
    });
    
    // Update statistics
    const wasFirstCompletion = !previousProgress?.completed;
    if (wasFirstCompletion) {
      updateStatistics('levelsCompleted', 1);
    }
    updateStatistics('totalStars', stars);
    
    // Check achievements
    const stats = getStatistics();
    const newAchievements = checkAchievements({
      levelsCompleted: stats.levelsCompleted,
      totalStars: stats.totalStars,
      threeStarLevels: 0, // Would need to calculate from all level progress
      totalMoves: stats.totalMoves,
      undosUsed: stats.undosUsed,
      hintsUsed: stats.hintsUsed,
      resetsUsed: stats.resetsUsed,
      justCompletedLevel: wasFirstCompletion,
      justGot3Stars: stars === 3,
      completedInOptimal: moveCount === level.stars.three,
      completedWithoutHints: hintsUsedThisLevel.current === 0,
    });
    
    // Save and show newly unlocked achievements
    newAchievements.forEach((achievementId, index) => {
      // Only save if not already unlocked
      if (!isAchievementUnlocked(achievementId)) {
        saveAchievement(achievementId, { unlocked: true });
        
        // Show toast after a delay (stagger if multiple)
        setTimeout(() => {
          const achievement = getAchievementById(achievementId);
          if (achievement) {
            setAchievementToShow({ ...achievement, unlocked: true });
          }
        }, 2000 + index * 3500); // Show first toast after 2s, then stagger
      }
    });
    
    // Haptic feedback
    GameHaptics.levelComplete();
    
    playSound('win', isSoundEnabled);
    
    setIsCompleted(true);
    setStarsEarned(stars);
    setIsNewBestScore(isNewBestScore);
    
    setTimeout(() => {
      setShowModal(true);
    }, 500);
  }, [moveHistory, level, isSoundEnabled]);

  const handleMoveCommit = useCallback((vehicleId: string, steps: number) => {
    if (isCompleted) return;
    
    setVehicles(currentVehicles => {
      const vehicle = currentVehicles.find(v => v.id === vehicleId);
      if (!vehicle) return currentVehicles;

      const others = currentVehicles.filter(v => v.id !== vehicleId);
      const occupancy = buildOccupancyMap(others);
      const allowedSteps = canMove(vehicle, steps, occupancy, level.backgroundGrid);

      if (allowedSteps !== 0) {
        // Haptic feedback for successful move
        GameHaptics.vehicleMove();
        
        // Update statistics
        updateStatistics('totalMoves', 1);
        
        playSound('move', isSoundEnabled);
        
        const newX = vehicle.direction === 'horizontal' ? vehicle.x + allowedSteps : vehicle.x;
        const newY = vehicle.direction === 'vertical' ? vehicle.y + allowedSteps : vehicle.y;
        
        moveHistory.addMove(vehicleId, vehicle.x, vehicle.y, newX, newY);
        
        // Clear hint
        setHintedVehicleId(null);
        
        return currentVehicles.map(v => {
          if (v.id !== vehicleId) return v;
          return { ...v, x: newX, y: newY };
        });
      } else {
        // Haptic feedback for collision
        GameHaptics.collision();
        
        playSound('invalid', isSoundEnabled);
      }

      return currentVehicles;
    });
  }, [level, isCompleted, isSoundEnabled, moveHistory]);

  const handleUndo = useCallback(() => {
    const lastMove = moveHistory.undo();
    if (lastMove) {
      GameHaptics.buttonPress();
      updateStatistics('undosUsed', 1);
      
      setVehicles(currentVehicles =>
        currentVehicles.map(v =>
          v.id === lastMove.vehicleId
            ? { ...v, x: lastMove.fromX, y: lastMove.fromY }
            : v
        )
      );
      setHintedVehicleId(null);
    }
  }, [moveHistory]);

  const handleRedo = useCallback(() => {
    const redoMove = moveHistory.redo();
    if (redoMove) {
      GameHaptics.buttonPress();
      
      setVehicles(currentVehicles =>
        currentVehicles.map(v =>
          v.id === redoMove.vehicleId
            ? { ...v, x: redoMove.toX, y: redoMove.toY }
            : v
        )
      );
      setHintedVehicleId(null);
    }
  }, [moveHistory]);

  const handleHint = useCallback(() => {
    const hint: Hint | null = getHint(vehicles, level);
    if (hint) {
      GameHaptics.buttonPress();
      updateStatistics('hintsUsed', 1);
      hintsUsedThisLevel.current += 1;
      
      setHintedVehicleId(hint.vehicleId);
      // Clear hint after 3 seconds
      setTimeout(() => setHintedVehicleId(null), 3000);
    }
  }, [vehicles, level]);

  const handleReset = useCallback(() => {
    GameHaptics.buttonPress();
    updateStatistics('resetsUsed', 1);
    
    setVehicles(level.vehicles);
    moveHistory.clear();
    setIsCompleted(false);
    setStarsEarned(0);
    setShowModal(false);
    setIsNewBestScore(false);
    setHintedVehicleId(null);
    hintsUsedThisLevel.current = 0;
    
    // Reset timer
    startTime.current = Date.now();
    setElapsedTime(0);
  }, [level, moveHistory]);

  const handleToggleSound = useCallback(() => {
    const newValue = !isSoundEnabled;
    setIsSoundEnabled(newValue);
    setSoundEnabled(newValue);
  }, [isSoundEnabled]);

  const handleNextLevel = useCallback(() => {
    const nextLevel = getNextLevel(level.id);
    if (nextLevel) {
      setShowModal(false);
      setLevel(nextLevel);
      setVehicles(nextLevel.vehicles);
      moveHistory.clear();
      setIsCompleted(false);
      setStarsEarned(0);
      setIsNewBestScore(false);
      setHintedVehicleId(null);
      hintsUsedThisLevel.current = 0;
      setCurrentLevelId(nextLevel.id);
      
      // Reset timer for new level
      startTime.current = Date.now();
      setElapsedTime(0);
    } else {
      // No more levels, go back to level select
      navigation.navigate('LevelSelect');
    }
  }, [level, navigation, moveHistory]);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);
const handleHelp = useCallback(() => {
    setShowHelp(true);
  }, []);

  
  return (
    <LinearGradient
      colors={['#0F2027', '#203A43', '#2C5364', '#3B5366']}
      locations={[0, 0.3, 0.6, 1]}
      style={styles.container}
    >
      {/* Subtle background pattern */}
      <View style={styles.backgroundPattern}>
        <View style={[styles.bgCircle, { top: '15%', right: '15%', width: 120, height: 120 }]} />
        <View style={[styles.bgCircle, { bottom: '20%', left: '10%', width: 160, height: 160 }]} />
      </View>
      
      <SafeAreaView style={styles.safeArea}>
        <GameHeader
          levelNumber={level.id}
          moveCount={moveHistory.getMoveCount()}
          optimalMoves={level.minMoves}
          isSoundEnabled={isSoundEnabled}
          onReset={handleReset}
          onHelp={handleHelp}
          onToggleSound={handleToggleSound}
          onBack={handleBack}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onHint={handleHint}
          canUndo={moveHistory.canUndo()}
          canRedo={moveHistory.canRedo()}
        />
        
        {/* Enhanced decorative landscape strip */}
        <View style={styles.landscapeStrip}>
          <View style={styles.grassPatch} />
          <View style={[styles.grassPatch, styles.grassPatch2]} />
          <View style={[styles.grassPatch, styles.grassPatch3]} />
          <View style={styles.roadMarking} />
        </View>
        
        <View style={styles.board}>
          <GameGrid 
            backgroundGrid={level.backgroundGrid} 
            gridOffsetY={GRID_OFFSET_Y} 
          />
          {vehicles.map(v => (
            <Vehicle
              key={v.id}
              {...v}
              gridOffsetY={GRID_OFFSET_Y}
              onMoveCommit={handleMoveCommit}
              isHinted={v.id === hintedVehicleId}
            />
          ))}
        </View>
        
        <LevelCompleteModal
          visible={showModal}
          levelNumber={level.id}
          moveCount={moveHistory.getMoveCount()}
          optimalMoves={level.minMoves}
          starsEarned={starsEarned}
          isNewBest={isNewBestScore}
          onRetry={handleReset}
          onNextLevel={handleNextLevel}
          isLastLevel={isLastLevel(level.id)}
        />
        
        <HelpModal
          visible={showHelp}
          onClose={() => setShowHelp(false)}
        />
        
        <AchievementToast
          achievement={achievementToShow}
          onDismiss={() => setAchievementToShow(null)}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  bgCircle: {
    position: 'absolute',
    borderRadius: 1000,
    backgroundColor: 'rgba(0, 217, 255, 0.04)',
  },
  safeArea: {
    flex: 1,
  },
  landscapeStrip: {
    height: 8,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 8,
  },
  grassPatch: {
    width: 45,
    height: 5,
    backgroundColor: '#4CAF50',
    borderRadius: 3,
    opacity: 0.7,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  grassPatch2: {
    width: 60,
    backgroundColor: '#66BB6A',
    opacity: 0.6,
  },
  grassPatch3: {
    width: 38,
    backgroundColor: '#388E3C',
    opacity: 0.5,
  },
  roadMarking: {
    width: 30,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 1,
  },
  board: {
    flex: 1,
    position: 'relative',
  },
});
