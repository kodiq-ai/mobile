import React, { useCallback, useState } from 'react';
import { Linking, Platform, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '../auth/useAuth';
import { AuthButton } from '../components/AuthButton';
import { AuthDivider } from '../components/AuthDivider';
import { AuthInput } from '../components/AuthInput';
import { AuthLayout } from '../components/AuthLayout';
import { OAuthButton } from '../components/OAuthButton';
import { AppleIcon } from '../components/icons/AppleIcon';
import { GitHubIcon } from '../components/icons/GitHubIcon';
import { GoogleIcon } from '../components/icons/GoogleIcon';
import { COLORS } from '../config';

interface LoginScreenProps {
  onNavigate: (screen: 'register' | 'forgot') => void;
}

const FONT_MONO = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

export function LoginScreen({ onNavigate }: LoginScreenProps) {
  const { signInWithEmail, signInWithOAuth } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = useCallback(async () => {
    if (!email.trim() || !password) return;
    setLoading(true);
    setError(null);
    const result = await signInWithEmail(email.trim(), password);
    if (result.error) {
      setError(result.error);
    }
    setLoading(false);
  }, [email, password, signInWithEmail]);

  const handleGitHubLogin = useCallback(async () => {
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
    <AuthLayout title="Вход в" highlight="Academy" subtitle="Продолжайте обучение">
      {/* OAuth buttons */}
      <View style={styles.oauthGroup}>
        <OAuthButton
          label="Продолжить с GitHub"
          icon={<GitHubIcon />}
          onPress={handleGitHubLogin}
          disabled={loading}
        />
        <OAuthButton
          label="Продолжить с Google"
          icon={<GoogleIcon />}
          onPress={() => {
            // Phase 2: Google Sign-In native SDK
          }}
          disabled={loading}
        />
        {Platform.OS === 'ios' && (
          <OAuthButton
            label="Продолжить с Apple"
            icon={<AppleIcon />}
            onPress={() => {
              // Phase 2: Apple Sign-In native SDK
            }}
            disabled={loading}
          />
        )}
      </View>

      <AuthDivider />

      {/* Email / Password */}
      <View style={styles.form}>
        <AuthInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoComplete="email"
          textContentType="emailAddress"
        />
        <AuthInput
          placeholder="Пароль"
          value={password}
          onChangeText={setPassword}
          isPassword
          autoComplete="password"
          textContentType="password"
        />

        {error && <Text style={styles.error}>{error}</Text>}

        <AuthButton
          label="Войти"
          onPress={handleEmailLogin}
          loading={loading}
          disabled={!email.trim() || !password}
        />
      </View>

      {/* Links */}
      <View style={styles.links}>
        <Text style={styles.link} onPress={() => onNavigate('register')}>
          Создать аккаунт
        </Text>
        <Text style={styles.link} onPress={() => onNavigate('forgot')}>
          Забыли пароль?
        </Text>
      </View>
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
  links: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  link: {
    fontFamily: FONT_MONO,
    fontSize: 11,
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
});
