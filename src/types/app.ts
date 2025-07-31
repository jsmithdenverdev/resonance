// Application-specific types

import type { TimeRange } from './spotify';

export type AuthState = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: unknown | null;
  error: Error | null;
};

export type DashboardProps = {
  onLogout: () => void;
};

export type LoginProps = {
  onLogin: () => void;
};

export type CallbackProps = {
  onSuccess: () => void;
};

export type GenreDistribution = {
  genre: string;
  count: number;
  percentage: number;
}[];

export type ListeningInsights = {
  topGenres: GenreDistribution;
  averagePopularity: number;
  totalUniqueArtists: number;
  diversityScore: number;
  timeRange: TimeRange;
};