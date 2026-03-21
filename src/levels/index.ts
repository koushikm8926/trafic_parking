import levelsData from './levels.json';
import { LevelData } from '../types';

export const levels: LevelData[] = levelsData as LevelData[];

export const getLevelById = (id: number): LevelData | undefined => {
  return levels.find(l => l.id === id);
};
