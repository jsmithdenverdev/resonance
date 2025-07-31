import { useState, useEffect } from 'react';
import { Dashboard } from './pages/dashboard';
import { Login } from './pages/login';
import { Callback } from './pages/callback';
import { getStoredTokenSync } from './services/spotify-auth';
import { logger } from './services/logger';

export const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCallback, setIsCallback] = useState(false);

  useEffect(() => {
    const token = getStoredTokenSync();
    setIsAuthenticated(!!token);
    logger.info('App initialized', { isAuthenticated: !!token });
    
    // Check if this is a callback URL
    const urlParams = new URLSearchParams(window.location.search);
    const isCallbackUrl = urlParams.has('code') || urlParams.has('error');
    setIsCallback(isCallbackUrl);
    
    if (isCallbackUrl) {
      logger.info('Detected OAuth callback URL');
    }
  }, []);

  const handleLogin = () => {
    logger.info('User successfully logged in');
    setIsAuthenticated(true);
    // Clear URL parameters and redirect to main page
    window.history.replaceState({}, document.title, '/');
    setIsCallback(false);
  };

  const handleLogout = () => {
    logger.info('User logged out');
    setIsAuthenticated(false);
  };

  if (isCallback) {
    return <Callback onSuccess={handleLogin} />;
  }

  return (
    <div className="min-h-screen w-full bg-neutral-950 font-sans">
      {isAuthenticated ? (
        <Dashboard onLogout={handleLogout} />
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  );
}

