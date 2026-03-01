import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { NAV_CONFIG_URL } from '../config';
import { FALLBACK_NAV_CONFIG } from '../navigation/fallback-config';
import type { MobileNavConfig } from '../types/nav';
import { fetchWithRetry } from '../utils/fetch-retry';

const STORAGE_KEY = 'kodiq:nav-config';

/** Runtime validation — server response could be malformed */
function isValidNavConfig(data: unknown): data is MobileNavConfig {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  if (!Array.isArray(d.tabs) || d.tabs.length === 0) return false;
  if (!Array.isArray(d.drawer)) return false;
  for (const tab of d.tabs) {
    if (!tab || typeof tab !== 'object') return false;
    const t = tab as Record<string, unknown>;
    if (typeof t.id !== 'string' || typeof t.path !== 'string') return false;
    if (typeof t.icon !== 'string' || typeof t.labelFallback !== 'string') return false;
    // Block dangerous URL schemes
    if (String(t.path).startsWith('javascript:')) return false;
  }
  return true;
}

/**
 * Loads navigation config with 3-tier fallback:
 * 1. Fetch from API (primary)
 * 2. AsyncStorage cache (offline)
 * 3. Hardcoded fallback (first launch, no network)
 *
 * Re-fetches when app comes to foreground.
 */
export function useNavConfig(): MobileNavConfig {
  const [config, setConfig] = useState<MobileNavConfig>(FALLBACK_NAV_CONFIG);
  const fetchingRef = useRef(false);

  const loadConfig = useCallback(async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    try {
      try {
        // Try API first (retry 2x, 5s timeout)
        const res = await fetchWithRetry(NAV_CONFIG_URL, undefined, {
          retries: 2,
          timeout: 5000,
        });

        if (res.ok) {
          const raw: unknown = await res.json();
          if (!isValidNavConfig(raw)) throw new Error('Invalid nav config');
          setConfig(raw);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(raw));
          return;
        }
      } catch {
        // API failed — try cache
      }

      try {
        const cached = await AsyncStorage.getItem(STORAGE_KEY);
        if (cached) {
          const parsed: unknown = JSON.parse(cached);
          if (isValidNavConfig(parsed)) {
            setConfig(parsed);
            return;
          }
        }
      } catch {
        // Cache read failed
      }

      // Fallback already set as initial state
    } finally {
      fetchingRef.current = false;
    }
  }, []);

  // Load on mount
  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  // Re-fetch when app comes to foreground
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        loadConfig();
      }
    });
    return () => sub.remove();
  }, [loadConfig]);

  return config;
}
