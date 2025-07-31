import React from 'react';
import type { LoginProps } from '../types/app';
import { initiateAuth } from '../services/spotify-auth';
import { logger } from '../services/logger';

export const Login: React.FC<LoginProps> = () => {
  const handleLogin = () => {
    logger.info('User initiating login');
    initiateAuth();
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-8">
      <div className="max-w-lg mx-auto">
        <div className="card-spotify text-center">
          <div className="space-y-6">
            <h1 className="text-4xl lg:text-5xl font-bold" style={{color: '#1db954'}}>
              Resonance
            </h1>
            <p className="text-neutral-300 text-lg">
              Discover your music listening patterns and top artists
            </p>
            
            <div className="text-left space-y-4 my-8">
              <ul className="text-neutral-300 space-y-3 list-disc list-inside">
                <li>View your top 50 most played artists</li>
                <li>Filter by different time periods</li>
                <li>See artist popularity and follower counts</li>
                <li>Direct links to Spotify</li>
              </ul>
            </div>

            <button 
              onClick={handleLogin} 
              className="btn-spotify w-full text-lg py-4 my-8"
            >
              Connect with Spotify
            </button>
            
            <p className="text-neutral-400 text-sm leading-relaxed">
              This app only reads your listening data and does not modify anything on your Spotify account.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

