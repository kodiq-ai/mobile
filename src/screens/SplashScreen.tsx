import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { COLORS } from '../config';

export function SplashScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Logo text — matches web: font-mono, cyan accent */}
        <Text style={styles.logo}>kodiq</Text>
        <View style={styles.divider} />
        <Text style={styles.subtitle}>Academy</Text>
      </View>
      <Text style={styles.tagline}>AI Solo Founder Program</Text>
    </View>
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
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
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
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.accent,
    letterSpacing: 0.5,
  },
  tagline: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 11,
    color: COLORS.textMuted,
    letterSpacing: 1,
    marginTop: 20,
    textTransform: 'uppercase',
  },
});
