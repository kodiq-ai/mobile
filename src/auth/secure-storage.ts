/**
 * Secure storage adapter for Supabase auth.
 *
 * Uses react-native-keychain (iOS Keychain / Android Keystore) instead of
 * AsyncStorage to protect access_token and refresh_token at rest.
 *
 * Falls back to AsyncStorage for non-auth keys or if Keychain is unavailable.
 *
 * On first run after upgrade, migrates existing tokens from AsyncStorage → Keychain.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';

const SERVICE_NAME = 'ai.kodiq.auth';

/**
 * Supabase-compatible storage adapter.
 * Supabase calls getItem/setItem/removeItem with the auth storage key.
 */
export const secureStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      const credentials = await Keychain.getGenericPassword({ service: keyToService(key) });
      if (credentials) return credentials.password;
    } catch {
      // Keychain unavailable — try AsyncStorage fallback
    }

    // Fallback: check AsyncStorage (handles migration case)
    return AsyncStorage.getItem(key);
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      await Keychain.setGenericPassword(key, value, {
        service: keyToService(key),
        accessible: Keychain.ACCESSIBLE.AFTER_FIRST_UNLOCK,
      });
      // Remove from AsyncStorage if it was there (migration cleanup)
      await AsyncStorage.removeItem(key).catch(() => {});
    } catch {
      // Keychain unavailable — fall back to AsyncStorage
      await AsyncStorage.setItem(key, value);
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await Keychain.resetGenericPassword({ service: keyToService(key) });
    } catch {
      // Ignore Keychain errors
    }
    // Always clean AsyncStorage too (migration remnants)
    await AsyncStorage.removeItem(key).catch(() => {});
  },
};

/** Map storage key → Keychain service name for isolation */
function keyToService(key: string): string {
  return `${SERVICE_NAME}.${key}`;
}
