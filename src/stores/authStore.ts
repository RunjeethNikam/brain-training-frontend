import { create } from 'zustand';
import { User } from '@/types';
import { authService } from '@/lib/authService';

interface AuthState {
  // State
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean; // Track if we've checked for existing session
  error: string | null;

  // Actions
  setUser: (user: User, token: string) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial state
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,

  // Actions
  setUser: (user: User, token: string) => {
    // Store token in localStorage for API service
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token);
    }
    
    set({
      user,
      token,
      isAuthenticated: true,
      error: null,
      isInitialized: true,
    });
  },

  clearAuth: () => {
    // Remove token from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
    
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
      isInitialized: true,
    });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setError: (error: string | null) => {
    set({ error, isLoading: false });
  },

  // Initialize auth state from localStorage and validate token
  initializeAuth: async () => {
    if (typeof window === 'undefined') return;
    
    const { isInitialized } = get();
    if (isInitialized) return; // Already initialized

    set({ isLoading: true });

    try {
      const storedToken = localStorage.getItem('authToken');
      
      if (!storedToken) {
        // No token found, user is not authenticated
        set({ 
          isInitialized: true, 
          isLoading: false,
          isAuthenticated: false 
        });
        return;
      }

      // Validate the stored token with backend
      const validation = await authService.validateToken();
      
      if (validation.valid && validation.user) {
        // Token is valid, set user
        set({
          user: validation.user,
          token: storedToken,
          isAuthenticated: true,
          error: null,
          isInitialized: true,
          isLoading: false,
        });
      } else {
        // Token is invalid, clear auth
        localStorage.removeItem('authToken');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
          isInitialized: true,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
      
      // Clear potentially invalid token
      localStorage.removeItem('authToken');
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        error: 'Session expired. Please sign in again.',
        isInitialized: true,
        isLoading: false,
      });
    }
  },
}));