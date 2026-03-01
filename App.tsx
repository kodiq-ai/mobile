import messaging from '@react-native-firebase/messaging';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Linking, StatusBar, StyleSheet } from 'react-native';
import { PostHogProvider, usePostHog } from 'posthog-react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from './src/auth/AuthContext';
import { supabase } from './src/auth/supabase';
import { useAuth } from './src/auth/useAuth';
import { AnimatedScreen } from './src/components/AnimatedScreen';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { COLORS, POSTHOG_API_KEY, POSTHOG_HOST } from './src/config';
import {
  clearAnalyticsUser,
  initAnalytics,
  setAnalyticsUser,
  trackScreen,
} from './src/services/analytics';
import { EmailSentScreen } from './src/screens/EmailSentScreen';
import { ForgotPasswordScreen } from './src/screens/ForgotPasswordScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { OfflineScreen } from './src/screens/OfflineScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { SplashScreen } from './src/screens/SplashScreen';
import { BiometricLockScreen } from './src/screens/BiometricLockScreen';
import { WebViewScreen } from './src/screens/WebViewScreen';
import { useBiometric } from './src/hooks/useBiometric';
import { connectivityService } from './src/services/connectivity';
import { onTokenRefresh, registerPushToken } from './src/services/push';

type AuthScreen = 'login' | 'register' | 'forgot' | 'email-sent';

