import React from 'react';
import type { Track } from '../types/spotify';
import { formatDuration } from '../utils/format-helpers';

type TrackCardProps = {
  track: Track;
  rank: number;
  className?: string;
};

export const TrackCard: React.FC<TrackCardProps> = ({ track, rank, className = '' }) => {
  return (
    <div className={`card-spotify card-spotify-hover relative ${className}`}>
      {/* Rank badge */}
      <div className="absolute top-4 right-4 text-white px-2 py-1 rounded-2xl text-sm font-bold" style={{backgroundColor: 'var(--color-spotify-green)'}}>
        #{rank}
      </div>
      
      {/* Album art */}
      <div className="text-center mb-4">
        {track.album.images && track.album.images[0] ? (
          <img
            src={track.album.images[0].url}
            alt={track.name}
            loading="lazy"
            className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl object-cover mx-auto border-4"
            style={{borderColor: 'var(--color-spotify-green)'}}
          />
        ) : (
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl mx-auto flex items-center justify-center text-3xl sm:text-4xl font-bold text-white border-4" 
               style={{backgroundColor: 'var(--color-spotify-medium-gray)', borderColor: 'var(--color-spotify-green)'}}>
            🎵
          </div>
        )}
      </div>
      
      {/* Track info */}
      <div className="text-center">
        <h3 className="text-white text-lg font-bold mb-1 truncate" title={track.name}>
          {track.name}
        </h3>
        <p className="text-gray-400 text-sm mb-2 truncate">
          by {track.artists.map(artist => artist.name).join(', ')}
        </p>
        <p className="text-gray-500 text-xs mb-4 truncate" title={track.album.name}>
          from "{track.album.name}"
        </p>
        
        {/* Stats */}
        <div className="space-y-2 mb-4">
          <div className="text-gray-400 text-sm">
            Duration: {formatDuration(track.duration_ms)}
          </div>
          <div className="text-gray-400 text-sm">
            Popularity: {track.popularity}/100
          </div>
          {track.explicit && (
            <div className="inline-block bg-gray-600 text-white text-xs px-2 py-1 rounded">
              EXPLICIT
            </div>
          )}
        </div>
        
        {/* Actions */}
        <div className="space-y-2">
          <a
            href={track.external_urls.spotify}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-white text-sm font-bold py-2 px-4 rounded-3xl transition-colors duration-300 hover:opacity-90"
            style={{backgroundColor: 'var(--color-spotify-green)'}}
          >
            Open in Spotify
          </a>
          
          {track.preview_url && (
            <button
              onClick={() => {
                const audio = new Audio(track.preview_url!);
                audio.play().catch(() => {
                  // Handle play error (e.g., user interaction required)
                });
              }}
              className="block w-full bg-gray-700 hover:bg-gray-600 text-white text-sm font-bold py-2 px-4 rounded-3xl transition-colors duration-300"
            >
              Preview
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

type TrackGridProps = {
  tracks: Track[];
  isLoading?: boolean;
  className?: string;
};

export const TrackGrid: React.FC<TrackGridProps> = ({ tracks, isLoading, className = '' }) => {
  if (isLoading) {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
        {Array.from({ length: 50 }, (_, index) => (
          <div key={index} className="card-spotify relative overflow-hidden">
            <div className="absolute top-4 right-4 text-white px-2 py-1 rounded-2xl text-sm font-bold" style={{backgroundColor: 'var(--color-spotify-green)'}}>
              <div className="skeleton-gradient w-8 h-4 rounded"></div>
            </div>
            <div className="text-center mb-4">
              <div className="skeleton-gradient w-24 h-24 sm:w-32 sm:h-32 rounded-xl mx-auto"></div>
            </div>
            <div className="text-center space-y-3">
              <div className="skeleton-gradient h-5 w-3/4 mx-auto rounded"></div>
              <div className="skeleton-gradient h-4 w-4/5 mx-auto rounded"></div>
              <div className="skeleton-gradient h-3 w-full mx-auto rounded"></div>
              <div className="space-y-2">
                <div className="skeleton-gradient h-4 w-3/5 mx-auto rounded"></div>
                <div className="skeleton-gradient h-4 w-3/5 mx-auto rounded"></div>
              </div>
              <div className="skeleton-gradient h-8 w-1/2 mx-auto rounded-3xl"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
      {tracks.map((track, index) => (
        <TrackCard
          key={track.id}
          track={track}
          rank={index + 1}
        />
      ))}
    </div>
  );
};