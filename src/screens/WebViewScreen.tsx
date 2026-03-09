import type { Session } from '@supabase/supabase-js';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
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
import { useTabNavigation } from '../hooks/useTabNavigation';
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
  const insets = useSafeAreaInsets();
  const { signOut } = useAuth();
  const navConfig = useNavConfig();
  const tabNav = useTabNavigation(navConfig.tabs);

  const [notificationCount, setNotificationCount] = useState(0);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [contentLoaded, setContentLoaded] = useState(false);

  // Opacity fade for tab transitions — masks SPA navigation delay
  const tabTransitionOpacity = useRef(new Animated.Value(1)).current;

  // Fallback timer — force reload if no page_meta within 1.5s after tab switch
  const pageMetaTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Crash recovery: max 3 reload attempts to prevent infinite loop
  const crashCountRef = useRef(0);
  const MAX_CRASH_RELOADS = 3;

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

      // Navigate back within tab's own history
      const prevPath = tabNav.goBack();
      if (prevPath && webViewRef.current) {
        webViewRef.current.injectJavaScript(buildNavigateJS(prevPath));
        return true;
      }

      // At tab root — open drawer instead of exiting
      if (!tabNav.canGoBack) {
        setDrawerVisible(true);
        return true;
      }

      return false;
    });

    return () => handler.remove();
  }, [drawerVisible, tabNav]);

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
      // Detect if WebView navigated to login page (session expired in web)
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
            onPageMeta: (title, path) => {
              // Clear fallback timer — we got a response from the bridge
              if (pageMetaTimerRef.current) {
                clearTimeout(pageMetaTimerRef.current);
                pageMetaTimerRef.current = null;
              }
              tabNav.onPageChange(path, title);
              crashCountRef.current = 0; // Reset crash counter on successful load

              // Fade in WebView after page loaded
              Animated.timing(tabTransitionOpacity, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
              }).start();
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
    [signOut, contentLoaded, tabNav, tabTransitionOpacity],
  );

  // Crash recovery: Android kills WebView renderer in background → white screen
  const handleRenderCrash = useCallback(() => {
    if (crashCountRef.current >= MAX_CRASH_RELOADS) return;
    crashCountRef.current += 1;
    setContentLoaded(false);
    webViewRef.current?.reload();
  }, []);

  const handleShouldStartLoad = useCallback(
    (event: { url: string }): boolean => {
      const { url } = event;
      return ALLOWED_ORIGINS.some(origin => url.startsWith(origin));
    },
    [],
  );

  // Tab press → navigate WebView or toggle AI Mentor
  const handleTabPress = useCallback(
    (path: string) => {
      if (path === '__ai_mentor__') {
        webViewRef.current?.injectJavaScript(`
        (function() {
          window.dispatchEvent(new CustomEvent('toggle-ai-mentor'));
          true;
        })();
      `);
        return;
      }

      // Find tab by path and switch via tab navigation
      const tab = navConfig.tabs.find(t => t.path === path);
      if (!tab) return;

      const navPath = tabNav.switchTab(tab.id);
      if (navPath && webViewRef.current) {
        // Fade out WebView to mask SPA navigation delay
        Animated.timing(tabTransitionOpacity, {
          toValue: 0.4,
          duration: 100,
          useNativeDriver: true,
        }).start();

        webViewRef.current.injectJavaScript(buildNavigateJS(navPath));

        // Fallback: force reload if no page_meta within 1.5s
        if (pageMetaTimerRef.current) clearTimeout(pageMetaTimerRef.current);
        pageMetaTimerRef.current = setTimeout(() => {
          webViewRef.current?.injectJavaScript(
            `window.location.href = 'https://kodiq.ai${navPath}'; true;`,
          );
          pageMetaTimerRef.current = null;
        }, 1500);
      }
    },
    [navConfig.tabs, tabNav, tabTransitionOpacity],
  );

  const handleBurgerPress = useCallback(() => setDrawerVisible(true), []);

  const handleBackPress = useCallback(() => {
    const prevPath = tabNav.goBack();
    if (prevPath && webViewRef.current) {
      webViewRef.current.injectJavaScript(buildNavigateJS(prevPath));
    }
  }, [tabNav]);

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
        title={tabNav.title}
        canGoBack={tabNav.canGoBack}
        notificationCount={notificationCount}
        onBurgerPress={handleBurgerPress}
        onBackPress={handleBackPress}
        onNotificationPress={handleNotificationPress}
        onSearchPress={handleSearchPress}
      />

      {/* WebView — content area */}
      <Animated.View
        style={[styles.webviewContainer, { opacity: tabTransitionOpacity }]}
      >
        <WebView
          ref={webViewRef}
          source={{ uri: ACADEMY_URL }}
          style={styles.webview}
          injectedJavaScriptBeforeContentLoaded={injectedJS}
          injectedJavaScript={INJECTED_JS_NO_SESSION}
          onNavigationStateChange={handleNavigationStateChange}
          onMessage={handleMessage}
          onShouldStartLoadWithRequest={handleShouldStartLoad}
          onRenderProcessGone={handleRenderCrash}
          onContentProcessDidTerminate={handleRenderCrash}
          // Auth: cookies still shared for SSR compatibility
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
      </Animated.View>

      {/* Native Tab Bar */}
      <NativeTabBar
        tabs={navConfig.tabs}
        activePath={tabNav.getActiveState().currentPath}
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
