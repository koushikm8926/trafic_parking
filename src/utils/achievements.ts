export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
}

export const achievements: Achievement[] = [
  {
    id: 'first_win',
    title: 'First Victory',
    description: 'Complete your first level',
    icon: '🎯',
    unlocked: false,
  },
  {
    id: 'five_levels',
    title: 'Getting Started',
    description: 'Complete 5 levels',
    icon: '🚗',
    unlocked: false,
    progress: 0,
    maxProgress: 5,
  },
  {
    id: 'all_levels',
    title: 'Master Driver',
    description: 'Complete all 15 levels',
    icon: '🏆',
    unlocked: false,
    progress: 0,
    maxProgress: 15,
  },
  {
    id: 'perfect_level',
    title: 'Perfect Move',
    description: 'Complete a level in optimal moves',
    icon: '⭐',
    unlocked: false,
  },
  {
    id: 'three_stars',
    title: 'Triple Star',
    description: 'Get 3 stars on any level',
    icon: '🌟',
    unlocked: false,
  },
  {
    id: 'all_three_stars',
    title: 'Star Collector',
    description: 'Get 3 stars on all levels',
    icon: '✨',
    unlocked: false,
    progress: 0,
    maxProgress: 15,
  },
  {
    id: 'no_hints',
    title: 'Independent Thinker',
    description: 'Complete a level without using hints',
    icon: '🧠',
    unlocked: false,
  },
  {
    id: 'speed_demon',
    title: 'Speed Demon',
    description: 'Complete any level in under 30 seconds',
    icon: '⚡',
    unlocked: false,
  },
  {
    id: 'undo_master',
    title: 'Time Traveler',
    description: 'Use undo 50 times',
    icon: '↶',
    unlocked: false,
    progress: 0,
    maxProgress: 50,
  },
  {
    id: 'persistent',
    title: 'Never Give Up',
    description: 'Retry a level 10 times',
    icon: '💪',
    unlocked: false,
    progress: 0,
    maxProgress: 10,
  },
  {
    id: 'efficient',
    title: 'Efficiency Expert',
    description: 'Complete 5 levels with 3 stars',
    icon: '🎓',
    unlocked: false,
    progress: 0,
    maxProgress: 5,
  },
  {
    id: 'hundred_moves',
    title: 'Century',
    description: 'Make 100 total moves',
    icon: '💯',
    unlocked: false,
    progress: 0,
    maxProgress: 100,
  },
];

export function getAchievementById(id: string): Achievement | undefined {
  return achievements.find(a => a.id === id);
}

export function calculateAchievementProgress(
  achievementId: string,
  stats: any
): number {
  const achievement = getAchievementById(achievementId);
  if (!achievement || !achievement.maxProgress) return 0;
  
  // This will be implemented based on actual stats
  return Math.min(achievement.progress || 0, achievement.maxProgress);
}

/**
 * Check for achievement unlocks based on game state and stats.
 * Returns array of newly unlocked achievement IDs.
 */
export function checkAchievements(context: {
  levelsCompleted: number;
  totalStars: number;
  threeStarLevels: number;
  totalMoves: number;
  undosUsed: number;
  hintsUsed: number;
  resetsUsed: number;
  justCompletedLevel?: boolean;
  justGot3Stars?: boolean;
  completedInOptimal?: boolean;
  completedWithoutHints?: boolean;
}): string[] {
  const newlyUnlocked: string[] = [];
  
  // First Victory
  if (context.justCompletedLevel && context.levelsCompleted === 1) {
    newlyUnlocked.push('first_win');
  }
  
  // Getting Started (5 levels)
  if (context.levelsCompleted >= 5) {
    newlyUnlocked.push('five_levels');
  }
  
  // Master Driver (all 15 levels)
  if (context.levelsCompleted >= 15) {
    newlyUnlocked.push('all_levels');
  }
  
  // Perfect Move (optimal moves)
  if (context.completedInOptimal) {
    newlyUnlocked.push('perfect_level');
  }
  
  // Triple Star (any level with 3 stars)
  if (context.justGot3Stars) {
    newlyUnlocked.push('three_stars');
  }
  
  // Star Collector (all levels with 3 stars)
  if (context.threeStarLevels >= 15) {
    newlyUnlocked.push('all_three_stars');
  }
  
  // Independent Thinker (no hints)
  if (context.completedWithoutHints) {
    newlyUnlocked.push('no_hints');
  }
  
  // Time Traveler (50 undos)
  if (context.undosUsed >= 50) {
    newlyUnlocked.push('undo_master');
  }
  
  // Efficiency Expert (5 levels with 3 stars)
  if (context.threeStarLevels >= 5) {
    newlyUnlocked.push('efficient');
  }
  
  // Century (100 moves)
  if (context.totalMoves >= 100) {
    newlyUnlocked.push('hundred_moves');
  }
  
  return newlyUnlocked;
}
