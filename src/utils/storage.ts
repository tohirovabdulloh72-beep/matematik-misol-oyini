import { LeaderboardItem, LevelConfig, PlayerStats } from '../types';
import { INITIAL_ADVENTURE_LEVELS, getRankTitle } from './mathGenerator';

const STATS_KEY = 'math_game_stats_v1';
const LEVELS_KEY = 'math_game_levels_v1';
const LEADERBOARD_KEY = 'math_game_leaderboard_v1';
const PLAYER_NAME_KEY = 'math_game_player_name';

export function getSavedPlayerName(): string {
  if (typeof window === 'undefined') return "Matematik";
  return localStorage.getItem(PLAYER_NAME_KEY) || "O'yinchi";
}

export function savePlayerName(name: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PLAYER_NAME_KEY, name);
}

export function getPlayerStats(): PlayerStats {
  const defaultStats: PlayerStats = {
    totalScore: 0,
    totalSolved: 0,
    totalCorrect: 0,
    highestStreak: 0,
    currentStreak: 0,
    gamesPlayed: 0,
    adventureStars: 0,
    unlockedLevel: 1,
    rankTitle: getRankTitle(0),
  };

  if (typeof window === 'undefined') return defaultStats;

  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return defaultStats;
    const parsed = JSON.parse(raw);
    return {
      ...defaultStats,
      ...parsed,
      rankTitle: getRankTitle(parsed.totalScore || 0),
    };
  } catch {
    return defaultStats;
  }
}

export function updatePlayerStats(
  scoreGained: number,
  solvedGained: number,
  correctGained: number,
  bestStreakInGame: number
): PlayerStats {
  const current = getPlayerStats();
  const newTotalScore = current.totalScore + scoreGained;
  const newTotalSolved = current.totalSolved + solvedGained;
  const newTotalCorrect = current.totalCorrect + correctGained;
  const newHighestStreak = Math.max(current.highestStreak, bestStreakInGame);
  const newGamesPlayed = current.gamesPlayed + 1;

  const updated: PlayerStats = {
    ...current,
    totalScore: newTotalScore,
    totalSolved: newTotalSolved,
    totalCorrect: newTotalCorrect,
    highestStreak: newHighestStreak,
    gamesPlayed: newGamesPlayed,
    rankTitle: getRankTitle(newTotalScore),
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(STATS_KEY, JSON.stringify(updated));
  }

  return updated;
}

export function getAdventureLevels(): LevelConfig[] {
  if (typeof window === 'undefined') return INITIAL_ADVENTURE_LEVELS;
  try {
    const raw = localStorage.getItem(LEVELS_KEY);
    if (!raw) return INITIAL_ADVENTURE_LEVELS;
    const parsed: LevelConfig[] = JSON.parse(raw);
    // Ensure all 12 levels exist
    if (parsed.length !== INITIAL_ADVENTURE_LEVELS.length) {
      return INITIAL_ADVENTURE_LEVELS.map((init) => {
        const found = parsed.find((p) => p.level === init.level);
        return found ? { ...init, ...found } : init;
      });
    }
    return parsed;
  } catch {
    return INITIAL_ADVENTURE_LEVELS;
  }
}

export function saveAdventureLevelResult(
  levelNumber: number,
  score: number,
  stars: number
): { levels: LevelConfig[]; newlyUnlocked: boolean } {
  const levels = getAdventureLevels();
  let newlyUnlocked = false;

  const updatedLevels = levels.map((lvl) => {
    if (lvl.level === levelNumber) {
      return {
        ...lvl,
        stars: Math.max(lvl.stars, stars),
        highScore: Math.max(lvl.highScore, score),
      };
    }
    if (lvl.level === levelNumber + 1 && stars > 0) {
      if (!lvl.unlocked) {
        newlyUnlocked = true;
      }
      return {
        ...lvl,
        unlocked: true,
      };
    }
    return lvl;
  });

  if (typeof window !== 'undefined') {
    localStorage.setItem(LEVELS_KEY, JSON.stringify(updatedLevels));
  }

  // Update total stars in stats
  const totalStars = updatedLevels.reduce((acc, curr) => acc + curr.stars, 0);
  const highestUnlocked = Math.max(...updatedLevels.filter((l) => l.unlocked).map((l) => l.level));
  
  const currentStats = getPlayerStats();
  const newStats: PlayerStats = {
    ...currentStats,
    adventureStars: totalStars,
    unlockedLevel: highestUnlocked,
  };
  
  if (typeof window !== 'undefined') {
    localStorage.setItem(STATS_KEY, JSON.stringify(newStats));
  }

  return { levels: updatedLevels, newlyUnlocked };
}

export function getLeaderboard(): LeaderboardItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LEADERBOARD_KEY);
    if (!raw) {
      // Seed default initial leaderboard for fun motivation
      const defaultLeaderboard: LeaderboardItem[] = [
        {
          id: '1',
          playerName: 'Ulug\'bek Al-Farg\'oniy',
          score: 8450,
          mode: 'adventure',
          difficulty: 'master',
          date: '2026-08-25',
          accuracy: 98,
        },
        {
          id: '2',
          playerName: 'Al-Xorazmiy',
          score: 6920,
          mode: 'timeAttack',
          difficulty: 'expert',
          date: '2026-08-26',
          accuracy: 95,
        },
        {
          id: '3',
          playerName: 'Ibn Sino',
          score: 5100,
          mode: 'survival',
          difficulty: 'hard',
          date: '2026-08-27',
          accuracy: 92,
        },
      ];
      localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(defaultLeaderboard));
      return defaultLeaderboard;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function addLeaderboardScore(entry: Omit<LeaderboardItem, 'id' | 'date'>): LeaderboardItem[] {
  const current = getLeaderboard();
  const newEntry: LeaderboardItem = {
    ...entry,
    id: `lb_${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
  };

  const updated = [...current, newEntry]
    .sort((a, b) => b.score - a.score)
    .slice(0, 20); // Keep top 20

  if (typeof window !== 'undefined') {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(updated));
  }

  return updated;
}
