import { VehicleData, CellValue } from '../types';
import { cellKey, getVehicleCells } from '../utils/gridUtils';

/**
 * Checks if a vehicle is in a position where it can escape the grid.
 * MUST be defined before canMove since canMove references it as a worklet.
 */
export const checkEscape = (
  vehicle: VehicleData,
  gridWidth: number,
  gridHeight: number,
  backgroundGrid: CellValue[][]
): { canEscape: boolean; direction: string | null } => {
  'worklet';

  const cells = getVehicleCells(vehicle);

  for (const cell of cells) {
    // If any cell is out of bounds, the vehicle has escaped
    if (cell.x < 0 || cell.x >= gridWidth || cell.y < 0 || cell.y >= gridHeight) {
      return { canEscape: true, direction: 'out' };
    }
    // Exit tile (3) or road tile (1)
    if (backgroundGrid[cell.y] && (backgroundGrid[cell.y][cell.x] === 3 || backgroundGrid[cell.y][cell.x] === 1)) {
      return { canEscape: true, direction: 'out' };
    }
  }

  return { canEscape: false, direction: null };
};

/**
 * Returns the maximum number of cells a vehicle can legally slide in a given direction.
 * Positive delta for right/down, negative for left/up.
 */
export const canMove = (
  vehicleId: string,
  deltaX: number,
  deltaY: number,
  vehicles: VehicleData[],
  occupancyMap: Record<string, string>,
  gridWidth: number,
  gridHeight: number,
  backgroundGrid: CellValue[][]
): number => {
  'worklet';

  const vehicle = vehicles.find((v) => v.id === vehicleId);
  if (!vehicle) return 0;

  const isHorizontal = vehicle.direction === 'horizontal';
  const steps = isHorizontal ? Math.round(deltaX) : Math.round(deltaY);
  if (steps === 0) return 0;

  const direction = steps > 0 ? 1 : -1;
  const absSteps = Math.abs(steps);
  let allowedSteps = 0;

  for (let i = 1; i <= absSteps; i++) {
    const nextX = vehicle.x + (isHorizontal ? i * direction : 0);
    const nextY = vehicle.y + (isHorizontal ? 0 : i * direction);

    // Stop if we've gone too far off-grid
    if (nextX < -vehicle.length || nextY < -vehicle.length) break;

    const cells = getVehicleCells({ ...vehicle, x: nextX, y: nextY });
    const isOutOfBounds = cells.some(
      (c) => c.x < 0 || c.x >= gridWidth || c.y < 0 || c.y >= gridHeight
    );

    if (isOutOfBounds) {
      const escape = checkEscape(
        { ...vehicle, x: nextX, y: nextY },
        gridWidth,
        gridHeight,
        backgroundGrid
      );
      if (escape.canEscape) {
        allowedSteps = i * direction;
      } else {
        break;
      }
    }

    // Collision with other vehicles
    const hasCollision = cells.some((c) => {
      if (c.x < 0 || c.x >= gridWidth || c.y < 0 || c.y >= gridHeight) return false;
      const occupantId = occupancyMap[cellKey(c.x, c.y)];
      return occupantId && occupantId !== vehicleId;
    });
    if (hasCollision) break;

    // Wall collision (cell value 2)
    const hasWallCollision = cells.some((c) => {
      if (c.x < 0 || c.x >= gridWidth || c.y < 0 || c.y >= gridHeight) return false;
      return backgroundGrid[c.y] && backgroundGrid[c.y][c.x] === 2;
    });
    if (hasWallCollision) break;

    allowedSteps = i * direction;
  }

  return allowedSteps;
};
