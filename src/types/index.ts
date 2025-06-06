// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Error types
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Game types
export enum GameType {
  MEMORY_FLASH = 'MEMORY_FLASH',
  QUICK_MATH = 'QUICK_MATH',
}

// User and related interfaces  
export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL: string;
  isSubscribed: boolean; // Make this a boolean property, not a method
  createdAt?: string;
  lastLoginAt?: string;
  gameProgress?: Record<string, GameProgress>;
  subscription?: Subscription;
}

export interface GameProgress {
  difficulty: number;
  totalGames: number;
  freeGamesUsed: number;
  bestScore: number;
}

export interface Subscription {
  isActive: boolean;
  expiresAt?: string;
  purchasedAt?: string;
  stripeSubscriptionId?: string;
}

// Game session and results
export interface GameSession {
  id: string;
  userId: string;
  gameType: GameType;
  difficulty: number;
  startTime: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
}

export interface GameResult {
  id: string;
  userId: string;
  sessionId: string;
  gameType: GameType;
  score: number;
  accuracy: number;
  difficulty: number;
  correctAnswers: number;
  totalQuestions: number;
  durationInSeconds: number;
  completedAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  score: number;
  accuracy: number;
  difficulty: number;
  completedAt: string;
}

// Game parameters
export interface MemoryFlashParams {
  itemCount: number;
  displayTimeSeconds: number;
  choiceCount: number;
}

export interface QuickMathParams {
  questionCount: number;
  timePerQuestionSeconds: number;
  minNumber: number;
  maxNumber: number;
}

// API Response types specific to your backend
export interface AuthResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    email: string;
    displayName: string;
    photoURL: string;
    isSubscribed: boolean;
  };
}

export interface GameStartResponse {
  success: boolean;
  sessionId: string;
  gameType: GameType;
  difficulty: number;
  difficultyDescription: string;
  gameParams: MemoryFlashParams | QuickMathParams;
  remainingFreeGames: number;
  isSubscribed: boolean;
}

export interface GameCompleteResponse {
  success: boolean;
  result: {
    score: number;
    accuracy: number;
    correctAnswers: number;
    totalQuestions: number;
    durationInSeconds: number;
    difficulty: number;
    isNewPersonalBest: boolean;
    globalRank: number;
  };
  remainingFreeGames: number;
  requiresSubscription: boolean;
}

export interface UserStats {
  totalGames: Record<GameType, number>;
  averageScores: Record<GameType, number>;
  globalRanks: Record<GameType, number>;
  freeGamesRemaining: Record<GameType, number>;
}

// Theme and UI types
export interface GameTheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  gradient: string;
  icon: string;
}

export const GAME_THEMES: Record<GameType, GameTheme> = {
  [GameType.MEMORY_FLASH]: {
    primary: 'from-purple-500 to-pink-500',
    secondary: 'from-purple-400 to-pink-400',
    accent: 'bg-purple-100',
    background: 'bg-gradient-to-br from-purple-50 to-pink-50',
    gradient: 'bg-gradient-to-r from-purple-500 via-pink-500 to-red-500',
    icon: '🧠'
  },
  [GameType.QUICK_MATH]: {
    primary: 'from-blue-500 to-cyan-500',
    secondary: 'from-blue-400 to-cyan-400',
    accent: 'bg-blue-100',
    background: 'bg-gradient-to-br from-blue-50 to-cyan-50',
    gradient: 'bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500',
    icon: '🔢'
  }
};