function AppContent() {
  const { session, isLoading, signOut } = useAuth();
  const posthog = usePostHog();
  const biometric = useBiometric(!!session);
  const accessTokenRef = useRef<string | null>(null);
  const [connectivityReady, setConnectivityReady] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [wasReady, setWasReady] = useState(false);
  const [deepLinkUrl, setDeepLinkUrl] = useState<string | null>(null);
  const [authScreen, setAuthScreen] = useState<AuthScreen>('login');
  const [showSplash, setShowSplash] = useState(true);

  // Initialize analytics on mount
  useEffect(() => {
    void initAnalytics();
  }, []);

  // Set/clear analytics user when session changes (Firebase + PostHog)
  useEffect(() => {
    if (session?.user?.id) {
      void setAnalyticsUser(session.user.id);
      posthog.identify(session.user.id, {
        ...(session.user.email ? { email: session.user.email } : {}),
        source: 'academy-mobile',
      });
    } else {
      void clearAnalyticsUser();
      posthog.reset();
    }
  }, [session?.user?.id, posthog]);

  // Splash timer + connectivity check
  useEffect(() => {
    const timer = setTimeout(() => {
      connectivityService.isConnected().then((online) => {
        setConnectivityReady(true);
        setIsOffline(!online);
        if (online) setWasReady(true);
      });
      setShowSplash(false);
    }, 1500);

    const unsubscribe = connectivityService.subscribe((online) => {
      setIsOffline(!online);
      if (online && !wasReady) {
        setConnectivityReady(true);
        setWasReady(true);
      }
    });

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, [wasReady]);

  // Keep access token ref fresh for push service callbacks
  useEffect(() => {
    accessTokenRef.current = session?.access_token ?? null;
  }, [session]);

  // Push token registration when authenticated
  useEffect(() => {
    if (!session || !connectivityReady || isOffline) return;
    void registerPushToken(session.access_token);
    const unsubscribeTokenRefresh = onTokenRefresh(() => accessTokenRef.current);
    return () => unsubscribeTokenRefresh();
  }, [session, connectivityReady, isOffline]);

  // Deep links: push notifications + OAuth callback (kodiq://auth/callback)
  useEffect(() => {
    // App opened from killed state by notification
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage?.data?.url) {
          setDeepLinkUrl(remoteMessage.data.url as string);
        }
      });

    // Background notification tap
    const unsubscribeNotification = messaging().onNotificationOpenedApp(
      (remoteMessage) => {
        if (remoteMessage.data?.url) {
          setDeepLinkUrl(remoteMessage.data.url as string);
        }
      },
    );

    // Handle kodiq:// deep links (OAuth callback + push)
    const linkingSubscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    // Check if app was opened with a URL (cold start)
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink(url);
    });

    return () => {
      unsubscribeNotification();
      linkingSubscription.remove();
    };
  }, []);

  const handleDeepLink = useCallback(
    (url: string) => {
      // OAuth callback: kodiq://auth/callback?code=xxx
      if (url.startsWith('kodiq://auth/callback')) {
        const params = new URL(url);
        const code = params.searchParams.get('code');
        if (code) {
          supabase.auth.exchangeCodeForSession(code).catch(() => {
            // Session exchange failed — stay on login
          });
        }
        return;
      }

      // Regular deep link (push notification URL)
      const path = url.replace(/^kodiq:\/\//, '/');
      setDeepLinkUrl(path);
    },
    [],
  );

  const handleRetry = useCallback(() => {
    connectivityService.isConnected().then((online) => {
      setIsOffline(!online);
      if (online) {
        setConnectivityReady(true);
        setWasReady(true);
      }
    });
  }, []);

  const handleAuthNavigate = useCallback((screen: AuthScreen) => {
    setAuthScreen(screen);
    void trackScreen(screen);
    posthog.screen(screen);
  }, [posthog]);

  // Splash fade-out animation
  const splashOpacity = useRef(new Animated.Value(1)).current;
  const [splashVisible, setSplashVisible] = useState(true);

  useEffect(() => {
    if (!showSplash && !isLoading && splashVisible) {
      Animated.timing(splashOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setSplashVisible(false));
    }
  }, [showSplash, isLoading, splashVisible, splashOpacity]);

  // Show splash with fade-out
  if (splashVisible) {
    return (
      <Animated.View style={[appStyles.fill, { opacity: splashOpacity }]}>
        <SplashScreen />
      </Animated.View>
    );
  }

  // Offline on cold start (no previous WebView cache)
  if (!wasReady && isOffline && !session) {
    return <OfflineScreen onRetry={handleRetry} />;
  }

  // Not authenticated → auth screens with transition
  if (!session) {
    const screen = (() => {
      switch (authScreen) {
        case 'register':
          return <RegisterScreen onNavigate={handleAuthNavigate} />;
        case 'forgot':
          return <ForgotPasswordScreen onNavigate={handleAuthNavigate} />;
        case 'email-sent':
          return <EmailSentScreen onNavigate={handleAuthNavigate} />;
        default:
          return <LoginScreen onNavigate={handleAuthNavigate} />;
      }
    })();

    return <AnimatedScreen screenKey={authScreen}>{screen}</AnimatedScreen>;
  }

  // Biometric lock gate
  if (biometric.state === 'locked' || biometric.state === 'prompting') {
    return (
      <BiometricLockScreen
        onUnlock={biometric.unlock}
        onSignOut={signOut}
      />
    );
  }

  // Authenticated → WebView with session injection
  return (
    <AnimatedScreen screenKey="webview">
      <WebViewScreen
        isOffline={isOffline}
        deepLinkUrl={deepLinkUrl}
        session={session}
      />
    </AnimatedScreen>
  );
}

const appStyles = StyleSheet.create({
  fill: {
    flex: 1,
  },
});

export default function App() {
  return (
    <ErrorBoundary>
      <PostHogProvider
        apiKey={POSTHOG_API_KEY}
        options={{
          host: POSTHOG_HOST,
          enableSessionReplay: true,
          sessionReplayConfig: {
            maskAllTextInputs: true,
            maskAllImages: false,
          },
        }}
        autocapture={{
          captureTouches: true,
          captureScreens: true,
        }}
      >
        <SafeAreaProvider>
          <StatusBar
            barStyle="light-content"
            backgroundColor={COLORS.background}
            translucent={false}
          />
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </SafeAreaProvider>
      </PostHogProvider>
    </ErrorBoundary>
  );
}
