// Structured logging service following CLAUDE.md patterns

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
    context: context ? sanitizeForProduction(context) as Record<string, unknown> : undefined,
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