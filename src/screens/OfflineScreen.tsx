import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { COLORS } from '../config';

const FONT_MONO = Platform.OS === 'ios' ? 'Menlo' : 'monospace';
const AUTO_RETRY_MS = 5000;

interface OfflineScreenProps {
  onRetry: () => void;
}

export function OfflineScreen({ onRetry }: OfflineScreenProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation on the icon
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  // Auto-retry interval
  useEffect(() => {
    const interval = setInterval(onRetry, AUTO_RETRY_MS);
    return () => clearInterval(interval);
  }, [onRetry]);

  return (
    <View style={styles.container}>
      {/* Wi-Fi off icon with pulse */}
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <Text style={styles.icon}>✕</Text>
        <Text style={styles.wifiIcon}>📶</Text>
      </Animated.View>

      <Text style={styles.title}>Нет подключения</Text>
      <Text style={styles.description}>
        Проверьте интернет-соединение.{'\n'}
        Автоматически переподключимся...
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
    position: 'absolute',
    top: -4,
    right: -4,
    fontSize: 16,
    color: COLORS.error,
    fontWeight: '700',
    zIndex: 1,
  },
  wifiIcon: {
    fontSize: 48,
    opacity: 0.5,
  },
  title: {
    fontFamily: FONT_MONO,
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  description: {
    fontFamily: FONT_MONO,
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
    fontFamily: FONT_MONO,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.background,
    letterSpacing: 0.5,
  },
});
