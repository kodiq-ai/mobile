import { useRef, useCallback } from 'react';
import { Animated } from 'react-native';

/**
 * Reusable press animation hook — spring scale effect.
 * Usage: <Animated.View style={animatedStyle}><Pressable onPressIn={onPressIn} onPressOut={onPressOut} /></Animated.View>
 */
export function useAnimatedPress(toValue = 0.95) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = useCallback(() => {
    Animated.spring(scale, {
      toValue,
      friction: 5,
      tension: 300,
      useNativeDriver: true,
    }).start();
  }, [scale, toValue]);

  const onPressOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 5,
      tension: 300,
      useNativeDriver: true,
    }).start();
  }, [scale]);

  const animatedStyle = { transform: [{ scale }] };

  return { animatedStyle, onPressIn, onPressOut };
}
