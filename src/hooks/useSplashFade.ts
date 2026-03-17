import { useEffect, useRef, useState } from 'react';
import { Animated } from 'react-native';

interface SplashFadeState {
  splashVisible: boolean;
  splashOpacity: Animated.Value;
}

/**
 * Manages splash screen fade-out animation.
 * Triggers when both `showSplash` and `isLoading` become false.
 */
export function useSplashFade(
  showSplash: boolean,
  isLoading: boolean,
): SplashFadeState {
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

  return { splashVisible, splashOpacity };
}
