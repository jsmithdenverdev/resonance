# Spotify Analytics App - Development Instructions

This document provides comprehensive guidance for developing and maintaining a React-based Spotify analytics application using Claude Code with specialized sub-agents.

## Table of Contents
1. [Project Overview](#project-overview)
2. [Sub-Agent Architecture](#sub-agent-architecture)
3. [Development Environment](#development-environment)
4. [Code Standards & Conventions](#code-standards--conventions)
5. [Architecture Patterns](#architecture-patterns)
6. [Component Guidelines](#component-guidelines)
7. [Service Layer Patterns](#service-layer-patterns)
8. [Testing Strategy](#testing-strategy)
9. [Security Requirements](#security-requirements)
10. [Performance & Accessibility](#performance--accessibility)
11. [Spotify API Integration](#spotify-api-integration)
12. [UI/UX Guidelines](#uiux-guidelines)
13. [Error Handling & Logging](#error-handling--logging)
14. [Common Code Patterns](#common-code-patterns)
15. [Anti-Patterns to Avoid](#anti-patterns-to-avoid)
16. [Development Workflow](#development-workflow)
17. [Feature Roadmap Management](#feature-roadmap-management)

## Project Overview

**Framework:** React 19 with TypeScript, built using Vite  
**Purpose:** Analytics dashboard for Spotify user data including top artists, genres, albums, and listening patterns  
**Target Browsers:** Modern Firefox and Chromium-based browsers  
**Authentication:** Spotify OAuth2 PKCE flow  

### Core Features
- User authentication via Spotify OAuth
- Top artists display across multiple time periods
- Genre analytics and insights
- Album listening patterns
- Modern, Spotify-themed UI
- Performance and accessibility optimized

## Sub-Agent Architecture

This project leverages specialized sub-agents for different aspects of development:

### 1. Security Agent 🔒
**Responsibilities:**
- Audit all code for security vulnerabilities
- Review OAuth implementation
- Validate input sanitization
- Check for sensitive data exposure
- Review CSP and security headers

**Audit Requirements:**
- All security recommendations must be reviewed and accepted by developer
- Focus on OAuth flow security, XSS prevention, and data protection
- Ensure no sensitive tokens or user data in logs

### 2. Frontend Agent 🎨
**Responsibilities:**
- Component design and implementation
- UI/UX consistency with Spotify theme
- Responsive design implementation
- Accessibility compliance
- Performance optimization

**Guidelines:**
- Modern, clean aesthetic matching Spotify's design language
- Ensure WCAG 2.1 AA compliance
- Optimize for Google Lighthouse scores

### 3. Testing Agent 🧪
**Responsibilities:**
- Unit test creation and maintenance
- Integration test design
- Test coverage analysis
- Performance testing guidance

**Requirements:**
- All new features must have accompanying tests
- Maintain >90% test coverage
- Focus on critical paths and edge cases

### 4. API Integration Agent 🔌
**Responsibilities:**
- Spotify API integration
- Error handling for API calls
- Rate limiting and caching strategies
- Data transformation and validation

### 5. Architecture Agent 🏗️
**Responsibilities:**
- Code structure and organization
- Pattern consistency
- Refactoring guidance
- Performance architecture

## Development Environment

### Prerequisites
```bash
Node.js 18+
npm or yarn
Git
```

### Setup Commands
```bash
# Install dependencies
npm install

# Start development server (HTTPS on localhost:5173)
npm run dev

# Build for production
npm run build

# Run tests
npm run test

# Run linting
npm run lint

# Preview production build
npm run preview

# Build for Netlify deployment
npm run netlify-build
```

### Environment Variables
```bash
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id
VITE_SPOTIFY_REDIRECT_URI=https://localhost:5173/callback
VITE_LOG_LEVEL=debug # development only
```

## Code Standards & Conventions

### File Naming
- Use **kebab-case** for all file names
- Examples: `user-profile.tsx`, `spotify-auth.ts`, `artist-card.test.tsx`

### Import/Export Patterns
```typescript
// ✅ Prefer named exports
export const UserProfile = () => {
  // component logic
};

export const calculateAveragePopularity = (artists: Artist[]) => {
  // utility logic
};

// ✅ Import patterns
import { UserProfile, calculateAveragePopularity } from './user-profile';
import type { Artist, TimeRange } from '../types/spotify';
```

### TypeScript Conventions
```typescript
// ✅ Prefer Types over Interfaces
type Artist = {
  id: string;
  name: string;
  genres: string[];
  popularity: number;
  followers: {
    total: number;
  };
  images: SpotifyImage[];
};

// ✅ Use const assertions for immutable data
const TIME_RANGES = ['short_term', 'medium_term', 'long_term'] as const;
type TimeRange = typeof TIME_RANGES[number];

// ✅ Leverage utility types
type PartialArtist = Partial<Artist>;
type ArtistKeys = keyof Artist;
```

### Component Structure
```typescript
// ✅ Functional components with proper typing
type ArtistCardProps = {
  artist: Artist;
  onArtistClick: (artistId: string) => void;
  className?: string;
};

export const ArtistCard = ({ artist, onArtistClick, className }: ArtistCardProps) => {
  const handleClick = () => {
    onArtistClick(artist.id);
  };

  return (
    <div className={`artist-card ${className || ''}`} onClick={handleClick}>
      {/* component JSX */}
    </div>
  );
};
```

## Architecture Patterns

### Project Structure
```
src/
├── components/           # Reusable, stateless UI components
│   ├── artist-card.tsx
│   ├── genre-chart.tsx
│   ├── loading-spinner.tsx
│   └── error-boundary.tsx
├── pages/               # Route-driven, stateful pages
│   ├── dashboard.tsx
│   ├── login.tsx
│   ├── callback.tsx
│   └── artist-details.tsx
├── services/            # Business logic, API calls, utilities
│   ├── spotify-auth.ts
│   ├── spotify-api.ts
│   ├── analytics.ts
│   └── logger.ts
├── types/              # TypeScript type definitions
│   ├── spotify.ts
│   └── app.ts
├── hooks/              # Custom React hooks
│   ├── use-spotify-auth.ts
│   └── use-artist-data.ts
└── utils/              # Pure utility functions
    ├── date-helpers.ts
    └── array-helpers.ts
```

### Service Layer Pattern
```typescript
// services/spotify-api.ts
type SpotifyApiConfig = {
  accessToken: string;
  baseUrl?: string;
};

export const createSpotifyApiClient = (config: SpotifyApiConfig) => {
  const { accessToken, baseUrl = 'https://api.spotify.com/v1' } = config;

  const makeRequest = async <T>(endpoint: string): Promise<T> => {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Spotify API error: ${response.status}`);
    }

    return response.json();
  };

  return {
    getTopArtists: (timeRange: TimeRange = 'medium_term', limit = 50) =>
      makeRequest<SpotifyTopArtistsResponse>(`/me/top/artists?time_range=${timeRange}&limit=${limit}`),
    
    getTopTracks: (timeRange: TimeRange = 'medium_term', limit = 50) =>
      makeRequest<SpotifyTopTracksResponse>(`/me/top/tracks?time_range=${timeRange}&limit=${limit}`),
    
    getUserProfile: () =>
      makeRequest<SpotifyUserProfile>('/me'),
  };
};
```

### Hook Patterns
```typescript
// hooks/use-spotify-auth.ts
export const useSpotifyAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    error: null,
  });

  const login = useCallback(async () => {
    try {
      const authUrl = await spotifyAuth.getAuthUrl();
      window.location.href = authUrl;
    } catch (error) {
      setAuthState(prev => ({ ...prev, error: error as Error }));
    }
  }, []);

  const logout = useCallback(async () => {
    await spotifyAuth.logout();
    setAuthState({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      error: null,
    });
  }, []);

  return {
    ...authState,
    login,
    logout,
  };
};
```

## Component Guidelines

### Component Types

#### 1. Presentational Components
```typescript
// components/artist-card.tsx
type ArtistCardProps = {
  artist: Artist;
  isLoading?: boolean;
  onSelect?: (artist: Artist) => void;
  className?: string;
};

export const ArtistCard = ({ artist, isLoading, onSelect, className }: ArtistCardProps) => {
  if (isLoading) {
    return <ArtistCardSkeleton className={className} />;
  }

  return (
    <div 
      className={`bg-gray-900 rounded-lg p-4 hover:bg-gray-800 transition-colors cursor-pointer ${className || ''}`}
      onClick={() => onSelect?.(artist)}
    >
      <img 
        src={artist.images[0]?.url} 
        alt={artist.name}
        className="w-full aspect-square object-cover rounded-md mb-3"
        loading="lazy"
      />
      <h3 className="text-white font-semibold text-lg truncate">{artist.name}</h3>
      <p className="text-gray-400 text-sm">
        {artist.genres.slice(0, 2).join(', ')}
      </p>
      <div className="flex items-center justify-between mt-2">
        <span className="text-green-400 text-sm">{artist.popularity}% popularity</span>
        <span className="text-gray-500 text-xs">
          {artist.followers.total.toLocaleString()} followers
        </span>
      </div>
    </div>
  );
};
```

#### 2. Container Components (Pages)
```typescript
// pages/dashboard.tsx
export const Dashboard = () => {
  const { isAuthenticated, user } = useSpotifyAuth();
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('medium_term');
  const { data: artists, isLoading, error } = useTopArtists(selectedTimeRange);

  const handleArtistSelect = useCallback((artist: Artist) => {
    // Navigate to artist details or show modal
    navigate(`/artist/${artist.id}`);
  }, [navigate]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header user={user} />
      <main className="container mx-auto px-4 py-8">
        <TimeRangeSelector 
          value={selectedTimeRange}
          onChange={setSelectedTimeRange}
        />
        <ArtistGrid 
          artists={artists}
          isLoading={isLoading}
          onArtistSelect={handleArtistSelect}
        />
        {error && <ErrorMessage error={error} />}
      </main>
    </div>
  );
};
```

### Error Boundary Implementation
```typescript
// components/error-boundary.tsx
type ErrorBoundaryState = {
  hasError: boolean;
  error?: Error;
};

type ErrorBoundaryProps = {
  children: ReactNode;
  fallback?: ComponentType<{ error: Error; resetError: () => void }>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('Error caught by boundary', { error, errorInfo });
    this.props.onError?.(error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}
```

## Service Layer Patterns

### Authentication Service
```typescript
// services/spotify-auth.ts
type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
};

type AuthConfig = {
  clientId: string;
  redirectUri: string;
  scopes: string[];
};

export const createSpotifyAuth = (config: AuthConfig) => {
  const STORAGE_KEY = 'spotify_auth_tokens';

  const generateCodeVerifier = (): string => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  };

  const generateCodeChallenge = async (verifier: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  };

  const getAuthUrl = async (): Promise<string> => {
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    
    localStorage.setItem('code_verifier', codeVerifier);

    const params = new URLSearchParams({
      client_id: config.clientId,
      response_type: 'code',
      redirect_uri: config.redirectUri,
      code_challenge_method: 'S256',
      code_challenge: codeChallenge,
      scope: config.scopes.join(' '),
    });

    return `https://accounts.spotify.com/authorize?${params.toString()}`;
  };

  const exchangeCodeForTokens = async (code: string): Promise<AuthTokens> => {
    const codeVerifier = localStorage.getItem('code_verifier');
    if (!codeVerifier) {
      throw new Error('Code verifier not found');
    }

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: config.redirectUri,
        client_id: config.clientId,
        code_verifier: codeVerifier,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to exchange code for tokens');
    }

    const data = await response.json();
    const tokens: AuthTokens = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: Date.now() + (data.expires_in * 1000),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
    localStorage.removeItem('code_verifier');

    return tokens;
  };

  return {
    getAuthUrl,
    exchangeCodeForTokens,
    // ... other auth methods
  };
};
```

### Analytics Service
```typescript
// services/analytics.ts
export const createAnalyticsService = (apiClient: ReturnType<typeof createSpotifyApiClient>) => {
  const calculateGenreDistribution = (artists: Artist[]): GenreDistribution => {
    const genreCounts = new Map<string, number>();
    
    artists.forEach(artist => {
      artist.genres.forEach(genre => {
        genreCounts.set(genre, (genreCounts.get(genre) || 0) + 1);
      });
    });

    const total = artists.length;
    return Array.from(genreCounts.entries())
      .map(([genre, count]) => ({
        genre,
        count,
        percentage: (count / total) * 100,
      }))
      .sort((a, b) => b.count - a.count);
  };

  const getListeningInsights = async (timeRange: TimeRange): Promise<ListeningInsights> => {
    const [artists, tracks] = await Promise.all([
      apiClient.getTopArtists(timeRange),
      apiClient.getTopTracks(timeRange),
    ]);

    return {
      topGenres: calculateGenreDistribution(artists.items),
      averagePopularity: artists.items.reduce((sum, artist) => sum + artist.popularity, 0) / artists.items.length,
      totalUniqueArtists: artists.items.length,
      diversityScore: calculateDiversityScore(artists.items),
      timeRange,
    };
  };

  return {
    calculateGenreDistribution,
    getListeningInsights,
  };
};
```

## Testing Strategy

### Unit Testing Patterns
```typescript
// components/artist-card.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { ArtistCard } from './artist-card';
import type { Artist } from '../types/spotify';

const mockArtist: Artist = {
  id: '1',
  name: 'Test Artist',
  genres: ['pop', 'rock'],
  popularity: 85,
  followers: { total: 1000000 },
  images: [{ url: 'https://example.com/image.jpg', width: 300, height: 300 }],
};

describe('ArtistCard', () => {
  it('renders artist information correctly', () => {
    render(<ArtistCard artist={mockArtist} />);
    
    expect(screen.getByText('Test Artist')).toBeInTheDocument();
    expect(screen.getByText('pop, rock')).toBeInTheDocument();
    expect(screen.getByText('85% popularity')).toBeInTheDocument();
    expect(screen.getByText('1,000,000 followers')).toBeInTheDocument();
  });

  it('calls onSelect when clicked', () => {
    const onSelect = vi.fn();
    render(<ArtistCard artist={mockArtist} onSelect={onSelect} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(onSelect).toHaveBeenCalledWith(mockArtist);
  });

  it('shows loading state', () => {
    render(<ArtistCard artist={mockArtist} isLoading />);
    expect(screen.getByTestId('artist-card-skeleton')).toBeInTheDocument();
  });
});
```

### Service Testing
```typescript
// services/spotify-auth.test.ts
import { vi, beforeEach, afterEach } from 'vitest';
import { createSpotifyAuth } from './spotify-auth';

// Mock crypto.subtle
Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: vi.fn(() => new Uint8Array(32)),
    subtle: {
      digest: vi.fn(() => Promise.resolve(new ArrayBuffer(32))),
    },
  },
});

describe('SpotifyAuth', () => {
  const mockConfig = {
    clientId: 'test-client-id',
    redirectUri: 'http://localhost:3000/callback',
    scopes: ['user-read-private', 'user-top-read'],
  };

  let spotifyAuth: ReturnType<typeof createSpotifyAuth>;

  beforeEach(() => {
    spotifyAuth = createSpotifyAuth(mockConfig);
    localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getAuthUrl', () => {
    it('generates auth URL with correct parameters', async () => {
      const authUrl = await spotifyAuth.getAuthUrl();
      
      expect(authUrl).toContain('https://accounts.spotify.com/authorize');
      expect(authUrl).toContain(`client_id=${mockConfig.clientId}`);
      expect(authUrl).toContain(`redirect_uri=${encodeURIComponent(mockConfig.redirectUri)}`);
      expect(authUrl).toContain('code_challenge_method=S256');
    });

    it('stores code verifier in localStorage', async () => {
      await spotifyAuth.getAuthUrl();
      expect(localStorage.getItem('code_verifier')).toBeTruthy();
    });
  });
});
```

## Security Requirements

### Input Validation
```typescript
// utils/validation.ts
export const validateSpotifyAuthCode = (code: string): boolean => {
  // Spotify auth codes are typically 200+ characters, alphanumeric with specific chars
  const codeRegex = /^[A-Za-z0-9\-._~]+$/;
  return codeRegex.test(code) && code.length > 50 && code.length < 1000;
};

export const sanitizeUserInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .trim()
    .slice(0, 1000); // Limit length
};
```

### Secure Token Handling
```typescript
// services/token-manager.ts
type SecureTokenStorage = {
  store: (tokens: AuthTokens) => void;
  retrieve: () => AuthTokens | null;
  clear: () => void;
  isExpired: (tokens: AuthTokens) => boolean;
};

export const createSecureTokenStorage = (): SecureTokenStorage => {
  const STORAGE_KEY = 'spotify_tokens';
  const BUFFER_TIME = 5 * 60 * 1000; // 5 minutes buffer

  const store = (tokens: AuthTokens) => {
    try {
      const encrypted = btoa(JSON.stringify(tokens)); // Basic obfuscation
      localStorage.setItem(STORAGE_KEY, encrypted);
    } catch (error) {
      logger.error('Failed to store tokens', { error });
    }
  };

  const retrieve = (): AuthTokens | null => {
    try {
      const encrypted = localStorage.getItem(STORAGE_KEY);
      if (!encrypted) return null;
      
      const tokens = JSON.parse(atob(encrypted));
      return isExpired(tokens) ? null : tokens;
    } catch (error) {
      logger.error('Failed to retrieve tokens', { error });
      return null;
    }
  };

  const isExpired = (tokens: AuthTokens): boolean => {
    return Date.now() >= (tokens.expiresAt - BUFFER_TIME);
  };

  return { store, retrieve, clear: () => localStorage.removeItem(STORAGE_KEY), isExpired };
};
```

## Performance & Accessibility

### Performance Optimization
```typescript
// components/virtual-artist-grid.tsx
import { FixedSizeGrid as Grid } from 'react-window';

type VirtualArtistGridProps = {
  artists: Artist[];
  onArtistSelect: (artist: Artist) => void;
};

export const VirtualArtistGrid = ({ artists, onArtistSelect }: VirtualArtistGridProps) => {
  const ITEM_SIZE = 280;
  const ITEMS_PER_ROW = Math.floor(window.innerWidth / ITEM_SIZE);

  const Cell = ({ columnIndex, rowIndex, style }: any) => {
    const index = rowIndex * ITEMS_PER_ROW + columnIndex;
    const artist = artists[index];

    if (!artist) return null;

    return (
      <div style={style}>
        <ArtistCard 
          artist={artist} 
          onSelect={onArtistSelect}
          className="m-2"
        />
      </div>
    );
  };

  return (
    <Grid
      columnCount={ITEMS_PER_ROW}
      columnWidth={ITEM_SIZE}
      height={600}
      rowCount={Math.ceil(artists.length / ITEMS_PER_ROW)}
      rowHeight={ITEM_SIZE}
      width="100%"
    >
      {Cell}
    </Grid>
  );
};
```

### Accessibility Implementation
```typescript
// components/accessible-button.tsx
type AccessibleButtonProps = {
  children: ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  ariaLabel?: string;
  className?: string;
};

export const AccessibleButton = ({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  ariaLabel,
  className = '',
}: AccessibleButtonProps) => {
  const baseClasses = 'px-4 py-2 rounded-md font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2';
  const variantClasses = {
    primary: 'bg-green-500 hover:bg-green-600 text-white focus:ring-green-500',
    secondary: 'bg-gray-700 hover:bg-gray-600 text-white focus:ring-gray-500',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      type="button"
    >
      {children}
    </button>
  );
};
```

## Spotify API Integration

### API Client Types
```typescript
// types/spotify.ts
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
  };
  popularity: number;
  duration_ms: number;
  explicit: boolean;
  preview_url: string | null;
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
```

### Advanced API Features
```typescript
// services/spotify-extended-api.ts
export const createExtendedSpotifyApi = (baseClient: ReturnType<typeof createSpotifyApiClient>) => {
  const getArtistDetails = async (artistId: string): Promise<Artist> => {
    return baseClient.makeRequest(`/artists/${artistId}`);
  };

  const getArtistTopTracks = async (artistId: string, market = 'US'): Promise<{ tracks: Track[] }> => {
    return baseClient.makeRequest(`/artists/${artistId}/top-tracks?market=${market}`);
  };

  const getRecommendations = async (params: {
    seedArtists?: string[];
    seedGenres?: string[];
    seedTracks?: string[];
    limit?: number;
    targetDanceability?: number;
    targetEnergy?: number;
  }): Promise<{ tracks: Track[] }> => {
    const searchParams = new URLSearchParams();
    
    if (params.seedArtists) searchParams.set('seed_artists', params.seedArtists.join(','));
    if (params.seedGenres) searchParams.set('seed_genres', params.seedGenres.join(','));
    if (params.seedTracks) searchParams.set('seed_tracks', params.seedTracks.join(','));
    if (params.limit) searchParams.set('limit', params.limit.toString());
    
    return baseClient.makeRequest(`/recommendations?${searchParams.toString()}`);
  };

  const getUserTopGenres = async (timeRange: TimeRange = 'medium_term'): Promise<GenreAnalysis> => {
    const artists = await baseClient.getTopArtists(timeRange, 50);
    const genreMap = new Map<string, number>();
    
    artists.items.forEach(artist => {
      artist.genres.forEach(genre => {
        genreMap.set(genre, (genreMap.get(genre) || 0) + 1);
      });
    });

    const totalGenreOccurrences = Array.from(genreMap.values()).reduce((sum, count) => sum + count, 0);
    
    return {
      genres: Array.from(genreMap.entries())
        .map(([genre, count]) => ({
          name: genre,
          count,
          percentage: (count / totalGenreOccurrences) * 100,
        }))
        .sort((a, b) => b.count - a.count),
      timeRange,
      totalArtists: artists.items.length,
    };
  };

  return {
    ...baseClient,
    getArtistDetails,
    getArtistTopTracks,
    getRecommendations,
    getUserTopGenres,
  };
};
```

## UI/UX Guidelines

### Spotify Theme Implementation
```typescript
// styles/theme.ts
export const spotifyTheme = {
  colors: {
    primary: {
      green: '#1db954',
      greenHover: '#1ed760',
      greenDark: '#1aa34a',
    },
    neutral: {
      black: '#000000',
      darkGray: '#121212',
      mediumGray: '#282828',
      lightGray: '#b3b3b3',
      white: '#ffffff',
    },
    accent: {
      purple: '#8b5cf6',
      blue: '#3b82f6',
      red: '#ef4444',
    },
  },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
    weights: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    sizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    full: '9999px',
  },
};

// Tailwind configuration for Spotify theme
export const tailwindConfig = {
  theme: {
    extend: {
      colors: spotifyTheme.colors,
      fontFamily: {
        sans: [spotifyTheme.typography.fontFamily],
      },
    },
  },
};
```

### Component Design Patterns
```typescript
// components/spotify-card.tsx
type SpotifyCardProps = {
  children: ReactNode;
  variant?: 'default' | 'hover' | 'selected';
  className?: string;
  onClick?: () => void;
};

export const SpotifyCard = ({ 
  children, 
  variant = 'default', 
  className = '', 
  onClick 
}: SpotifyCardProps) => {
  const baseClasses = 'bg-neutral-mediumGray rounded-lg transition-all duration-200';
  const variantClasses = {
    default: 'hover:bg-neutral-lightGray/10',
    hover: 'bg-neutral-lightGray/10 shadow-lg',
    selected: 'bg-primary-green/20 border border-primary-green',
  };

  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
```

### Responsive Design Patterns
```typescript
// components/responsive-grid.tsx
type ResponsiveGridProps = {
  children: ReactNode;
  minItemWidth?: string;
  gap?: string;
  className?: string;
};

export const ResponsiveGrid = ({ 
  children, 
  minItemWidth = '280px', 
  gap = '1rem',
  className = '' 
}: ResponsiveGridProps) => {
  return (
    <div 
      className={`grid ${className}`}
      style={{
        gridTemplateColumns: `repeat(auto-fill, minmax(${minItemWidth}, 1fr))`,
        gap,
      }}
    >
      {children}
    </div>
  );
};
```

## Error Handling & Logging

### Structured Logging Service
```typescript
// services/logger.ts
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

type LogEntry = {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
  userId?: string;
  sessionId: string;
};

type LoggerConfig = {
  level: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
  remoteEndpoint?: string;
};

export const createLogger = (config: LoggerConfig) => {
  const sessionId = crypto.randomUUID();
  const isProduction = import.meta.env.PROD;

  const shouldLog = (level: LogLevel): boolean => {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
    };
    return levels[level] >= levels[config.level];
  };

  const sanitizeForProduction = (data: unknown): unknown => {
    if (!isProduction) return data;
    
    if (typeof data === 'object' && data !== null) {
      const sanitized = { ...data as Record<string, unknown> };
      // Remove sensitive fields in production
      delete sanitized.accessToken;
      delete sanitized.refreshToken;
      delete sanitized.password;
      delete sanitized.email;
      return sanitized;
    }
    return data;
  };

  const createLogEntry = (
    level: LogLevel, 
    message: string, 
    context?: Record<string, unknown>
  ): LogEntry => ({
    level,
    message,
    timestamp: new Date().toISOString(),
    context: context ? sanitizeForProduction(context) : undefined,
    sessionId,
  });

  const log = (level: LogLevel, message: string, context?: Record<string, unknown>) => {
    if (!shouldLog(level)) return;

    const entry = createLogEntry(level, message, context);

    if (config.enableConsole) {
      const consoleMethod = level === 'debug' ? 'log' : level;
      console[consoleMethod](`[${entry.level.toUpperCase()}] ${entry.message}`, entry.context || '');
    }

    if (config.enableRemote && config.remoteEndpoint) {
      // Send to remote logging service (implement based on your needs)
      sendToRemoteLogger(entry);
    }
  };

  const sendToRemoteLogger = async (entry: LogEntry) => {
    try {
      await fetch(config.remoteEndpoint!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });
    } catch (error) {
      console.error('Failed to send log to remote service:', error);
    }
  };

  return {
    debug: (message: string, context?: Record<string, unknown>) => log('debug', message, context),
    info: (message: string, context?: Record<string, unknown>) => log('info', message, context),
    warn: (message: string, context?: Record<string, unknown>) => log('warn', message, context),
    error: (message: string, context?: Record<string, unknown>) => log('error', message, context),
  };
};

// Global logger instance
export const logger = createLogger({
  level: import.meta.env.VITE_LOG_LEVEL as LogLevel || 'info',
  enableConsole: true,
  enableRemote: import.meta.env.PROD,
  remoteEndpoint: import.meta.env.VITE_LOG_ENDPOINT,
});
```

### Error Handling Patterns
```typescript
// utils/error-handling.ts
export class SpotifyApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'SpotifyApiError';
  }
}

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export const handleApiError = (error: unknown): never => {
  if (error instanceof Response) {
    throw new SpotifyApiError(
      `API request failed: ${error.statusText}`,
      error.status
    );
  }
  
  if (error instanceof Error) {
    logger.error('Unexpected error', { error: error.message, stack: error.stack });
    throw error;
  }
  
  logger.error('Unknown error type', { error });
  throw new Error('An unexpected error occurred');
};

