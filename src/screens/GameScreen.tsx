import React, { useState, useCallback, useEffect, useRef } from 'react';
import { StyleSheet, View, Dimensions, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GameGrid from '../components/GameGrid';
import Vehicle, { PhysicsEntity } from '../components/Vehicle';
import Hazard from '../components/Hazard';
import LevelCompleteModal from '../components/LevelCompleteModal';
import HelpModal from '../components/HelpModal';
import AchievementToast from '../components/AchievementToast';
import { Grid, Vehicle as GridVehicle, Orientation, CellType } from '../engine/Grid';
import { calculateGridMetrics, GridMetrics } from '../utils/gridUtils';
import { calculateStars, isNewBest } from '../utils/gameLogic';
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
  getHapticsEnabled,
  setHapticsEnabled,
  setCurrentLevelId,
  updateStatistics,
  incrementStatistic,
  getStatistics,
  getTotalStars,
  saveAchievement,
  isAchievementUnlocked,
} from '../utils/storage';
import { getLevelById, getNextLevel, isLastLevel } from '../levels';
import { LevelData, VehicleData } from '../types';

interface Props {
  navigation: any;
  route: any;
}

export default function GameScreen({ navigation, route }: Props) {
  const levelId = route.params?.levelId || 1;
  const initialLevel = getLevelById(levelId)!;
  const [level, setLevel] = useState<LevelData>(initialLevel);
  const [vehicles, setVehicles] = useState<VehicleData[]>(level.vehicles);
  const [metrics, setMetrics] = useState<GridMetrics>(
    calculateGridMetrics(level.gridWidth, level.gridHeight)
  );
  const [isCompleted, setIsCompleted] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const [starsEarned, setStarsEarned] = useState(0);
  const [isSoundEnabled, setIsSoundEnabled] = useState(getSoundEnabled());
  const [isHapticsEnabled, setIsHapticsEnabled] = useState(getHapticsEnabled());
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

  const gridRef = useRef<Grid | null>(null);

  const vehicleRefs = useRef<Record<string, PhysicsEntity>>({});
  const hazardRefs = useRef<Record<string, PhysicsEntity>>({});

  const registerVehicle = useCallback((id: string, entity: PhysicsEntity) => { vehicleRefs.current[id] = entity; }, []);
  const unregisterVehicle = useCallback((id: string) => { delete vehicleRefs.current[id]; }, []);
  const registerHazard = useCallback((id: string, entity: PhysicsEntity) => { hazardRefs.current[id] = entity; }, []);
  const unregisterHazard = useCallback((id: string) => { delete hazardRefs.current[id]; }, []);

  const handleGameOver = useCallback(() => {
    setIsFailed(true);
    GameHaptics.collision(isHapticsEnabled);
    playSound('invalid', isSoundEnabled);
  }, [isHapticsEnabled, isSoundEnabled]);

  // JS-driven frame collision loop polling precision Reanimated values
  useEffect(() => {
    let frameId: number;
    let isActive = true;

    const collisionLoop = () => {
      if (!isActive || isCompleted || isFailed) return;

      const vehiclesList = Object.values(vehicleRefs.current);
      const hazardsList = Object.values(hazardRefs.current);

      for (const v of vehiclesList) {
        for (const h of hazardsList) {
          const vx = v.getX();
          const vy = v.getY();
          const hx = h.getX();
          const hy = h.getY();

          // AABB Intersection check (with a tiny 2px forgiving buffer to prevent unfair corner clips)
          const buffer = 2;
          if (
            vx + buffer < hx + h.w - buffer &&
            vx + v.w - buffer > hx + buffer &&
            vy + buffer < hy + h.h - buffer &&
            vy + v.h - buffer > hy + buffer
          ) {
            handleGameOver();
            isActive = false;
            return;
          }
        }
      }

      frameId = requestAnimationFrame(collisionLoop);
    };

    frameId = requestAnimationFrame(collisionLoop);

    return () => {
      isActive = false;
      cancelAnimationFrame(frameId);
    };
  }, [isCompleted, isFailed, handleGameOver]);

  // Initialize sounds, timer, and logical grid on mount
  useEffect(() => {
    initSounds();
    setCurrentLevelId(levelId);
    startTime.current = Date.now();
    
    const newGrid = new Grid(level.gridWidth, level.gridHeight);
    for (let r = 0; r < level.gridHeight; r++) {
      for (let c = 0; c < level.gridWidth; c++) {
        newGrid.setCell(r, c, level.backgroundGrid[r][c] as CellType);
      }
    }
    level.vehicles.forEach(v => {
      newGrid.addVehicle(new GridVehicle(v.id, v.x, v.y, v.direction as Orientation, v.length));
    });
    gridRef.current = newGrid;

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

  useEffect(() => {
    setMetrics(calculateGridMetrics(level.gridWidth, level.gridHeight));
    
    // Refresh the logical grid instance on level update
    const newGrid = new Grid(level.gridWidth, level.gridHeight);
    for (let r = 0; r < level.gridHeight; r++) {
      for (let c = 0; c < level.gridWidth; c++) {
        newGrid.setCell(r, c, level.backgroundGrid[r][c] as CellType);
      }
    }
    level.vehicles.forEach(v => {
      newGrid.addVehicle(new GridVehicle(v.id, v.x, v.y, v.direction as Orientation, v.length));
    });
    gridRef.current = newGrid;
    setVehicles(level.vehicles);
    
  }, [level]);

  // Check win condition after every move (All vehicles removed)
  useEffect(() => {
    if (!isCompleted && !isFailed && vehicles.length === 0) {
      handleLevelComplete();
    }
  }, [vehicles, isCompleted, isFailed]);

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
      incrementStatistic('totalLevelsCompleted', 1);
    }
    
    // Check achievements
    const stats = getStatistics();
    const newAchievements = checkAchievements({
      levelsCompleted: stats.totalLevelsCompleted,
      totalStars: getTotalStars(),
      threeStarLevels: 0, 
      totalMoves: stats.totalMoves,
      undosUsed: stats.totalUndos,
      hintsUsed: stats.totalHintsUsed,
      resetsUsed: stats.totalResets,
      justCompletedLevel: wasFirstCompletion,
      justGot3Stars: stars === 3,
      completedInOptimal: moveCount === level.stars[0],
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
    GameHaptics.levelComplete(isHapticsEnabled);
    
    playSound('win', isSoundEnabled);
    
    setIsCompleted(true);
    setStarsEarned(stars);
    setIsNewBestScore(isNewBestScore);
    
    setTimeout(() => {
      setShowModal(true);
    }, 500);
  }, [moveHistory, level, isSoundEnabled]);

  const handleSwipe = useCallback((vehicleId: string, dir: number) => {
    if (isCompleted || isFailed || !gridRef.current) return;
    
    const grid = gridRef.current;
    const originV = grid.vehicles.find(v => v.id === vehicleId);
    if (!originV) return;

    const preX = originV.x;
    const preY = originV.y;

    // Slide logic
    const result = grid.slideVehicle(vehicleId, dir);
    if (!result) return;

    if (result.x === preX && result.y === preY) {
      GameHaptics.collision(isHapticsEnabled);
      playSound('invalid', isSoundEnabled);
      return;
    }

    // A valid move occurred
    GameHaptics.vehicleMove(isHapticsEnabled);
    incrementStatistic('totalMoves', 1);
    playSound('move', isSoundEnabled);

    // Sync to visually update rendering
    setVehicles(prev => prev.map(v => {
      if (v.id === vehicleId) {
        return { ...v, x: result.x, y: result.y };
      }
      return v;
    }));

    if (result.exited) {
      playSound('win', isSoundEnabled); // Optional feedback for exiting
      // Wait for dynamic animation duration based on distance before unmounting!
      const duration = Math.max(300, Math.abs(result.steps) * 50);
      
      setTimeout(() => {
        setVehicles(prev => prev.filter(v => v.id !== vehicleId));
      }, duration);
    } else {
      // Clear hints on successful internal move
      setHintedVehicleId(null);
    }

  }, [level, isCompleted, isSoundEnabled, isHapticsEnabled]);

  const handleUndo = useCallback(() => {
    const lastMove = moveHistory.undo();
    if (lastMove) {
      GameHaptics.buttonPress(isHapticsEnabled);
      incrementStatistic('totalUndos', 1);
      
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
      GameHaptics.buttonPress(isHapticsEnabled);
      
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
      GameHaptics.buttonPress(isHapticsEnabled);
      incrementStatistic('totalHintsUsed', 1);
      hintsUsedThisLevel.current += 1;
      
      setHintedVehicleId(hint.vehicleId);
      // Clear hint after 3 seconds
      setTimeout(() => setHintedVehicleId(null), 3000);
    }
  }, [vehicles, level]);

  const handleReset = useCallback(() => {
    GameHaptics.buttonPress(isHapticsEnabled);
    incrementStatistic('totalResets', 1);
    
    setVehicles(level.vehicles);
    moveHistory.clear();
    setIsCompleted(false);
    setIsFailed(false);
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
      setIsFailed(false);
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
            metrics={metrics} 
          />
          {level.hazards?.map(h => (
            <Hazard
              key={h.id}
              data={h}
              metrics={metrics}
              onRegister={registerHazard}
              onUnregister={unregisterHazard}
            />
          ))}
          {vehicles.map(v => (
            <Vehicle
              key={v.id}
              {...v}
              metrics={metrics}
              onSwipe={handleSwipe}
              isHinted={v.id === hintedVehicleId}
              onRegister={registerVehicle}
              onUnregister={unregisterVehicle}
            />
          ))}
        </View>

        {isFailed && (
          <View style={styles.overlay}>
            <Text style={styles.gameOverText}>GAME OVER</Text>
            <Text style={styles.gameOverSub}>You hit a hazard!</Text>
            <TouchableOpacity style={styles.button} onPress={handleReset}>
              <Text style={styles.buttonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}
        
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
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  gameOverText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginBottom: 10,
  },
  gameOverSub: {
    fontSize: 20,
    color: 'white',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#34C759',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 30,
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  }
});
