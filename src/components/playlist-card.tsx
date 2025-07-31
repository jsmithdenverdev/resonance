import React from 'react';
import type { Playlist } from '../types/spotify';
import { formatNumber } from '../utils/format-helpers';

type PlaylistCardProps = {
  playlist: Playlist;
  rank: number;
  className?: string;
};

export const PlaylistCard: React.FC<PlaylistCardProps> = ({ playlist, rank, className = '' }) => {
  return (
    <div className={`card-spotify card-spotify-hover relative ${className}`}>
      {/* Rank badge */}
      <div className="absolute top-4 right-4 text-white px-2 py-1 rounded-2xl text-sm font-bold" style={{backgroundColor: 'var(--color-spotify-green)'}}>
        #{rank}
      </div>
      
      {/* Playlist image */}
      <div className="text-center mb-4">
        {playlist.images[0] ? (
          <img
            src={playlist.images[0].url}
            alt={playlist.name}
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
      
      {/* Playlist info */}
      <div className="text-center">
        <h3 className="text-white text-lg font-bold mb-2 truncate" title={playlist.name}>
          {playlist.name}
        </h3>
        
        {playlist.description && (
          <p className="text-gray-400 text-sm mb-3 line-clamp-2" title={playlist.description}>
            {playlist.description.replace(/<[^>]*>/g, '')} {/* Remove HTML tags */}
          </p>
        )}
        
        <p className="text-gray-500 text-xs mb-4">
          by {playlist.owner.display_name}
        </p>
        
        {/* Stats */}
        <div className="space-y-2 mb-4">
          <div className="text-gray-400 text-sm">
            {formatNumber(playlist.tracks.total)} tracks
          </div>
          
          <div className="flex items-center justify-center space-x-2">
            {playlist.public ? (
              <div className="flex items-center text-green-400 text-xs">
                <span>🌍</span>
                <span className="ml-1">Public</span>
              </div>
            ) : (
              <div className="flex items-center text-gray-400 text-xs">
                <span>🔒</span>
                <span className="ml-1">Private</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Spotify link */}
        <a
          href={playlist.external_urls.spotify}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-white text-sm font-bold py-2 px-4 rounded-3xl transition-colors duration-300 hover:opacity-90"
          style={{backgroundColor: 'var(--color-spotify-green)'}}
        >
          Open Playlist
        </a>
      </div>
    </div>
  );
};

type PlaylistGridProps = {
  playlists: Playlist[];
  isLoading?: boolean;
  className?: string;
};

export const PlaylistGrid: React.FC<PlaylistGridProps> = ({ playlists, isLoading, className = '' }) => {
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
              <div className="skeleton-gradient h-4 w-full mx-auto rounded"></div>
              <div className="skeleton-gradient h-3 w-2/3 mx-auto rounded"></div>
              <div className="space-y-2">
                <div className="skeleton-gradient h-4 w-3/5 mx-auto rounded"></div>
                <div className="skeleton-gradient h-4 w-1/2 mx-auto rounded"></div>
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
      {playlists.map((playlist, index) => (
        <PlaylistCard
          key={playlist.id}
          playlist={playlist}
          rank={index + 1}
        />
      ))}
    </div>
  );
};