export const withErrorHandling = <T extends (...args: any[]) => any>(
  fn: T,
  errorHandler?: (error: unknown) => void
): T => {
  return ((...args: Parameters<T>) => {
    try {
      const result = fn(...args);
      
      if (result instanceof Promise) {
        return result.catch((error) => {
          errorHandler?.(error) || logger.error('Async operation failed', { error });
          throw error;
        });
      }
      
      return result;
    } catch (error) {
      errorHandler?.(error) || logger.error('Sync operation failed', { error });
      throw error;
    }
  }) as T;
};
```

## Common Code Patterns

### Custom Hooks
```typescript
// hooks/use-debounced-value.ts
export const useDebouncedValue = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// hooks/use-local-storage.ts
export const useLocalStorage = <T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      logger.warn('Failed to parse localStorage value', { key, error });
      return initialValue;
    }
  });

  const setValue = (value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      logger.error('Failed to save to localStorage', { key, error });
    }
  };

  return [storedValue, setValue];
};

// hooks/use-spotify-data.ts
export const useSpotifyData = <T>(
  fetcher: () => Promise<T>,
  dependencies: unknown[] = []
) => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await fetcher();
      setData(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      logger.error('Data fetch failed', { error });
    } finally {
      setIsLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
};
```

### Utility Functions
```typescript
// utils/array-helpers.ts
export const groupBy = <T, K extends string | number>(
  array: T[],
  keyFn: (item: T) => K
): Record<K, T[]> => {
  return array.reduce((groups, item) => {
    const key = keyFn(item);
    return {
      ...groups,
      [key]: [...(groups[key] || []), item],
    };
  }, {} as Record<K, T[]>);
};

