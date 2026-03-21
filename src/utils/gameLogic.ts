import { VehicleData, LevelData, CellValue } from '../types';
import { buildOccupancyMap } from './gridUtils';
import { canMove, checkEscape } from '../engine/Grid';

/**
 * Checks if there are any legal moves left on the board.
 * If no vehicle can move at least 1 cell in any direction, the player is stuck.
 */
export const isStuck = (
  level: LevelData,
  vehicles: VehicleData[]
): boolean => {
  if (vehicles.length === 0) return false;

  const occupancyMap = buildOccupancyMap(vehicles, level.gridWidth, level.gridHeight);

  for (const vehicle of vehicles) {
    const isHorizontal = vehicle.direction === 'horizontal';
    
    // Check both directions
    const directions = [-1, 1];
    
    for (const dir of directions) {
      const steps = canMove(
        vehicle.id,
        isHorizontal ? dir : 0,
        isHorizontal ? 0 : dir,
        vehicles,
        occupancyMap,
        level.gridWidth,
        level.gridHeight,
        level.backgroundGrid
      );

      if (Math.abs(steps) >= 1) {
        return false; // Found at least one legal move
      }

      // Check for escape if at edge
      const escape = checkEscape(
        { ...vehicle, x: vehicle.x + (isHorizontal ? dir : 0), y: vehicle.y + (isHorizontal ? 0 : dir) },
        level.gridWidth,
        level.gridHeight,
        level.backgroundGrid
      );
      
      if (escape.canEscape) {
        return false;
      }
    }
  }

  return true; // No legal moves found for any vehicle
};

/**
 * Calculates current star rating based on move count.
 */
export const calculateStars = (moveCount: number, thresholds: [number, number, number]): 0 | 1 | 2 | 3 => {
  if (moveCount <= thresholds[0]) return 3;
  if (moveCount <= thresholds[1]) return 2;
  if (moveCount <= thresholds[2]) return 1;
  return 0;
};
