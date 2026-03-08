import { useCallback, useRef } from 'react';
import { Animated } from 'react-native';

interface WebViewSnapshotState {
  overlayOpacity: Animated.Value;
  onPathChange: (newPath: string, contentLoaded: boolean) => void;
}

/**
 * Manages a fade overlay to hide white flash during WebView navigation.
 * Animates opacity 0 → 0.6 → 0 when path changes and content is loaded.
 */
export function useWebViewSnapshot(): WebViewSnapshotState {
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const lastPathRef = useRef<string>('');

  const onPathChange = useCallback(
    (newPath: string, contentLoaded: boolean) => {
      if (!contentLoaded) return;
      if (newPath === lastPathRef.current) return;

      lastPathRef.current = newPath;

      Animated.sequence([
        Animated.timing(overlayOpacity, {
          toValue: 0.6,
          duration: 80,
          useNativeDriver: true,
        }),
        Animated.delay(50),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    },
    [overlayOpacity],
  );

  return { overlayOpacity, onPathChange };
}