export const chunk = <T>(array: T[], size: number): T[][] => {
  return Array.from({ length: Math.ceil(array.length / size) }, (_, index) =>
    array.slice(index * size, index * size + size)
  );
};

export const shuffle = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// utils/format-helpers.ts
export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toLocaleString();
};

export const formatDuration = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const formatPercentage = (value: number, decimals = 1): string => {
  return `${value.toFixed(decimals)}%`;
};
```

### Data Transformation Patterns
```typescript
// utils/spotify-transformers.ts
export const transformArtistForDisplay = (artist: Artist): DisplayArtist => ({
  id: artist.id,
  name: artist.name,
  imageUrl: artist.images[0]?.url || '',
  genres: artist.genres.slice(0, 3), // Limit to 3 genres for display
  popularity: artist.popularity,
  followerCount: formatNumber(artist.followers.total),
  spotifyUrl: artist.external_urls.spotify,
});

export const transformTracksToPlaylist = (tracks: Track[]): PlaylistData => ({
  tracks: tracks.map(track => ({
    id: track.id,
    name: track.name,
    artist: track.artists[0]?.name || 'Unknown Artist',
    duration: formatDuration(track.duration_ms),
    popularity: track.popularity,
  })),
  totalDuration: tracks.reduce((sum, track) => sum + track.duration_ms, 0),
  averagePopularity: tracks.reduce((sum, track) => sum + track.popularity, 0) / tracks.length,
});

