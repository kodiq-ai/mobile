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
import { BadgeModal } from '../components/BadgeModal';
import { ConfettiOverlay } from '../components/ConfettiOverlay';
import { DownloadManager } from '../components/DownloadManager';
import { DrawerMenu } from '../components/DrawerMenu';
import { NativeHeader } from '../components/NativeHeader';
import { LevelUpAnimation } from '../components/LevelUpAnimation';
import { NativeTabBar } from '../components/NativeTabBar';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { StreakOverlay } from '../components/StreakOverlay';
import { XPOverlay } from '../components/XPOverlay';
import type { SkeletonVariant } from '../components/SkeletonLoader';
import { useConfetti } from '../hooks/useConfetti';
import { useGamification } from '../hooks/useGamification';
import { useLessonCache } from '../hooks/useLessonCache';
import { useNavConfig } from '../hooks/useNavConfig';
import { useStreakOverlay } from '../hooks/useStreakOverlay';
import { useTabNavigation } from '../hooks/useTabNavigation';
import { useWebViewPreload } from '../hooks/useWebViewPreload';
import { useWebViewSnapshot } from '../hooks/useWebViewSnapshot';
import type { WebToNativeMessage } from '../types/bridge';
import {
  buildNavigateJS,
  buildSessionInjectionJS,
  INJECTED_JS_NO_SESSION,
} from '../services/webview-injection';
import { processWebViewMessage } from '../services/webview-bridge';
import { hapticStreakMilestone } from '../utils/haptics';

