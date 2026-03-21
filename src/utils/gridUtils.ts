import { VehicleData } from '../types';

/**
 * Creates a unique key for a grid cell coordinate.
 */
export const cellKey = (x: number, y: number): string => `${x},${y}`;

/**
 * Returns an array of cell coordinates occupied by a vehicle.
 */
export const getVehicleCells = (vehicle: VehicleData): { x: number; y: number }[] => {
  const cells: { x: number; y: number }[] = [];
  for (let i = 0; i < vehicle.length; i++) {
    cells.push({
      x: vehicle.direction === 'horizontal' ? vehicle.x + i : vehicle.x,
      y: vehicle.direction === 'vertical' ? vehicle.y + i : vehicle.y,
    });
  }
  return cells;
};

/**
 * Builds a map of all occupied cells on the grid for O(1) lookup.
 * Returns a Map where the key is "x,y" and the value is the vehicle ID.
 */
export function buildOccupancyMap(
  vehicles: VehicleData[],
  gridWidth: number,
  gridHeight: number
): Map<string, string> {
  const map = new Map<string, string>();

  vehicles.forEach((vehicle) => {
    const cells = getVehicleCells(vehicle);
    cells.forEach((cell) => {
      // Basic out-of-bounds check (not strictly required for the map itself but good practice)
      if (cell.x >= 0 && cell.x < gridWidth && cell.y >= 0 && cell.y < gridHeight) {
        map.set(cellKey(cell.x, cell.y), vehicle.id);
      }
    });
  });

  return map;
}
