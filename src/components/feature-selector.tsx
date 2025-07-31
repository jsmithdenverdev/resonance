import React from 'react';
import type { ContentType, FeatureOption } from '../types/spotify';

type FeatureSelectorProps = {
  selectedFeature: ContentType;
  onFeatureChange: (feature: ContentType) => void;
  disabled?: boolean;
};

const featureOptions: FeatureOption[] = [
  {
    id: 'artists',
    label: 'Artists',
    description: 'Your most played artists',
  },
  {
    id: 'genres',
    label: 'Genres',
    description: 'Your music taste breakdown',
  },
  {
    id: 'tracks',
    label: 'Tracks',
    description: 'Your favorite songs',
  },
  {
    id: 'albums',
    label: 'Albums',
    description: 'Your saved albums',
  },
  {
    id: 'playlists',
    label: 'Playlists',
    description: 'Your created playlists',
  },
];

export const FeatureSelector: React.FC<FeatureSelectorProps> = ({ 
  selectedFeature, 
  onFeatureChange, 
  disabled = false 
}) => {
  return (
    <div className="mb-8">
      <h2 className="text-white text-2xl lg:text-3xl font-semibold mb-6 text-center">
        Your Top Music Data
      </h2>
      
      {/* Desktop: Horizontal tabs */}
      <div className="hidden sm:flex justify-center mb-6">
        <div className="inline-flex bg-gray-800 rounded-full p-1 space-x-1">
          {featureOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => onFeatureChange(option.id)}
              disabled={disabled}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                selectedFeature === option.id
                  ? 'text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
              style={selectedFeature === option.id ? { backgroundColor: 'var(--color-spotify-green)' } : {}}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Mobile: Dropdown */}
      <div className="sm:hidden mb-6">
        <select
          value={selectedFeature}
          onChange={(e) => onFeatureChange(e.target.value as ContentType)}
          disabled={disabled}
          className="w-full bg-gray-800 border border-gray-600 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ outline: 'none' }}
          onFocus={(e) => {
            e.target.style.boxShadow = '0 0 0 2px var(--color-spotify-green)';
          }}
          onBlur={(e) => {
            e.target.style.boxShadow = 'none';
          }}
        >
          {featureOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label} - {option.description}
            </option>
          ))}
        </select>
      </div>
      
      {/* Feature description */}
      <div className="text-center">
        <p className="text-gray-400 text-sm">
          {featureOptions.find(opt => opt.id === selectedFeature)?.description}
        </p>
      </div>
    </div>
  );
};