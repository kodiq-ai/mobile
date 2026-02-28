import React from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { COLORS } from '../config';

interface OfflineScreenProps {
  onRetry: () => void;
}

export function OfflineScreen({ onRetry }: OfflineScreenProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>⚡</Text>
      <Text style={styles.title}>Нет подключения</Text>
      <Text style={styles.description}>
        Проверьте интернет-соединение и попробуйте снова
      </Text>
      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
        ]}
        onPress={onRetry}
      >
        <Text style={styles.buttonText}>Повторить</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  description: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  button: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.background,
    letterSpacing: 0.5,
  },
});
