import React, { useState, useCallback, useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GameGrid from '../components/GameGrid';
import Vehicle from '../components/Vehicle';
import GameHeader from '../components/GameHeader';
import LevelCompleteModal from '../components/LevelCompleteModal';
import HelpModal from '../components/HelpModal';
import { buildOccupancyMap } from '../utils/gridUtils';
import { canMove } from '../utils/collision';
import { hasReachedExit, calculateStars, isNewBest } from '../utils/gameLogic';
import { playSound, initSounds } from '../utils/soundManager';
import { MoveHistory } from '../utils/moveHistory';
import { getHint, Hint } from '../utils/hintSystem';
import {
  getLevelProgress,
  saveLevelProgress,
  getSoundEnabled,
  setSoundEnabled,
  setCurrentLevelId,
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
  
  const moveHistory = useRef(new MoveHistory()).current;

  // Initialize sounds on mount
  useEffect(() => {
    initSounds();
    setCurrentLevelId(levelId);
  }, [levelId]);

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
        playSound('invalid', isSoundEnabled);
      }

      return currentVehicles;
    });
  }, [level, isCompleted, isSoundEnabled, moveHistory]);

  const handleUndo = useCallback(() => {
    const lastMove = moveHistory.undo();
    if (lastMove) {
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
      setHintedVehicleId(hint.vehicleId);
      // Clear hint after 3 seconds
      setTimeout(() => setHintedVehicleId(null), 3000);
    }
  }, [vehicles, level]);

  const handleReset = useCallback(() => {
    setVehicles(level.vehicles);
    moveHistory.clear();
    setIsCompleted(false);
    setStarsEarned(0);
    setShowModal(false);
    setIsNewBestScore(false);
    setHintedVehicleId(null);
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
      setCurrentLevelId(nextLevel.id);
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
    <SafeAreaView style={styles.container}>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  board: {
    flex: 1,
    position: 'relative',
  },
});