export const calculateListeningStats = (artists: Artist[], tracks: Track[]): ListeningStats => {
  const genreDistribution = calculateGenreDistribution(artists);
  const popularityDistribution = calculatePopularityDistribution([...artists, ...tracks]);
  
  return {
    totalArtists: artists.length,
    totalTracks: tracks.length,
    topGenres: genreDistribution.slice(0, 5),
    averagePopularity: popularityDistribution.average,
    diversityScore: calculateDiversityScore(genreDistribution),
  };
};
```

## Anti-Patterns to Avoid

### Component Anti-Patterns
```typescript
// ❌ DON'T: Mix business logic with presentation
const BadArtistCard = ({ artistId }: { artistId: string }) => {
  const [artist, setArtist] = useState<Artist | null>(null);
  
  useEffect(() => {
    // Business logic mixed with component
    fetch(`/api/artists/${artistId}`)
      .then(res => res.json())
      .then(setArtist);
  }, [artistId]);

  // Component doing too much
  const handleClick = () => {
    analytics.track('artist_clicked', { artistId });
    navigate(`/artist/${artistId}`);
  };

  return <div>{/* JSX */}</div>;
};

// ✅ DO: Separate concerns
const GoodArtistCard = ({ artist, onArtistClick }: ArtistCardProps) => {
  return (
    <div onClick={() => onArtistClick(artist)}>
      {/* Pure presentation */}
    </div>
  );
};
```

### State Management Anti-Patterns
```typescript
// ❌ DON'T: Mutate state directly
const badReducer = (state: AppState, action: Action) => {
  switch (action.type) {
    case 'ADD_ARTIST':
      state.artists.push(action.artist); // Direct mutation
      return state;
  }
};

