'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { GameType, ApiError } from '@/types';
import { gameService } from '@/services/gameService';
import PageLayout from '@/components/layout/PageLayout';
import GameResults from '@/components/game/GameResults';

type GameState = 'loading' | 'ready' | 'memorize' | 'test' | 'results' | 'error';

interface GameSession {
  sessionId: string;
  difficulty: number;
  difficultyDescription: string;
  gameParams: {
    itemCount: number;
    displayTimeSeconds: number;
    choiceCount: number;
  };
  remainingFreeGames: number;
  isSubscribed: boolean;
}

export default function MemoryGamePage() {
  const router = useRouter();
  const { user, isAuthenticated, isInitialized } = useAuthStore();
  
  const [gameState, setGameState] = useState<GameState>('loading');
  const [session, setSession] = useState<GameSession | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [gameItems, setGameItems] = useState<string[]>([]);
  const [choiceItems, setChoiceItems] = useState<string[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [gameResults, setGameResults] = useState<{
    score: number;
    accuracy: number;
    correctAnswers: number;
    totalQuestions: number;
    durationInSeconds: number;
    difficulty: number;
    isNewPersonalBest: boolean;
    globalRank: number;
    remainingFreeGames: number;
    requiresSubscription: boolean;
  } | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isInitialized, router]);

  // Initialize game when component mounts
  useEffect(() => {
    if (isAuthenticated && user) {
      initializeGame();
    }
  }, [isAuthenticated, user]);

  const initializeGame = async () => {
    try {
      setGameState('loading');
      setError(null);
      
      // Available icons for the game
      const availableIcons = ['⭐', '🎨', '🎯', '🎪', '🎵', '🎭', '🎲', '🎸', '🌟', '🎮', '🎺', '🎷', '🎹', '🥁', '🎻', '🎤'];
      
      // Call backend API to start game
      const response = await gameService.startGame(GameType.MEMORY_FLASH);
      
      // Extract game parameters from response
      const gameParams = response.gameParams as {
        itemCount: number;
        displayTimeSeconds: number;
        choiceCount: number;
      };
      
      const sessionData: GameSession = {
        sessionId: response.sessionId,
        difficulty: response.difficulty,
        difficultyDescription: response.difficultyDescription,
        gameParams,
        remainingFreeGames: response.remainingFreeGames,
        isSubscribed: response.isSubscribed
      };
      
      // Randomly select items for the game
      const shuffled = [...availableIcons].sort(() => Math.random() - 0.5);
      const selectedGameItems = shuffled.slice(0, gameParams.itemCount);
      
      // Create choice items (game items + random distractors)
      const remainingIcons = shuffled.slice(gameParams.itemCount);
      const distractors = remainingIcons.slice(0, gameParams.choiceCount - gameParams.itemCount);
      const allChoices = [...selectedGameItems, ...distractors].sort(() => Math.random() - 0.5);
      
      setGameItems(selectedGameItems);
      setChoiceItems(allChoices);
      setSelectedItems(new Set());
      setSession(sessionData);
      setGameState('ready');
      
    } catch (error) {
      console.error('Failed to initialize game:', error);
      
      let errorMessage = 'Failed to start game. Please try again.';
      
      if (error instanceof ApiError) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      setGameState('error');
    }
  };

  const startGame = () => {
    if (!session) return;
    
    setGameState('memorize');
    setTimeLeft(session.gameParams.displayTimeSeconds);
    
    // Start countdown timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameState('test');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleItemSelection = (item: string) => {
    const newSelected = new Set(selectedItems);
    
    if (newSelected.has(item)) {
      newSelected.delete(item);
    } else {
      // Only allow selection up to the number of items shown
      if (newSelected.size < (session?.gameParams.itemCount || 4)) {
        newSelected.add(item);
      }
    }
    
    setSelectedItems(newSelected);
  };

  const submitAnswers = async () => {
    if (!session) return;
    
    try {
      setError(null);
      
      // Check if user selected the correct items (order doesn't matter)
      const correctItems = new Set(gameItems);
      const userItems = selectedItems;
      
      let correctCount = 0;
      userItems.forEach(item => {
        if (correctItems.has(item)) {
          correctCount++;
        }
      });
      
      // Calculate actual duration (memorization time + selection time)
      const totalDuration = session.gameParams.displayTimeSeconds + 30; // Estimate selection time
      
      // Call backend API to complete game
      const response = await gameService.completeGame({
        sessionId: session.sessionId,
        correctAnswers: correctCount,
        totalQuestions: gameItems.length,
        durationInSeconds: totalDuration
      });
      
      console.log('Backend Response:', response);
      console.log('Correct items:', gameItems);
      console.log('User selected:', Array.from(selectedItems));
      console.log('Correct answers:', correctCount, 'out of', gameItems.length);
      
      // Combine backend response with additional data
      const combinedResults = {
        ...response.result,
        remainingFreeGames: response.remainingFreeGames,
        requiresSubscription: response.requiresSubscription
      };
      
      setGameResults(combinedResults);
      setGameState('results');
      
    } catch (error) {
      console.error('Failed to submit answers:', error);
      
      let errorMessage = 'Failed to submit answers. Please try again.';
      
      if (error instanceof ApiError) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    }
  };

  const handlePlayAgain = () => {
    // Reset game state and start over
    setSelectedItems(new Set());
    setGameResults(null);
    setGameItems([]);
    setChoiceItems([]);
    initializeGame();
  };

  const goBackToDashboard = async () => {
    if (session && (gameState === 'memorize' || gameState === 'test')) {
      await gameService.abandonGame(session.sessionId);
    }
    router.push('/dashboard');
  };

  // Loading state
  if (!isInitialized || gameState === 'loading') {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="text-6xl mb-4 animate-bounce">🧠</div>
            <div className="text-xl font-medium text-gray-700">Loading Memory Flash...</div>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Error state
  if (gameState === 'error') {
    return (
      <PageLayout>
        <div className="max-w-md mx-auto">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 text-center border border-white/50">
            <div className="text-6xl mb-4">😞</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Oops!</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
              <button
                onClick={initializeGame}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition-all"
              >
                Try Again
              </button>
              <button
                onClick={goBackToDashboard}
                className="w-full bg-gray-500 text-white py-3 px-6 rounded-xl font-medium hover:bg-gray-600 transition-all"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Ready to start
  if (gameState === 'ready' && session) {
    return (
      <PageLayout>
        <div className="max-w-4xl mx-auto">
          {/* Animated header with floating elements */}
          <div className="text-center mb-8 relative">
            <div className="absolute -top-4 -left-4 w-12 h-12 bg-pink-400 rounded-full animate-bounce opacity-70"></div>
            <div className="absolute -top-2 -right-6 w-8 h-8 bg-yellow-400 rounded-full animate-ping opacity-60"></div>
            <div className="absolute top-8 left-8 w-6 h-6 bg-blue-400 rounded-full animate-pulse opacity-50"></div>
            
            <div className="relative bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 bg-clip-text text-transparent">
              <div className="text-8xl mb-4 animate-bounce">🧠</div>
              <h1 className="text-5xl font-black mb-2">Memory Flash</h1>
              <p className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">
                Train Your Visual Memory! ⚡
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Game Info Card */}
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-1 rounded-2xl shadow-xl transform hover:scale-105 transition-all duration-300">
              <div className="bg-white/95 rounded-2xl p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-10 h-10 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-lg font-bold">📊</span>
                  </div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Game Settings
                  </h3>
                </div>
                
                <div className="space-y-3">
                  <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-purple-700 font-medium flex items-center text-sm">
                        <span className="text-lg mr-2">🎯</span> Difficulty
                      </span>
                      <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full font-bold text-xs">
                        {session.difficultyDescription}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-200 to-pink-200 rounded-xl p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-purple-800 font-medium flex items-center text-sm">
                        <span className="text-lg mr-2">🧠</span> Items to Remember
                      </span>
                      <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full font-bold">
                        {session.gameParams.itemCount}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-xl p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-pink-700 font-medium flex items-center text-sm">
                        <span className="text-lg mr-2">⏰</span> Display Time
                      </span>
                      <span className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-3 py-1 rounded-full font-bold">
                        {session.gameParams.displayTimeSeconds}s
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-pink-200 to-purple-200 rounded-xl p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-pink-800 font-medium flex items-center text-sm">
                        <span className="text-lg mr-2">🎮</span> Free Games Left
                      </span>
                      <span className="bg-gradient-to-r from-pink-600 to-purple-600 text-white px-3 py-1 rounded-full font-bold">
                        {session.remainingFreeGames}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Instructions Card */}
            <div className="bg-gradient-to-br from-pink-500 to-purple-500 p-1 rounded-2xl shadow-xl transform hover:scale-105 transition-all duration-300">
              <div className="bg-white/95 rounded-2xl p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-gradient-to-r from-pink-500 to-purple-500 w-10 h-10 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-lg font-bold">🎯</span>
                  </div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                    How to Play
                  </h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center group hover:scale-105 transition-transform">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3 shadow-lg group-hover:animate-bounce">
                      1
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-700 text-sm">
                        <span className="text-purple-600 font-bold">Watch & Memorize</span> - {session.gameParams.itemCount} items for {session.gameParams.displayTimeSeconds}s
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center group hover:scale-105 transition-transform">
                    <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3 shadow-lg group-hover:animate-bounce">
                      2
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-700 text-sm">
                        <span className="text-pink-600 font-bold">Remember Positions</span> - Focus on locations and colors
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center group hover:scale-105 transition-transform">
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3 shadow-lg group-hover:animate-bounce">
                      3
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-700 text-sm">
                        <span className="text-purple-600 font-bold">Select Correctly</span> - Choose the right items
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center group hover:scale-105 transition-transform">
                    <div className="bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3 shadow-lg group-hover:animate-bounce">
                      4
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-700 text-sm">
                        <span className="text-pink-600 font-bold">Score Big!</span> - Accuracy + Speed = Higher Points
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <button
              onClick={startGame}
              className="flex-1 relative group overflow-hidden bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 px-6 rounded-xl font-black text-lg shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-purple-400 opacity-0 group-hover:opacity-30 transition-opacity"></div>
              <div className="relative flex items-center justify-center">
                <span className="text-2xl mr-2 animate-bounce">🧠</span>
                START MEMORY GAME
                <span className="text-2xl ml-2 animate-bounce delay-100">✨</span>
              </div>
            </button>
            
            <button
              onClick={goBackToDashboard}
              className="flex-1 bg-gradient-to-r from-purple-300 to-pink-300 text-purple-800 py-4 px-6 rounded-xl font-bold text-lg hover:from-purple-400 hover:to-pink-400 hover:text-white transition-all transform hover:scale-105 shadow-xl"
            >
              <span className="text-xl mr-2">←</span>
              Back to Dashboard
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Memorize phase
  if (gameState === 'memorize') {
    const totalTime = session?.gameParams.displayTimeSeconds || 10;
    const progress = ((totalTime - timeLeft) / totalTime) * 100;
    
    return (
      <PageLayout>
        <div className="max-w-6xl mx-auto">
          {/* Header with Timer */}
          <div className="flex justify-between items-center mb-8">
            {/* Clock Timer */}
            <div className="relative">
              <div className="w-24 h-24 relative">
                {/* Clock Background */}
                <div className="w-24 h-24 rounded-full border-4 border-purple-200 bg-white shadow-lg flex items-center justify-center relative overflow-hidden">
                  {/* Timer Display */}
                  <div className="text-2xl font-black text-purple-600 z-10 flex items-center justify-center">
                    {timeLeft}
                  </div>
                  
                  {/* Progress Circle */}
                  <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 96 96">
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      className="text-purple-100"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - progress / 100)}`}
                      className="text-purple-500 transition-all duration-1000 ease-linear"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
              
              {/* Timer Label */}
              <div className="text-center mt-2">
                <div className="text-sm font-bold text-purple-600">Time Left</div>
                <div className="text-xs text-purple-500">Focus & Memorize!</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="flex-1 mx-8">
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-full h-4 shadow-inner">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-4 rounded-full transition-all duration-1000 ease-linear shadow-lg"
                  style={{ width: `${progress}%` }}
                >
                  <div className="h-full bg-gradient-to-r from-white/20 to-transparent rounded-full"></div>
                </div>
              </div>
              <div className="flex justify-between mt-2 text-sm">
                <span className="text-purple-600 font-medium">Memorizing...</span>
                <span className="text-pink-600 font-medium">{Math.round(progress)}% Complete</span>
              </div>
            </div>

            {/* Game Info */}
            <div className="text-right">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                🧠 Memory Flash
              </div>
              <div className="text-xs text-purple-600 mt-1 font-medium">
                Level {session?.difficulty} • {session?.gameParams.itemCount} Items
              </div>
            </div>
          </div>

          {/* Main Game Area */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-purple-200">
            {/* Instructions */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                Memorize These Items!
              </h2>
              <p className="text-lg text-gray-600">
                Study the positions and remember what you see
              </p>
            </div>

            {/* Items Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 max-w-4xl mx-auto">
              {gameItems.map((item, index) => (
                <div
                  key={index}
                  className={`aspect-square bg-gradient-to-br from-purple-400 to-pink-500 rounded-3xl flex items-center justify-center text-white shadow-2xl transform hover:scale-105 transition-all duration-300 border-2 border-white/20 relative overflow-hidden`}
                >
                  {/* Background animation */}
                  <div 
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"
                    style={{
                      animationDelay: `${index * 200}ms`,
                      animationDuration: '2s'
                    }}
                  ></div>
                  
                  {/* Icon (stays on top) */}
                  <div 
                    className="relative z-10"
                    style={{ fontSize: '5rem' }}
                  >
                    {item}
                  </div>
                </div>
              ))}
            </div>

            {/* Focus Message */}
            <div className="text-center">
              <div className="inline-flex items-center bg-gradient-to-r from-purple-100 to-pink-100 px-6 py-3 rounded-full">
                <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse mr-3"></div>
                <span className="text-purple-700 font-medium">
                  Focus on the positions and symbols - you&apos;ll need to identify them next!
                </span>
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Test phase
  if (gameState === 'test') {
    return (
      <PageLayout>
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full text-lg font-bold inline-block shadow-lg mb-4">
              🧠 Memory Test Phase
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
              Select the Items You Remember!
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Click on the items that were shown to you during the memorization phase
            </p>
          </div>

          {/* Selection Grid */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-purple-200 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {choiceItems.map((item, index) => (
                <div
                  key={index}
                  onClick={() => handleItemSelection(item)}
                  className={`aspect-square rounded-2xl flex items-center justify-center cursor-pointer transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border-2 group ${
                    selectedItems.has(item)
                      ? 'bg-gradient-to-br from-purple-400 to-pink-500 border-purple-500 text-white'
                      : 'bg-gradient-to-br from-gray-100 to-gray-200 hover:from-purple-100 hover:to-pink-100 border-transparent hover:border-purple-300'
                  }`}
                >
                  <div 
                    className={`transition-all duration-300 group-hover:scale-110 ${
                      selectedItems.has(item) ? 'scale-110' : ''
                    }`}
                    style={{ fontSize: '4rem' }}
                  >
                    {item}
                  </div>
                </div>
              ))}
            </div>

            {/* Selection Info */}
            <div className="mt-8 text-center">
              <div className="inline-flex items-center bg-gradient-to-r from-purple-100 to-pink-100 px-6 py-3 rounded-full">
                <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse mr-3"></div>
                <span className="text-purple-700 font-medium">
                  Selected: {selectedItems.size}/{session?.gameParams.itemCount || 4} items
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center">
            <button
              onClick={submitAnswers}
              disabled={selectedItems.size !== (session?.gameParams.itemCount || 4)}
              className={`py-4 px-8 rounded-xl font-bold text-lg shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center ${
                selectedItems.size === (session?.gameParams.itemCount || 4)
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white cursor-pointer'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <span className="text-2xl mr-2">✅</span>
              Submit My Answers
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Results phase
  if (gameState === 'results' && gameResults && session) {
    return (
      <PageLayout>
        <GameResults
          gameType={GameType.MEMORY_FLASH}
          results={gameResults}
          remainingFreeGames={gameResults.remainingFreeGames}
          requiresSubscription={gameResults.requiresSubscription}
          onPlayAgain={handlePlayAgain}
        />
      </PageLayout>
    );
  }

  return null;
}