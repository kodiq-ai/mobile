import React, { useEffect, useRef } from 'react';
import { Animated, Platform, StyleSheet } from 'react-native';

import { COLORS } from '../config';

const FONT_MONO = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

export function SplashScreen() {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.92)).current;

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
  }, [opacity, scale]);

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <Animated.View style={[styles.content, { transform: [{ scale }] }]}>
        <Animated.Text style={styles.logo}>kodiq</Animated.Text>
        <Animated.View style={styles.divider} />
        <Animated.Text style={styles.subtitle}>Academy</Animated.Text>
      </Animated.View>
      <Animated.Text style={styles.tagline}>AI Solo Founder Program</Animated.Text>
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
  tagline: {
    fontFamily: FONT_MONO,
    fontSize: 11,
    color: COLORS.textMuted,
    letterSpacing: 1,
    marginTop: 20,
    textTransform: 'uppercase',
  },
});
