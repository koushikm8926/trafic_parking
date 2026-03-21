import { MMKV } from 'react-native-mmkv';

export const storage = new MMKV();

export interface LevelStats {
  moves: number;
  stars: number;
  completedAt: number;
}

const KEYS = {
  UNLOCKED_LEVELS: 'unlocked_levels',
  LEVEL_STATS_PREFIX: 'level_stats_',
};

/**
 * Returns whether a level is unlocked. Level 1 is always unlocked.
 */
export const isLevelUnlocked = (levelId: number): boolean => {
  if (levelId === 1) return true;
  const unlocked = storage.getString(KEYS.UNLOCKED_LEVELS);
  if (!unlocked) return false;
  try {
    const unlockedList: number[] = JSON.parse(unlocked);
    return unlockedList.includes(levelId);
  } catch {
    return false;
  }
};

/**
 * Mark a level as unlocked.
 */
export const unlockLevel = (levelId: number) => {
  const unlocked = storage.getString(KEYS.UNLOCKED_LEVELS);
  let unlockedList: number[] = unlocked ? JSON.parse(unlocked) : [1];
  if (!unlockedList.includes(levelId)) {
    unlockedList.push(levelId);
    storage.set(KEYS.UNLOCKED_LEVELS, JSON.stringify(unlockedList));
  }
};

/**
 * Save the result of a level completion.
 */
export const saveLevelResult = (levelId: number, moves: number, stars: number) => {
  const currentStats = getLevelStats(levelId);
  
  // Save if it's the first time or if the new result is better
  if (!currentStats || moves < currentStats.moves || stars > currentStats.stars) {
    const stats: LevelStats = {
      moves,
      stars,
      completedAt: Date.now(),
    };
    storage.set(`${KEYS.LEVEL_STATS_PREFIX}${levelId}`, JSON.stringify(stats));
  }
};

/**
 * Retrieve the saved results for a specific level.
 */
export const getLevelStats = (levelId: number): LevelStats | null => {
  const stats = storage.getString(`${KEYS.LEVEL_STATS_PREFIX}${levelId}`);
  if (!stats) return null;
  try {
    return JSON.parse(stats);
  } catch {
    return null;
  }
};