// ✅ DO: Return new state objects
const goodReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'ADD_ARTIST':
      return {
        ...state,
        artists: [...state.artists, action.artist],
      };
  }
};
```

### API Anti-Patterns
```typescript
// ❌ DON'T: Tight coupling to specific API structure
const badFetchArtists = async () => {
  const response = await fetch('/api/spotify/artists');
  return response.json(); // Direct return of API structure
};

// ✅ DO: Transform API responses to application models
const goodFetchArtists = async (): Promise<Artist[]> => {
  const response = await fetch('/api/spotify/artists');
  const data = await response.json();
  return data.items.map(transformSpotifyArtist);
};
```

### Error Handling Anti-Patterns
```typescript
// ❌ DON'T: Silent failures or generic error handling
const badApiCall = async () => {
  try {
    return await fetch('/api/data');
  } catch {
    return null; // Silent failure
  }
};

// ❌ DON'T: Catch all errors the same way
const anotherBadApiCall = async () => {
  try {
    return await fetch('/api/data');
  } catch (error) {
    alert('Something went wrong'); // Generic handling
  }
};

// ✅ DO: Specific error handling with context
const goodApiCall = async () => {
  try {
    const response = await fetch('/api/data');
    if (!response.ok) {
      throw new SpotifyApiError(`API call failed: ${response.statusText}`, response.status);
    }
    return await response.json();
  } catch (error) {
    if (error instanceof SpotifyApiError) {
      logger.error('Spotify API error', { status: error.status, message: error.message });
      throw error;
    }
    logger.error('Unexpected error in API call', { error });
    throw new Error('Failed to fetch data');
  }
};
```

## Development Workflow

### Git Workflow
```bash
# Feature development workflow
git checkout main
git pull origin main
git checkout -b feature/artist-recommendations