function getSkeletonVariant(path: string): SkeletonVariant {
  if (path.includes('/lesson') || path.includes('/lessons/')) return 'lesson';
  if (path.includes('/dashboard') || path.includes('/progress'))
    return 'dashboard';
  if (path.includes('/feed') || path.includes('/social')) return 'feed';
  return 'grid';
}

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
  const webViewRefA = useRef<WebView>(null);
  const webViewRefB = useRef<WebView>(null);
  const activeKeyRef = useRef<'A' | 'B'>('A');
  const [activeKey, setActiveKey] = useState<'A' | 'B'>('A');

  // Helper: always returns the currently visible WebView (reads ref, safe in callbacks)
  const getActiveRef = useCallback(
    (): WebView | null =>
      activeKeyRef.current === 'A' ? webViewRefA.current : webViewRefB.current,
    [],
  );

  const insets = useSafeAreaInsets();
  const { signOut } = useAuth();
  const navConfig = useNavConfig();
  const tabNav = useTabNavigation(navConfig.tabs);
  const { overlayOpacity, onPathChange } = useWebViewSnapshot();
  const confetti = useConfetti();
  const gamification = useGamification();
  const lessonCache = useLessonCache();
  const streakOverlay = useStreakOverlay();
  const [downloadManagerVisible, setDownloadManagerVisible] = useState(false);

  // Dual WebView preloading
  const activePath = tabNav.getActiveState().currentPath;
  const { shouldPreload, preloadUrl, onPreloadReady, canSwap, markSwapped } =
    useWebViewPreload(activePath, navConfig.tabs);

  // Frozen source for WebView B — only updated when B is hidden
  const [bSource, setBSource] = useState(ACADEMY_URL);
  useEffect(() => {
    if (preloadUrl && activeKeyRef.current !== 'B') {
      setBSource(preloadUrl);
    }
  }, [preloadUrl]);

  const shouldRenderB = activeKey === 'B' || shouldPreload;

  const [notificationCount, setNotificationCount] = useState(0);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [contentLoaded, setContentLoaded] = useState(false);
  const [skeletonVariant, setSkeletonVariant] =
    useState<SkeletonVariant>('grid');
  const [tabSwitchSkeleton, setTabSwitchSkeleton] = useState(false);

  // Fallback timer — force reload if no page_meta within 1.5s after tab switch
  const pageMetaTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Re-inject session when token refreshes — both WebViews share session
  const prevTokenRef = useRef(session.access_token);
  useEffect(() => {
    if (session.access_token !== prevTokenRef.current) {
      prevTokenRef.current = session.access_token;
      const js = buildSessionInjectionJS(session);
      webViewRefA.current?.injectJavaScript(js);
      webViewRefB.current?.injectJavaScript(js);
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
      if (prevPath) {
        getActiveRef()?.injectJavaScript(buildNavigateJS(prevPath));
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
  }, [drawerVisible, tabNav, getActiveRef]);

  // Deep link navigation — validate origin before navigating
  useEffect(() => {
    if (deepLinkUrl) {
      const fullUrl = deepLinkUrl.startsWith('http')
        ? deepLinkUrl
        : `https://kodiq.ai${deepLinkUrl}`;
      const isAllowed = ALLOWED_ORIGINS.some(origin =>
        fullUrl.startsWith(origin),
      );
      if (!isAllowed) return;
      getActiveRef()?.injectJavaScript(
        `window.location.href = ${JSON.stringify(fullUrl)}; true;`,
      );
    }
  }, [deepLinkUrl, getActiveRef]);

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
              setSkeletonVariant(getSkeletonVariant(path));
              onPathChange(path, contentLoaded);
            },
            onNotificationCount: setNotificationCount,
            onContentLoaded: () => setContentLoaded(true),
            onCelebration: confetti.trigger,
            onStreakUpdate: (streak, progress, target) => {
              hapticStreakMilestone();
              streakOverlay.showStreak(streak, progress, target);
            },
            onXPUpdate: gamification.onXPUpdate,
            onCacheLesson: (lessonId, html, title) => {
              void lessonCache.cacheLesson(lessonId, html, title);
            },
          },
          contentLoaded,
        );
      } catch {
        // Ignore non-JSON messages
      }
    },
    [
      signOut,
      contentLoaded,
      tabNav,
      onPathChange,
      confetti,
      streakOverlay,
      gamification,
      lessonCache,
    ],
  );

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
        getActiveRef()?.injectJavaScript(`
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
      if (!navPath) return;

      // If the preloaded WebView has this page ready, swap instead of navigating
      if (canSwap(navPath)) {
        const next: 'A' | 'B' = activeKeyRef.current === 'A' ? 'B' : 'A';
        activeKeyRef.current = next;
        setActiveKey(next);
        markSwapped();
        setSkeletonVariant(getSkeletonVariant(navPath));
        setTabSwitchSkeleton(true);
        setTimeout(() => setTabSwitchSkeleton(false), 150);
        return;
      }

      // Standard navigation — show skeleton briefly during tab switch
      const targetVariant = getSkeletonVariant(navPath);
      setSkeletonVariant(targetVariant);
      setTabSwitchSkeleton(true);
      setTimeout(() => setTabSwitchSkeleton(false), 300);

      getActiveRef()?.injectJavaScript(buildNavigateJS(navPath));

      // Fallback: force reload if no page_meta within 1.5s
      if (pageMetaTimerRef.current) clearTimeout(pageMetaTimerRef.current);
      pageMetaTimerRef.current = setTimeout(() => {
        getActiveRef()?.injectJavaScript(
          `window.location.href = 'https://kodiq.ai${navPath}'; true;`,
        );
        pageMetaTimerRef.current = null;
      }, 1500);
    },
    [navConfig.tabs, tabNav, canSwap, markSwapped, getActiveRef],
  );

  const handleBurgerPress = useCallback(() => setDrawerVisible(true), []);

  const handleBackPress = useCallback(() => {
    const prevPath = tabNav.goBack();
    if (prevPath) {
      getActiveRef()?.injectJavaScript(buildNavigateJS(prevPath));
    }
  }, [tabNav, getActiveRef]);

  const handleNotificationPress = useCallback(() => {
    getActiveRef()?.injectJavaScript(buildNavigateJS('/notifications'));
  }, [getActiveRef]);

  const handleSearchPress = useCallback(() => {
    getActiveRef()?.injectJavaScript(buildNavigateJS('/search'));
  }, [getActiveRef]);

  const handleDrawerNavigate = useCallback(
    (path: string, external?: boolean) => {
      if (external) {
        void Linking.openURL(path);
      } else {
        getActiveRef()?.injectJavaScript(buildNavigateJS(path));
      }
    },
    [getActiveRef],
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

      {/* WebView — content area (dual WebView for tab preloading) */}
      <View style={styles.webviewContainer}>
        {/* Primary WebView (A) */}
        <WebView
          ref={webViewRefA}
          source={{ uri: ACADEMY_URL }}
          style={activeKey === 'A' ? styles.webview : styles.webviewHidden}
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

        {/* Secondary WebView (B) — preloads next likely tab */}
        {shouldRenderB && (
          <WebView
            ref={webViewRefB}
            source={{ uri: bSource }}
            style={activeKey === 'B' ? styles.webview : styles.webviewHidden}
            injectedJavaScriptBeforeContentLoaded={injectedJS}
            injectedJavaScript={INJECTED_JS_NO_SESSION}
            onNavigationStateChange={handleNavigationStateChange}
            onMessage={handleMessage}
            onShouldStartLoadWithRequest={handleShouldStartLoad}
            onLoadEnd={activeKey !== 'B' ? onPreloadReady : undefined}
            sharedCookiesEnabled
            cacheEnabled
            cacheMode={isOffline ? 'LOAD_CACHE_ELSE_NETWORK' : 'LOAD_DEFAULT'}
            javaScriptEnabled
            domStorageEnabled
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            overScrollMode="never"
            scrollEnabled
          />
        )}

        {/* Snapshot overlay — hides white flash during navigation */}
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: COLORS.background, opacity: overlayOpacity },
          ]}
          pointerEvents="none"
        />

        {/* Skeleton overlay — visible until first page_meta or during tab switch */}
        {(!contentLoaded || tabSwitchSkeleton) && (
          <View style={StyleSheet.absoluteFill}>
            <SkeletonLoader variant={skeletonVariant} />
          </View>
        )}
      </View>

      {/* Native Tab Bar */}
      <NativeTabBar
        tabs={navConfig.tabs}
        activePath={tabNav.getActiveState().currentPath}
        notificationCount={notificationCount}
        onTabPress={handleTabPress}
      />

      {/* Streak Overlay */}
      <StreakOverlay
        visible={streakOverlay.visible}
        streak={streakOverlay.streak}
        progress={streakOverlay.progress}
        target={streakOverlay.target}
        translateY={streakOverlay.translateY}
        translateX={streakOverlay.translateX}
        opacity={streakOverlay.opacity}
        onDismiss={streakOverlay.hideStreak}
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

      {/* XP Overlay (bottom-left) */}
      <XPOverlay
        visible={gamification.showXP}
        xp={gamification.xp}
        level={gamification.level}
        xpToNextLevel={gamification.xpToNextLevel}
        onDismiss={gamification.dismissXP}
      />

      {/* Level-up celebration */}
      <LevelUpAnimation
        visible={gamification.showLevelUp}
        level={gamification.levelUpLevel}
        onDismiss={gamification.dismissLevelUp}
      />

      {/* Badge modal */}
      <BadgeModal
        visible={gamification.showBadge}
        badge={gamification.pendingBadge}
        onDismiss={gamification.dismissBadge}
      />

      {/* Download Manager */}
      <DownloadManager
        visible={downloadManagerVisible}
        cachedLessons={lessonCache.cachedLessons}
        cacheSize={lessonCache.cacheSize}
        onRemoveLesson={id => void lessonCache.removeCachedLesson(id)}
        onClearAll={() => void lessonCache.clearCache()}
        onClose={() => setDownloadManagerVisible(false)}
      />

      {/* Confetti celebration overlay */}
      <ConfettiOverlay
        visible={confetti.visible}
        onComplete={confetti.onComplete}
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
  webviewHidden: {
    height: 0,
    width: 0,
    position: 'absolute',
    opacity: 0,
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
