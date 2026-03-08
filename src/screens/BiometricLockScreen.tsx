import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { KodiqLogo } from '../components/icons/KodiqLogo';
import { COLORS } from '../config';
import { hapticError } from '../utils/haptics';

const FONT_MONO = Platform.OS === 'ios' ? 'Menlo' : 'monospace';
const AUTO_RETRY_MS = 2000;

interface BiometricLockScreenProps {
  onUnlock: () => Promise<boolean>;
  onSignOut: () => void;
  biometryType?: string | null;
}

/** Unicode icon for biometry type */
function getBiometricIcon(type: string | null | undefined): string {
  switch (type) {
    case 'FaceID':
    case 'Face':
      return '👤'; // Face
    case 'Iris':
      return '👁'; // Iris
    case 'TouchID':
    case 'Fingerprint':
    default:
      return '🔒'; // Fingerprint / generic
  }
}

function getBiometricLabel(type: string | null | undefined): string {
  switch (type) {
    case 'FaceID':
    case 'Face':
      return 'Face ID';
    case 'Iris':
      return 'Iris';
    case 'TouchID':
      return 'Touch ID';
    case 'Fingerprint':
      return 'Отпечаток пальца';
    default:
      return 'Биометрия';
  }
}

export function BiometricLockScreen({
  onUnlock,
  onSignOut,
  biometryType,
}: BiometricLockScreenProps) {
  const [error, setError] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const autoRetryTimer = useRef<ReturnType<typeof setTimeout>>();

  // Pulse animation loop
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

  const triggerShake = useCallback(() => {
    const SHAKE_OFFSET = 10;
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: SHAKE_OFFSET,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -SHAKE_OFFSET,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: SHAKE_OFFSET,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -SHAKE_OFFSET,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, [shakeAnim]);

  const handleUnlock = useCallback(async () => {
    setError(false);
    const success = await onUnlock();
    if (!success) {
      setError(true);
      hapticError();
      triggerShake();
      // Auto-retry after delay
      autoRetryTimer.current = setTimeout(() => {
        void onUnlock().then(ok => {
          if (ok) setError(false);
        });
      }, AUTO_RETRY_MS);
    }
  }, [onUnlock, triggerShake]);

  // Auto-prompt on mount
  useEffect(() => {
    void handleUnlock();
    return () => {
      if (autoRetryTimer.current) clearTimeout(autoRetryTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const icon = getBiometricIcon(biometryType);
  const label = getBiometricLabel(biometryType);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <KodiqLogo size={48} />
        <Text style={styles.title}>Kodiq Academy</Text>
        <Text style={styles.subtitle}>Приложение заблокировано</Text>

        {/* Biometric icon with pulse + shake */}
        <Animated.View
          style={[
            styles.iconWrapper,
            {
              transform: [{ scale: pulseAnim }, { translateX: shakeAnim }],
            },
          ]}
        >
          <Text style={styles.biometricIcon}>{icon}</Text>
        </Animated.View>

        <Text style={styles.biometricLabel}>{label}</Text>

        {error && (
          <View style={styles.errorSection}>
            <Text style={styles.errorText}>Не удалось разблокировать</Text>
            <Pressable
              style={styles.retryButton}
              onPress={() => void handleUnlock()}
            >
              <Text style={styles.retryText}>Повторить</Text>
            </Pressable>
          </View>
        )}

        {!error && (
          <Pressable
            style={styles.unlockButton}
            onPress={() => void handleUnlock()}
          >
            <Text style={styles.unlockText}>Разблокировать</Text>
          </Pressable>
        )}

        <Pressable style={styles.signOutButton} onPress={onSignOut}>
          <Text style={styles.signOutText}>Выйти из аккаунта</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontFamily: FONT_MONO,
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 16,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontFamily: FONT_MONO,
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 8,
    marginBottom: 24,
  },
  iconWrapper: {
    marginBottom: 8,
  },
  biometricIcon: {
    fontSize: 48,
  },
  biometricLabel: {
    fontFamily: FONT_MONO,
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 24,
    letterSpacing: 0.3,
  },
  errorSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  errorText: {
    fontFamily: FONT_MONO,
    fontSize: 12,
    color: COLORS.error,
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  retryButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 10,
  },
  retryText: {
    fontFamily: FONT_MONO,
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 0.3,
  },
  unlockButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginBottom: 16,
  },
  unlockText: {
    fontFamily: FONT_MONO,
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 0.3,
  },
  signOutButton: {
    paddingVertical: 10,
  },
  signOutText: {
    fontFamily: FONT_MONO,
    fontSize: 12,
    color: COLORS.error,
    letterSpacing: 0.3,
  },
});