# Make changes, commit regularly
git add .
git commit -m "feat: add artist recommendation engine"

# Before pushing, ensure all checks pass
npm run lint        # ESLint checks
npm run test        # Unit tests
npm run build       # Production build
npm run type-check  # TypeScript compilation

# Push and create PR
git push origin feature/artist-recommendations
```

### Pre-commit Checks
```json
// package.json scripts
{
  "scripts": {
    "pre-commit": "npm run lint && npm run test && npm run type-check",
    "lint": "eslint src --ext .ts,.tsx --max-warnings 0",
    "lint:fix": "eslint src --ext .ts,.tsx --fix",
    "test": "vitest run --coverage",
    "test:watch": "vitest",
    "type-check": "tsc --noEmit",
    "build": "npm run type-check && vite build"
  }
}
```

### Code Review Checklist
- [ ] All tests pass
- [ ] Code follows established patterns
- [ ] Security review completed by Security Agent
- [ ] Accessibility requirements met
- [ ] Performance impact assessed
- [ ] Error handling implemented
- [ ] Logging added for important operations
- [ ] TypeScript types are specific and accurate
- [ ] No console.log statements in production code

## Feature Roadmap Management

### Current Feature Set
1. **Authentication** ✅
   - Spotify OAuth2 PKCE flow
   - Token management and refresh
   - Secure logout

2. **Artist Analytics** ✅
   - Top artists across time ranges
   - Artist detail views
   - Genre distribution

3. **Basic UI** ✅
   - Spotify-themed design
   - Responsive layout
   - Accessibility compliance

### Planned Features

#### Phase 1: Enhanced Analytics
```typescript
// Upcoming features with type definitions
type AlbumAnalytics = {
  topAlbums: Album[];
  albumGenreDistribution: GenreDistribution;
  releaseYearTrends: YearTrend[];
  averageAlbumLength: number;
};

