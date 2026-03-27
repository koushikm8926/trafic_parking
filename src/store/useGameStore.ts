import { create } from 'zustand';
import { VehicleData, GuardData } from '../types';
import { getLevelById } from '../levels';
import { checkEscape } from '../engine/Grid';

interface HistoryItem {
  vehicles: VehicleData[];
  moveCount: number;
}

interface GameState {
  vehicles: VehicleData[];
  guards: GuardData[];
  history: HistoryItem[];
  moveCount: number;
  levelId: number | null;
  isWin: boolean;
  isGameOver: boolean;
  
  // Actions
  initLevel: (levelId: number) => void;
  moveVehicle: (vehicleId: string, deltaX: number, deltaY: number) => void;
  removeEscapedVehicle: (vehicleId: string) => void;
  updateGuardPosition: (guardId: string, position: number) => void;
  checkGuardCollision: () => void;
  setGameOver: (gameOver: boolean) => void;
  undo: () => void;
  resetLevel: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  vehicles: [],
  guards: [],
  history: [],
  moveCount: 0,
  levelId: null,
  isWin: false,
  isGameOver: false,

  initLevel: (levelId: number) => {
    const level = getLevelById(levelId);
    if (level) {
      // Initialize guards with their starting positions
      const initialGuards = level.guards?.map(g => ({
        ...g,
        currentPosition: g.startCell,
        direction: 1 as 1 | -1,
      })) || [];
      
      set({
        levelId,
        vehicles: level.vehicles,
        guards: initialGuards,
        history: [],
        moveCount: 0,
        isWin: false,
        isGameOver: false,
      });
    }
  },

  moveVehicle: (vehicleId, deltaX, deltaY) => {
    const { vehicles, history, moveCount, levelId } = get();
    if (deltaX === 0 && deltaY === 0) return;

    const level = levelId ? getLevelById(levelId) : null;
    if (!level) return;

    // Save current state to history BEFORE moving
    const newHistory = [...history, { vehicles: [...vehicles], moveCount }];

    const nextVehicles = vehicles.map((v) => {
      if (v.id === vehicleId) {
        return { ...v, x: v.x + deltaX, y: v.y + deltaY };
      }
      return v;
    });

    const movedVehicle = nextVehicles.find(v => v.id === vehicleId);
    if (movedVehicle) {
      const escapeStatus = checkEscape(
        movedVehicle,
        level.gridWidth,
        level.gridHeight,
        level.backgroundGrid
      );

      if (escapeStatus.canEscape) {
        // Determine which wall the vehicle hit based on its position
        let escapedFrom: 'top' | 'bottom' | 'left' | 'right' = 'right';
        if (movedVehicle.direction === 'vertical') {
          escapedFrom = movedVehicle.y <= 0 ? 'top' : 'bottom';
        } else {
          escapedFrom = movedVehicle.x <= 0 ? 'left' : 'right';
        }

        const afterEscape = nextVehicles.map(v =>
          v.id === vehicleId ? { ...v, isEscaping: true, escapedFrom } : v
        );
        set({
          vehicles: afterEscape,
          history: newHistory,
          moveCount: moveCount + 1,
          isWin: false, // defer until animation completes
        });
        return;
      }
    }

    set({
      vehicles: nextVehicles,
      history: newHistory,
      moveCount: moveCount + 1,
    });
  },

  removeEscapedVehicle: (vehicleId: string) => {
    const { vehicles } = get();
    const remaining = vehicles.filter(v => v.id !== vehicleId);
    // Win only when all non-escaping (active) vehicles are gone
    const activeRemaining = remaining.filter(v => !v.isEscaping);
    set({
      vehicles: remaining,
      isWin: activeRemaining.length === 0,
    });
  },

  undo: () => {
    const { history } = get();
    if (history.length === 0) return;

    const previousState = history[history.length - 1];
    const newHistory = history.slice(0, -1);

    set({
      vehicles: previousState.vehicles,
      moveCount: previousState.moveCount,
      history: newHistory,
      isWin: false, // Undo always reverts from a win state if it was the last move
    });
  },
  
  resetLevel: () => {
    const { levelId } = get();
    if (levelId !== null) {
      get().initLevel(levelId);
    }
  },

  updateGuardPosition: (guardId: string, position: number) => {
    const { guards } = get();
    const updatedGuards = guards.map(g =>
      g.id === guardId ? { ...g, currentPosition: position } : g
    );
    set({ guards: updatedGuards });
  },

  checkGuardCollision: () => {
    const { vehicles, guards, levelId, isGameOver } = get();
    if (isGameOver) return; // Already game over
    
    const level = levelId ? getLevelById(levelId) : null;
    if (!level || !guards || guards.length === 0) return;

    for (const guard of guards) {
      for (const vehicle of vehicles) {
        if (vehicle.isEscaping) continue; // Skip escaping vehicles

        // Calculate the cells occupied by the vehicle
        const vehicleCells: { x: number; y: number }[] = [];
        for (let i = 0; i < vehicle.length; i++) {
          if (vehicle.direction === 'horizontal') {
            vehicleCells.push({ x: vehicle.x + i, y: vehicle.y });
          } else {
            vehicleCells.push({ x: vehicle.x, y: vehicle.y + i });
          }
        }

        // Check if any vehicle cell overlaps with guard position
        const guardCell = { x: 0, y: 0 };
        switch (guard.side) {
          case 'right':
            guardCell.x = level.gridWidth - 1;
            guardCell.y = Math.floor(guard.currentPosition);
            break;
          case 'left':
            guardCell.x = 0;
            guardCell.y = Math.floor(guard.currentPosition);
            break;
          case 'top':
            guardCell.x = Math.floor(guard.currentPosition);
            guardCell.y = 0;
            break;
          case 'bottom':
            guardCell.x = Math.floor(guard.currentPosition);
            guardCell.y = level.gridHeight - 1;
            break;
        }

        // Check collision
        const collision = vehicleCells.some(
          cell => cell.x === guardCell.x && cell.y === guardCell.y
        );

        if (collision) {
          set({ isGameOver: true });
          return;
        }
      }
    }
  },

  setGameOver: (gameOver: boolean) => {
    set({ isGameOver: gameOver });
  },
}));
