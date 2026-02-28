import messaging from '@react-native-firebase/messaging';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Linking, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from './src/auth/AuthContext';
import { supabase } from './src/auth/supabase';
import { useAuth } from './src/auth/useAuth';
import { COLORS } from './src/config';
import { EmailSentScreen } from './src/screens/EmailSentScreen';
import { ForgotPasswordScreen } from './src/screens/ForgotPasswordScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { OfflineScreen } from './src/screens/OfflineScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { SplashScreen } from './src/screens/SplashScreen';
import { WebViewScreen } from './src/screens/WebViewScreen';
import { connectivityService } from './src/services/connectivity';
import { onTokenRefresh, registerPushToken } from './src/services/push';

type AuthScreen = 'login' | 'register' | 'forgot' | 'email-sent';

function AppContent() {
  const { session, isLoading } = useAuth();
  const accessTokenRef = useRef<string | null>(null);
  const [connectivityReady, setConnectivityReady] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [wasReady, setWasReady] = useState(false);
  const [deepLinkUrl, setDeepLinkUrl] = useState<string | null>(null);
  const [authScreen, setAuthScreen] = useState<AuthScreen>('login');
  const [showSplash, setShowSplash] = useState(true);

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
  }, []);

  // Loading: splash or auth restoring
  if (showSplash || isLoading) {
    return <SplashScreen />;
  }

  // Offline on cold start (no previous WebView cache)
  if (!wasReady && isOffline && !session) {
    return <OfflineScreen onRetry={handleRetry} />;
  }

  // Not authenticated → auth screens
  if (!session) {
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
  }

  // Authenticated → WebView with session injection
  return (
    <WebViewScreen
      isOffline={isOffline}
      deepLinkUrl={deepLinkUrl}
      session={session}
    />
  );
}

export default function App() {
  return (
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
  );
}
