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

export type SkinCategory = 'theme' | 'avatar' | 'cardFrame' | 'buttonStyle';

export interface SkinItem {
  id: string;
  name: string;
  nameUz: string;
  category: SkinCategory;
  price: number; // in points/ball
  description: string;
  icon: string; // emoji or identifier
  previewGradient: string;
  tag?: string;
  themeStyles?: {
    appBackground: string;
    boardBackground: string;
    boardBorder: string;
    hudBackground: string;
    hudBorder: string;
    accentColor: string;
    accentGlow: string;
  };
  cardStyles?: {
    borderClass: string;
    glowShadowClass: string;
    headerBadgeClass: string;
    innerCardBg: string;
    accentText: string;
  };
  buttonStyles?: {
    baseClass: string;
    selectedClass: string;
    correctClass: string;
    wrongClass: string;
    indicatorClass: string;
  };
  avatarData?: {
    emoji: string;
    badgeText: string;
    colorClass: string;
    borderClass: string;
  };
}

export interface PlayerSkinsConfig {
  unlockedSkinIds: string[];
  equippedTheme: string;
  equippedAvatar: string;
  equippedCardFrame: string;
  equippedButtonStyle: string;
}

