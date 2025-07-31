// AuthConfig and AuthTokens types are defined but not used in this file currently
import { logger } from './logger';

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI || 'https://localhost:5173/callback';
const SCOPES = 'user-top-read user-read-private user-read-email user-library-read playlist-read-private playlist-read-collaborative';

// Validate required environment variables
if (!CLIENT_ID) {
  throw new Error('VITE_SPOTIFY_CLIENT_ID environment variable is required');
}

// Validate redirect URI format
if (REDIRECT_URI && !REDIRECT_URI.match(/^https?:\/\/.+/)) {
  throw new Error('VITE_SPOTIFY_REDIRECT_URI must be a valid URL');
}

// PKCE helper functions
const generateRandomString = (length: number): string => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], '');
};

const sha256 = async (plain: string): Promise<ArrayBuffer> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return await crypto.subtle.digest('SHA-256', data);
};

const base64encode = (input: ArrayBuffer): string => {
  return btoa(String.fromCharCode(...new Uint8Array(input)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
};

export const initiateAuth = async (): Promise<void> => {
  try {
    const codeVerifier = generateRandomString(64);
    const hashed = await sha256(codeVerifier);
    const codeChallenge = base64encode(hashed);

    // Store code verifier for later use
    localStorage.setItem('code_verifier', codeVerifier);

    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      response_type: 'code',
      redirect_uri: REDIRECT_URI,
      scope: SCOPES,
      code_challenge_method: 'S256',
      code_challenge: codeChallenge,
      show_dialog: 'true'
    });

    logger.info('Initiating Spotify OAuth flow');
    window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
  } catch (error) {
    logger.error('Failed to initiate auth', { error });
    throw error;
  }
};

export const exchangeCodeForToken = async (code: string): Promise<string> => {
  try {
    // Validate input
    if (!code || typeof code !== 'string' || code.length < 10) {
      throw new Error('Invalid authorization code');
    }
    
    const codeVerifier = localStorage.getItem('code_verifier');
    
    if (!codeVerifier) {
      throw new Error('Code verifier not found');
    }

    logger.info('Exchanging authorization code for access token');
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
        code_verifier: codeVerifier,
      }),
    });

    if (!response.ok) {
      logger.error('Token exchange failed', { status: response.status });
      throw new Error('Failed to exchange code for token');
    }

    const data = await response.json();
    
    // Clean up stored code verifier
    localStorage.removeItem('code_verifier');
    
    // Store token expiration time if provided
    if (data.expires_in) {
      const expirationTime = Date.now() + (data.expires_in * 1000);
      localStorage.setItem('spotify_token_expires', expirationTime.toString());
    }
    
    // Store refresh token if provided
    if (data.refresh_token) {
      localStorage.setItem('spotify_refresh_token', data.refresh_token);
    }
    
    logger.info('Successfully obtained access token');
    return data.access_token;
  } catch (error) {
    logger.error('Code exchange failed', { error });
    throw error;
  }
};

export const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = localStorage.getItem('spotify_refresh_token');
  
  if (!refreshToken) {
    logger.warn('No refresh token available');
    return null;
  }

  try {
    logger.info('Refreshing access token');
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      logger.error('Token refresh failed', { status: response.status });
      clearToken();
      return null;
    }

    const data = await response.json();
    
    // Store new access token
    localStorage.setItem('spotify_access_token', data.access_token);
    
    // Update expiration time
    if (data.expires_in) {
      const expirationTime = Date.now() + (data.expires_in * 1000);
      localStorage.setItem('spotify_token_expires', expirationTime.toString());
    }
    
    // Update refresh token if a new one is provided
    if (data.refresh_token) {
      localStorage.setItem('spotify_refresh_token', data.refresh_token);
    }
    
    logger.info('Successfully refreshed access token');
    return data.access_token;
  } catch (error) {
    logger.error('Token refresh error', { error });
    clearToken();
    return null;
  }
};

export const getStoredToken = async (): Promise<string | null> => {
  const token = localStorage.getItem('spotify_access_token');
  const expirationTime = localStorage.getItem('spotify_token_expires');
  
  // If no token exists, return null
  if (!token) {
    return null;
  }
  
  // Check if token is expired
  if (expirationTime) {
    const now = Date.now();
    if (now >= parseInt(expirationTime)) {
      logger.info('Token expired, attempting refresh');
      const refreshedToken = await refreshAccessToken();
      return refreshedToken;
    }
  }
  
  return token;
};

// Synchronous version for cases where async is not suitable
export const getStoredTokenSync = (): string | null => {
  const token = localStorage.getItem('spotify_access_token');
  const expirationTime = localStorage.getItem('spotify_token_expires');
  
  // Check if token is expired
  if (token && expirationTime) {
    const now = Date.now();
    if (now >= parseInt(expirationTime)) {
      // Token expired but can't refresh synchronously
      return null;
    }
  }
  
  return token;
};

export const storeToken = (token: string): void => {
  localStorage.setItem('spotify_access_token', token);
};

export const clearToken = (): void => {
  logger.info('Clearing stored tokens');
  localStorage.removeItem('spotify_access_token');
  localStorage.removeItem('spotify_token_expires');
  localStorage.removeItem('spotify_refresh_token');
  localStorage.removeItem('code_verifier');
};