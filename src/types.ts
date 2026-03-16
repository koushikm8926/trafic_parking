// src/types.ts — single source of truth for all interfaces
export type Direction = 'horizontal' | 'vertical';

export interface VehicleData {
  id: string; // unique, e.g. 'target', 'v1', 'v2'
  x: number; // grid column of top-left cell
  y: number; // grid row of top-left cell
  direction: Direction;
  length: number; // 2 = car, 3 = truck
  color: string; // hex color string
  isTarget: boolean; // true for the red exit car
}

export interface LevelData {
  id: number;
  gridWidth: number; // always 6
  gridHeight: number; // always 6
  backgroundGrid: number[][]; // 6x6 array, values 0/2/3
  vehicles: VehicleData[];
  minMoves: number; // optimal solution move count
  stars: [number, number, number]; // [3-star, 2-star, 1-star] move thresholds
  exitSide: 'right' | 'left' | 'top' | 'bottom'; // which edge exit is on
}

export interface MoveRecord {
  vehicleId: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
}

export interface LevelProgress {
  levelId: number;
  stars: 0 | 1 | 2 | 3;
  bestMoves: number;
  unlocked: boolean;
}

export type GameEvent =
  | { type: 'MOVE_COMMITTED'; move: MoveRecord }
  | { type: 'WIN_TRIGGERED' }
  | { type: 'UNDO_REQUESTED' }
  | { type: 'HINT_REQUESTED' };
