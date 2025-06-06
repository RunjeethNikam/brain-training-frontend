'use client';

import { useRouter } from 'next/navigation';
import { GameType, GAME_THEMES } from '@/types';

interface GameResultsProps {
  gameType: GameType;
  results: {
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
  onPlayAgain: () => void;
}

export default function GameResults({
  gameType,
  results,
  remainingFreeGames,
  requiresSubscription,
  onPlayAgain
}: GameResultsProps) {
  const router = useRouter();
  const theme = GAME_THEMES[gameType];

  const getScoreGrade = (score: number) => {
    if (score >= 90) return { grade: 'A+', color: 'text-green-600', emoji: '🌟' };
    if (score >= 80) return { grade: 'A', color: 'text-green-500', emoji: '⭐' };
    if (score >= 70) return { grade: 'B+', color: 'text-blue-500', emoji: '👍' };
    if (score >= 60) return { grade: 'B', color: 'text-blue-400', emoji: '👌' };
    if (score >= 50) return { grade: 'C', color: 'text-yellow-500', emoji: '💪' };
    return { grade: 'D', color: 'text-red-500', emoji: '💪' };
  };

  const scoreGrade = getScoreGrade(results.score);
  const gameName = gameType === GameType.MEMORY_FLASH ? 'Memory Flash' : 'Quick Math';

  return (
    <div className="max-w-4xl mx-auto">
      {/* Celebration Header */}
      <div className="text-center mb-8 relative">
        {/* Floating celebration elements */}
        <div className="absolute -top-4 left-1/4 text-3xl animate-bounce">🎉</div>
        <div className="absolute -top-2 right-1/4 text-2xl animate-ping">✨</div>
        <div className="absolute top-4 left-1/3 text-xl animate-pulse">🎊</div>
        
        <div className="text-8xl mb-4 animate-bounce">{theme.icon}</div>
        <h1 className="text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
          Game Complete!
        </h1>
        <p className="text-xl text-gray-600">
          Great job playing {gameName}! Here&apos;s how you did:
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Score Card */}
        <div className={`bg-gradient-to-br ${theme.primary} p-1 rounded-3xl shadow-2xl transform hover:scale-105 transition-all duration-300`}>
          <div className="bg-white/95 rounded-3xl p-8 text-center">
            <div className="mb-6">
              <div className="text-6xl mb-2">{scoreGrade.emoji}</div>
              <div className={`text-6xl font-black ${scoreGrade.color} mb-2`}>
                {Math.round(results.score)}
              </div>
              <div className={`text-2xl font-bold ${scoreGrade.color}`}>
                Grade: {scoreGrade.grade}
              </div>
              {results.isNewPersonalBest && (
                <div className="mt-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-4 py-2 rounded-full text-sm font-bold animate-pulse">
                  🏆 NEW PERSONAL BEST! 🏆
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <div className={`bg-gradient-to-br ${theme.secondary} p-1 rounded-3xl shadow-2xl transform hover:scale-105 transition-all duration-300`}>
          <div className="bg-white/95 rounded-3xl p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              📊 Performance Stats
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl">
                <span className="text-green-700 font-medium flex items-center">
                  <span className="text-xl mr-2">🎯</span> Accuracy
                </span>
                <span className="text-green-800 font-bold text-lg">
                  {Math.round(results.accuracy)}%
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-xl">
                <span className="text-blue-700 font-medium flex items-center">
                  <span className="text-xl mr-2">✅</span> Correct Answers
                </span>
                <span className="text-blue-800 font-bold text-lg">
                  {results.correctAnswers}/{results.totalQuestions}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl">
                <span className="text-purple-700 font-medium flex items-center">
                  <span className="text-xl mr-2">⏱️</span> Time Taken
                </span>
                <span className="text-purple-800 font-bold text-lg">
                  {Math.round(results.durationInSeconds)}s
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl">
                <span className="text-orange-700 font-medium flex items-center">
                  <span className="text-xl mr-2">🌟</span> Global Rank
                </span>
                <span className="text-orange-800 font-bold text-lg">
                  #{results.globalRank}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Game Status & Actions */}
      <div className="mt-8 space-y-6">
        {/* Free Games Status */}
        {!requiresSubscription ? (
          <div className="bg-gradient-to-r from-green-100 to-emerald-100 border border-green-200 rounded-2xl p-6 text-center">
            <div className="text-green-700">
              <div className="text-2xl mb-2">🎮</div>
              <div className="font-bold text-lg mb-1">
                {remainingFreeGames} Free Games Remaining
              </div>
              <div className="text-sm">
                Keep playing to improve your skills!
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border border-orange-200 rounded-2xl p-6 text-center">
            <div className="text-orange-700">
              <div className="text-2xl mb-2">⭐</div>
              <div className="font-bold text-lg mb-1">
                Free Games Exhausted
              </div>
              <div className="text-sm mb-3">
                Subscribe for unlimited games and premium features!
              </div>
              <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-full font-bold text-sm hover:from-orange-600 hover:to-red-600 transition-all">
                ✨ Upgrade to Premium - Only $5/year
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={onPlayAgain}
            disabled={requiresSubscription}
            className={`flex-1 py-4 px-6 rounded-xl font-bold text-lg shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center ${
              requiresSubscription
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : `bg-gradient-to-r ${theme.primary} text-white hover:shadow-2xl`
            }`}
          >
            <span className="text-2xl mr-2">{theme.icon}</span>
            Play {gameName} Again
          </button>
          
          <button
            onClick={() => router.push('/dashboard')}
            className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-gray-700 hover:to-gray-800 transition-all transform hover:scale-105 shadow-xl flex items-center justify-center"
          >
            <span className="text-xl mr-2">🏠</span>
            Back to Dashboard
          </button>
          
          <button
            onClick={() => router.push('/leaderboard')}
            className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-yellow-600 hover:to-orange-600 transition-all transform hover:scale-105 shadow-xl flex items-center justify-center"
          >
            <span className="text-xl mr-2">🏆</span>
            View Leaderboard
          </button>
        </div>
      </div>
    </div>
  );
}