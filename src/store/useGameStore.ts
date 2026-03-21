import { create } from 'zustand';
import { VehicleData } from '../types';
import { getLevelById } from '../levels';
import { checkEscape } from '../engine/Grid';

interface HistoryItem {
  vehicles: VehicleData[];
  moveCount: number;
}

interface GameState {
  vehicles: VehicleData[];
  history: HistoryItem[];
  moveCount: number;
  levelId: number | null;
  isWin: boolean;
  
  // Actions
  initLevel: (levelId: number) => void;
  moveVehicle: (vehicleId: string, deltaX: number, deltaY: number) => void;
  undo: () => void;
  resetLevel: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  vehicles: [],
  history: [],
  moveCount: 0,
  levelId: null,
  isWin: false,

  initLevel: (levelId: number) => {
    const level = getLevelById(levelId);
    if (level) {
      set({
        levelId,
        vehicles: level.vehicles,
        history: [],
        moveCount: 0,
        isWin: false,
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
        const afterEscape = nextVehicles.filter(v => v.id !== vehicleId);
        set({
          vehicles: afterEscape,
          history: newHistory,
          moveCount: moveCount + 1,
          isWin: afterEscape.length === 0,
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
}));
