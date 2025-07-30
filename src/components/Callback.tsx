import React, { useEffect, useState } from 'react';
import { exchangeCodeForToken, storeToken } from '../services/spotifyAuth';

interface CallbackProps {
  onSuccess: () => void;
}

const Callback: React.FC<CallbackProps> = ({ onSuccess }) => {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const error = urlParams.get('error');
      
      // Sanitize URL parameters
      const sanitizeParam = (param: string | null): string | null => {
        if (!param) return null;
        // Remove any HTML tags and limit length
        return param.replace(/<[^>]*>/g, '').slice(0, 100);
      };
      
      const sanitizedCode = sanitizeParam(code);
      const sanitizedError = sanitizeParam(error);

      if (sanitizedError) {
        setError(`Authorization failed: ${sanitizedError}`);
        return;
      }

      if (!sanitizedCode) {
        setError('No authorization code received');
        return;
      }

      try {
        const token = await exchangeCodeForToken(sanitizedCode);
        storeToken(token);
        onSuccess();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to get access token');
      }
    };

    handleCallback();
  }, [onSuccess]);

  if (error) {
    return (
      <div className="callback">
        <div className="callback-container">
          <h2>Authentication Error</h2>
          <p>{error}</p>
          <button onClick={() => window.location.href = '/'}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="callback">
      <div className="callback-container">
        <h2>Connecting to Spotify...</h2>
        <p>Please wait while we authenticate your account.</p>
      </div>
    </div>
  );
};

export default Callback;