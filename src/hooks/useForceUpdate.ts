import { useCallback, useEffect, useState } from 'react';
import { AppState, Platform } from 'react-native';

import { ACADEMY_URL } from '../config';

const VERSION_URL = `${ACADEMY_URL.replace('/academy', '')}/api/academy/mobile-version`;
const APP_VERSION = '1.0.0'; // Keep in sync with package.json

export type UpdateStatus = 'ok' | 'soft' | 'force';

interface VersionResponse {
  minVersion: string;
  latestVersion: string;
  updateUrl: { ios: string; android: string };
}

/** Compare semver strings. Returns -1, 0, or 1. */
function compareSemver(a: string, b: string): number {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (diff !== 0) return diff > 0 ? 1 : -1;
  }
  return 0;
}

/**
 * Checks if the app needs updating.
 * - force: current < minVersion (blocking screen)
 * - soft: current < latestVersion (dismissable banner)
 * - ok: up to date
 *
 * Re-checks on app foreground.
 */
export function useForceUpdate() {
  const [status, setStatus] = useState<UpdateStatus>('ok');
  const [storeUrl, setStoreUrl] = useState<string | null>(null);

  const check = useCallback(async () => {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(VERSION_URL, { signal: controller.signal });
      clearTimeout(timer);

      if (!res.ok) return;
      const data: VersionResponse = await res.json();

      const url = Platform.OS === 'ios' ? data.updateUrl.ios : data.updateUrl.android;
      setStoreUrl(url);

      if (compareSemver(APP_VERSION, data.minVersion) < 0) {
        setStatus('force');
      } else if (compareSemver(APP_VERSION, data.latestVersion) < 0) {
        setStatus('soft');
      } else {
        setStatus('ok');
      }
    } catch {
      // Network error — skip check, don't block the user
    }
  }, []);

  useEffect(() => {
    check();
  }, [check]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') check();
    });
    return () => sub.remove();
  }, [check]);

  const dismiss = useCallback(() => {
    if (status === 'soft') setStatus('ok');
  }, [status]);

  return { status, storeUrl, dismiss };
}
