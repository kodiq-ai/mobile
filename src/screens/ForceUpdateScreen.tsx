import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS } from '../config';
import { APP_VERSION } from '../hooks/useForceUpdate';
import { KodiqLogo } from '../components/icons/KodiqLogo';

const FONT_MONO = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

interface ForceUpdateScreenProps {
  storeUrl: string | null;
  requiredVersion?: string | null;
  onSkip?: () => void;
}

export function ForceUpdateScreen({
  storeUrl,
  requiredVersion,
  onSkip,
}: ForceUpdateScreenProps) {
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Fade-in on mount
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <Animated.View
      style={[
        styles.container,
        { paddingTop: insets.top + 40, opacity: fadeAnim },
      ]}
    >
      <KodiqLogo size={48} />

      <Text style={styles.title}>Обновите приложение</Text>
      <Text style={styles.subtitle}>
        Эта версия больше не поддерживается.{'\n'}
        Обновите для продолжения работы.
      </Text>

      {/* Version info */}
      {requiredVersion && (
        <View style={styles.versionRow}>
          <Text style={styles.versionCurrent}>{APP_VERSION}</Text>
          <Text style={styles.versionArrow}>→</Text>
          <Text style={styles.versionRequired}>{requiredVersion}</Text>
        </View>
      )}

      <Pressable
        style={styles.button}
        onPress={() => {
          if (storeUrl) void Linking.openURL(storeUrl);
        }}
      >
        <Text style={styles.buttonText}>Обновить</Text>
      </Pressable>

      {/* Skip button for soft updates */}
      {onSkip && (
        <Pressable style={styles.skipButton} onPress={onSkip}>
          <Text style={styles.skipText}>Пропустить</Text>
        </Pressable>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  title: {
    fontFamily: FONT_MONO,
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginTop: 24,
  },
  subtitle: {
    fontFamily: FONT_MONO,
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  versionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  versionCurrent: {
    fontFamily: FONT_MONO,
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  versionArrow: {
    fontFamily: FONT_MONO,
    fontSize: 14,
    color: COLORS.accent,
  },
  versionRequired: {
    fontFamily: FONT_MONO,
    fontSize: 14,
    color: COLORS.accent,
    fontWeight: '700',
  },
  button: {
    marginTop: 24,
    backgroundColor: COLORS.accent,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
  },
  buttonText: {
    fontFamily: FONT_MONO,
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  skipButton: {
    paddingVertical: 10,
  },
  skipText: {
    fontFamily: FONT_MONO,
    fontSize: 12,
    color: COLORS.textSecondary,
    letterSpacing: 0.3,
  },
});
