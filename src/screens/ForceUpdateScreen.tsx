import React from 'react';
import { Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS } from '../config';
import { KodiqLogo } from '../components/icons/KodiqLogo';

interface ForceUpdateScreenProps {
  storeUrl: string | null;
}

export function ForceUpdateScreen({ storeUrl }: ForceUpdateScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 40 }]}>
      <KodiqLogo size={48} />

      <Text style={styles.title}>Обновите приложение</Text>
      <Text style={styles.subtitle}>
        Эта версия больше не поддерживается.{'\n'}
        Обновите для продолжения работы.
      </Text>

      <Pressable
        style={styles.button}
        onPress={() => {
          if (storeUrl) Linking.openURL(storeUrl);
        }}
      >
        <Text style={styles.buttonText}>Обновить</Text>
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
    paddingHorizontal: 32,
    gap: 16,
  },
  title: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginTop: 24,
  },
  subtitle: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  button: {
    marginTop: 24,
    backgroundColor: COLORS.accent,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
  },
  buttonText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
});
