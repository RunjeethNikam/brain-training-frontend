'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

export default function SubscriptionCancelPage() {
  const router = useRouter();
  const { user, isAuthenticated, isInitialized } = useAuthStore();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isInitialized, router]);

  // Show loading while checking auth
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⭐</div>
          <div className="text-xl font-medium">Loading...</div>
        </div>
      </div>
    );
  }

  // Redirect happening
  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        
        {/* Back Button */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center text-blue-400 hover:text-blue-300 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
        </div>

        {/* Cancel Message */}
        <div className="text-center mb-12">
          <div className="text-8xl mb-6">😔</div>
          <h1 className="text-5xl font-bold mb-4">
            Subscription Cancelled
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            You cancelled your subscription. No worries! You can always upgrade to premium later.
          </p>
        </div>

        {/* What You're Missing */}
        <div className="bg-gray-800 rounded-2xl p-8 mb-8 border border-gray-700">
          <h2 className="text-2xl font-bold mb-6 text-center">What You&apos;re Missing Out On</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm">🎮</span>
                </div>
                <span>Unlimited brain training games</span>
              </div>
              
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm">📊</span>
                </div>
                <span>Advanced performance analytics</span>
              </div>
              
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm">⚡</span>
                </div>
                <span>Faster difficulty progression</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm">🎯</span>
                </div>
                <span>Exclusive premium game modes</span>
              </div>
              
              <div className="flex items-center">
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm">🚫</span>
                </div>
                <span>No advertisements</span>
              </div>
              
              <div className="flex items-center">
                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm">💬</span>
                </div>
                <span>Priority customer support</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.push('/subscription')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 px-8 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg"
          >
            ⭐ Try Premium Again
          </button>
          
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-gray-700 hover:bg-gray-600 text-white py-4 px-8 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg"
          >
            🏠 Back to Dashboard
          </button>
        </div>

        {/* Footer Message */}
        <div className="text-center mt-12">
          <p className="text-gray-400">
            You can still enjoy 10 free games per day. Questions? Contact us at{' '}
            <a href="mailto:support@braintraining.com" className="text-blue-400 hover:text-blue-300">
              support@braintraining.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}