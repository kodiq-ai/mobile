import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS } from '../config';

interface OAuthButtonProps {
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
  disabled?: boolean;
}

const FONT_MONO = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

export function OAuthButton({
  label,
  icon,
  onPress,
  disabled,
}: OAuthButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <View style={styles.iconWrapper}>{icon}</View>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.85,
    backgroundColor: '#1c1c1e',
  },
  iconWrapper: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: FONT_MONO,
    fontSize: 14,
    color: COLORS.text,
  },
});
