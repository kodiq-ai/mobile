import {
  getMessaging,
  requestPermission,
  getToken,
  onTokenRefresh as onFirebaseTokenRefresh,
  AuthorizationStatus,
} from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

import { BASE_URL } from '../config';
import { buildAuthHeaders } from '../utils/auth-headers';
import { fetchWithRetry } from '../utils/fetch-retry';
import { logger } from '../utils/logger';

const log = logger.child({ module: 'push' });

const msg = getMessaging();
const STORAGE_KEY = 'fcm_token';
const API_URL = `${BASE_URL}/api/academy/push-token`;

/**
 * Request push permission, get FCM token, register with backend.
 * Uses Bearer token auth (JWT from Supabase session).
 */
export async function registerPushToken(accessToken?: string): Promise<void> {
  try {
    const authStatus = await requestPermission(msg);
    const enabled =
      authStatus === AuthorizationStatus.AUTHORIZED ||
      authStatus === AuthorizationStatus.PROVISIONAL;

    if (!enabled) return;

    const token = await getToken(msg);
    if (!token) return;

    // Skip if already registered with same token
    const cachedToken = await AsyncStorage.getItem(STORAGE_KEY);
    if (cachedToken === token) return;

    const response = await fetchWithRetry(
      API_URL,
      {
        method: 'POST',
        headers: buildAuthHeaders(accessToken),
        body: JSON.stringify({
          token,
          platform: Platform.OS,
        }),
      },
      { retries: 3, timeout: 10000 },
    );

    if (response.ok) {
      log.info('Push token registered');
      await AsyncStorage.setItem(STORAGE_KEY, token);
    } else {
      log.warn({ status: response.status }, 'Push token registration failed');
    }
  } catch (err) {
    log.error({ err }, 'Push registration error');
  }
}

/**
 * Unregister push token (call on logout).
 */
export async function unregisterPushToken(accessToken?: string): Promise<void> {
  try {
    const token = await AsyncStorage.getItem(STORAGE_KEY);
    if (!token) return;

    await fetchWithRetry(
      API_URL,
      {
        method: 'DELETE',
        headers: buildAuthHeaders(accessToken),
        body: JSON.stringify({ token }),
      },
      { retries: 1, timeout: 5000 },
    );

    log.info('Push token unregistered');
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    log.error({ err }, 'Push token unregister error');
  }
}

/**
 * Listen for token refreshes (FCM rotates tokens periodically).
 * Accepts a getter function for access token to avoid stale closure.
 * Returns unsubscribe function.
 */
export function onTokenRefresh(
  getAccessToken: (() => string | null) | string | undefined,
): () => void {
  return onFirebaseTokenRefresh(msg, async newToken => {
    const oldToken = await AsyncStorage.getItem(STORAGE_KEY);

    const accessToken =
      typeof getAccessToken === 'function' ? getAccessToken() : getAccessToken;

    const headers = buildAuthHeaders(accessToken ?? undefined);

    if (oldToken && oldToken !== newToken) {
      await fetchWithRetry(
        API_URL,
        {
          method: 'DELETE',
          headers,
          body: JSON.stringify({ token: oldToken }),
        },
        { retries: 1, timeout: 5000 },
      );
    }

    await fetchWithRetry(
      API_URL,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          token: newToken,
          platform: Platform.OS,
        }),
      },
      { retries: 3, timeout: 10000 },
    );

    await AsyncStorage.setItem(STORAGE_KEY, newToken);
  });
}
