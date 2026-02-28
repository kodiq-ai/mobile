import React, { forwardRef, useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

import { COLORS } from '../config';

interface AuthInputProps extends TextInputProps {
  /** Show eye toggle for password fields */
  isPassword?: boolean;
}

const FONT_MONO = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

export const AuthInput = forwardRef<TextInput, AuthInputProps>(
  function AuthInput({ isPassword, style, ...props }, ref) {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <View style={styles.wrapper}>
        <TextInput
          ref={ref}
          style={[styles.input, isPassword && styles.inputWithToggle, style]}
          placeholderTextColor={COLORS.textMuted}
          selectionColor={COLORS.accent}
          secureTextEntry={isPassword && !showPassword}
          autoCapitalize="none"
          autoCorrect={false}
          {...props}
        />
        {isPassword && (
          <Pressable
            style={styles.eyeButton}
            onPress={() => setShowPassword((v) => !v)}
            hitSlop={8}
          >
            <Text style={styles.eyeText}>
              {showPassword ? 'Скрыть' : 'Показать'}
            </Text>
          </Pressable>
        )}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  input: {
    fontFamily: FONT_MONO,
    fontSize: 14,
    color: COLORS.text,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
  },
  inputWithToggle: {
    paddingRight: 80,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  eyeText: {
    fontFamily: FONT_MONO,
    fontSize: 11,
    color: COLORS.textMuted,
  },
});
