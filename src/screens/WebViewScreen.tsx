import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  BackHandler,
  Platform,
  RefreshControl,
  ScrollView,
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

import { ACADEMY_URL, ALLOWED_ORIGINS, COLORS } from '../config';
import type { WebToNativeMessage } from '../types/bridge';

/**
 * JS injected into WebView on load.
 * Sets __KODIQ_NATIVE__ flag so the web app can detect native context
 * and hide its own chrome (header, footer, bottom tabs).
 */
const INJECTED_JS = `
  (function() {
    window.__KODIQ_NATIVE__ = true;
    // Disable bounce/overscroll on iOS
    document.body.style.overscrollBehavior = 'none';
    true;
  })();
`;

interface WebViewScreenProps {
  isOffline?: boolean;
  deepLinkUrl?: string | null;
}

export function WebViewScreen({ isOffline, deepLinkUrl }: WebViewScreenProps) {
  const webViewRef = useRef<WebView>(null);
  const canGoBackRef = useRef(false);
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);

  // Android back button → navigate back in WebView
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (canGoBackRef.current && webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }
      return false;
    });

    return () => handler.remove();
  }, []);

  // Deep link: navigate WebView to specific URL
  useEffect(() => {
    if (deepLinkUrl && webViewRef.current) {
      const fullUrl = deepLinkUrl.startsWith('http')
        ? deepLinkUrl
        : `https://kodiq.ai${deepLinkUrl}`;
      webViewRef.current.injectJavaScript(
        `window.location.href = ${JSON.stringify(fullUrl)}; true;`,
      );
    }
  }, [deepLinkUrl]);

  const handleNavigationStateChange = useCallback(
    (navState: WebViewNavigation) => {
      canGoBackRef.current = navState.canGoBack;
    },
    [],
  );

  const handleMessage = useCallback((event: WebViewMessageEvent) => {
    try {
      const msg: WebToNativeMessage = JSON.parse(event.nativeEvent.data);
      switch (msg.type) {
        case 'auth_state':
          break;
        case 'navigation':
          break;
      }
    } catch {
      // Ignore non-JSON messages
    }
  }, []);

  const handleShouldStartLoad = useCallback(
    (event: { url: string }): boolean => {
      const { url } = event;
      if (ALLOWED_ORIGINS.some((origin) => url.startsWith(origin))) {
        return true;
      }
      return false;
    },
    [],
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    webViewRef.current?.reload();
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Offline banner */}
      {isOffline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineBannerText}>⚡ Офлайн-режим</Text>
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.accent}
            colors={[COLORS.accent]}
          />
        }
      >
        <WebView
          ref={webViewRef}
          source={{ uri: ACADEMY_URL }}
          style={styles.webview}
          injectedJavaScript={INJECTED_JS}
          onNavigationStateChange={handleNavigationStateChange}
          onMessage={handleMessage}
          onShouldStartLoadWithRequest={handleShouldStartLoad}
          // Auth: share cookies with system browser (Supabase sessions)
          sharedCookiesEnabled
          // Cache: use cached content when offline
          cacheEnabled
          cacheMode={isOffline ? 'LOAD_CACHE_ELSE_NETWORK' : 'LOAD_DEFAULT'}
          // UI
          allowsBackForwardNavigationGestures
          pullToRefreshEnabled={Platform.OS === 'android'}
          startInLoadingState
          renderLoading={() => <View style={styles.loading} />}
          // Security
          javaScriptEnabled
          domStorageEnabled
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          // Scroll
          overScrollMode="never"
          scrollEnabled
        />
      </ScrollView>
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
  scrollContent: {
    flex: 1,
  },
  webview: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loading: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
