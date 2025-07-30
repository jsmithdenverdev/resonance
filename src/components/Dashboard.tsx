import React, { useState, useEffect } from 'react';
import type { SpotifyArtist } from '../services/spotifyApi';
import { getTopArtists, getCurrentUser } from '../services/spotifyApi';
import { clearToken } from '../services/spotifyAuth';

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [artists, setArtists] = useState<SpotifyArtist[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'short_term' | 'medium_term' | 'long_term'>('medium_term');

  useEffect(() => {
    loadData();
  }, [timeRange]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [topArtistsData, userData] = await Promise.all([
        getTopArtists(timeRange, 50),
        getCurrentUser(),
      ]);

      setArtists(topArtistsData.items);
      setUser(userData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      if (err instanceof Error && err.message.includes('Token expired')) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearToken();
    onLogout();
  };

  const getTimeRangeLabel = (range: string) => {
    switch (range) {
      case 'short_term':
        return 'Last 4 weeks';
      case 'medium_term':
        return 'Last 6 months';
      case 'long_term':
        return 'All time';
      default:
        return range;
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading">Loading your music data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="error">
          <p>Error: {error}</p>
          <button onClick={loadData}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="user-info">
          <h1>Welcome, {user?.display_name || 'Music Lover'}!</h1>
          <p>Your Spotify listening statistics</p>
        </div>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </header>

      <div className="time-range-selector">
        <h2>Your Top 50 Artists</h2>
        <div className="time-range-buttons">
          {(['short_term', 'medium_term', 'long_term'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`time-range-btn ${timeRange === range ? 'active' : ''}`}
            >
              {getTimeRangeLabel(range)}
            </button>
          ))}
        </div>
      </div>

      <div className="artists-grid">
        {artists.map((artist, index) => (
          <div key={artist.id} className="artist-card">
            <div className="artist-rank">#{index + 1}</div>
            <div className="artist-image">
              {artist.images[0] && (
                <img
                  src={artist.images[0].url}
                  alt={artist.name}
                  loading="lazy"
                />
              )}
            </div>
            <div className="artist-info">
              <h3 className="artist-name">{artist.name}</h3>
              <p className="artist-genres">
                {artist.genres.length > 0 
                  ? artist.genres.slice(0, 3).join(', ')
                  : 'No genres available'
                }
              </p>
              <div className="artist-stats">
                <span className="popularity">
                  Popularity: {artist.popularity}/100
                </span>
                <span className="followers">
                  {artist.followers.total.toLocaleString()} followers
                </span>
              </div>
              <a
                href={artist.external_urls.spotify}
                target="_blank"
                rel="noopener noreferrer"
                className="spotify-link"
              >
                Open in Spotify
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;