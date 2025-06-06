'use client';

import { useState } from 'react';
import { SubscriptionPlan, subscriptionService } from '@/services/subscriptionService';
import { ApiError } from '@/types';

interface PricingCardProps {
  plan: SubscriptionPlan;
  isPopular?: boolean;
  disabled?: boolean;
  currentPlan?: string;
}

export default function PricingCard({ plan, isPopular = false, disabled = false, currentPlan }: PricingCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isCurrentPlan = currentPlan === plan.id;

  const handleSubscribe = async () => {
    if (disabled || isCurrentPlan) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await subscriptionService.createCheckout(plan.id);
      
      if (response.success && response.checkoutUrl) {
        // Redirect to Stripe checkout
        subscriptionService.redirectToCheckout(response.checkoutUrl);
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      
      let errorMessage = 'Failed to start subscription process';
      if (error instanceof ApiError) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number, interval: string) => {
    return (
      <div className="text-center">
        <span className="text-4xl font-bold">${price}</span>
        <span className="text-gray-600 ml-1">/{interval}</span>
      </div>
    );
  };

  return (
    <div className={`relative rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 ${
      isPopular 
        ? 'bg-gradient-to-br from-purple-500 to-pink-500 p-1' 
        : 'bg-white border-2 border-gray-200'
    }`}>
      
      {/* Popular Badge */}
      {isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-4 py-1 rounded-full text-sm font-bold">
            ⭐ Most Popular
          </div>
        </div>
      )}

      {/* Card Content */}
      <div className={`rounded-2xl p-8 h-full flex flex-col ${
        isPopular ? 'bg-white' : ''
      }`}>
        
        {/* Plan Header */}
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">{plan.name}</h3>
          {formatPrice(plan.price, plan.interval)}
          
          {plan.savings && (
            <div className="mt-2">
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                {plan.savings}
              </span>
            </div>
          )}
        </div>

        {/* Features List */}
        <div className="flex-grow mb-8">
          <ul className="space-y-3">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-center">
                <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-700">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Button */}
        <div className="space-y-3">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
          
          <button
            onClick={handleSubscribe}
            disabled={isLoading || disabled || isCurrentPlan}
            className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center ${
              isCurrentPlan
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : disabled
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : isPopular
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                : 'bg-gray-800 hover:bg-gray-900 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
            }`}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : isCurrentPlan ? (
              'Current Plan'
            ) : disabled ? (
              'You have an active subscription'
            ) : (
              `Subscribe to ${plan.name}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}