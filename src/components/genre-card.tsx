import React from 'react';
import type { GenreData } from '../types/spotify';

type GenreCardProps = {
  genre: GenreData;
  rank: number;
  className?: string;
};

export const GenreCard: React.FC<GenreCardProps> = ({ genre, rank, className = '' }) => {
  return (
    <div className={`card-spotify card-spotify-hover relative ${className}`}>
      {/* Rank badge */}
      <div className="absolute top-4 right-4 text-white px-2 py-1 rounded-2xl text-sm font-bold" style={{backgroundColor: 'var(--color-spotify-green)'}}>
        #{rank}
      </div>
      
      {/* Genre icon/visual */}
      <div className="text-center mb-4">
        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full mx-auto flex items-center justify-center text-4xl sm:text-6xl font-bold text-white" style={{backgroundColor: 'var(--color-spotify-green)'}}>
          🎵
        </div>
      </div>
      
      {/* Genre info */}
      <div className="text-center">
        <h3 className="text-white text-xl font-bold mb-2 capitalize">
          {genre.name}
        </h3>
        
        {/* Stats */}
        <div className="space-y-2 mb-4">
          <div className="text-gray-400 text-sm">
            {genre.count} artists ({genre.percentage.toFixed(1)}%)
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="h-2 rounded-full transition-all duration-300"
              style={{
                backgroundColor: 'var(--color-spotify-green)',
                width: `${Math.min(genre.percentage, 100)}%`
              }}
            />
          </div>
        </div>
        
        {/* Top artists for this genre */}
        <div className="text-left">
          <h4 className="text-gray-300 text-sm font-medium mb-2">Top Artists:</h4>
          <div className="space-y-1">
            {genre.topArtists.slice(0, 3).map((artist, index) => (
              <div key={artist} className="text-gray-400 text-xs">
                {index + 1}. {artist}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

type GenreGridProps = {
  genres: GenreData[];
  isLoading?: boolean;
  className?: string;
};

export const GenreGrid: React.FC<GenreGridProps> = ({ genres, isLoading, className = '' }) => {
  if (isLoading) {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
        {Array.from({ length: 20 }, (_, index) => (
          <div key={index} className="card-spotify relative overflow-hidden">
            <div className="absolute top-4 right-4 text-white px-2 py-1 rounded-2xl text-sm font-bold" style={{backgroundColor: 'var(--color-spotify-green)'}}>
              <div className="skeleton-gradient w-8 h-4 rounded"></div>
            </div>
            <div className="text-center mb-4">
              <div className="skeleton-gradient w-24 h-24 sm:w-32 sm:h-32 rounded-full mx-auto"></div>
            </div>
            <div className="text-center space-y-3">
              <div className="skeleton-gradient h-6 w-3/4 mx-auto rounded"></div>
              <div className="skeleton-gradient h-4 w-4/5 mx-auto rounded"></div>
              <div className="skeleton-gradient h-2 w-full rounded-full"></div>
              <div className="space-y-1">
                <div className="skeleton-gradient h-3 w-full rounded"></div>
                <div className="skeleton-gradient h-3 w-4/5 rounded"></div>
                <div className="skeleton-gradient h-3 w-3/4 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
      {genres.map((genre, index) => (
        <GenreCard
          key={genre.name}
          genre={genre}
          rank={index + 1}
        />
      ))}
    </div>
  );
};