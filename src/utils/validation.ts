// Input validation utilities following CLAUDE.md security patterns

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

export const validateTimeRange = (timeRange: string): timeRange is 'short_term' | 'medium_term' | 'long_term' => {
  return ['short_term', 'medium_term', 'long_term'].includes(timeRange);
};

export const validateLimit = (limit: number): boolean => {
  return Number.isInteger(limit) && limit >= 1 && limit <= 50;
};

export const sanitizeUrl = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    // Only allow https URLs for Spotify
    if (urlObj.protocol !== 'https:') {
      return null;
    }
    // Only allow Spotify domains
    if (!urlObj.hostname.endsWith('spotify.com') && !urlObj.hostname.endsWith('scdn.co')) {
      return null;
    }
    return urlObj.toString();
  } catch {
    return null;
  }
};

export const validateEnvironmentVariable = (value: string | undefined, name: string): string => {
  if (!value) {
    throw new Error(`${name} environment variable is required`);
  }
  return value;
};