import React, { useState, useCallback, useEffect, useRef } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GameGrid from '../components/GameGrid';
import Vehicle from '../components/Vehicle';
import LevelCompleteModal from '../components/LevelCompleteModal';
import HelpModal from '../components/HelpModal';
import AchievementToast from '../components/AchievementToast';
import { buildOccupancyMap, CELL_WIDTH, CELL_HEIGHT, GRID_SIZE } from '../utils/gridUtils';
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

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const GRID_HEIGHT = CELL_HEIGHT * GRID_SIZE;
const GRID_OFFSET_Y = Math.floor((SCREEN_HEIGHT - GRID_HEIGHT) / 2);

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
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>

        

        
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8', // Very soft light bluish-gray
  },
  safeArea: {
    flex: 1,
  },
  board: {
    flex: 1,
    position: 'relative',
  },
});
