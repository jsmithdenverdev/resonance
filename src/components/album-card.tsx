import React from 'react';
import type { Album } from '../types/spotify';

type AlbumCardProps = {
  album: Album;
  rank: number;
  className?: string;
};

export const AlbumCard: React.FC<AlbumCardProps> = ({ album, rank, className = '' }) => {
  const releaseYear = new Date(album.release_date).getFullYear();
  
  return (
    <div className={`card-spotify card-spotify-hover relative ${className}`}>
      {/* Rank badge */}
      <div className="absolute top-4 right-4 text-white px-2 py-1 rounded-2xl text-sm font-bold" style={{backgroundColor: 'var(--color-spotify-green)'}}>
        #{rank}
      </div>
      
      {/* Album art */}
      <div className="text-center mb-4">
        {album.images && album.images[0] ? (
          <img
            src={album.images[0].url}
            alt={album.name}
            loading="lazy"
            className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl object-cover mx-auto border-4"
            style={{borderColor: 'var(--color-spotify-green)'}}
          />
        ) : (
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl mx-auto flex items-center justify-center text-3xl sm:text-4xl font-bold text-white border-4" 
               style={{backgroundColor: 'var(--color-spotify-medium-gray)', borderColor: 'var(--color-spotify-green)'}}>
            💿
          </div>
        )}
      </div>
      
      {/* Album info */}
      <div className="text-center">
        <h3 className="text-white text-lg font-bold mb-2 truncate" title={album.name}>
          {album.name}
        </h3>
        <p className="text-gray-400 text-sm mb-2 truncate">
          by {album.artists.map(artist => artist.name).join(', ')}
        </p>
        
        {/* Album details */}
        <div className="space-y-1 mb-4">
          <div className="text-gray-500 text-xs">
            {releaseYear} • {album.album_type}
          </div>
          <div className="text-gray-500 text-xs">
            {album.total_tracks} track{album.total_tracks !== 1 ? 's' : ''}
          </div>
          {album.trackCount && (
            <div className="text-green-400 text-sm font-medium">
              {album.trackCount} song{album.trackCount !== 1 ? 's' : ''} in your top tracks
            </div>
          )}
        </div>
        
        {/* Top tracks for this album */}
        {album.topTracks && album.topTracks.length > 0 && (
          <div className="text-left mb-4">
            <h4 className="text-gray-300 text-sm font-medium mb-2">Your top tracks:</h4>
            <div className="space-y-1">
              {album.topTracks.map((track, index) => (
                <div key={index} className="text-gray-400 text-xs truncate">
                  {index + 1}. {track}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Spotify link */}
        <a
          href={album.external_urls.spotify}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-white text-sm font-bold py-2 px-4 rounded-3xl transition-colors duration-300 hover:opacity-90"
          style={{backgroundColor: 'var(--color-spotify-green)'}}
        >
          Open Album
        </a>
      </div>
    </div>
  );
};

type AlbumGridProps = {
  albums: Album[];
  isLoading?: boolean;
  className?: string;
};

export const AlbumGrid: React.FC<AlbumGridProps> = ({ albums, isLoading, className = '' }) => {
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
              <div className="space-y-1">
                <div className="skeleton-gradient h-3 w-2/3 mx-auto rounded"></div>
                <div className="skeleton-gradient h-3 w-1/2 mx-auto rounded"></div>
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
      {albums.map((album, index) => (
        <AlbumCard
          key={album.id}
          album={album}
          rank={index + 1}
        />
      ))}
    </div>
  );
};