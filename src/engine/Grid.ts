import { VehicleData, CellValue, Direction } from '../types';
import { cellKey } from '../utils/gridUtils';

/**
 * Returns the maximum number of cells a vehicle can legally slide in a given direction.
 * Positive delta for right/down, negative for left/up.
 */
export function canMove(
  vehicleId: string,
  deltaX: number,
  deltaY: number,
  vehicles: VehicleData[],
  occupancyMap: Map<string, string>,
  gridWidth: number,
  gridHeight: number,
  backgroundGrid: CellValue[][]
): number {
  'worklet';
  const vehicle = vehicles.find(v => v.id === vehicleId);
  if (!vehicle) return 0;

  const isHorizontal = vehicle.direction === 'horizontal';
  const stepsRequested = isHorizontal ? deltaX : deltaY;
  if (stepsRequested === 0) return 0;

  // Rule 01: Axis lock
  if (isHorizontal && deltaY !== 0) return 0;
  if (!isHorizontal && deltaX !== 0) return 0;

  const direction = stepsRequested > 0 ? 1 : -1;
  const absSteps = Math.abs(stepsRequested);
  let validSteps = 0;

  for (let s = 1; s <= absSteps; s++) {
    const currentStep = s * direction;
    
    // Determine the cell being "entered"
    let checkX = vehicle.x;
    let checkY = vehicle.y;

    if (isHorizontal) {
      checkX = direction > 0 ? vehicle.x + vehicle.length + s - 1 : vehicle.x - s;
    } else {
      checkY = direction > 0 ? vehicle.y + vehicle.length + s - 1 : vehicle.y - s;
    }

    // Boundary check for collision (we allow moving "to" the edge)
    if (checkX < 0 || checkX >= gridWidth || checkY < 0 || checkY >= gridHeight) {
      break;
    }

    // Occupancy check
    const occupant = occupancyMap.get(cellKey(checkX, checkY));
    if (occupant && occupant !== vehicleId) {
      break;
    }

    // Wall collision (cell value 2)
    if (backgroundGrid[checkY][checkX] === 2) {
      break;
    }

    validSteps = s;
  }

  return validSteps * direction;
}

/**
 * Checks if the vehicle has successfully escaped the grid.
 * According to Rule 02, it escapes when it reaches a free boundary.
 */
export function checkEscape(
  vehicle: VehicleData,
  gridWidth: number,
  gridHeight: number,
  backgroundGrid: CellValue[][]
): { canEscape: boolean; direction: 'left' | 'right' | 'up' | 'down' | null } {
  'worklet';
  const isHorizontal = vehicle.direction === 'horizontal';

  // Check if at Right edge and cell is exit (or just edge)
  if (isHorizontal) {
    if (vehicle.x + vehicle.length === gridWidth) {
      // Check if the edge cell is marked as exit (3) or is just a free edge
      if (backgroundGrid[vehicle.y][gridWidth - 1] === 3 || backgroundGrid[vehicle.y][gridWidth - 1] === 0) {
        return { canEscape: true, direction: 'right' };
      }
    }
    if (vehicle.x === 0) {
      if (backgroundGrid[vehicle.y][0] === 3 || backgroundGrid[vehicle.y][0] === 0) {
        return { canEscape: true, direction: 'left' };
      }
    }
  } else {
    if (vehicle.y + vehicle.length === gridHeight) {
      if (backgroundGrid[gridHeight - 1][vehicle.x] === 3 || backgroundGrid[gridHeight - 1][vehicle.x] === 0) {
        return { canEscape: true, direction: 'down' };
      }
    }
    if (vehicle.y === 0) {
      if (backgroundGrid[0][vehicle.x] === 3 || backgroundGrid[0][vehicle.x] === 0) {
        return { canEscape: true, direction: 'up' };
      }
    }
  }

  return { canEscape: false, direction: null };
}
