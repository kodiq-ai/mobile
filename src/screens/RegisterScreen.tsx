import React, { useCallback, useState } from 'react';
import { Linking, Platform, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '../auth/useAuth';
import { AuthButton } from '../components/AuthButton';
import { AuthDivider } from '../components/AuthDivider';
import { AuthInput } from '../components/AuthInput';
import { AuthLayout } from '../components/AuthLayout';
import { OAuthButton } from '../components/OAuthButton';
import { GitHubIcon } from '../components/icons/GitHubIcon';
import { GoogleIcon } from '../components/icons/GoogleIcon';
import { COLORS } from '../config';

interface RegisterScreenProps {
  onNavigate: (screen: 'login' | 'email-sent') => void;
}

const FONT_MONO = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

export function RegisterScreen({ onNavigate }: RegisterScreenProps) {
  const { signUpWithEmail, signInWithOAuth } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = useCallback(async () => {
    if (!fullName.trim() || !email.trim() || !password) return;
    setLoading(true);
    setError(null);
    const result = await signUpWithEmail(email.trim(), password, fullName.trim());
    if (result.error) {
      setError(result.error);
    } else if (result.success) {
      onNavigate('email-sent');
    }
    setLoading(false);
  }, [fullName, email, password, signUpWithEmail, onNavigate]);

  const handleGitHubOAuth = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await signInWithOAuth('github');
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    if (result.url) {
      await Linking.openURL(result.url);
    }
    setLoading(false);
  }, [signInWithOAuth]);

  return (
    <AuthLayout
      title="Создать"
      highlight="аккаунт"
      subtitle="Начните обучение в Academy"
    >
      {/* OAuth */}
      <View style={styles.oauthGroup}>
        <OAuthButton
          label="Продолжить с GitHub"
          icon={<GitHubIcon />}
          onPress={handleGitHubOAuth}
          disabled={loading}
        />
        <OAuthButton
          label="Продолжить с Google"
          icon={<GoogleIcon />}
          onPress={() => {
            // Phase 2: Google Sign-In
          }}
          disabled={loading}
        />
      </View>

      <AuthDivider />

      {/* Form */}
      <View style={styles.form}>
        <AuthInput
          placeholder="Имя"
          value={fullName}
          onChangeText={setFullName}
          autoComplete="name"
          textContentType="name"
        />
        <AuthInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoComplete="email"
          textContentType="emailAddress"
        />
        <AuthInput
          placeholder="Пароль (мин. 6 символов)"
          value={password}
          onChangeText={setPassword}
          isPassword
          autoComplete="new-password"
          textContentType="newPassword"
        />

        {error && <Text style={styles.error}>{error}</Text>}

        <AuthButton
          label="Создать аккаунт"
          onPress={handleRegister}
          loading={loading}
          disabled={!fullName.trim() || !email.trim() || password.length < 6}
        />
      </View>

      <Text style={styles.linkCenter}>
        Уже есть аккаунт?{' '}
        <Text style={styles.linkAccent} onPress={() => onNavigate('login')}>
          Войти
        </Text>
      </Text>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  oauthGroup: {
    gap: 12,
  },
  form: {
    gap: 12,
  },
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
