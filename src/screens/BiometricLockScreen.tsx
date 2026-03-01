import React, { useEffect } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { KodiqLogo } from '../components/icons/KodiqLogo';
import { COLORS } from '../config';

interface BiometricLockScreenProps {
  onUnlock: () => Promise<boolean>;
  onSignOut: () => void;
}

export function BiometricLockScreen({
  onUnlock,
  onSignOut,
}: BiometricLockScreenProps) {
  // Automatically prompt on mount
  useEffect(() => {
    void onUnlock();
  }, [onUnlock]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <KodiqLogo size={48} />
        <Text style={styles.title}>Kodiq Academy</Text>
        <Text style={styles.subtitle}>Приложение заблокировано</Text>

        <Pressable style={styles.unlockButton} onPress={() => void onUnlock()}>
          <Text style={styles.unlockText}>Разблокировать</Text>
        </Pressable>

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
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 16,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 8,
    marginBottom: 32,
  },
  unlockButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginBottom: 16,
  },
  unlockText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 0.3,
  },
  signOutButton: {
    paddingVertical: 10,
  },
  signOutText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
    color: COLORS.error,
    letterSpacing: 0.3,
  },
});
