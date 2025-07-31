import React from 'react';

type ArtistCardSkeletonProps = {
  count?: number;
  className?: string;
};

export const ArtistCardSkeleton: React.FC<ArtistCardSkeletonProps> = ({ 
  count = 50, 
  className = '' 
}) => {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className={`card-spotify relative overflow-hidden ${className}`}>
          {/* Rank badge */}
          <div className="absolute top-4 right-4 text-white px-2 py-1 rounded-2xl text-sm font-bold" style={{backgroundColor: '#1db954'}}>
            <div className="skeleton-gradient w-8 h-4 rounded"></div>
          </div>
          
          {/* Artist image skeleton */}
          <div className="text-center mb-4">
            <div className="skeleton-gradient w-24 h-24 sm:w-32 sm:h-32 rounded-full mx-auto border-4" style={{borderColor: '#1db954'}}></div>
          </div>
          
          {/* Artist info skeleton */}
          <div className="text-center space-y-3">
            {/* Artist name */}
            <div className="skeleton-gradient h-6 w-3/4 mx-auto rounded"></div>
            
            {/* Genres */}
            <div className="skeleton-gradient h-4 w-4/5 mx-auto rounded"></div>
            
            {/* Stats */}
            <div className="space-y-2 my-4">
              <div className="skeleton-gradient h-4 w-3/5 mx-auto rounded"></div>
              <div className="skeleton-gradient h-4 w-3/5 mx-auto rounded"></div>
            </div>
            
            {/* Spotify link */}
            <div className="skeleton-gradient h-8 w-1/2 mx-auto rounded-3xl mt-4"></div>
          </div>
        </div>
      ))}
    </>
  );
};