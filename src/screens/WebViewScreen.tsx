import React, { useCallback, useRef } from 'react';
import {
  BackHandler,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
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

export function WebViewScreen() {
  const webViewRef = useRef<WebView>(null);
  const canGoBackRef = useRef(false);
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = React.useState(false);

  // Android back button → navigate back in WebView
  React.useEffect(() => {
    if (Platform.OS !== 'android') return;

    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (canGoBackRef.current && webViewRef.current) {
        webViewRef.current.goBack();
        return true; // prevent app exit
      }
      return false; // let system handle (exit app)
    });

    return () => handler.remove();
  }, []);

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
          // Future: track auth for push token registration
          break;
        case 'navigation':
          // Future: deep link handling
          break;
      }
    } catch {
      // Ignore non-JSON messages
    }
  }, []);

  const handleShouldStartLoad = useCallback(
    (event: { url: string }): boolean => {
      const { url } = event;
      // Allow same-origin and allowed OAuth origins
      if (ALLOWED_ORIGINS.some((origin) => url.startsWith(origin))) {
        return true;
      }
      // Block other external URLs — could open in system browser instead
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
          // Cache
          cacheEnabled
          cacheMode="LOAD_DEFAULT"
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
