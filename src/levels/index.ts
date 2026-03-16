import { LevelData } from '../types';
import { level_001 } from './level_001';
import { level_002 } from './level_002';
import { level_003 } from './level_003';
import { level_004 } from './level_004';
import { level_005 } from './level_005';
import { level_006 } from './level_006';
import { level_007 } from './level_007';
import { level_008 } from './level_008';
import { level_009 } from './level_009';
import { level_010 } from './level_010';

export const allLevels: LevelData[] = [
  level_001,
  level_002,
  level_003,
  level_004,
  level_005,
  level_006,
  level_007,
  level_008,
  level_009,
  level_010,
] as LevelData[];

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
