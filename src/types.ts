// src/types.ts
export type Direction = 'horizontal' | 'vertical';
export type CellValue = 0 | 1 | 2 | 3; // 0=empty, 1=road, 2=wall, 3=exit

export interface VehicleData {
  id: string;           // 'v1', 'v2', 'truck_a' ...
  x: number;            // grid column of top-left cell
  y: number;            // grid row of top-left cell
  direction: Direction;
  length: 2;
  color: string;
  isEscaping?: boolean;                           // true while animating exit
  escapedFrom?: 'top' | 'bottom' | 'left' | 'right'; // which road wall was hit
}

export interface HazardData {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  speed: number;     // cells per second
  loopType: 'loop' | 'reverse';
}

export interface GuardData {
  id: string;
  startCell: number;   // Starting cell position (e.g., 4)
  endCell: number;     // Ending cell position (e.g., 9)
  side: 'top' | 'bottom' | 'left' | 'right';  // Which side of the grid
  speed: number;       // cells per second (default: 1)
  currentPosition: number;  // Current cell position
  direction: 1 | -1;   // 1 = moving toward end, -1 = moving toward start
}

export interface LevelData {
  id: number;
  gridWidth: number;
  gridHeight: number;
  backgroundGrid: CellValue[][];
  vehicles: VehicleData[];
  minMoves: number;
  stars: [number, number, number];  // [3star, 2star, 1star] move thresholds
  exitSide: 'right' | 'left' | 'top' | 'bottom';
  difficulty?: 'tutorial' | 'easy' | 'medium' | 'hard' | 'expert';
  hazards?: HazardData[];
  guards?: GuardData[];
}

export interface MoveRecord {
  vehicleId: string;
  fromX: number; 
  fromY: number;
  toX: number;   
  toY: number;
}
