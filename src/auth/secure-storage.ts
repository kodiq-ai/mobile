/**
 * Secure storage adapter for Supabase auth.
 *
 * Uses expo-secure-store (iOS Keychain / Android EncryptedSharedPreferences)
 * instead of AsyncStorage to protect access_token and refresh_token at rest.
 *
 * Falls back to AsyncStorage for non-auth keys or if SecureStore is unavailable.
 *
 * On first run after upgrade, migrates existing tokens from AsyncStorage → SecureStore.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

import { logger } from '../utils/logger';

const log = logger.child({ module: 'secure-storage' });

const KEY_PREFIX = 'ai.kodiq.auth';

/**
 * Supabase-compatible storage adapter.
 * Supabase calls getItem/setItem/removeItem with the auth storage key.
 */
export const secureStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      const value = await SecureStore.getItemAsync(prefixKey(key));
      if (value) return value;
    } catch (err) {
      log.debug(
        { err, key },
        'SecureStore read failed, falling back to AsyncStorage',
      );
    }

    // Fallback: check AsyncStorage (handles migration case)
    return AsyncStorage.getItem(key);
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(prefixKey(key), value);
      // Remove from AsyncStorage if it was there (migration cleanup)
      await AsyncStorage.removeItem(key).catch(() => {});
    } catch (err) {
      log.warn(
        { err, key },
        'SecureStore write failed, falling back to AsyncStorage',
      );
      await AsyncStorage.setItem(key, value);
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(prefixKey(key));
    } catch (err) {
      log.debug({ err, key }, 'SecureStore delete failed');
    }
    // Always clean AsyncStorage too (migration remnants)
    await AsyncStorage.removeItem(key).catch(() => {});
  },
};

/** Prefix key to avoid collisions in SecureStore's flat namespace */
function prefixKey(key: string): string {
  return `${KEY_PREFIX}.${key}`;
}
