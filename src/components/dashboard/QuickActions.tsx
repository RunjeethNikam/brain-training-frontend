'use client';

import { useAuthStore } from '@/stores/authStore';

export default function QuickActions() {
  const { user } = useAuthStore();
  
  const actions = [
    {
      id: 'memory',
      label: 'Play Memory',
      icon: '🧠',
      gradient: 'from-purple-500 to-pink-500',
      href: '/games/memory'
    },
    {
      id: 'math',
      label: 'Play Math',
      icon: '🔢',
      gradient: 'from-blue-500 to-cyan-500',
      href: '/games/math'
    },
    {
      id: 'subscription',
      label: user?.isSubscribed ? 'Manage Premium' : 'Go Premium',
      icon: user?.isSubscribed ? '⭐' : '💎',
      gradient: user?.isSubscribed 
        ? 'from-yellow-500 to-orange-500' 
        : 'from-purple-600 to-pink-600',
      href: '/subscription',
      special: !user?.isSubscribed // Make it stand out for non-premium users
    },
    {
      id: 'leaderboard',
      label: 'Leaderboard',
      icon: '🏆',
      gradient: 'from-green-500 to-emerald-500',
      href: '/leaderboard'
    },
    {
      id: 'stats',
      label: 'Statistics',
      icon: '📊',
      gradient: 'from-yellow-500 to-orange-500',
      href: '/profile/stats'
    }
  ];

  const handleActionClick = (href: string) => {
    // Navigate to the actual routes
    if (typeof window !== 'undefined') {
      window.location.href = href;
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/50">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => handleActionClick(action.href)}
            className={`bg-gradient-to-r ${action.gradient} text-white p-4 rounded-xl hover:scale-105 transition-transform relative ${
              action.special ? 'ring-2 ring-purple-300 ring-opacity-50 animate-pulse' : ''
            }`}
          >
            {/* Special badge for premium upgrade */}
            {action.special && (
              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                !
              </div>
            )}
            
            <div className="text-2xl mb-1">{action.icon}</div>
            <div className="text-sm font-medium">{action.label}</div>
            
            {/* Show savings for non-premium users */}
            {action.special && (
              <div className="text-xs mt-1 opacity-90">
                Save 17%
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}