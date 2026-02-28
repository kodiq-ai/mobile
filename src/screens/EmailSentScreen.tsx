import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { AuthButton } from '../components/AuthButton';
import { AuthLayout } from '../components/AuthLayout';
import { COLORS } from '../config';

interface EmailSentScreenProps {
  onNavigate: (screen: 'login') => void;
}

const FONT_MONO = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

export function EmailSentScreen({ onNavigate }: EmailSentScreenProps) {
  return (
    <AuthLayout title="Проверьте" highlight="почту" subtitle="Мы отправили вам письмо">
      <View style={styles.card}>
        <Text style={styles.cardText}>
          Проверьте входящие сообщения и следуйте инструкциям в письме.
        </Text>
        <Text style={styles.cardHint}>
          Если письма нет — проверьте папку «Спам»
        </Text>
      </View>

      <AuthButton
        label="Вернуться к входу"
        onPress={() => onNavigate('login')}
        variant="secondary"
      />
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: `${COLORS.accent}30`,
    backgroundColor: `${COLORS.accent}08`,
    borderRadius: 8,
    padding: 16,
    gap: 8,
  },
  cardText: {
    fontFamily: FONT_MONO,
    fontSize: 13,
    color: COLORS.accent,
    textAlign: 'center',
    lineHeight: 20,
  },
  cardHint: {
    fontFamily: FONT_MONO,
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});
