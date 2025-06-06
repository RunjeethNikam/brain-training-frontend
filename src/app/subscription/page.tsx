'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import PageLayout from '@/components/layout/PageLayout';
import { subscriptionService, SubscriptionPlans, SubscriptionStatus } from '@/services/subscriptionService';
import { ApiError } from '@/types';

export default function SubscriptionPage() {
  const router = useRouter();
  const { user, isAuthenticated, isInitialized } = useAuthStore();
  
  const [plans, setPlans] = useState<SubscriptionPlans | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isInitialized, router]);

  // Load plans and subscription status
  useEffect(() => {
    if (isAuthenticated && user) {
      loadData();
    }
  }, [isAuthenticated, user]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [plansResponse, statusResponse] = await Promise.all([
        subscriptionService.getPlans(),
        subscriptionService.getSubscriptionStatus()
      ]);

      if (plansResponse.success) {
        setPlans(plansResponse.plans);
      }

      setSubscriptionStatus(statusResponse);

    } catch (error) {
      console.error('Error loading subscription data:', error);
      let errorMessage = 'Failed to load subscription information';
      
      if (error instanceof ApiError) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    setCheckoutLoading(planId);
    
    try {
      const response = await subscriptionService.createCheckout(planId);
      
      if (response.success && response.checkoutUrl) {
        subscriptionService.redirectToCheckout(response.checkoutUrl);
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      setCheckoutLoading(null);
      // You could show an error toast here
    }
  };

  // Show loading while checking auth or loading data
  if (!isInitialized || isLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="text-6xl mb-4 animate-bounce">🧠</div>
            <div className="text-xl font-medium text-gray-700">Loading subscription plans...</div>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Redirect happening
  if (!isAuthenticated || !user) {
    return null;
  }

  // Error state
  if (error) {
    return (
      <PageLayout>
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="text-6xl mb-4">😞</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Oops!</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={loadData}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-all"
            >
              Try Again
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  const hasActiveSubscription = subscriptionStatus?.hasSubscription && subscriptionStatus?.subscription?.isActive;
  const currentPlan = subscriptionStatus?.subscription?.plan;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">Premium</h1>
          <p className="text-xl text-gray-300">
            Get started with a Brain Training Subscription that works for you.
          </p>
        </div>

        {/* Current Subscription Status */}
        {hasActiveSubscription && (
          <div className="mb-12 text-center">
            <div className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg">
              ✅ You have an active {subscriptionStatus.subscription?.planName} subscription
            </div>
          </div>
        )}

        {/* Pricing Cards */}
        {plans && (
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
            
            {/* Monthly Plan */}
            <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Monthly</h2>
                <p className="text-gray-400 text-sm mb-4">billed monthly</p>
                
                <div className="mb-6">
                  <p className="text-gray-300 text-sm mb-2">Down from $6/month.</p>
                  <p className="text-gray-300 text-sm">
                    Our monthly plan grants access to <span className="text-white font-semibold">all premium features</span>, the best plan for short-term subscribers.
                  </p>
                </div>
              </div>

              <div className="text-center mb-8">
                <div className="text-4xl font-bold mb-2">
                  ${plans.monthly.price}
                  <span className="text-lg text-gray-400 font-normal">/mo</span>
                </div>
                <p className="text-sm text-gray-400">Prices are marked in USD</p>
              </div>

              <button
                onClick={() => handleSubscribe('MONTHLY')}
                disabled={hasActiveSubscription || checkoutLoading === 'MONTHLY'}
                className={`w-full py-4 px-6 rounded-lg font-semibold transition-all ${
                  hasActiveSubscription
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : checkoutLoading === 'MONTHLY'
                    ? 'bg-gray-600 text-gray-300 cursor-wait'
                    : 'bg-white text-black hover:bg-gray-100'
                }`}
              >
                {checkoutLoading === 'MONTHLY' ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                    Processing...
                  </div>
                ) : hasActiveSubscription ? (
                  currentPlan === 'MONTHLY' ? 'Current Plan' : 'You have a subscription'
                ) : (
                  'Subscribe'
                )}
              </button>
            </div>

            {/* Yearly Plan */}
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-8 relative">
              
              {/* Most Popular Badge */}
              <div className="absolute -top-3 right-4">
                <div className="bg-orange-300 text-orange-900 px-3 py-1 rounded-full text-sm font-semibold">
                  🏆 Most popular
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Yearly</h2>
                <p className="text-orange-100 text-sm mb-4">billed yearly ($10)</p>
                
                <div className="mb-6">
                  <p className="text-orange-100 text-sm mb-2">
                    Our <span className="font-semibold">most popular</span> plan previously sold for $12 and is now only
                  </p>
                  <p className="text-orange-100 text-sm mb-2">
                    <span className="font-semibold">${(plans.yearly.price / 12).toFixed(2)}/month.</span>
                  </p>
                  <p className="text-orange-100 text-sm">
                    This plan <span className="font-semibold">saves you over 17%</span> in comparison to the monthly plan.
                  </p>
                </div>
              </div>

              <div className="text-center mb-8">
                <div className="text-4xl font-bold mb-2">
                  ${(plans.yearly.price / 12).toFixed(2)}
                  <span className="text-lg text-orange-100 font-normal">/mo</span>
                </div>
                <p className="text-sm text-orange-100">Prices are marked in USD</p>
              </div>

              <button
                onClick={() => handleSubscribe('YEARLY')}
                disabled={hasActiveSubscription || checkoutLoading === 'YEARLY'}
                className={`w-full py-4 px-6 rounded-lg font-semibold transition-all ${
                  hasActiveSubscription
                    ? 'bg-orange-300 text-orange-700 cursor-not-allowed'
                    : checkoutLoading === 'YEARLY'
                    ? 'bg-orange-300 text-orange-700 cursor-wait'
                    : 'bg-black text-white hover:bg-gray-900'
                }`}
              >
                {checkoutLoading === 'YEARLY' ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : hasActiveSubscription ? (
                  currentPlan === 'YEARLY' ? 'Current Plan' : 'You have a subscription'
                ) : (
                  'Subscribe'
                )}
              </button>
            </div>
          </div>
        )}

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          
          {/* Feature 1 */}
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🎮</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Unlimited Games</h3>
            <p className="text-gray-400">
              Play as many brain training games as you want. No daily limits, no restrictions.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Advanced Analytics</h3>
            <p className="text-gray-400">
              Get detailed insights into your performance with comprehensive statistics and progress tracking.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="text-center">
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🚀</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Exclusive Features</h3>
            <p className="text-gray-400">
              Access premium game modes, faster difficulty progression, and priority support.
            </p>
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-blue-400 hover:text-blue-300 underline text-lg"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}