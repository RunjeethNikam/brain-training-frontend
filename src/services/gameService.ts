import { apiService } from '@/lib/api';
import { GameType, ApiError } from '@/types';

export interface StartGameRequest {
  gameType: GameType;
}

export interface StartGameResponse {
  success: boolean;
  sessionId: string;
  gameType: GameType;
  difficulty: number;
  difficultyDescription: string;
  gameParams: {
    itemCount: number;
    displayTimeSeconds: number;
    choiceCount: number;
  } | {
    questionCount: number;
    timePerQuestionSeconds: number;
    minNumber: number;
    maxNumber: number;
  };
  remainingFreeGames: number;
  isSubscribed: boolean;
}

export interface CompleteGameRequest {
  sessionId: string;
  correctAnswers: number;
  totalQuestions: number;
  durationInSeconds: number;
}

export interface CompleteGameResponse {
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

export interface AbandonGameRequest {
  sessionId: string;
}

class GameService {
  /**
   * Start a new game session
   */
  async startGame(gameType: GameType): Promise<StartGameResponse> {
    try {
      const response = await apiService.post<StartGameResponse>('/game/start', {
        gameType
      });

      if (!response.success) {
        throw new ApiError('Failed to start game', 500);
      }

      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to start game session', 500);
    }
  }

  /**
   * Complete a game session
   */
  async completeGame(request: CompleteGameRequest): Promise<CompleteGameResponse> {
    try {
      const response = await apiService.post<CompleteGameResponse>('/game/complete', request);

      if (!response.success) {
        throw new ApiError('Failed to complete game', 500);
      }

      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to complete game session', 500);
    }
  }

  /**
   * Abandon a game session (user closed tab)
   */
  async abandonGame(sessionId: string): Promise<void> {
    try {
      await apiService.post('/game/abandon', { sessionId });
    } catch (error) {
      // Abandon should not throw errors - just log them
      console.warn('Failed to abandon game session:', error);
    }
  }

  /**
   * Get remaining free games for a game type
   */
  async getRemainingGames(gameType: GameType): Promise<{
    remainingGames: number;
    isSubscribed: boolean;
    canPlay: boolean;
  }> {
    try {
      const response = await apiService.get<{
        remainingGames: number;
        isSubscribed: boolean;
        canPlay: boolean;
      }>(`/game/remaining-games/${gameType}`);

      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to get remaining games', 500);
    }
  }

  /**
   * Check if user can play a specific game
   */
  async canUserPlay(gameType: GameType): Promise<boolean> {
    try {
      const response = await this.getRemainingGames(gameType);
      return response.canPlay;
    } catch (error) {
      console.error('Error checking if user can play:', error);
      return false;
    }
  }
}

// Create singleton instance
export const gameService = new GameService();