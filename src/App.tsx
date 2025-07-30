import { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Callback from './components/Callback';
import { getStoredToken } from './services/spotifyAuth';
import './App.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCallback, setIsCallback] = useState(false);

  useEffect(() => {
    const token = getStoredToken();
    setIsAuthenticated(!!token);
    
    // Check if this is a callback URL
    const urlParams = new URLSearchParams(window.location.search);
    setIsCallback(urlParams.has('code') || urlParams.has('error'));
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    // Clear URL parameters and redirect to main page
    window.history.replaceState({}, document.title, '/');
    setIsCallback(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  if (isCallback) {
    return <Callback onSuccess={handleLogin} />;
  }

  return (
    <div className="app">
      {isAuthenticated ? (
        <Dashboard onLogout={handleLogout} />
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App
