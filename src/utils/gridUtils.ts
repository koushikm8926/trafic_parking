import { Dimensions } from 'react-native';
import { VehicleData } from '../types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export function calculateGridMetrics(gridWidth: number, gridHeight: number) {
  const cellWidth = Math.floor((SCREEN_WIDTH * 0.85) / gridWidth);
  const cellHeight = Math.floor((SCREEN_HEIGHT * 0.6) / gridHeight);
  const offsetX = Math.floor((SCREEN_WIDTH - cellWidth * gridWidth) / 2);
  const gridHeightTotal = cellHeight * gridHeight;
  const offsetY = Math.floor((SCREEN_HEIGHT - gridHeightTotal) / 2);

  return {
    cellWidth,
    cellHeight,
    offsetX,
    offsetY,
    gridWidth,
    gridHeight,
  };
}

export type GridMetrics = ReturnType<typeof calculateGridMetrics>;

export function gridToPixel(col: number, row: number, metrics: GridMetrics) {
  return {
    x: metrics.offsetX + col * metrics.cellWidth,
    y: metrics.offsetY + row * metrics.cellHeight,
  };
}

export function pixelToGrid(px: number, py: number, metrics: GridMetrics) {
  return {
    col: Math.round((px - metrics.offsetX) / metrics.cellWidth),
    row: Math.round((py - metrics.offsetY) / metrics.cellHeight),
  };
}

export function buildOccupancyMap(vehicles: VehicleData[], gridWidth: number, gridHeight: number): boolean[][] {
  const map: boolean[][] = Array.from({ length: gridHeight }, () =>
    Array(gridWidth).fill(false)
  );

  for (const v of vehicles) {
    for (let i = 0; i < v.length; i++) {
      const col = v.direction === 'horizontal' ? v.x + i : v.x;
      const row = v.direction === 'vertical' ? v.y + i : v.y;
      if (col >= 0 && col < gridWidth && row >= 0 && row < gridHeight) {
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
