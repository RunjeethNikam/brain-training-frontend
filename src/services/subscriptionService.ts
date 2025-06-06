import { apiService } from '@/lib/api';
import { ApiError } from '@/types';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: string;
  features: string[];
  savings?: string;
}

export interface SubscriptionPlans {
  monthly: SubscriptionPlan;
  yearly: SubscriptionPlan;
}

export interface UserSubscription {
  id: string;
  plan: string;
  planName: string;
  status: string;
  isActive: boolean;
  amount: number;
  currency: string;
  startDate: string;
  endDate: string;
  nextBillingDate: string;
}

export interface SubscriptionStatus {
  success: boolean;
  hasSubscription: boolean;
  subscription: UserSubscription | null;
}

export interface CreateCheckoutResponse {
  success: boolean;
  checkoutUrl: string;
}

class SubscriptionService {
  
  /**
   * Get available subscription plans
   */
  async getPlans(): Promise<{ success: boolean; plans: SubscriptionPlans }> {
    try {
      const response = await apiService.get<{ success: boolean; plans: SubscriptionPlans }>('/subscription/plans');
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to get subscription plans', 500);
    }
  }

  /**
   * Create checkout session
   */
  async createCheckout(plan: string): Promise<CreateCheckoutResponse> {
    try {
      const response = await apiService.post<CreateCheckoutResponse>('/subscription/create-checkout', {
        plan: plan.toUpperCase()
      });
      
      if (!response.success || !response.checkoutUrl) {
        throw new ApiError('Invalid response from server', 500);
      }
      
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to create checkout session', 500);
    }
  }

  /**
   * Get user's subscription status
   */
  async getSubscriptionStatus(): Promise<SubscriptionStatus> {
    try {
      const response = await apiService.get<SubscriptionStatus>('/subscription/status');
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to get subscription status', 500);
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiService.post<{ success: boolean; message: string }>('/subscription/cancel');
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to cancel subscription', 500);
    }
  }

  /**
   * Reactivate subscription
   */
  async reactivateSubscription(plan: string): Promise<CreateCheckoutResponse> {
    try {
      const response = await apiService.post<CreateCheckoutResponse>('/subscription/reactivate', {
        plan: plan.toUpperCase()
      });
      
      if (!response.success || !response.checkoutUrl) {
        throw new ApiError('Invalid response from server', 500);
      }
      
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to reactivate subscription', 500);
    }
  }

  /**
   * Redirect to Stripe checkout
   */
  redirectToCheckout(checkoutUrl: string): void {
    window.location.href = checkoutUrl;
  }
}

// Create singleton instance
export const subscriptionService = new SubscriptionService();