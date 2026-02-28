import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { COLORS } from '../config';

const FONT_MONO = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

export function AuthDivider() {
  return (
    <View style={styles.container}>
      <View style={styles.line} />
      <Text style={styles.text}>или</Text>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  line: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.border,
  },
  text: {
    fontFamily: FONT_MONO,
    fontSize: 12,
    color: COLORS.textMuted,
  },
});
