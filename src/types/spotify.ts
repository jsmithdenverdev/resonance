// Spotify API types following CLAUDE.md conventions

export type SpotifyImage = {
  url: string;
  height: number;
  width: number;
};

export type Artist = {
  id: string;
  name: string;
  genres: string[];
  popularity: number;
  followers: {
    total: number;
  };
  images: SpotifyImage[];
  external_urls: {
    spotify: string;
  };
};

export type Track = {
  id: string;
  name: string;
  artists: Pick<Artist, 'id' | 'name'>[];
  album: {
    id: string;
    name: string;
    images: SpotifyImage[];
    external_urls?: {
      spotify: string;
    };
  };
  popularity: number;
  duration_ms: number;
  explicit: boolean;
  preview_url: string | null;
  external_urls: {
    spotify: string;
  };
};

export type TimeRange = 'short_term' | 'medium_term' | 'long_term';

export type SpotifyTopArtistsResponse = {
  items: Artist[];
  total: number;
  limit: number;
  offset: number;
  href: string;
  next: string | null;
  previous: string | null;
};

export type SpotifyUserProfile = {
  id: string;
  display_name: string;
  email: string;
  images: SpotifyImage[];
  followers: {
    total: number;
  };
  country: string;
  product: string;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
};

export type AuthConfig = {
  clientId: string;
  redirectUri: string;
  scopes: string[];
};

export type Album = {
  id: string;
  name: string;
  artists: Pick<Artist, 'id' | 'name'>[];
  images: SpotifyImage[];
  release_date: string;
  total_tracks: number;
  album_type: string;
  external_urls: {
    spotify: string;
  };
};

export type Playlist = {
  id: string;
  name: string;
  description: string;
  images: SpotifyImage[];
  tracks: {
    total: number;
  };
  owner: {
    id: string;
    display_name: string;
  };
  public: boolean;
  external_urls: {
    spotify: string;
  };
};

export type GenreData = {
  name: string;
  count: number;
  percentage: number;
  topArtists: string[];
};

export type SpotifyTopAlbumsResponse = {
  items: Album[];
  total: number;
  limit: number;
  offset: number;
  href: string;
  next: string | null;
  previous: string | null;
};

export type SpotifyPlaylistsResponse = {
  items: Playlist[];
  total: number;
  limit: number;
  offset: number;
  href: string;
  next: string | null;
  previous: string | null;
};

export type ContentType = 'artists' | 'genres' | 'albums' | 'playlists' | 'tracks';

export type FeatureOption = {
  id: ContentType;
  label: string;
  description: string;
  icon?: string;
};