// Format helper utilities following CLAUDE.md patterns

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

export const getTimeRangeLabel = (range: string): string => {
  switch (range) {
    case 'short_term':
      return 'Last 4 weeks';
    case 'medium_term':
      return 'Last 6 months';
    case 'long_term':
      return 'All time';
    default:
      return range;
  }
};