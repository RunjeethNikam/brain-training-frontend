import { GameType } from '@/types';

export interface ScoreCalculationInput {
  correctAnswers: number;
  totalQuestions: number;
  durationInSeconds: number;
  difficulty: number;
  gameType: GameType;
  maxTimeAllowed?: number;
}

export interface ScoreResult {
  score: number;
  accuracy: number;
  breakdown: {
    baseScore: number;
    difficultyBonus: number;
    speedBonus: number;
    perfectBonus: number;
  };
}

class ScoreService {
  /**
   * Calculate game score based on performance
   */
  calculateScore(input: ScoreCalculationInput): ScoreResult {
    const { correctAnswers, totalQuestions, durationInSeconds, difficulty, maxTimeAllowed } = input;
    
    // Base accuracy score (0-100)
    const accuracy = (correctAnswers / totalQuestions) * 100;
    const baseScore = accuracy;
    
    // Difficulty bonus (1-50 points based on difficulty level)
    const difficultyBonus = Math.min(50, difficulty * 5);
    
    // Speed bonus (0-30 points based on time efficiency)
    let speedBonus = 0;
    if (maxTimeAllowed && durationInSeconds < maxTimeAllowed) {
      const timeEfficiency = 1 - (durationInSeconds / maxTimeAllowed);
      speedBonus = timeEfficiency * 30;
    }
    
    // Perfect game bonus (20 points for 100% accuracy)
    const perfectBonus = accuracy === 100 ? 20 : 0;
    
    // Calculate total score (max 200, but usually capped at 100 for display)
    const rawScore = baseScore + difficultyBonus + speedBonus + perfectBonus;
    const finalScore = Math.min(200, Math.max(0, rawScore));
    
    return {
      score: Math.round(finalScore * 100) / 100, // Round to 2 decimal places
      accuracy: Math.round(accuracy * 100) / 100,
      breakdown: {
        baseScore: Math.round(baseScore),
        difficultyBonus: Math.round(difficultyBonus),
        speedBonus: Math.round(speedBonus),
        perfectBonus
      }
    };
  }
  
  /**
   * Get score grade and feedback
   */
  getScoreGrade(score: number) {
    if (score >= 180) return { 
      grade: 'S+', 
      color: 'text-purple-600', 
      emoji: '👑', 
      message: 'Legendary Performance!' 
    };
    if (score >= 150) return { 
      grade: 'S', 
      color: 'text-purple-500', 
      emoji: '🌟', 
      message: 'Outstanding!' 
    };
    if (score >= 120) return { 
      grade: 'A+', 
      color: 'text-green-600', 
      emoji: '⭐', 
      message: 'Excellent!' 
    };
    if (score >= 100) return { 
      grade: 'A', 
      color: 'text-green-500', 
      emoji: '🎉', 
      message: 'Great Job!' 
    };
    if (score >= 80) return { 
      grade: 'B+', 
      color: 'text-blue-500', 
      emoji: '👍', 
      message: 'Well Done!' 
    };
    if (score >= 70) return { 
      grade: 'B', 
      color: 'text-blue-400', 
      emoji: '👌', 
      message: 'Good Work!' 
    };
    if (score >= 60) return { 
      grade: 'C+', 
      color: 'text-yellow-500', 
      emoji: '💪', 
      message: 'Keep Practicing!' 
    };
    if (score >= 50) return { 
      grade: 'C', 
      color: 'text-yellow-400', 
      emoji: '📈', 
      message: 'You\'re Improving!' 
    };
    return { 
      grade: 'D', 
      color: 'text-red-500', 
      emoji: '🎯', 
      message: 'Try Again!' 
    };
  }
  
  /**
   * Compare with previous best score
   */
  isNewPersonalBest(currentScore: number, previousBest: number = 0): boolean {
    return currentScore > previousBest;
  }
  
  /**
   * Get performance tips based on score breakdown
   */
  getPerformanceTips(scoreResult: ScoreResult, gameType: GameType): string[] {
    const tips: string[] = [];
    const { accuracy, breakdown } = scoreResult;
    
    if (accuracy < 80) {
      tips.push('Focus on accuracy - take your time to memorize the items carefully');
    }
    
    if (breakdown.speedBonus < 15) {
      tips.push('Try to complete the challenge faster for bonus points');
    }
    
    if (breakdown.difficultyBonus < 20) {
      tips.push('As you improve, you\'ll unlock higher difficulties for more points');
    }
    
    if (gameType === GameType.MEMORY_FLASH) {
      tips.push('Try to create mental associations with the item positions');
      tips.push('Focus on one item at a time rather than trying to memorize everything at once');
    }
    
    if (gameType === GameType.QUICK_MATH) {
      tips.push('Practice mental math techniques to improve your speed');
      tips.push('Look for patterns and shortcuts in calculations');
    }
    
    return tips.slice(0, 3); // Return max 3 tips
  }
}

export const scoreService = new ScoreService();