'use client';

import { useEffect, useRef, useState } from 'react';
import { authService } from '@/lib/authService';
import { useAuthStore } from '@/stores/authStore';
import { ApiError } from '@/types';

interface GoogleSignInButtonProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export default function GoogleSignInButton({ onSuccess, onError }: GoogleSignInButtonProps) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { setUser, setLoading, setError } = useAuthStore();

  useEffect(() => {
    initializeGoogleSignIn();
  }, []);

  const initializeGoogleSignIn = async () => {
    try {
      await authService.initializeGoogleSignIn();
      
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      if (!clientId) {
        throw new Error('Google Client ID not configured');
      }

      if (window.google?.accounts?.id && buttonRef.current) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
        });

        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: 'outline',
          size: 'large',
          width: '100%',
          text: 'signin_with',
        });
      }
    } catch (error) {
      console.error('Failed to initialize Google Sign-In:', error);
      setError('Failed to initialize Google Sign-In');
      onError?.('Failed to initialize Google Sign-In');
    }
  };

  const handleCredentialResponse = async (response: any) => {
    if (!response.credential) {
      setError('No credential received from Google');
      onError?.('No credential received from Google');
      return;
    }

    setIsLoading(true);
    setLoading(true);
    setError(null);

    try {
      const authResponse = await authService.googleSignIn(response.credential);
      
      if (authResponse.success) {
        setUser(authResponse.user, authResponse.token);
        onSuccess?.();
      } else {
        throw new Error('Authentication failed');
      }
    } catch (error) {
      let errorMessage = 'Authentication failed';
      
      if (error instanceof ApiError) {
        errorMessage = error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Signing in...</span>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div ref={buttonRef} className="w-full"></div>
    </div>
  );
}