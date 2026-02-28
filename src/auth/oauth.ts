import { Platform } from 'react-native';

import { GoogleSignin } from '@react-native-google-signin/google-signin';

import { GOOGLE_WEB_CLIENT_ID } from '../config';
import { supabase } from './supabase';

// ─── Google Sign-In ────────────────────────────

let googleConfigured = false;

function ensureGoogleConfigured() {
  if (googleConfigured) return;
  GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    offlineAccess: false,
  });
  googleConfigured = true;
}

export async function signInWithGoogle(): Promise<{ error?: string }> {
  try {
    ensureGoogleConfigured();

    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const response = await GoogleSignin.signIn();

    if (response.type === 'cancelled') {
      return {}; // User cancelled — not an error
    }

    const idToken = response.data.idToken;
    if (!idToken) {
      return { error: 'Не удалось получить токен Google' };
    }

    const { error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
    });

    if (error) return { error: error.message };
    return {};
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Ошибка входа через Google';
    return { error: message };
  }
}

// ─── Apple Sign-In (iOS only) ──────────────────

export async function signInWithApple(): Promise<{ error?: string }> {
  if (Platform.OS !== 'ios') {
    return { error: 'Apple Sign-In доступен только на iOS' };
  }

  try {
    // Dynamic import — only available on iOS
    const { appleAuth } =
      await import('@invertase/react-native-apple-authentication');

    // Generate nonce for Supabase verification
    const rawNonce = generateNonce();
    const hashedNonce = await sha256(rawNonce);

    const appleResponse = await appleAuth.performRequest({
      requestedOperation: appleAuth.Operation.LOGIN,
      requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      nonce: hashedNonce,
    });

    if (!appleResponse.identityToken) {
      return { error: 'Не удалось получить токен Apple' };
    }

    const { error } = await supabase.auth.signInWithIdToken({
      provider: 'apple',
      token: appleResponse.identityToken,
      nonce: rawNonce,
    });

    if (error) return { error: error.message };
    return {};
  } catch (err: unknown) {
    // User cancelled Apple dialog
    if (
      err instanceof Error &&
      (err.message.includes('1001') || err.message.includes('canceled'))
    ) {
      return {};
    }
    const message =
      err instanceof Error ? err.message : 'Ошибка входа через Apple';
    return { error: message };
  }
}

// ─── Helpers ───────────────────────────────────

// Hermes exposes Web Crypto API at runtime but RN types don't declare it
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const crypto = (globalThis as any).crypto as {
  getRandomValues: (array: Uint8Array) => Uint8Array;
  subtle: { digest: (algo: string, data: Uint8Array) => Promise<ArrayBuffer> };
};

function generateNonce(length = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  for (let i = 0; i < length; i++) {
    result += chars[array[i]! % chars.length];
  }
  return result;
}

async function sha256(input: string): Promise<string> {
  // Hermes 0.76+ supports SubtleCrypto
  const data = new Uint8Array(
    Array.from(input).map((c) => c.charCodeAt(0)),
  );
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
