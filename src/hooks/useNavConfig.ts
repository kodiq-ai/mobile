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
const COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

export function useNavConfig(): MobileNavConfig {
  const [config, setConfig] = useState<MobileNavConfig>(FALLBACK_NAV_CONFIG);
  const fetchingRef = useRef(false);
  const lastFetchRef = useRef(0);
  const configJsonRef = useRef('');

  const loadConfig = useCallback(async (force?: boolean) => {
    if (fetchingRef.current) return;

    // Cooldown: skip if fetched recently (unless forced on mount)
    if (!force && Date.now() - lastFetchRef.current < COOLDOWN_MS) return;

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
          lastFetchRef.current = Date.now();

          // Only update state if config actually changed
          const json = JSON.stringify(raw);
          if (json !== configJsonRef.current) {
            configJsonRef.current = json;
            setConfig(raw);
          }
          await AsyncStorage.setItem(STORAGE_KEY, json);
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
            if (cached !== configJsonRef.current) {
              configJsonRef.current = cached;
              setConfig(parsed);
            }
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

  // Load on mount (forced — bypass cooldown)
  useEffect(() => {
    loadConfig(true);
  }, [loadConfig]);

  // Re-fetch when app comes to foreground (with cooldown)
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
