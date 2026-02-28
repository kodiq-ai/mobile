import React, { useCallback, useEffect, useState } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { COLORS } from './src/config';
import { OfflineScreen } from './src/screens/OfflineScreen';
import { SplashScreen } from './src/screens/SplashScreen';
import { WebViewScreen } from './src/screens/WebViewScreen';
import { connectivityService } from './src/services/connectivity';

type AppState = 'splash' | 'ready' | 'offline';

const SPLASH_DURATION_MS = 1500;

export default function App() {
  const [state, setState] = useState<AppState>('splash');
  const [wasReady, setWasReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      connectivityService.isConnected().then((online) => {
        setState(online ? 'ready' : 'offline');
        if (online) setWasReady(true);
      });
    }, SPLASH_DURATION_MS);

    const unsubscribe = connectivityService.subscribe((online) => {
      if (!online && wasReady) {
        // Don't switch to offline if we already loaded — WebView has cache
        return;
      }
      if (!online) setState('offline');
      if (online && state === 'offline') setState('ready');
    });

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, [wasReady, state]);

  const handleRetry = useCallback(() => {
    connectivityService.isConnected().then((online) => {
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
      {state === 'ready' && <WebViewScreen />}
      {state === 'offline' && <OfflineScreen onRetry={handleRetry} />}
    </SafeAreaProvider>
  );
}
