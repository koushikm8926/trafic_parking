import { VehicleData, LevelData, CellValue } from '../types';
import { buildOccupancyMap, cellKey } from './gridUtils';
import { checkEscape, canMove } from '../engine/Grid';

export interface HintMove {
  vehicleId: string;
  deltaX: number;
  deltaY: number;
}

/**
 * Serializes the current vehicle positions into a unique string key.
 */
export const serializeState = (vehicles: VehicleData[]): string => {
  return vehicles
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((v) => `${v.id}:${v.x},${v.y}`)
    .join('|');
};

/**
 * Finds the optimal first move to reach the "all vehicles escaped" state using BFS.
 */
export const findOptimalMove = (
  level: LevelData,
  currentVehicles: VehicleData[]
): HintMove | null => {
  const queue: { vehicles: VehicleData[]; firstMove: HintMove | null }[] = [
    { vehicles: currentVehicles, firstMove: null },
  ];
  const visited = new Set<string>();
  visited.add(serializeState(currentVehicles));

  let head = 0;
  // Limit BFS iterations to prevent infinite loops or excessive memory usage
  const MAX_ITERATIONS = 5000; 

  while (head < queue.length && head < MAX_ITERATIONS) {
    const { vehicles, firstMove } = queue[head++];

    if (vehicles.length === 0) {
      return firstMove;
    }

    const occupancyMap = buildOccupancyMap(vehicles, level.gridWidth, level.gridHeight);

    for (const vehicle of vehicles) {
      const isHorizontal = vehicle.direction === 'horizontal';
      
      // Try moving in both directions along the axis
      const directions = [-1, 1];
      
      for (const dir of directions) {
        // Find max steps in this direction
        const maxSteps = canMove(
          vehicle.id,
          isHorizontal ? dir * level.gridWidth : 0,
          isHorizontal ? 0 : dir * level.gridHeight,
          vehicles,
          occupancyMap,
          level.gridWidth,
          level.gridHeight,
          level.backgroundGrid
        );

        const absMaxSteps = Math.abs(maxSteps);
        
        // Explore moving 1 to absMaxSteps
        for (let s = 1; s <= absMaxSteps; s++) {
          const deltaX = isHorizontal ? s * dir : 0;
          const deltaY = isHorizontal ? 0 : s * dir;
          
          let nextVehicles = vehicles.map((v) =>
            v.id === vehicle.id ? { ...v, x: v.x + deltaX, y: v.y + deltaY } : v
          );

          const movedVehicle = nextVehicles.find((v) => v.id === vehicle.id)!;
          const escape = checkEscape(
            movedVehicle,
            level.gridWidth,
            level.gridHeight,
            level.backgroundGrid
          );

          if (escape.canEscape) {
            nextVehicles = nextVehicles.filter((v) => v.id !== vehicle.id);
          }

          const stateKey = serializeState(nextVehicles);
          if (!visited.has(stateKey)) {
            visited.add(stateKey);
            const currentMove: HintMove = { vehicleId: vehicle.id, deltaX, deltaY };
            queue.push({
              vehicles: nextVehicles,
              firstMove: firstMove || currentMove,
            });

            // If this move leads to win, return it immediately if it's the first move
            if (nextVehicles.length === 0) {
              return firstMove || currentMove;
            }
          }
        }
      }
    }
  }

  return null;
};
