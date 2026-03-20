import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const GRID_SIZE = 6;
export const CELL_WIDTH = Math.floor((SCREEN_WIDTH * 0.85) / GRID_SIZE);
export const CELL_HEIGHT = Math.floor((SCREEN_HEIGHT * 0.6) / GRID_SIZE); // Taller cells
export const GRID_OFFSET_X = Math.floor((SCREEN_WIDTH - CELL_WIDTH * GRID_SIZE) / 2);
// GRID_OFFSET_Y is set per-layout in GameScreen based on safe area insets

export function gridToPixel(col: number, row: number) {
  return {
    x: GRID_OFFSET_X + col * CELL_WIDTH,
    y: row * CELL_HEIGHT, // add GRID_OFFSET_Y in component
  };
}

export function pixelToGrid(px: number, py: number, offsetY: number) {
  return {
    col: Math.round((px - GRID_OFFSET_X) / CELL_WIDTH),
    row: Math.round((py - offsetY) / CELL_HEIGHT),
  };
}

import { VehicleData } from '../types';

export function buildOccupancyMap(vehicles: VehicleData[]): boolean[][] {
  const map: boolean[][] = Array.from({ length: GRID_SIZE }, () =>
    Array(GRID_SIZE).fill(false)
  );

  for (const v of vehicles) {
    for (let i = 0; i < v.length; i++) {
      const col = v.direction === 'horizontal' ? v.x + i : v.x;
      const row = v.direction === 'vertical' ? v.y + i : v.y;
      if (col >= 0 && col < GRID_SIZE && row >= 0 && row < GRID_SIZE) {
        map[row][col] = true;
      }
    }
  }
  return map;
}

export function calcStars(
    moveCount: number,
    thresholds: [number, number, number] // [3star, 2star, 1star]
): 0 | 1 | 2 | 3 {
  if (moveCount <= thresholds[0]) return 3;
  if (moveCount <= thresholds[1]) return 2;
  if (moveCount <= thresholds[2]) return 1;
  return 0; // level complete but no star improvement
}
