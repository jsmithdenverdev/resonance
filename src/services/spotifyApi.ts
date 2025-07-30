import { getStoredToken } from './spotifyAuth';

export interface SpotifyArtist {
  id: string;
  name: string;
  images: Array<{
    url: string;
    height: number;
    width: number;
  }>;
  genres: string[];
  popularity: number;
  followers: {
    total: number;
  };
  external_urls: {
    spotify: string;
  };
}

export interface TopArtistsResponse {
  items: SpotifyArtist[];
  total: number;
  limit: number;
  offset: number;
  href: string;
  next: string | null;
  previous: string | null;
}

const makeSpotifyRequest = async (endpoint: string): Promise<any> => {
  const token = getStoredToken();
  
  if (!token) {
    throw new Error('No access token available');
  }

  const response = await fetch(`https://api.spotify.com/v1${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Token expired or invalid');
    }
    if (response.status === 403) {
      throw new Error('Access forbidden - insufficient permissions');
    }
    if (response.status === 429) {
      throw new Error('Rate limit exceeded - please try again later');
    }
    // Generic error without exposing internal details
    throw new Error('Failed to fetch data from Spotify');
  }

  return response.json();
};

export const getTopArtists = async (
  timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term',
  limit: number = 50
): Promise<TopArtistsResponse> => {
  // Validate inputs
  const validTimeRanges = ['short_term', 'medium_term', 'long_term'];
  if (!validTimeRanges.includes(timeRange)) {
    throw new Error('Invalid time range');
  }
  
  if (limit < 1 || limit > 50 || !Number.isInteger(limit)) {
    throw new Error('Limit must be an integer between 1 and 50');
  }
  
  const endpoint = `/me/top/artists?time_range=${encodeURIComponent(timeRange)}&limit=${encodeURIComponent(limit.toString())}`;
  return makeSpotifyRequest(endpoint);
};

export const getCurrentUser = async (): Promise<any> => {
  return makeSpotifyRequest('/me');
};