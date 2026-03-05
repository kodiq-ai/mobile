import { useCallback, useEffect, useState } from 'react';

import { connectivityService } from '../services/connectivity';

interface ConnectivityState {
  connectivityReady: boolean;
  isOffline: boolean;
  wasReady: boolean;
  retry: () => void;
}

/**
 * Manages network connectivity state: splash-time check,
 * live subscription, and manual retry.
 */
export function useConnectivity(): ConnectivityState {
  const [connectivityReady, setConnectivityReady] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [wasReady, setWasReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      void connectivityService.isConnected().then(online => {
        setConnectivityReady(true);
        setIsOffline(!online);
        if (online) setWasReady(true);
      });
    }, 1500);

    const unsubscribe = connectivityService.subscribe(online => {
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

  const retry = useCallback(() => {
    void connectivityService.isConnected().then(online => {
      setIsOffline(!online);
      if (online) {
        setConnectivityReady(true);
        setWasReady(true);
      }
    });
  }, []);

  return { connectivityReady, isOffline, wasReady, retry };
}
