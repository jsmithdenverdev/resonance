import React, { useState, useEffect, useCallback } from 'react';
import type { 
  Artist, 
  SpotifyUserProfile, 
  TimeRange, 
  Track, 
  Album, 
  Playlist, 
  GenreData,
  ContentType 
} from '../types/spotify';
import type { DashboardProps } from '../types/app';
import { 
  getTopArtists, 
  getCurrentUser, 
  getTopTracks, 
  getUserPlaylists, 
  getUserSavedAlbums, 
  getTopGenres 
} from '../services/spotify-api';
import { clearToken } from '../services/spotify-auth';
import { logger } from '../services/logger';
import { getTimeRangeLabel, formatNumber } from '../utils/format-helpers';
import { LoadingSpinner } from '../components/loading-spinner';
import { ArtistCardSkeleton } from '../components/artist-card-skeleton';
import { FeatureSelector } from '../components/feature-selector';
import { GenreGrid } from '../components/genre-card';
import { TrackGrid } from '../components/track-card';
import { AlbumGrid } from '../components/album-card';
import { PlaylistGrid } from '../components/playlist-card';

export const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [genres, setGenres] = useState<GenreData[]>([]);
  const [user, setUser] = useState<SpotifyUserProfile | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('medium_term');
  const [selectedFeature, setSelectedFeature] = useState<ContentType>('artists');

  const handleLogout = useCallback(() => {
    logger.info('User logging out');
    clearToken();
    onLogout();
  }, [onLogout]);

  const loadData = useCallback(async (isInitial = false, feature?: ContentType) => {
    try {
      if (isInitial) {
        setInitialLoading(true);
      } else {
        setContentLoading(true);
      }
      setError(null);
      const currentFeature = feature || selectedFeature;
      logger.info('Loading dashboard data', { timeRange, isInitial, feature: currentFeature });

      const startTime = Date.now();
      const minimumLoadTime = 800; // Minimum 800ms for smooth UX

      let dataPromise;
      
      if (isInitial) {
        // Load user data and initial feature data
        dataPromise = Promise.all([
          getCurrentUser(),
          currentFeature === 'artists' ? getTopArtists(timeRange, 50) :
          currentFeature === 'tracks' ? getTopTracks(timeRange, 50) :
          currentFeature === 'genres' ? getTopGenres(timeRange) :
          currentFeature === 'albums' ? getUserSavedAlbums(50) :
          currentFeature === 'playlists' ? getUserPlaylists(50) :
          getTopArtists(timeRange, 50)
        ]);
      } else {
        // Load only the selected feature data
        dataPromise = currentFeature === 'artists' ? getTopArtists(timeRange, 50) :
                     currentFeature === 'tracks' ? getTopTracks(timeRange, 50) :
                     currentFeature === 'genres' ? getTopGenres(timeRange) :
                     currentFeature === 'albums' ? getUserSavedAlbums(50) :
                     currentFeature === 'playlists' ? getUserPlaylists(50) :
                     getTopArtists(timeRange, 50);
      }

      const [data] = await Promise.all([
        dataPromise,
        new Promise(resolve => {
          const elapsed = Date.now() - startTime;
          const remaining = Math.max(0, minimumLoadTime - elapsed);
          setTimeout(resolve, remaining);
        })
      ]);

      if (isInitial) {
        const [userData, featureData] = data as [SpotifyUserProfile, any];
        setUser(userData);
        
        // Set the appropriate state based on feature
        if (currentFeature === 'artists') {
          setArtists(Array.isArray(featureData) ? featureData as unknown as Artist[] : (featureData as any).items || []);
        } else if (currentFeature === 'tracks') {
          setTracks(Array.isArray(featureData) ? featureData as unknown as Track[] : (featureData as any).items || []);
        } else if (currentFeature === 'genres') {
          setGenres(featureData as unknown as GenreData[]);
        } else if (currentFeature === 'albums') {
          const albumData = Array.isArray(featureData) ? featureData : (featureData as any).items || [];
          setAlbums(albumData.map((item: any) => item.album || item));
        } else if (currentFeature === 'playlists') {
          setPlaylists(Array.isArray(featureData) ? featureData as unknown as Playlist[] : (featureData as any).items || []);
        }
        
        logger.info('Initial dashboard data loaded successfully', { 
          userName: userData.display_name,
          feature: currentFeature
        });
      } else {
        // Update the appropriate state based on feature
        if (currentFeature === 'artists') {
          setArtists(Array.isArray(data) ? data as unknown as Artist[] : (data as any).items || []);
        } else if (currentFeature === 'tracks') {
          setTracks(Array.isArray(data) ? data as unknown as Track[] : (data as any).items || []);
        } else if (currentFeature === 'genres') {
          setGenres(data as unknown as GenreData[]);
        } else if (currentFeature === 'albums') {
          const albumData = Array.isArray(data) ? data : (data as any).items || [];
          setAlbums(albumData.map((item: any) => item.album || item));
        } else if (currentFeature === 'playlists') {
          setPlaylists(Array.isArray(data) ? data as unknown as Playlist[] : (data as any).items || []);
        }
        
        logger.info('Content data refreshed successfully', { 
          feature: currentFeature,
          timeRange
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      logger.error('Failed to load dashboard data', { error: err, timeRange, isInitial, feature: feature || selectedFeature });
      
      if (err instanceof Error && (err.message.includes('Token expired') || err.message.includes('Access forbidden'))) {
        handleLogout();
      }
    } finally {
      if (isInitial) {
        setInitialLoading(false);
      } else {
        setContentLoading(false);
      }
    }
  }, [timeRange, selectedFeature, handleLogout]);

  useEffect(() => {
    if (initialLoading) {
      loadData(true);
    } else {
      loadData(false);
    }
  }, [loadData, initialLoading]);

  // Handle time range changes
  const handleTimeRangeChange = (newTimeRange: TimeRange) => {
    if (newTimeRange !== timeRange) {
      setTimeRange(newTimeRange);
    }
  };

  // Handle feature changes
  const handleFeatureChange = (newFeature: ContentType) => {
    if (newFeature !== selectedFeature) {
      setSelectedFeature(newFeature);
      loadData(false, newFeature);
    }
  };

  // Render content based on selected feature
  const renderContent = () => {
    const isLoading = contentLoading;
    
    switch (selectedFeature) {
      case 'artists':
        return isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <ArtistCardSkeleton count={50} />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {artists.map((artist, index) => (
              <div key={artist.id} className="card-spotify card-spotify-hover relative">
                {/* Rank badge */}
                <div className="absolute top-4 right-4 text-white px-2 py-1 rounded-2xl text-sm font-bold" style={{backgroundColor: '#1db954'}}>
                  #{index + 1}
                </div>
                
                {/* Artist image */}
                <div className="text-center mb-4">
                  {artist.images && artist.images[0] ? (
                    <img
                      src={artist.images[0].url}
                      alt={artist.name}
                      loading="lazy"
                      className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 mx-auto"
                      style={{borderColor: '#1db954'}}
                    />
                  ) : (
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full mx-auto flex items-center justify-center text-3xl sm:text-4xl font-bold text-white border-4" 
                         style={{backgroundColor: 'var(--color-spotify-medium-gray)', borderColor: '#1db954'}}>
                      🎤
                    </div>
                  )}
                </div>
                
                {/* Artist info */}
                <div className="text-center">
                  <h3 className="text-white text-xl font-bold mb-2 truncate">
                    {artist.name}
                  </h3>
                  <p className="text-neutral-400 text-sm mb-4 italic">
                    {artist.genres.length > 0 
                      ? artist.genres.slice(0, 3).join(', ')
                      : 'No genres available'
                    }
                  </p>
                  
                  {/* Stats */}
                  <div className="space-y-2 mb-4">
                    <div className="text-neutral-400 text-sm">
                      Popularity: {artist.popularity}/100
                    </div>
                    <div className="text-neutral-400 text-sm">
                      {formatNumber(artist.followers.total)} followers
                    </div>
                  </div>
                  
                  {/* Spotify link */}
                  <a
                    href={artist.external_urls.spotify}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-white text-sm font-bold py-2 px-4 rounded-3xl transition-colors duration-300 hover:opacity-90"
                    style={{backgroundColor: '#1db954'}}
                  >
                    Open in Spotify
                  </a>
                </div>
              </div>
            ))}
          </div>
        );
      
      case 'genres':
        return <GenreGrid genres={genres} isLoading={isLoading} />;
      
      case 'tracks':
        return <TrackGrid tracks={tracks} isLoading={isLoading} />;
      
      case 'albums':
        return <AlbumGrid albums={albums} isLoading={isLoading} />;
      
      case 'playlists':
        return <PlaylistGrid playlists={playlists} isLoading={isLoading} />;
      
      default:
        return <ArtistCardSkeleton count={50} />;
    }
  };


  // Show full loading screen only on initial load
  if (initialLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white p-8">
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner size="large" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white p-8">
        <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
          <p className="text-red-400 text-lg">Error: {error}</p>
          {error.includes('Access forbidden') && (
            <div className="text-center max-w-md">
              <p className="text-gray-400 text-sm mb-4">
                This feature requires additional permissions. Please log out and log back in to grant the necessary permissions.
              </p>
              <button 
                onClick={handleLogout}
                className="btn-spotify-secondary mr-4"
              >
                Re-authenticate
              </button>
            </div>
          )}
          <button 
            onClick={() => loadData(false)}
            className="btn-spotify"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="card-spotify flex flex-col lg:flex-row justify-between items-center mb-8 space-y-4 lg:space-y-0">
          <div className="text-center lg:text-left">
            <h1 className="text-3xl lg:text-4xl font-bold mb-2" style={{color: '#1db954'}}>
              Welcome, {user?.display_name || 'Music Lover'}!
            </h1>
            <p className="text-neutral-400 text-lg">
              Your Spotify listening statistics
            </p>
          </div>
          <button 
            onClick={handleLogout} 
            className="btn-spotify-secondary"
          >
            Logout
          </button>
        </header>

        <FeatureSelector 
          selectedFeature={selectedFeature}
          onFeatureChange={handleFeatureChange}
          disabled={contentLoading}
        />

        {/* Time range selector - only show for time-based features */}
        {(selectedFeature === 'artists' || selectedFeature === 'tracks' || selectedFeature === 'genres') && (
          <div className="text-center mb-8">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center flex-wrap">
              {(['short_term', 'medium_term', 'long_term'] as const).map((range: TimeRange) => (
                <button
                  key={range}
                  onClick={() => handleTimeRangeChange(range)}
                  className={`px-4 py-2 rounded-3xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                    timeRange === range 
                      ? 'text-white border' 
                      : 'bg-transparent border border-gray-500 text-gray-300 hover:bg-gray-500 hover:text-white'
                  }`}
                  style={timeRange === range ? {backgroundColor: '#1db954', borderColor: '#1db954'} : {}}
                  disabled={contentLoading}
                >
                  {getTimeRangeLabel(range)}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

