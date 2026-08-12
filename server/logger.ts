import pino from 'pino';

const isProduction = process.env.NODE_ENV === 'production';

// Cloud Run & Google Cloud Logging compatible level mapping
const levelToSeverityMap: Record<string, string> = {
  trace: 'DEBUG',
  debug: 'DEBUG',
  info: 'INFO',
  warn: 'WARNING',
  error: 'ERROR',
  fatal: 'CRITICAL',
};

export const logger = pino({
  level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
  messageKey: 'message',
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level(label) {
      return {
        severity: levelToSeverityMap[label] || 'INFO',
        level: label,
      };
    },
  },
  base: isProduction
    ? {
        service: 'kode-runner-server',
        env: 'production',
      }
    : {
        service: 'kode-runner-server-dev',
      },
});

export const logInfo = (msg: string, context: Record<string, any> = {}) => {
  logger.info(context, msg);
};

export const logWarn = (msg: string, context: Record<string, any> = {}) => {
  logger.warn(context, msg);
};

export const logError = (msg: string, error?: any, context: Record<string, any> = {}) => {
  logger.error(
    {
      ...context,
      err: error instanceof Error ? { message: error.message, stack: error.stack } : error,
    },
    msg
  );
};

export const logDebug = (msg: string, context: Record<string, any> = {}) => {
  logger.debug(context, msg);
};
