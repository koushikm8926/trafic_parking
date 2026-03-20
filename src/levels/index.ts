import { LevelData } from '../types';
const levelsJson = require('./levels.json');
export const allLevels: LevelData[] = levelsJson as LevelData[];

export function getLevelById(id: number): LevelData | null {
  return allLevels.find(level => level.id === id) || null;
}

export function getNextLevel(currentId: number): LevelData | null {
  const nextId = currentId + 1;
  return getLevelById(nextId);
}

export function getTotalLevels(): number {
  return allLevels.length;
}

export function isLastLevel(levelId: number): boolean {
  return levelId >= allLevels.length;
}
