import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

import { ACADEMY_URL } from '../config';

const STORAGE_KEY = 'fcm_token';
const API_URL = `${ACADEMY_URL.replace('/academy', '')}/api/academy/push-token`;

/**
 * Request push permission, get FCM token, register with backend.
 * Call after user is authenticated in the WebView.
 */
export async function registerPushToken(sessionCookie?: string): Promise<void> {
  try {
    // 1. Request permission (iOS shows prompt, Android auto-grants)
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (!enabled) {
      return;
    }

    // 2. Get FCM token
    const token = await messaging().getToken();
    if (!token) {
      return;
    }

    // 3. Check if already registered (avoid redundant API calls)
    const cachedToken = await AsyncStorage.getItem(STORAGE_KEY);
    if (cachedToken === token) {
      return;
    }

    // 4. Register with backend
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (sessionCookie) {
      headers['Cookie'] = sessionCookie;
    }

    const response = await fetch(API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        token,
        platform: Platform.OS, // 'ios' | 'android'
      }),
      credentials: 'include',
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
export async function unregisterPushToken(): Promise<void> {
  try {
    const token = await AsyncStorage.getItem(STORAGE_KEY);
    if (!token) {
      return;
    }

    await fetch(API_URL, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
      credentials: 'include',
    });

    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {
    // Best-effort cleanup
  }
}

/**
 * Listen for token refreshes (FCM rotates tokens periodically).
 * Returns unsubscribe function.
 */
export function onTokenRefresh(): () => void {
  return messaging().onTokenRefresh(async (newToken) => {
    const oldToken = await AsyncStorage.getItem(STORAGE_KEY);
    if (oldToken && oldToken !== newToken) {
      // Unregister old, register new
      await fetch(API_URL, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: oldToken }),
        credentials: 'include',
      });
    }

    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: newToken,
        platform: Platform.OS,
      }),
      credentials: 'include',
    });

    await AsyncStorage.setItem(STORAGE_KEY, newToken);
  });
}
