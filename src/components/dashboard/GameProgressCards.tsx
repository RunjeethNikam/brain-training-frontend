'use client';

import { User } from '@/types';

interface GameProgressCardsProps {
  user: User;
}

export default function GameProgressCards({ user }: GameProgressCardsProps) {
  return (
    <div className="grid md:grid-cols-2 gap-6 mb-6">
      {/* Memory Flash Progress */}
      <div className="bg-gradient-to-br from-purple-100/80 to-pink-100/80 backdrop-blur-sm rounded-2xl p-6 border border-purple-200/50 shadow-lg">
        <div className="flex items-center space-x-3 mb-4">
          <span className="text-3xl">🧠</span>
          <div>
            <h3 className="text-xl font-bold text-purple-800">Memory Flash</h3>
            <p className="text-purple-600">Test your visual memory</p>
          </div>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-purple-700">Difficulty Level:</span>
            <span className="font-medium text-purple-900">
              {user?.gameProgress?.['MEMORY_FLASH']?.difficulty || 1}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-purple-700">Games Played:</span>
            <span className="font-medium text-purple-900">
              {user?.gameProgress?.['MEMORY_FLASH']?.totalGames || 0}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-purple-700">Best Score:</span>
            <span className="font-medium text-purple-900">
              {user?.gameProgress?.['MEMORY_FLASH']?.bestScore || 0}
            </span>
          </div>
          {!user?.isSubscribed && (
            <div className="flex justify-between">
              <span className="text-purple-700">Free Games Used:</span>
              <span className="font-medium text-purple-900">
                {user?.gameProgress?.['MEMORY_FLASH']?.freeGamesUsed || 0}/10
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Quick Math Progress */}
      <div className="bg-gradient-to-br from-blue-100/80 to-cyan-100/80 backdrop-blur-sm rounded-2xl p-6 border border-blue-200/50 shadow-lg">
        <div className="flex items-center space-x-3 mb-4">
          <span className="text-3xl">🔢</span>
          <div>
            <h3 className="text-xl font-bold text-blue-800">Quick Math</h3>
            <p className="text-blue-600">Sharpen your calculation skills</p>
          </div>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-blue-700">Difficulty Level:</span>
            <span className="font-medium text-blue-900">
              {user?.gameProgress?.['QUICK_MATH']?.difficulty || 1}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-700">Games Played:</span>
            <span className="font-medium text-blue-900">
              {user?.gameProgress?.['QUICK_MATH']?.totalGames || 0}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-700">Best Score:</span>
            <span className="font-medium text-blue-900">
              {user?.gameProgress?.['QUICK_MATH']?.bestScore || 0}
            </span>
          </div>
          {!user?.isSubscribed && (
            <div className="flex justify-between">
              <span className="text-blue-700">Free Games Used:</span>
              <span className="font-medium text-blue-900">
                {user?.gameProgress?.['QUICK_MATH']?.freeGamesUsed || 0}/10
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}