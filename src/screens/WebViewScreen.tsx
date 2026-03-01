import type { Session } from '@supabase/supabase-js';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  BackHandler,
  Linking,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import WebView from 'react-native-webview';
import type {
  WebViewMessageEvent,
  WebViewNavigation,
} from 'react-native-webview';

import { useAuth } from '../auth/useAuth';
import { ACADEMY_URL, ALLOWED_ORIGINS, COLORS, SUPABASE_PROJECT_REF } from '../config';
import { DrawerMenu } from '../components/DrawerMenu';
import { NativeHeader } from '../components/NativeHeader';
import { NativeTabBar } from '../components/NativeTabBar';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { useNavConfig } from '../hooks/useNavConfig';
import type { WebToNativeMessage } from '../types/bridge';

const STORAGE_KEY = `sb-${SUPABASE_PROJECT_REF}-auth-token`;
const COOKIE_BASE = `sb-${SUPABASE_PROJECT_REF}-auth-token`;

/**
 * Build JS to inject session into WebView (localStorage + cookies).
 * Runs BEFORE page content loads so Supabase client picks up the session.
 */
function buildSessionInjectionJS(session: Session): string {
  const sessionJSON = JSON.stringify({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_in: session.expires_in,
    expires_at: session.expires_at,
    token_type: session.token_type,
    user: session.user,
  });

  // Chunk the encoded session for cookies (max ~3500 chars per cookie)
  const encoded = encodeURIComponent(sessionJSON);
  const CHUNK_SIZE = 3500;
  const chunks: string[] = [];
  for (let i = 0; i < encoded.length; i += CHUNK_SIZE) {
    chunks.push(encoded.slice(i, i + CHUNK_SIZE));
  }

  const cookieStatements = chunks
    .map(
      (chunk, i) =>
        `document.cookie = '${COOKIE_BASE}.${i}=${chunk}; path=/; domain=.kodiq.ai; secure; samesite=lax; max-age=604800';`,
    )
    .join('\n');

  return `
    (function() {
      try {
        window.__KODIQ_NATIVE__ = true;
        document.body.style.overscrollBehavior = 'none';

        // 1. localStorage for client-side Supabase
        localStorage.setItem('${STORAGE_KEY}', ${JSON.stringify(sessionJSON)});

        // 2. Chunked cookies for server-side Supabase (middleware)
        ${cookieStatements}

        console.log('[Native] Session injected');
      } catch(e) {
        console.error('[Native] Session injection failed', e);
      }
      true;
    })();
  `;
}

/** Minimal JS when no session — just set native flag */
const INJECTED_JS_NO_SESSION = `
  (function() {
    window.__KODIQ_NATIVE__ = true;
    document.body.style.overscrollBehavior = 'none';
    true;
  })();
`;

/** Build JS to navigate WebView via Next.js router (SPA, no reload) */
function buildNavigateJS(path: string): string {
  // Use Next.js router.push for SPA navigation (no page reload)
  return `
    (function() {
      try {
        var msg = JSON.stringify({ type: 'navigate', path: ${JSON.stringify(path)} });
        window.dispatchEvent(new MessageEvent('message', { data: msg }));
      } catch(e) {
        window.location.href = 'https://kodiq.ai/academy' + ${JSON.stringify(path)};
      }
      true;
    })();
  `;
}

interface WebViewScreenProps {
  isOffline?: boolean;
  deepLinkUrl?: string | null;
  session: Session;
}

