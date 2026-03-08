// Integration: In WebViewScreen.tsx, add a second hidden WebView:
// <WebView
//   source={{ uri: preloadUrl }}
//   style={{ height: 0, width: 0, position: 'absolute', opacity: 0 }}
//   injectedJavaScriptBeforeContentLoaded={injectedJS}
//   onLoadEnd={onPreloadReady}
// />
// On tab switch: if canSwap(targetPath), swap WebView refs instead of navigating.

import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { BASE_URL } from '../config';
import type { TabItem } from '../types/nav';

interface PreloadState {
  preloadUrl: string | null;
  isPreloaded: boolean;
}

/**
 * Determines the next likely tab path to preload based on current location.
 *
 * Heuristic:
 *  - home (/) or catalog (/catalog) -> preload dashboard (/dashboard)
 *  - dashboard (/dashboard)         -> preload home (/)
 *  - anything else                  -> preload home (/)
 */
function getNextLikelyPath(activePath: string, tabs: TabItem[]): string | null {
  const dashboardTab = tabs.find(t => t.path === '/dashboard');
  const homeTab = tabs.find(t => t.path === '/' || t.path === '/catalog');

  const isHome =
    activePath === '/' ||
    activePath === '/catalog' ||
    activePath.startsWith('/catalog/');
  const isDashboard =
    activePath === '/dashboard' || activePath.startsWith('/dashboard/');

  if (isHome) {
    return dashboardTab?.path ?? null;
  }

  // Dashboard or any other tab -> preload home
  if (isDashboard || homeTab) {
    return homeTab?.path ?? '/';
  }

  return null;
}

/** Converts a relative path to a full URL */
function toFullUrl(path: string): string {
  if (path.startsWith('http')) return path;
  return `${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}

/**
 * Manages a secondary WebView for preloading the next likely tab.
 *
 * Preloads a single tab URL in a hidden WebView so tab switching feels instant.
 * Listens for memory warnings and destroys the preloaded WebView to free RAM.
 */
export function useWebViewPreload(activePath: string, tabs: TabItem[]) {
  const [state, setState] = useState<PreloadState>({
    preloadUrl: null,
    isPreloaded: false,
  });
  const memoryPressureRef = useRef(false);
  const prevActivePathRef = useRef(activePath);

  // Recompute preload target when active path changes
  useEffect(() => {
    if (activePath === prevActivePathRef.current && state.preloadUrl !== null) {
      return;
    }
    prevActivePathRef.current = activePath;

    if (memoryPressureRef.current) {
      setState({ preloadUrl: null, isPreloaded: false });
      return;
    }

    // Filter out special tabs (e.g. __ai_mentor__)
    const webTabs = tabs.filter(t => !t.path.startsWith('__'));
    const nextPath = getNextLikelyPath(activePath, webTabs);

    if (!nextPath || nextPath === activePath) {
      setState({ preloadUrl: null, isPreloaded: false });
      return;
    }

    setState({ preloadUrl: toFullUrl(nextPath), isPreloaded: false });
  }, [activePath, tabs, state.preloadUrl]);

  // Listen for memory warnings — destroy secondary WebView
  useEffect(() => {
    const sub = AppState.addEventListener('memoryWarning', () => {
      memoryPressureRef.current = true;
      setState({ preloadUrl: null, isPreloaded: false });
    });

    // Reset memory pressure flag when app returns to foreground
    const fgSub = AppState.addEventListener('change', nextState => {
      if (nextState === 'active') {
        memoryPressureRef.current = false;
      }
    });

    return () => {
      sub.remove();
      fgSub.remove();
    };
  }, []);

  const onPreloadReady = useCallback(() => {
    setState(prev => (prev.preloadUrl ? { ...prev, isPreloaded: true } : prev));
  }, []);

  const canSwap = useCallback(
    (targetPath: string): boolean => {
      if (!state.isPreloaded || !state.preloadUrl) return false;
      const targetUrl = toFullUrl(targetPath);
      return state.preloadUrl === targetUrl;
    },
    [state.isPreloaded, state.preloadUrl],
  );

  const markSwapped = useCallback(() => {
    // After swap: the old active path becomes the new preload candidate.
    // Reset preload state so the effect recomputes on next render.
    setState({ preloadUrl: null, isPreloaded: false });
  }, []);

  return {
    preloadUrl: state.preloadUrl,
    shouldPreload: state.preloadUrl !== null && !memoryPressureRef.current,
    onPreloadReady,
    canSwap,
    markSwapped,
  };
}
