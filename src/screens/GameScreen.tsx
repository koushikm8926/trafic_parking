import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GameGrid from '../components/GameGrid';
import Vehicle from '../components/Vehicle';
import GameHeader from '../components/GameHeader';
import LevelCompleteModal from '../components/LevelCompleteModal';
import { buildOccupancyMap } from '../utils/gridUtils';
import { canMove } from '../utils/collision';
import { hasReachedExit, calculateStars, isNewBest } from '../utils/gameLogic';
import { playSound, initSounds } from '../utils/soundManager';
import {
  getLevelProgress,
  saveLevelProgress,
  getSoundEnabled,
  setSoundEnabled,
} from '../utils/storage';
import { useGameStore } from '../store/gameStore';
import { LevelData, VehicleData } from '../types';
import { level_001 } from '../levels/level_001';

const GRID_OFFSET_Y = 100; // Hardcoded for this milestone check

export default function GameScreen() {
  const [level] = useState<LevelData>(level_001 as LevelData);
  const [vehicles, setVehicles] = useState<VehicleData[]>(level.vehicles);
  const [moveCount, setMoveCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [starsEarned, setStarsEarned] = useState(0);
  const [isSoundEnabled, setIsSoundEnabled] = useState(getSoundEnabled());
  const [showModal, setShowModal] = useState(false);
  const [isNewBestScore, setIsNewBestScore] = useState(false);

  // Initialize sounds on mount
  useEffect(() => {
    initSounds();
  }, []);

  // Check win condition after every move
  useEffect(() => {
    if (!isCompleted && hasReachedExit(vehicles, level)) {
      handleLevelComplete();
    }
  }, [vehicles, isCompleted]);

  const handleLevelComplete = useCallback(() => {
    // Calculate stars
    const stars = calculateStars(moveCount, level.stars);
    
    // Check if new best
    const previousProgress = getLevelProgress(level.id);
    const isNewBestScore = isNewBest(moveCount, previousProgress?.bestMoves || null);
    
    // Save progress
    saveLevelProgress({
      levelId: level.id,
      completed: true,
      bestMoves: moveCount,
      starsEarned: stars,
    });
    
    // Play win sound
    playSound('win', isSoundEnabled);
    
    // Update state and show modal
    setIsCompleted(true);
    setStarsEarned(stars);
    setIsNewBestScore(isNewBestScore);
    
    // Delay modal slightly for better UX
    setTimeout(() => {
      setShowModal(true);
    }, 500);
  }, [moveCount, level, vehicles, isSoundEnabled]);

  const handleMoveCommit = useCallback((vehicleId: string, steps: number) => {
    if (isCompleted) return; // Prevent moves after completion
    
    setVehicles(currentVehicles => {
      const vehicle = currentVehicles.find(v => v.id === vehicleId);
      if (!vehicle) return currentVehicles;

      // Build map excluding the moving vehicle
      const others = currentVehicles.filter(v => v.id !== vehicleId);
      const occupancy = buildOccupancyMap(others);

      // Find max steps in requested direction
      const allowedSteps = canMove(vehicle, steps, occupancy, level.backgroundGrid);

      if (allowedSteps !== 0) {
        // Play move sound
        playSound('move', isSoundEnabled);
        
        // Increment move counter
        setMoveCount(prev => prev + 1);
        
        return currentVehicles.map(v => {
          if (v.id !== vehicleId) return v;
          return {
             ...v,
             x: v.direction === 'horizontal' ? v.x + allowedSteps : v.x,
             y: v.direction === 'vertical' ? v.y + allowedSteps : v.y,
          };
        });
      } else {
        // Play invalid sound when blocked
        playSound('invalid', isSoundEnabled);
      }

      return currentVehicles; // No change if blocked
    });
  }, [level, isCompleted, isSoundEnabled]);

  const handleReset = useCallback(() => {
    setVehicles(level.vehicles);
    setMoveCount(0);
    setIsCompleted(false);
    setStarsEarned(0);
    setShowModal(false);
    setIsNewBestScore(false);
  }, [level]);

  const handleToggleSound = useCallback(() => {
    const newValue = !isSoundEnabled;
    setIsSoundEnabled(newValue);
    setSoundEnabled(newValue);
  }, [isSoundEnabled]);

  const handleNextLevel = useCallback(() => {
    // TODO: Load next level when multiple levels are implemented
    // For now, just reset the current level
    setShowModal(false);
    handleReset();
  }, [handleReset]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <GameHeader
        levelNumber={level.id}
        moveCount={moveCount}
        optimalMoves={level.minMoves}
        isSoundEnabled={isSoundEnabled}
        onReset={handleReset}
        onToggleSound={handleToggleSound}
      />
      
      {/* Game Board */}
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
            isHinted={false}
          />
        ))}
      </View>
      
      {/* Completion Modal */}
      <LevelCompleteModal
        visible={showModal}
        levelNumber={level.id}
        moveCount={moveCount}
        optimalMoves={level.minMoves}
        starsEarned={starsEarned}
        isNewBest={isNewBestScore}
        onRetry={handleReset}
        onNextLevel={handleNextLevel}
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
