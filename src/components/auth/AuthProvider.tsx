'use client';

import { useEffect, ReactNode } from 'react';
import { useAuthStore } from '@/stores/authStore';

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const { initializeAuth, isLoading, isInitialized } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Show loading spinner while checking authentication
  if (!isInitialized && isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <div className="flex flex-col items-center space-y-4">
            <div className="text-4xl animate-bounce">🧠</div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-purple-500 rounded-full animate-pulse"></div>
              <div className="w-4 h-4 bg-pink-500 rounded-full animate-pulse delay-100"></div>
              <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse delay-200"></div>
            </div>
            <p className="text-gray-600 font-medium">Loading Brain Training...</p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}