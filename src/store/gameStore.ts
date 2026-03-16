import { create } from 'zustand';
import { VehicleData, LevelData } from '../types';
import { level_001 } from '../levels/level_001';

export interface GameState {
  // Level state
  currentLevel: LevelData;
  vehicles: VehicleData[];
  moveCount: number;
  isCompleted: boolean;
  starsEarned: number;
  
  // Settings
  isSoundEnabled: boolean;
  
  // Actions
  initLevel: (level: LevelData) => void;
  moveVehicle: (vehicleId: string, newX: number, newY: number) => void;
  resetLevel: () => void;
  completeLevel: (stars: number) => void;
  toggleSound: () => void;
  checkWinCondition: () => boolean;
}

export const useGameStore = create<GameState>((set, get) => ({
  // Initial state
  currentLevel: level_001 as LevelData,
  vehicles: (level_001 as LevelData).vehicles,
  moveCount: 0,
  isCompleted: false,
  starsEarned: 0,
  isSoundEnabled: true,
  
  // Initialize or load a level
  initLevel: (level: LevelData) => set({
    currentLevel: level,
    vehicles: level.vehicles,
    moveCount: 0,
    isCompleted: false,
    starsEarned: 0,
  }),
  
  // Move a vehicle and increment move counter
  moveVehicle: (vehicleId: string, newX: number, newY: number) => {
    const { vehicles, moveCount } = get();
    const updatedVehicles = vehicles.map(v =>
      v.id === vehicleId ? { ...v, x: newX, y: newY } : v
    );
    
    set({
      vehicles: updatedVehicles,
      moveCount: moveCount + 1,
    });
  },
  
  // Reset the current level
  resetLevel: () => {
    const { currentLevel } = get();
    set({
      vehicles: currentLevel.vehicles,
      moveCount: 0,
      isCompleted: false,
      starsEarned: 0,
    });
  },
  
  // Mark level as completed with star rating
  completeLevel: (stars: number) => set({
    isCompleted: true,
    starsEarned: stars,
  }),
  
  // Toggle sound on/off
  toggleSound: () => set((state) => ({
    isSoundEnabled: !state.isSoundEnabled,
  })),
  
  // Check if win condition is met
  checkWinCondition: () => {
    const { vehicles, currentLevel } = get();
    const target = vehicles.find(v => v.isTarget);
    
    if (!target) return false;
    
    // For horizontal target vehicle, check if it reached the right edge exit
    if (target.direction === 'horizontal') {
      const exitCol = target.x + target.length;
      const exitRow = target.y;
      
      // Check if vehicle front is at or past the exit (cell value 3)
      if (exitCol >= currentLevel.gridWidth) {
        return true;
      }
      
      // Or if the next cell is marked as exit
      if (exitCol < currentLevel.gridWidth &&
          currentLevel.backgroundGrid[exitRow][exitCol] === 3) {
        return true;
      }
    }
    
    return false;
  },
}));
