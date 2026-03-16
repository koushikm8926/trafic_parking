import { LevelData, VehicleData } from '../types';

/**
 * Check if the target vehicle has reached the exit
 */
export function hasReachedExit(
  vehicles: VehicleData[],
  level: LevelData
): boolean {
  const target = vehicles.find(v => v.isTarget);
  
  if (!target) return false;
  
  // For horizontal target vehicle, check if it reached the right edge exit
  if (target.direction === 'horizontal') {
    const exitCol = target.x + target.length;
    const exitRow = target.y;
    
    // Check if vehicle front is at or past grid edge
    if (exitCol >= level.gridWidth) {
      return true;
    }
    
    // Or if the next cell is marked as exit (value 3)
    if (exitCol < level.gridWidth &&
        level.backgroundGrid[exitRow][exitCol] === 3) {
      return true;
    }
  }
  
  return false;
}

/**
 * Calculate star rating based on moves taken
 * Stars array format: [3-star threshold, 2-star threshold, 1-star threshold]
 * Example: [8, 12, 18] means:
 *   - 3 stars if moves <= 8
 *   - 2 stars if moves <= 12
 *   - 1 star if moves <= 18
 *   - 0 stars if moves > 18
 */
export function calculateStars(
  moveCount: number,
  starsThresholds: number[]
): number {
  if (starsThresholds.length !== 3) {
    console.warn('Invalid stars array, expected [3-star, 2-star, 1-star] thresholds');
    return 1; // Default to 1 star
  }
  
  const [threeStarMoves, twoStarMoves, oneStarMoves] = starsThresholds;
  
  if (moveCount <= threeStarMoves) return 3;
  if (moveCount <= twoStarMoves) return 2;
  if (moveCount <= oneStarMoves) return 1;
  
  return 0; // Completed but exceeded all thresholds
}

/**
 * Get star rating text description
 */
export function getStarRatingText(stars: number): string {
  switch (stars) {
    case 3:
      return 'Perfect!';
    case 2:
      return 'Great!';
    case 1:
      return 'Good!';
    case 0:
      return 'Completed';
    default:
      return 'Try Again';
  }
}

/**
 * Check if this is a new best score for the level
 */
export function isNewBest(
  currentMoves: number,
  previousBest: number | null
): boolean {
  if (previousBest === null) return true;
  return currentMoves < previousBest;
}
