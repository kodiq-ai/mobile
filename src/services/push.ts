import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

import { ACADEMY_URL } from '../config';

const STORAGE_KEY = 'fcm_token';
const API_URL = `${ACADEMY_URL.replace('/academy', '')}/api/academy/push-token`;

/**
 * Request push permission, get FCM token, register with backend.
 * Uses Bearer token auth (JWT from Supabase session).
 */
export async function registerPushToken(accessToken?: string): Promise<void> {
  try {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (!enabled) return;

    const token = await messaging().getToken();
    if (!token) return;

    // Skip if already registered with same token
    const cachedToken = await AsyncStorage.getItem(STORAGE_KEY);
    if (cachedToken === token) return;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await fetch(API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        token,
        platform: Platform.OS,
      }),
    });

    if (response.ok) {
      await AsyncStorage.setItem(STORAGE_KEY, token);
    }
  } catch {
    // Push registration is best-effort
  }
}

/**
 * Unregister push token (call on logout).
 */
export async function unregisterPushToken(accessToken?: string): Promise<void> {
  try {
    const token = await AsyncStorage.getItem(STORAGE_KEY);
    if (!token) return;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    await fetch(API_URL, {
      method: 'DELETE',
      headers,
      body: JSON.stringify({ token }),
    });

    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {
    // Best-effort cleanup
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
  return messaging().onTokenRefresh(async (newToken) => {
    const oldToken = await AsyncStorage.getItem(STORAGE_KEY);

    const accessToken =
      typeof getAccessToken === 'function'
        ? getAccessToken()
        : getAccessToken;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    if (oldToken && oldToken !== newToken) {
      await fetch(API_URL, {
        method: 'DELETE',
        headers,
        body: JSON.stringify({ token: oldToken }),
      });
    }

    await fetch(API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        token: newToken,
        platform: Platform.OS,
      }),
    });

    await AsyncStorage.setItem(STORAGE_KEY, newToken);
  });
}
