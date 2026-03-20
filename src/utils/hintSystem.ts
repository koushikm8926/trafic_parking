import { VehicleData, LevelData } from '../types';
import { buildOccupancyMap } from './gridUtils';
import { canMove } from './collision';

export interface Hint {
  vehicleId: string;
  direction: 'forward' | 'backward';
  steps: number;
}

/**
 * Simple heuristic-based hint system
 * Prioritizes moves that clear the path for the target vehicle
 */
export function getHint(
  vehicles: VehicleData[],
  level: LevelData
): Hint | null {
  const target = vehicles.find(v => v.isTarget);
  if (!target) return null;
  
  // Check if target can move to exit
  const targetHint = getTargetMoveHint(target, vehicles, level);
  if (targetHint) return targetHint;
  
  // Find blocking vehicles and suggest moves to clear them
  const blockingHint = getBlockingVehicleHint(target, vehicles, level);
  if (blockingHint) return blockingHint;
  
  // If no obvious hint, suggest any valid move
  return getAnyValidMove(vehicles, level);
}

function getTargetMoveHint(
  target: VehicleData,
  vehicles: VehicleData[],
  level: LevelData
): Hint | null {
  const others = vehicles.filter(v => v.id !== target.id);
  const occupancy = buildOccupancyMap(others, level.gridWidth, level.gridHeight);
  
  // Try moving target forward (towards exit)
  const stepsToExit = level.gridWidth - (target.x + target.length);
  if (stepsToExit > 0) {
    const allowedSteps = canMove(target, stepsToExit, occupancy, level.backgroundGrid);
    if (allowedSteps > 0) {
      return {
        vehicleId: target.id,
        direction: 'forward',
        steps: allowedSteps,
      };
    }
  }
  
  return null;
}

function getBlockingVehicleHint(
  target: VehicleData,
  vehicles: VehicleData[],
  level: LevelData
): Hint | null {
  // Find vehicles that block the target's path
  const targetRow = target.y;
  const targetFrontCol = target.x + target.length;
  
  // Check for vertical vehicles blocking the horizontal target
  for (const vehicle of vehicles) {
    if (vehicle.id === target.id) continue;
    
    if (vehicle.direction === 'vertical') {
      // Check if this vehicle is in the target's row
      const vehicleCol = vehicle.x;
      const vehicleStartRow = vehicle.y;
      const vehicleEndRow = vehicle.y + vehicle.length - 1;
      
      if (vehicleCol >= targetFrontCol &&
          targetRow >= vehicleStartRow &&
          targetRow <= vehicleEndRow) {
        // This vehicle blocks the target, try to move it
        const hint = getSuggestedMoveForVehicle(vehicle, vehicles, level);
        if (hint) return hint;
      }
    }
  }
  
  return null;
}

function getSuggestedMoveForVehicle(
  vehicle: VehicleData,
  vehicles: VehicleData[],
  level: LevelData
): Hint | null {
  const others = vehicles.filter(v => v.id !== vehicle.id);
  const occupancy = buildOccupancyMap(others, level.gridWidth, level.gridHeight);
  
  // Try moving forward
  const forwardSteps = canMove(vehicle, 1, occupancy, level.backgroundGrid);
  if (forwardSteps !== 0) {
    return {
      vehicleId: vehicle.id,
      direction: forwardSteps > 0 ? 'forward' : 'backward',
      steps: Math.abs(forwardSteps),
    };
  }
  
  // Try moving backward
  const backwardSteps = canMove(vehicle, -1, occupancy, level.backgroundGrid);
  if (backwardSteps !== 0) {
    return {
      vehicleId: vehicle.id,
      direction: backwardSteps < 0 ? 'backward' : 'forward',
      steps: Math.abs(backwardSteps),
    };
  }
  
  return null;
}

function getAnyValidMove(
  vehicles: VehicleData[],
  level: LevelData
): Hint | null {
  // Try to find any valid move
  for (const vehicle of vehicles) {
    const hint = getSuggestedMoveForVehicle(vehicle, vehicles, level);
    if (hint) return hint;
  }
  
  return null;
}
