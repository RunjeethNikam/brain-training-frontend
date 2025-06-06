import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          🧠 Brain Training App
        </h1>
        
        <p className="text-gray-600 text-center mb-8">
          Sharpen your mind with fun and challenging games!
        </p>
        
        <div className="space-y-4">
          <Link
            href="/login"
            className="block w-full bg-blue-500 hover:bg-blue-600 text-white text-center py-3 px-6 rounded-lg font-medium transition-colors"
          >
            🔐 Sign In with Google
          </Link>
          
          <Link
            href="/test"
            className="block w-full bg-gray-500 hover:bg-gray-600 text-white text-center py-3 px-6 rounded-lg font-medium transition-colors"
          >
            🔧 Test Backend Connection
          </Link>
          
          <div className="text-center text-sm text-gray-500">
            Sign in to access games and leaderboards
          </div>
        </div>
      </div>
    </div>
  );
}