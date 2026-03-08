import { useCallback, useRef, useState } from 'react';
import { Animated } from 'react-native';

interface StreakOverlayState {
  visible: boolean;
  streak: number;
  progress: number;
  target: number;
}

interface UseStreakOverlayReturn {
  visible: boolean;
  streak: number;
  progress: number;
  target: number;
  translateY: Animated.Value;
  translateX: Animated.Value;
  opacity: Animated.Value;
  showStreak: (streak: number, progress?: number, target?: number) => void;
  hideStreak: () => void;
}

export function useStreakOverlay(): UseStreakOverlayReturn {
  const [state, setState] = useState<StreakOverlayState>({
    visible: false,
    streak: 0,
    progress: 0,
    target: 1,
  });

  const translateY = useRef(new Animated.Value(100)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const autoHideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hideStreak = useCallback(() => {
    if (autoHideTimer.current) {
      clearTimeout(autoHideTimer.current);
      autoHideTimer.current = null;
    }

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 100,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      translateX.setValue(0);
      setState(prev => ({ ...prev, visible: false }));
    });
  }, [opacity, translateY, translateX]);

  const showStreak = useCallback(
    (streak: number, progress?: number, target?: number) => {
      if (streak <= 0) return;

      if (autoHideTimer.current) {
        clearTimeout(autoHideTimer.current);
      }

      // Reset position
      translateY.setValue(100);
      translateX.setValue(0);
      opacity.setValue(1);

      setState({
        visible: true,
        streak,
        progress: progress ?? 0,
        target: target ?? 1,
      });

      // Spring entrance
      Animated.spring(translateY, {
        toValue: 0,
        friction: 7,
        tension: 50,
        useNativeDriver: true,
      }).start();

      // Auto-hide after 5 seconds
      autoHideTimer.current = setTimeout(() => {
        hideStreak();
      }, 5000);
    },
    [translateY, translateX, opacity, hideStreak],
  );

  return {
    visible: state.visible,
    streak: state.streak,
    progress: state.progress,
    target: state.target,
    translateY,
    translateX,
    opacity,
    showStreak,
    hideStreak,
  };
}
