import React from 'react';
import { initiateAuth } from '../services/spotifyAuth';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = () => {
  const handleLogin = () => {
    initiateAuth();
  };

  return (
    <div className="login">
      <div className="login-container">
        <div className="login-content">
          <h1>Resonance</h1>
          <p>Discover your music listening patterns and top artists</p>
          
          <div className="features">
            <ul>
              <li>View your top 50 most played artists</li>
              <li>Filter by different time periods</li>
              <li>See artist popularity and follower counts</li>
              <li>Direct links to Spotify</li>
            </ul>
          </div>

          <button onClick={handleLogin} className="login-btn">
            Connect with Spotify
          </button>
          
          <p className="disclaimer">
            This app only reads your listening data and does not modify anything on your Spotify account.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;