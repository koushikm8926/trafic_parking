// Initialize MMKV storage with error handling
let storage: any = null;
let storageAvailable = false;

try {
  const { MMKV } = require('react-native-mmkv');
  storage = new MMKV({
    id: 'traffic-parking-storage',
  });
  storageAvailable = true;
} catch (error) {
  console.warn('MMKV not available, using in-memory storage fallback');
  // Fallback to in-memory storage
  const memoryStore: Record<string, any> = {};
  storage = {
    getBoolean: (key: string) => memoryStore[key],
    set: (key: string, value: any) => { memoryStore[key] = value; },
    getString: (key: string) => memoryStore[key],
    getNumber: (key: string) => memoryStore[key],
    clearAll: () => { Object.keys(memoryStore).forEach(k => delete memoryStore[k]); },
  };
}

// Storage keys
const KEYS = {
  SOUND_ENABLED: 'sound_enabled',
  LEVEL_PROGRESS: 'level_progress',
  CURRENT_LEVEL: 'current_level',
  ACHIEVEMENTS: 'achievements',
  STATISTICS: 'statistics',
  HAPTICS_ENABLED: 'haptics_enabled',
} as const;

// Type for level completion data
export interface LevelProgress {
  levelId: number;
  completed: boolean;
  bestMoves: number;
  starsEarned: number;
  completedAt?: string;
}

/**
 * Sound preferences
 */
export function getSoundEnabled(): boolean {
  const value = storage.getBoolean(KEYS.SOUND_ENABLED);
  return value !== undefined ? value : true; // Default to enabled
}

export function setSoundEnabled(enabled: boolean): void {
  storage.set(KEYS.SOUND_ENABLED, enabled);
}

/**
 * Level progress tracking
 */
export function getLevelProgress(levelId: number): LevelProgress | null {
  const allProgress = getAllLevelProgress();
  return allProgress[levelId] || null;
}

export function getAllLevelProgress(): Record<number, LevelProgress> {
  const json = storage.getString(KEYS.LEVEL_PROGRESS);
  if (!json) return {};
  
  try {
    return JSON.parse(json);
  } catch (error) {
    console.warn('Failed to parse level progress:', error);
    return {};
  }
}

export function saveLevelProgress(progress: LevelProgress): void {
  const allProgress = getAllLevelProgress();
  const existing = allProgress[progress.levelId];
  
  // Only update if this is a better score or first completion
  if (!existing || progress.bestMoves < existing.bestMoves) {
    allProgress[progress.levelId] = {
      ...progress,
      completedAt: new Date().toISOString(),
    };
    
    storage.set(KEYS.LEVEL_PROGRESS, JSON.stringify(allProgress));
  }
}

export function clearLevelProgress(levelId: number): void {
  const allProgress = getAllLevelProgress();
  delete allProgress[levelId];
  storage.set(KEYS.LEVEL_PROGRESS, JSON.stringify(allProgress));
}

/**
 * Current level tracking
 */
export function getCurrentLevelId(): number {
  const value = storage.getNumber(KEYS.CURRENT_LEVEL);
  return value !== undefined ? value : 1; // Default to level 1
}

export function setCurrentLevelId(levelId: number): void {
  storage.set(KEYS.CURRENT_LEVEL, levelId);
}

/**
 * Utility to check if a level is unlocked
 * By default, level 1 is always unlocked
 * Other levels unlock when previous level is completed
 */
export function isLevelUnlocked(levelId: number): boolean {
  if (levelId === 1) return true;
  
  const previousLevel = getLevelProgress(levelId - 1);
  return previousLevel?.completed ?? false;
}

/**
 * Get total stars earned across all levels
 */
export function getTotalStars(): number {
  const allProgress = getAllLevelProgress();
  return Object.values(allProgress).reduce((sum, level) => sum + level.starsEarned, 0);
}

/**
 * Achievements storage
 */
export function getAchievements(): Record<string, any> {
  const json = storage.getString(KEYS.ACHIEVEMENTS);
  if (!json) return {};
  
  try {
    return JSON.parse(json);
  } catch (error) {
    return {};
  }
}

export function saveAchievement(achievementId: string, data: any): void {
  const achievements = getAchievements();
  achievements[achievementId] = {
    ...data,
    unlockedAt: new Date().toISOString(),
  };
  storage.set(KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
}

export function isAchievementUnlocked(achievementId: string): boolean {
  const achievements = getAchievements();
  return achievements[achievementId]?.unlocked ?? false;
}

/**
 * Statistics storage
 */
export interface GameStatistics {
  totalMoves: number;
  totalLevelsCompleted: number;
  totalUndos: number;
  totalHintsUsed: number;
  totalResets: number;
  totalPlayTime: number; // in seconds
  fastestLevelTime: number;
  slowestLevelTime: number;
}

export function getStatistics(): GameStatistics {
  const json = storage.getString(KEYS.STATISTICS);
  if (!json) {
    return {
      totalMoves: 0,
      totalLevelsCompleted: 0,
      totalUndos: 0,
      totalHintsUsed: 0,
      totalResets: 0,
      totalPlayTime: 0,
      fastestLevelTime: Infinity,
      slowestLevelTime: 0,
    };
  }
  
  try {
    return JSON.parse(json);
  } catch (error) {
    return {
      totalMoves: 0,
      totalLevelsCompleted: 0,
      totalUndos: 0,
      totalHintsUsed: 0,
      totalResets: 0,
      totalPlayTime: 0,
      fastestLevelTime: Infinity,
      slowestLevelTime: 0,
    };
  }
}

export function updateStatistics(updates: Partial<GameStatistics>): void {
  const current = getStatistics();
  const updated = { ...current, ...updates };
  storage.set(KEYS.STATISTICS, JSON.stringify(updated));
}

export function incrementStatistic(key: keyof GameStatistics, amount: number = 1): void {
  const stats = getStatistics();
  const currentValue = stats[key] as number;
  updateStatistics({ [key]: currentValue + amount });
}

/**
 * Haptics preference
 */
export function getHapticsEnabled(): boolean {
  const value = storage.getBoolean(KEYS.HAPTICS_ENABLED);
  return value !== undefined ? value : true; // Default to enabled
}

export function setHapticsEnabled(enabled: boolean): void {
  storage.set(KEYS.HAPTICS_ENABLED, enabled);
}

/**
 * Clear all storage (for debugging/testing)
 */
export function clearAllStorage(): void {
  storage.clearAll();
}

/**
 * Export storage instance for advanced use cases
 */
export { storage };
