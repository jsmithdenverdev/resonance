import type { 
  SpotifyTopArtistsResponse, 
  SpotifyUserProfile, 
  TimeRange, 
  SpotifyPlaylistsResponse,
  Track,
  GenreData,
  Artist
} from '../types/spotify';
import { getStoredToken } from './spotify-auth';
import { logger } from './logger';

const makeSpotifyRequest = async <T = unknown>(endpoint: string): Promise<T> => {
  const token = await getStoredToken();
  
  if (!token) {
    throw new Error('No access token available');
  }

  logger.debug('Making Spotify API request', { endpoint });
  const response = await fetch(`https://api.spotify.com/v1${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      logger.warn('Spotify API authentication failed', { status: response.status });
      throw new Error('Token expired or invalid');
    }
    if (response.status === 403) {
      logger.warn('Spotify API access forbidden', { status: response.status });
      throw new Error('Access forbidden - insufficient permissions');
    }
    if (response.status === 429) {
      logger.warn('Spotify API rate limit exceeded', { status: response.status });
      throw new Error('Rate limit exceeded - please try again later');
    }
    
    logger.error('Spotify API request failed', { 
      status: response.status, 
      statusText: response.statusText,
      endpoint 
    });
    throw new Error('Failed to fetch data from Spotify');
  }

  const data = await response.json();
  logger.debug('Spotify API request successful', { endpoint });
  return data;
};

export const getTopArtists = async (
  timeRange: TimeRange = 'medium_term',
  limit: number = 50
): Promise<SpotifyTopArtistsResponse> => {
  // Validate inputs
  const validTimeRanges: TimeRange[] = ['short_term', 'medium_term', 'long_term'];
  if (!validTimeRanges.includes(timeRange)) {
    throw new Error('Invalid time range');
  }
  
  if (limit < 1 || limit > 50 || !Number.isInteger(limit)) {
    throw new Error('Limit must be an integer between 1 and 50');
  }
  
  const endpoint = `/me/top/artists?time_range=${encodeURIComponent(timeRange)}&limit=${encodeURIComponent(limit.toString())}`;
  return makeSpotifyRequest(endpoint);
};

export const getCurrentUser = async (): Promise<SpotifyUserProfile> => {
  return makeSpotifyRequest('/me');
};

export const getTopTracks = async (
  timeRange: TimeRange = 'medium_term',
  limit: number = 50
): Promise<{ items: Track[]; total: number }> => {
  // Validate inputs
  const validTimeRanges: TimeRange[] = ['short_term', 'medium_term', 'long_term'];
  if (!validTimeRanges.includes(timeRange)) {
    throw new Error('Invalid time range');
  }
  
  if (limit < 1 || limit > 50 || !Number.isInteger(limit)) {
    throw new Error('Limit must be an integer between 1 and 50');
  }
  
  const endpoint = `/me/top/tracks?time_range=${encodeURIComponent(timeRange)}&limit=${encodeURIComponent(limit.toString())}`;
  return makeSpotifyRequest(endpoint);
};

export const getUserPlaylists = async (
  limit: number = 50,
  offset: number = 0
): Promise<SpotifyPlaylistsResponse> => {
  if (limit < 1 || limit > 50 || !Number.isInteger(limit)) {
    throw new Error('Limit must be an integer between 1 and 50');
  }
  
  const endpoint = `/me/playlists?limit=${encodeURIComponent(limit.toString())}&offset=${encodeURIComponent(offset.toString())}`;
  return makeSpotifyRequest(endpoint);
};

export const getUserSavedAlbums = async (
  limit: number = 50,
  offset: number = 0
): Promise<{ items: Array<{ album: any }>; total: number }> => {
  if (limit < 1 || limit > 50 || !Number.isInteger(limit)) {
    throw new Error('Limit must be an integer between 1 and 50');
  }
  
  const endpoint = `/me/albums?limit=${encodeURIComponent(limit.toString())}&offset=${encodeURIComponent(offset.toString())}`;
  return makeSpotifyRequest(endpoint);
};

export const getTopAlbumsFromTracks = async (
  timeRange: TimeRange = 'medium_term',
  limit: number = 50
): Promise<Array<{ album: any; trackCount: number; topTracks: string[] }>> => {
  try {
    logger.info('Calculating top albums from user tracks', { timeRange, limit });
    
    // Get top tracks (maximum 50)
    const tracksResponse = await getTopTracks(timeRange, 50);
    const tracks = tracksResponse.items || [];
    
    // Group tracks by album
    const albumMap = new Map<string, {
      album: any;
      trackCount: number;
      topTracks: string[];
      totalPopularity: number;
    }>();
    
    tracks.forEach((track) => {
      const albumId = track.album.id;
      const albumData = albumMap.get(albumId);
      
      if (albumData) {
        // Album already exists, increment count
        albumData.trackCount += 1;
        albumData.topTracks.push(track.name);
        albumData.totalPopularity += track.popularity;
      } else {
        // New album
        albumMap.set(albumId, {
          album: {
            id: track.album.id,
            name: track.album.name,
            images: track.album.images,
            artists: (track.album as any).artists || [{ id: track.artists[0]?.id || '', name: track.artists[0]?.name || 'Unknown Artist' }],
            release_date: (track.album as any).release_date || 'Unknown',
            total_tracks: (track.album as any).total_tracks || 1,
            album_type: (track.album as any).album_type || 'album',
            external_urls: track.album.external_urls || track.external_urls,
          },
          trackCount: 1,
          topTracks: [track.name],
          totalPopularity: track.popularity,
        });
      }
    });
    
    // Convert to array and sort by track count (then by average popularity)
    const albumsArray = Array.from(albumMap.values())
      .map(item => ({
        album: item.album,
        trackCount: item.trackCount,
        topTracks: item.topTracks.slice(0, 3), // Only keep top 3 track names
        averagePopularity: item.totalPopularity / item.trackCount,
      }))
      .sort((a, b) => {
        // Primary sort: track count (more tracks = higher rank)
        if (b.trackCount !== a.trackCount) {
          return b.trackCount - a.trackCount;
        }
        // Secondary sort: average popularity
        return b.averagePopularity - a.averagePopularity;
      })
      .slice(0, limit);
    
    logger.info('Top albums calculated successfully', { 
      totalAlbums: albumsArray.length,
      timeRange 
    });
    
    return albumsArray;
  } catch (error) {
    logger.error('Failed to calculate top albums from tracks', { error, timeRange });
    throw error;
  }
};

export const getTopGenres = async (
  timeRange: TimeRange = 'medium_term'
): Promise<GenreData[]> => {
  try {
    logger.info('Calculating top genres from user artists', { timeRange });
    
    // Get top artists first
    const artistsResponse = await getTopArtists(timeRange, 50);
    const artists: Artist[] = artistsResponse.items;
    
    // Count genres from artists
    const genreCount = new Map<string, { count: number; artists: string[] }>();
    
    artists.forEach(artist => {
      artist.genres.forEach(genre => {
        if (!genreCount.has(genre)) {
          genreCount.set(genre, { count: 0, artists: [] });
        }
        const genreData = genreCount.get(genre)!;
        genreData.count += 1;
        genreData.artists.push(artist.name);
      });
    });
    
    // Convert to array and calculate percentages
    const totalGenreOccurrences = Array.from(genreCount.values())
      .reduce((sum, { count }) => sum + count, 0);
    
    const genreData: GenreData[] = Array.from(genreCount.entries())
      .map(([name, { count, artists }]) => ({
        name,
        count,
        percentage: (count / totalGenreOccurrences) * 100,
        topArtists: artists.slice(0, 5), // Top 5 artists for this genre
      }))
      .sort((a, b) => b.count - a.count);
    
    logger.info('Genre analysis completed', { 
      totalGenres: genreData.length,
      topGenre: genreData[0]?.name 
    });
    
    return genreData;
  } catch (error) {
    logger.error('Failed to calculate top genres', { error, timeRange });
    throw error;
  }
};