export function WebViewScreen({ isOffline, deepLinkUrl, session }: WebViewScreenProps) {
  const webViewRef = useRef<WebView>(null);
  const canGoBackRef = useRef(false);
  const insets = useSafeAreaInsets();
  const { signOut } = useAuth();
  const navConfig = useNavConfig();

  // Navigation state from bridge
  const [activePath, setActivePath] = useState('/');
  const [pageTitle, setPageTitle] = useState('');
  const [pageCanGoBack, setPageCanGoBack] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [contentLoaded, setContentLoaded] = useState(false);

  // Re-inject session when token refreshes
  const prevTokenRef = useRef(session.access_token);
  useEffect(() => {
    if (session.access_token !== prevTokenRef.current) {
      prevTokenRef.current = session.access_token;
      const js = buildSessionInjectionJS(session);
      webViewRef.current?.injectJavaScript(js);
    }
  }, [session]);

  // Android back button
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      // Close drawer first
      if (drawerVisible) {
        setDrawerVisible(false);
        return true;
      }
      if (canGoBackRef.current && webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }
      return false;
    });

    return () => handler.remove();
  }, [drawerVisible]);

  // Deep link navigation — validate origin before navigating
  useEffect(() => {
    if (deepLinkUrl && webViewRef.current) {
      const fullUrl = deepLinkUrl.startsWith('http')
        ? deepLinkUrl
        : `https://kodiq.ai${deepLinkUrl}`;
      const isAllowed = ALLOWED_ORIGINS.some((origin) => fullUrl.startsWith(origin));
      if (!isAllowed) return;
      webViewRef.current.injectJavaScript(
        `window.location.href = ${JSON.stringify(fullUrl)}; true;`,
      );
    }
  }, [deepLinkUrl]);

  const handleNavigationStateChange = useCallback(
    (navState: WebViewNavigation) => {
      canGoBackRef.current = navState.canGoBack;

      // Extract path from URL for tab matching
      try {
        const url = new URL(navState.url);
        const path = url.pathname.replace(/^\/academy/, '') || '/';
        setActivePath(path);
      } catch {
        // Invalid URL
      }

      // Detect if WebView navigated to login page (session expired in web)
      if (navState.url.includes('/auth/login')) {
        signOut();
      }
    },
    [signOut],
  );

  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const msg: WebToNativeMessage = JSON.parse(event.nativeEvent.data);
        switch (msg.type) {
          case 'logout':
            signOut();
            break;
          case 'auth_state':
            if (!msg.authenticated) signOut();
            break;
          case 'page_meta':
            setPageTitle(msg.title);
            setActivePath(msg.path);
            setPageCanGoBack(msg.canGoBack);
            if (!contentLoaded) setContentLoaded(true);
            break;
          case 'notification_count':
            setNotificationCount(msg.count);
            break;
          case 'navigation':
            break;
        }
      } catch {
        // Ignore non-JSON messages
      }
    },
    [signOut, contentLoaded],
  );

  const handleShouldStartLoad = useCallback(
    (event: { url: string }): boolean => {
      const { url } = event;
      return ALLOWED_ORIGINS.some((origin) => url.startsWith(origin));
    },
    [],
  );

  // Tab press → navigate WebView
  const handleTabPress = useCallback((path: string) => {
    webViewRef.current?.injectJavaScript(buildNavigateJS(path));
  }, []);

  // Header actions
  const handleBurgerPress = useCallback(() => {
    setDrawerVisible(true);
  }, []);

  const handleBackPress = useCallback(() => {
    if (canGoBackRef.current && webViewRef.current) {
      webViewRef.current.goBack();
    }
  }, []);

  const handleNotificationPress = useCallback(() => {
    webViewRef.current?.injectJavaScript(buildNavigateJS('/notifications'));
  }, []);

  const handleSearchPress = useCallback(() => {
    webViewRef.current?.injectJavaScript(buildNavigateJS('/search'));
  }, []);

  // Drawer navigation
  const handleDrawerNavigate = useCallback((path: string, external?: boolean) => {
    if (external) {
      Linking.openURL(path);
    } else {
      webViewRef.current?.injectJavaScript(buildNavigateJS(path));
    }
  }, []);

  const handleLogout = useCallback(() => {
    signOut();
  }, [signOut]);

  const injectedJS = buildSessionInjectionJS(session);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Offline banner */}
      {isOffline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineBannerText}>{'\u26A1'} Офлайн-режим</Text>
        </View>
      )}

      {/* Native Header */}
      <NativeHeader
        config={navConfig}
        title={pageTitle}
        canGoBack={pageCanGoBack}
        notificationCount={notificationCount}
        onBurgerPress={handleBurgerPress}
        onBackPress={handleBackPress}
        onNotificationPress={handleNotificationPress}
        onSearchPress={handleSearchPress}
      />

      {/* WebView — content area */}
      <View style={styles.webviewContainer}>
        <WebView
          ref={webViewRef}
          source={{ uri: ACADEMY_URL }}
          style={styles.webview}
          injectedJavaScriptBeforeContentLoaded={injectedJS}
          injectedJavaScript={INJECTED_JS_NO_SESSION}
          onNavigationStateChange={handleNavigationStateChange}
          onMessage={handleMessage}
          onShouldStartLoadWithRequest={handleShouldStartLoad}
          // Auth: cookies still shared for SSR compatibility
          sharedCookiesEnabled
          // Cache
          cacheEnabled
          cacheMode={isOffline ? 'LOAD_CACHE_ELSE_NETWORK' : 'LOAD_DEFAULT'}
          // UI
          allowsBackForwardNavigationGestures
          pullToRefreshEnabled={Platform.OS === 'android'}
          startInLoadingState
          // Security
          javaScriptEnabled
          domStorageEnabled
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          // Scroll
          overScrollMode="never"
          scrollEnabled
        />

        {/* Skeleton overlay — visible until first page_meta */}
        {!contentLoaded && (
          <View style={StyleSheet.absoluteFill}>
            <SkeletonLoader />
          </View>
        )}
      </View>

      {/* Native Tab Bar */}
      <NativeTabBar
        tabs={navConfig.tabs}
        activePath={activePath}
        notificationCount={notificationCount}
        onTabPress={handleTabPress}
      />

      {/* Drawer Menu (overlay) */}
      <DrawerMenu
        visible={drawerVisible}
        sections={navConfig.drawer}
        onClose={() => setDrawerVisible(false)}
        onNavigate={handleDrawerNavigate}
        onLogout={handleLogout}
        userEmail={session.user.email}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  offlineBanner: {
    backgroundColor: '#78350f',
    paddingVertical: 6,
    alignItems: 'center',
  },
  offlineBannerText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 11,
    color: '#fbbf24',
    letterSpacing: 0.5,
  },
  webview: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  webviewContainer: {
    flex: 1,
  },
});
