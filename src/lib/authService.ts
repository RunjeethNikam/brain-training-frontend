/* eslint-disable @typescript-eslint/no-explicit-any */

import { apiService } from './api';
import { User, ApiError } from '@/types';

export interface GoogleAuthResponse {
  success: boolean;
  token: string;
  user: User;
}

class AuthService {
  /**
   * Authenticate with Google ID token
   */
  async googleSignIn(idToken: string): Promise<GoogleAuthResponse> {
    try {
      // Your backend returns: { success: true, token: "...", user: {...} }
      const response = await apiService.post<GoogleAuthResponse>('/auth/google-signin', {
        idToken,
      });
      
      // Validate the response structure
      if (!response.success || !response.token || !response.user) {
        throw new ApiError('Invalid response from server', 500);
      }
      
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Authentication failed', 500);
    }
  }

  /**
   * Validate current JWT token
   */
  async validateToken(): Promise<{ valid: boolean; user?: User }> {
    try {
      // Your backend returns: { valid: true, user: {...} }
      const response = await apiService.post<{ valid: boolean; user: User }>('/auth/validate');
      return response;
    } catch {
      return { valid: false };
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User> {
    try {
      // Your backend returns the user object directly from /auth/me
      const response = await apiService.get<User>('/auth/me');
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to get user profile', 500);
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      // Your backend expects: { success: true, message: "..." }
      await apiService.post('/auth/logout');
    } catch (error) {
      // Logout should always succeed on frontend even if backend fails
      console.warn('Logout request failed:', error);
    }
  }

  /**
   * Initialize Google Sign-In
   */
  initializeGoogleSignIn(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        reject(new Error('Window not available'));
        return;
      }

      // Check if script is already loaded
      if (window.google?.accounts?.id) {
        resolve(window.google);
        return;
      }

      // Load Google Sign-In script
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;

      script.onload = () => {
        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
        if (!clientId) {
          reject(new Error('Google Client ID not configured'));
          return;
        }

        // Wait a bit for the library to initialize
        setTimeout(() => {
          if (window.google?.accounts?.id) {
            resolve(window.google);
          } else {
            reject(new Error('Google Sign-In failed to initialize'));
          }
        }, 100);
      };

      script.onerror = () => {
        reject(new Error('Failed to load Google Sign-In script'));
      };

      document.head.appendChild(script);
    });
  }
}

// Create singleton instance
export const authService = new AuthService();

// Global type for Google Sign-In
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: () => void;
          renderButton: (element: HTMLElement, config: any) => void;
        };
      };
    };
  }
}