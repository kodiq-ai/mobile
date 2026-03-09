import React, { useEffect, useRef } from 'react';
import { Animated, Platform, StyleSheet, View } from 'react-native';

import { KodiqLogo } from '../components/icons/KodiqLogo';
import { COLORS } from '../config';

const FONT_MONO = Platform.OS === 'ios' ? 'Menlo' : 'monospace';
const PROGRESS_WIDTH = 120;

export function SplashScreen() {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.92)).current;
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Progress bar: 0→100% over 2s (useNativeDriver: false for width)
    Animated.timing(progress, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: false,
    }).start();
  }, [opacity, scale, progress]);

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, PROGRESS_WIDTH],
  });

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <Animated.View style={[styles.content, { transform: [{ scale }] }]}>
        <View style={styles.logoSquare}>
          <KodiqLogo size={64} />
        </View>
        <Animated.Text style={styles.wordmark}>Kodiq</Animated.Text>

        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <Animated.View
            style={[styles.progressFill, { width: progressWidth }]}
          />
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logoSquare: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordmark: {
    fontFamily: FONT_MONO,
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: 2,
    marginTop: 20,
  },
  progressTrack: {
    width: PROGRESS_WIDTH,
    height: 2,
    backgroundColor: COLORS.border,
    borderRadius: 1,
    marginTop: 24,
    overflow: 'hidden',
  },
  progressFill: {
    height: 2,
    backgroundColor: COLORS.accent,
    borderRadius: 1,
  },
});