type ListeningHistory = {
  recentTracks: Track[];
  playbackHistory: PlaybackSession[];
  listeningPatterns: TimePattern[];
  deviceUsage: DeviceStats[];
};

type Recommendations = {
  artistRecommendations: Artist[];
  trackRecommendations: Track[];
  playlistSuggestions: PlaylistSuggestion[];
  confidenceScore: number;
};
```

#### Phase 2: Social Features
```typescript
type SocialFeatures = {
  friendComparisons: FriendComparison[];
  sharedPlaylists: SharedPlaylist[];
  musicCompatibility: CompatibilityScore;
  socialRecommendations: SocialRecommendation[];
};
```

#### Phase 3: Advanced Visualizations
```typescript
type VisualizationFeatures = {
  genreEvolution: TimeSeriesChart;
  artistNetwork: NetworkGraph;
  moodAnalysis: MoodDistribution;
  listeningHeatmap: HeatmapData;
};
```

### Implementation Guidelines for New Features

#### 1. Feature Planning
```typescript
// Define types first
type NewFeature = {
  // Define all necessary types
};

// Plan API requirements
type ApiRequirements = {
  endpoints: string[];
  rateLimit: number;
  dataTransformation: TransformFunction[];
};

// Design component structure
type ComponentStructure = {
  pages: string[];
  components: string[];
  hooks: string[];
  services: string[];
};
```

#### 2. Security Review Process
```markdown
Before implementing any new feature:
1. Security Agent reviews API integrations
2. Security Agent validates data handling
3. Security Agent checks for vulnerabilities
4. Developer approval required for all security recommendations
```

#### 3. Testing Requirements
```typescript
// Test structure for new features
describe('NewFeature', () => {
  describe('Component Tests', () => {
    // Component rendering and interaction tests
  });

  describe('Service Tests', () => {
    // API integration and business logic tests
  });

  describe('Integration Tests', () => {
    // End-to-end feature tests
  });

  describe('Accessibility Tests', () => {
    // A11y compliance tests
  });
});
```

## Sub-Agent Coordination

### Task Assignment Matrix
| Task Type | Primary Agent | Supporting Agents | Approval Required |
|-----------|---------------|-------------------|-------------------|
| New Component | Frontend Agent | Architecture Agent | Developer |
| API Integration | API Agent | Security Agent | Security + Developer |
| Security Fix | Security Agent | Architecture Agent | Developer (mandatory) |
| Performance Optimization | Frontend Agent | Architecture Agent | Developer |
| Test Implementation | Testing Agent | All relevant agents | Developer |
| Refactoring | Architecture Agent | All relevant agents | Developer |

### Communication Protocols
```typescript
// Inter-agent communication types
type AgentMessage = {
  from: AgentType;
  to: AgentType[];
  type: 'review_request' | 'approval_needed' | 'feedback' | 'completion';
  payload: {
    taskId: string;
    description: string;
    files?: string[];
    urgency: 'low' | 'medium' | 'high';
  };
};

type AgentResponse = {
  agentId: AgentType;
  taskId: string;
  status: 'approved' | 'rejected' | 'needs_changes';
  feedback?: string;
  suggestions?: string[];
};
```

## Final Notes

This comprehensive guide ensures consistent, secure, and maintainable development of the Spotify Analytics application. All sub-agents must adhere to these guidelines and coordinate effectively to deliver high-quality features.

### Key Principles Recap
1. **Security First**: All code must pass security review
2. **Performance Matters**: Optimize for Google Lighthouse scores
3. **Accessibility Required**: WCAG 2.1 AA compliance mandatory
4. **Type Safety**: Leverage TypeScript features fully
5. **Test Coverage**: Maintain >90% test coverage
6. **Code Quality**: Follow established patterns and conventions
7. **User Experience**: Modern, clean, Spotify-themed interface

### Success Metrics
- Google Lighthouse score: >90 for all categories
- Test coverage: >90%
- Zero security vulnerabilities
- Sub-100ms page load times
- Full keyboard navigation support
- Cross-browser compatibility (modern browsers)

Remember: Every feature addition should enhance the user experience while maintaining the established quality standards.