import React, { useCallback, useState } from 'react';
import { Platform, StyleSheet, Text } from 'react-native';

import { useAuth } from '../auth/useAuth';
import { AuthButton } from '../components/AuthButton';
import { AuthInput } from '../components/AuthInput';
import { AuthLayout } from '../components/AuthLayout';
import { COLORS } from '../config';

interface ForgotPasswordScreenProps {
  onNavigate: (screen: 'login' | 'email-sent') => void;
}

const FONT_MONO = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

export function ForgotPasswordScreen({ onNavigate }: ForgotPasswordScreenProps) {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleReset = useCallback(async () => {
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    const result = await resetPassword(email.trim());
    if (result.error) {
      setError(result.error);
    } else {
      onNavigate('email-sent');
    }
    setLoading(false);
  }, [email, resetPassword, onNavigate]);

  return (
    <AuthLayout title="Сброс пароля" subtitle="Введите email для получения ссылки">
      <AuthInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoComplete="email"
        textContentType="emailAddress"
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <AuthButton
        label="Отправить ссылку"
        onPress={handleReset}
        loading={loading}
        disabled={!email.trim()}
      />

      <Text style={styles.linkCenter}>
        Вспомнили пароль?{' '}
        <Text style={styles.linkAccent} onPress={() => onNavigate('login')}>
          Войти
        </Text>
      </Text>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  error: {
    fontFamily: FONT_MONO,
    fontSize: 13,
    color: COLORS.error,
    textAlign: 'center',
  },
  linkCenter: {
    fontFamily: FONT_MONO,
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  linkAccent: {
    color: COLORS.text,
  },
});
