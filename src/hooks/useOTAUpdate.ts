import { useEffect } from 'react';
import * as Updates from 'expo-updates';

import { logger } from '../utils/logger';

const log = logger.child({ module: 'ota' });

/**
 * Checks for OTA updates on mount.
 * If an update is available, downloads and reloads the app silently.
 * Only runs in production (no-op in dev client / __DEV__).
 */
export function useOTAUpdate(): void {
  useEffect(() => {
    if (__DEV__) return;

    async function checkUpdate() {
      try {
        const update = await Updates.checkForUpdateAsync();
        if (!update.isAvailable) return;

        log.info('OTA update available, downloading...');
        const result = await Updates.fetchUpdateAsync();

        if (result.isNew) {
          log.info('OTA update downloaded, reloading...');
          await Updates.reloadAsync();
        }
      } catch (err) {
        // Non-critical — app continues with current bundle
        log.warn({ err }, 'OTA update check failed');
      }
    }

    void checkUpdate();
  }, []);
}
