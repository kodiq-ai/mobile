import { useCallback, useRef, useState } from 'react';

import type { TabItem } from '../types/nav';

interface TabState {
  rootPath: string;
  currentPath: string;
  currentTitle: string;
  history: string[];
}

interface UseTabNavigationResult {
  activeTabId: string;
  /** Switch to a tab. Returns the path to navigate WebView to, or null if already on this tab's current page. */
  switchTab: (tabId: string) => string | null;
  /** Called on page_meta from web bridge — tracks navigation within the active tab. */
  onPageChange: (path: string, title: string) => void;
  /** Go back within the current tab's history. Returns path to navigate to, or null if at root. */
  goBack: () => string | null;
  /** Current active tab's state. */
  getActiveState: () => TabState;
  /** Whether current tab has history entries (can go back within tab). */
  canGoBack: boolean;
  /** Title from the active tab's state. */
  title: string;
}

/**
 * Per-tab navigation state manager.
 *
 * Each tab maintains its own history stack so switching away and back
 * restores the exact page the user was on. Back button navigates within
 * the current tab's stack, not the shared WebView back-list.
 */
export function useTabNavigation(tabs: TabItem[]): UseTabNavigationResult {
  // Build initial tab states from config
  const buildInitialStates = useCallback((): Record<string, TabState> => {
    const states: Record<string, TabState> = {};
    for (const tab of tabs) {
      // Skip special tabs (like __ai_mentor__)
      if (tab.path.startsWith('__')) continue;
      states[tab.id] = {
        rootPath: tab.path,
        currentPath: tab.path,
        currentTitle: tab.labelFallback,
        history: [],
      };
    }
    return states;
  }, [tabs]);

  const tabStatesRef = useRef<Record<string, TabState>>(buildInitialStates());
  const [activeTabId, setActiveTabId] = useState(() => {
    const first = tabs.find((t) => !t.path.startsWith('__'));
    return first?.id ?? tabs[0]?.id ?? '';
  });
  const [canGoBack, setCanGoBack] = useState(false);
  const [title, setTitle] = useState(() => {
    const first = tabs.find((t) => !t.path.startsWith('__'));
    return first?.labelFallback ?? '';
  });

  // Ensure new tabs from server config get initialized
  const syncStates = useCallback(() => {
    const states = tabStatesRef.current;
    for (const tab of tabs) {
      if (tab.path.startsWith('__')) continue;
      if (!states[tab.id]) {
        states[tab.id] = {
          rootPath: tab.path,
          currentPath: tab.path,
          currentTitle: tab.labelFallback,
          history: [],
        };
      }
    }
  }, [tabs]);

  const switchTab = useCallback(
    (tabId: string): string | null => {
      syncStates();
      const states = tabStatesRef.current;
      const targetState = states[tabId];
      if (!targetState) return null;

      setActiveTabId(tabId);
      setCanGoBack(targetState.history.length > 0);
      setTitle(targetState.currentTitle);

      // Return the path to navigate to (the tab's last visited page)
      return targetState.currentPath;
    },
    [syncStates],
  );

  const onPageChange = useCallback(
    (path: string, pageTitle: string) => {
      syncStates();
      const states = tabStatesRef.current;
      const state = states[activeTabId];
      if (!state) return;

      // Only push to history if path actually changed
      if (path !== state.currentPath) {
        state.history.push(state.currentPath);
        state.currentPath = path;
      }

      state.currentTitle = pageTitle;
      setCanGoBack(state.history.length > 0);
      setTitle(pageTitle);
    },
    [activeTabId, syncStates],
  );

  const goBack = useCallback((): string | null => {
    const states = tabStatesRef.current;
    const state = states[activeTabId];
    if (!state || state.history.length === 0) return null;

    const prevPath = state.history.pop()!;
    state.currentPath = prevPath;
    setCanGoBack(state.history.length > 0);

    return prevPath;
  }, [activeTabId]);

  const getActiveState = useCallback((): TabState => {
    syncStates();
    const states = tabStatesRef.current;
    return (
      states[activeTabId] ?? {
        rootPath: '/',
        currentPath: '/',
        currentTitle: '',
        history: [],
      }
    );
  }, [activeTabId, syncStates]);

  return {
    activeTabId,
    switchTab,
    onPageChange,
    goBack,
    getActiveState,
    canGoBack,
    title,
  };
}
