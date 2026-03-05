import type { Session } from '@supabase/supabase-js';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  BackHandler,
  Linking,
  Platform,
  Pressable,
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
import { ACADEMY_URL, ALLOWED_ORIGINS, COLORS } from '../config';
import { DrawerMenu } from '../components/DrawerMenu';
import { NativeHeader } from '../components/NativeHeader';
import { NativeTabBar } from '../components/NativeTabBar';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { useNavConfig } from '../hooks/useNavConfig';
import type { WebToNativeMessage } from '../types/bridge';
import {
  buildNavigateJS,
  buildSessionInjectionJS,
  INJECTED_JS_NO_SESSION,
} from '../services/webview-injection';
import { processWebViewMessage } from '../services/webview-bridge';

interface UpdateBanner {
  storeUrl: string | null;
  onDismiss: () => void;
}

interface WebViewScreenProps {
  isOffline?: boolean;
  deepLinkUrl?: string | null;
  session: Session;
  updateBanner?: UpdateBanner;
}

export function WebViewScreen({
  isOffline,
  deepLinkUrl,
  session,
  updateBanner,
}: WebViewScreenProps) {
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
      const isAllowed = ALLOWED_ORIGINS.some(origin =>
        fullUrl.startsWith(origin),
      );
      if (!isAllowed) return;
      webViewRef.current.injectJavaScript(
        `window.location.href = ${JSON.stringify(fullUrl)}; true;`,
      );
    }
  }, [deepLinkUrl]);

  const handleNavigationStateChange = useCallback(
    (navState: WebViewNavigation) => {
      canGoBackRef.current = navState.canGoBack;

      try {
        const url = new URL(navState.url);
        const path = url.pathname.replace(/^\/academy/, '') || '/';
        setActivePath(path);
      } catch {
        // Invalid URL
      }

      if (navState.url.includes('/auth/login')) {
        void signOut();
      }
    },
    [signOut],
  );

  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- untyped
        const msg: WebToNativeMessage = JSON.parse(event.nativeEvent.data);
        processWebViewMessage(
          msg,
          {
            // eslint-disable-next-line @typescript-eslint/no-misused-promises -- untyped
            onSignOut: signOut,
            onPageMeta: (title, path, canGoBack) => {
              setPageTitle(title);
              setActivePath(path);
              setPageCanGoBack(canGoBack);
            },
            onNotificationCount: setNotificationCount,
            onContentLoaded: () => setContentLoaded(true),
          },
          contentLoaded,
        );
      } catch {
        // Ignore non-JSON messages
      }
    },
    [signOut, contentLoaded],
  );

  const handleShouldStartLoad = useCallback(
    (event: { url: string }): boolean => {
      const { url } = event;
      return ALLOWED_ORIGINS.some(origin => url.startsWith(origin));
    },
    [],
  );

  // Tab press → navigate WebView or toggle AI Mentor
  const handleTabPress = useCallback((path: string) => {
    if (path === '__ai_mentor__') {
      webViewRef.current?.injectJavaScript(`
        (function() {
          window.dispatchEvent(new CustomEvent('toggle-ai-mentor'));
          true;
        })();
      `);
      return;
    }
    webViewRef.current?.injectJavaScript(buildNavigateJS(path));
  }, []);

  const handleBurgerPress = useCallback(() => setDrawerVisible(true), []);

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

  const handleDrawerNavigate = useCallback(
    (path: string, external?: boolean) => {
      if (external) {
        void Linking.openURL(path);
      } else {
        webViewRef.current?.injectJavaScript(buildNavigateJS(path));
      }
    },
    [],
  );

  const handleLogout = useCallback(() => signOut(), [signOut]);

  const injectedJS = buildSessionInjectionJS(session);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Offline banner */}
      {isOffline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineBannerText}>{'\u26A1'} Офлайн-режим</Text>
        </View>
      )}

      {/* Soft update banner */}
      {updateBanner && (
        <Pressable
          style={styles.updateBanner}
          onPress={() => {
            if (updateBanner.storeUrl)
              void Linking.openURL(updateBanner.storeUrl);
          }}
        >
          <Text style={styles.updateBannerText}>Доступно обновление</Text>
          <Pressable onPress={updateBanner.onDismiss} hitSlop={8}>
            <Text style={styles.updateBannerDismiss}>{'\u2715'}</Text>
          </Pressable>
        </Pressable>
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
          sharedCookiesEnabled
          cacheEnabled
          cacheMode={isOffline ? 'LOAD_CACHE_ELSE_NETWORK' : 'LOAD_DEFAULT'}
          allowsBackForwardNavigationGestures
          pullToRefreshEnabled={Platform.OS === 'android'}
          startInLoadingState
          javaScriptEnabled
          domStorageEnabled
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
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
    backgroundColor: 'rgba(212, 148, 74, 0.2)',
    paddingVertical: 6,
    alignItems: 'center',
  },
  offlineBannerText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 11,
    color: COLORS.warning,
    letterSpacing: 0.5,
  },
  webview: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  webviewContainer: {
    flex: 1,
  },
  updateBanner: {
    backgroundColor: COLORS.accentDim,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  updateBannerText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 11,
    color: COLORS.accent,
    letterSpacing: 0.5,
  },
  updateBannerDismiss: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
});
