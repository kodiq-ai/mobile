import pino from 'pino';

/**
 * Structured logger for Kodiq Mobile.
 *
 * Uses Pino with a custom write function that routes to console
 * in dev and stays silent in production (Sentry/Crashlytics handle prod errors).
 *
 * Usage:
 *   import { logger } from '../utils/logger';
 *   logger.info({ tab: 'feed', path: '/feed' }, 'Tab switched');
 *   logger.error({ err }, 'Session injection failed');
 *
 * Child loggers for subsystems:
 *   const log = logger.child({ module: 'bridge' });
 *   log.info('page_meta received');
 */
export const logger = pino({
  level: __DEV__ ? 'debug' : 'error',
  browser: {
    asObject: false,
  },
});
