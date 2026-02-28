import messaging from '@react-native-firebase/messaging';
import React, { useCallback, useEffect, useState } from 'react';
import { Linking, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { COLORS } from './src/config';
import { OfflineScreen } from './src/screens/OfflineScreen';
import { SplashScreen } from './src/screens/SplashScreen';
import { WebViewScreen } from './src/screens/WebViewScreen';
import { connectivityService } from './src/services/connectivity';
import { onTokenRefresh, registerPushToken } from './src/services/push';

type AppState = 'splash' | 'ready' | 'offline';

const SPLASH_DURATION_MS = 1500;

export default function App() {
  const [state, setState] = useState<AppState>('splash');
  const [isOffline, setIsOffline] = useState(false);
  const [wasReady, setWasReady] = useState(false);
  const [deepLinkUrl, setDeepLinkUrl] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      connectivityService.isConnected().then((online) => {
        setState(online ? 'ready' : 'offline');
        setIsOffline(!online);
        if (online) {
          setWasReady(true);
        }
      });
    }, SPLASH_DURATION_MS);

    const unsubscribe = connectivityService.subscribe((online) => {
      setIsOffline(!online);

      if (!online && !wasReady) {
        // Cold start without network — show offline screen
        setState('offline');
      }
      if (online && state === 'offline') {
        setState('ready');
      }
      // If wasReady && !online → stay on WebView with offline banner + cache
    });

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, [wasReady, state]);

  // Register push token once app is ready
  useEffect(() => {
    if (state !== 'ready') return;
    void registerPushToken();
    const unsubscribeTokenRefresh = onTokenRefresh();
    return () => unsubscribeTokenRefresh();
  }, [state]);

  // Deep links: push notification tap → navigate WebView
  useEffect(() => {
    // App was opened from a notification (killed state)
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage?.data?.url) {
          setDeepLinkUrl(remoteMessage.data.url as string);
        }
      });

    // App was in background, notification tapped
    const unsubscribeNotification = messaging().onNotificationOpenedApp(
      (remoteMessage) => {
        if (remoteMessage.data?.url) {
          setDeepLinkUrl(remoteMessage.data.url as string);
        }
      },
    );

    // Handle kodiq:// deep links (for future use)
    const linkingSubscription = Linking.addEventListener('url', (event) => {
      const path = event.url.replace(/^kodiq:\/\//, '/');
      setDeepLinkUrl(path);
    });

    return () => {
      unsubscribeNotification();
      linkingSubscription.remove();
    };
  }, []);

  const handleRetry = useCallback(() => {
    connectivityService.isConnected().then((online) => {
      setIsOffline(!online);
      setState(online ? 'ready' : 'offline');
    });
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.background}
        translucent={false}
      />
      {state === 'splash' && <SplashScreen />}
      {state === 'ready' && (
        <WebViewScreen isOffline={isOffline} deepLinkUrl={deepLinkUrl} />
      )}
      {state === 'offline' && <OfflineScreen onRetry={handleRetry} />}
    </SafeAreaProvider>
  );
}
