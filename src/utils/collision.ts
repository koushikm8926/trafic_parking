import { GRID_SIZE } from './gridUtils';
import { VehicleData } from '../types';

/**
 * Returns the number of steps the vehicle can actually move.
 * If steps = +2 but only 1 cell is free, returns +1.
 * If steps = -3 but 0 cells are free, returns 0.
 */
export function canMove(
  vehicle: VehicleData,
  requestedSteps: number,
  occupancy: boolean[][],
  backgroundGrid: number[][],
): number {
  const dir = Math.sign(requestedSteps);
  const absSteps = Math.abs(requestedSteps);
  let allowedSteps = 0;

  for (let step = 1; step <= absSteps; step++) {
    // Cell at the leading edge of the vehicle after `step` steps
    let checkCol: number;
    let checkRow: number;

    if (vehicle.direction === 'horizontal') {
      checkCol = dir > 0
        ? vehicle.x + vehicle.length - 1 + step // front
        : vehicle.x - step; // back
      checkRow = vehicle.y;
    } else {
      checkCol = vehicle.x;
      checkRow = dir > 0
        ? vehicle.y + vehicle.length - 1 + step
        : vehicle.y - step;
    }

    // Out of bounds — hard stop
    if (checkCol < 0 || checkCol >= GRID_SIZE ||
        checkRow < 0 || checkRow >= GRID_SIZE) break;

    // Wall — hard stop
    if (backgroundGrid[checkRow][checkCol] === 2) break;

    // Another vehicle — hard stop
    if (occupancy[checkRow][checkCol]) break;

    // Cell is free — allow this step
    allowedSteps = step * dir;
  }

  return allowedSteps;
}

/**
 * Returns true if the target vehicle's exit cell is clear.
 * Used by WinConditionSystem.
 */
export function isAtExit(
  vehicle: VehicleData,
  backgroundGrid: number[][],
): boolean {
  if (!vehicle.isTarget) return false;

  // Exit is always at the right edge for horizontal target
  const exitCol = vehicle.x + vehicle.length - 1;
  const exitRow = vehicle.y;

  // Check if the cell to the right is exit (3) or off-grid
  if (vehicle.direction === 'horizontal') {
    const frontCol = vehicle.x + vehicle.length;
    if (frontCol >= GRID_SIZE) return true; // drove off grid
    return backgroundGrid[exitRow][frontCol] === 3;
  }

  return false;
}
