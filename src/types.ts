export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert' | 'master';

export type Operation = 'all' | 'add' | 'subtract' | 'multiply' | 'divide';

export type GameMode = 'adventure' | 'classic' | 'timeAttack' | 'survival';

export type InputMode = 'choice' | 'numpad';

export interface MathProblem {
  id: string;
  expression: string;
  operands: number[];
  operators: string[];
  correctAnswer: number;
  options: number[];
  explanation: string;
  level: number;
  timeLimit: number; // in seconds
}

export interface AnswerHistory {
  problem: MathProblem;
  userAnswer: number;
  isCorrect: boolean;
  timeTaken: number;
  pointsEarned: number;
}

export interface LevelConfig {
  level: number;
  title: string;
  description: string;
  difficulty: Difficulty;
  operations: Operation[];
  targetScore: number;
  questionsCount: number;
  timePerQuestion: number;
  unlocked: boolean;
  stars: number; // 0-3
  highScore: number;
}

export interface PlayerStats {
  totalScore: number;
  totalSolved: number;
  totalCorrect: number;
  highestStreak: number;
  currentStreak: number;
  gamesPlayed: number;
  adventureStars: number;
  unlockedLevel: number;
  rankTitle: string;
}

export interface LeaderboardItem {
  id: string;
  playerName: string;
  score: number;
  mode: GameMode;
  difficulty: Difficulty;
  date: string;
  accuracy: number;
}
