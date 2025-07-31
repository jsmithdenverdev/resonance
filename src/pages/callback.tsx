import React, { useEffect, useState } from 'react';
import type { CallbackProps } from '../types/app';
import { exchangeCodeForToken, storeToken } from '../services/spotify-auth';
import { logger } from '../services/logger';
import { LoadingSpinner } from '../components/loading-spinner';

export const Callback: React.FC<CallbackProps> = ({ onSuccess }) => {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      logger.info('Processing OAuth callback');
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const error = urlParams.get('error');
      
      // Sanitize URL parameters
      const sanitizeParam = (param: string | null): string | null => {
        if (!param) return null;
        // Remove any HTML tags but don't truncate authorization codes
        return param.replace(/<[^>]*>/g, '');
      };
      
      const sanitizedCode = sanitizeParam(code);
      const sanitizedError = sanitizeParam(error);

      if (sanitizedError) {
        const errorMessage = `Authorization failed: ${sanitizedError}`;
        logger.error('OAuth authorization failed', { error: sanitizedError });
        setError(errorMessage);
        return;
      }

      if (!sanitizedCode) {
        const errorMessage = 'No authorization code received';
        logger.error('OAuth callback missing authorization code');
        setError(errorMessage);
        return;
      }

      try {
        const token = await exchangeCodeForToken(sanitizedCode);
        storeToken(token);
        logger.info('OAuth callback processed successfully');
        onSuccess();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to get access token';
        logger.error('OAuth token exchange failed', { error: err });
        setError(errorMessage);
      }
    };

    handleCallback();
  }, [onSuccess]);

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-8">
        <div className="card-spotify text-center space-y-6">
          <h2 className="text-2xl font-bold" style={{color: '#1db954'}}>
            Authentication Error
          </h2>
          <p className="text-red-400">{error}</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="btn-spotify"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-8">
      <div className="card-spotify text-center space-y-6">
        <h2 className="text-2xl font-bold" style={{color: '#1db954'}}>
          Connecting to Spotify...
        </h2>
        <p className="text-neutral-300">
          Please wait while we authenticate your account.
        </p>
        <LoadingSpinner size="large" className="mt-6" />
      </div>
    </div>
  );
};

