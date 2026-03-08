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
        <View style={styles.logoIcon}>
          <KodiqLogo size={80} />
        </View>
        <View style={styles.textRow}>
          <Animated.Text style={styles.logo}>kodiq</Animated.Text>
          <Animated.View style={styles.divider} />
          <Animated.Text style={styles.subtitle}>Academy</Animated.Text>
        </View>

        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <Animated.View
            style={[styles.progressFill, { width: progressWidth }]}
          />
        </View>
      </Animated.View>
      <Animated.Text style={styles.tagline}>
        AI Solo Founder Program
      </Animated.Text>
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
  logoIcon: {
    marginBottom: 20,
  },
  textRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    fontFamily: FONT_MONO,
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -1,
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: COLORS.border,
  },
  subtitle: {
    fontFamily: FONT_MONO,
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.accent,
    letterSpacing: 0.5,
  },
  progressTrack: {
    width: PROGRESS_WIDTH,
    height: 2,
    backgroundColor: COLORS.border,
    borderRadius: 1,
    marginTop: 20,
    overflow: 'hidden',
  },
  progressFill: {
    height: 2,
    backgroundColor: COLORS.accent,
    borderRadius: 1,
  },
  tagline: {
    fontFamily: FONT_MONO,
    fontSize: 11,
    color: COLORS.textMuted,
    letterSpacing: 1,
    marginTop: 20,
    textTransform: 'uppercase',
  },
});
