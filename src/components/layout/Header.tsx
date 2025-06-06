'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

export default function Header() {
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();

  const handleSignOut = () => {
    clearAuth();
    router.push('/');
  };

  if (!user) return null;

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-6 border border-white/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName}
                className="w-16 h-16 rounded-full border-4 border-purple-200 object-cover"
                onError={(e) => {
                  console.log('Image failed to load:', user.photoURL);
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.parentElement?.querySelector('.fallback-avatar') as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
            ) : null}
            <div className={`fallback-avatar w-16 h-16 rounded-full border-4 border-purple-200 bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white text-2xl font-bold ${user?.photoURL ? 'hidden' : 'flex'}`}>
              {user?.displayName?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Welcome back, {user?.displayName}! 👋
            </h1>
            <p className="text-gray-600">{user?.email}</p>
            <div className="flex items-center space-x-2 mt-1">
              {user?.isSubscribed ? (
                <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  ✨ Premium Member
                </span>
              ) : (
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                  🎮 Free Account
                </span>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}