import React, { useCallback, useRef, useState } from 'react';
import {
  Linking,
  Platform,
  StyleSheet,
  Text,
  type TextInput,
  View,
} from 'react-native';

import { signInWithApple, signInWithGoogle } from '../auth/oauth';
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
import { translateError } from '../utils/errors';

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
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const passwordRef = useRef<TextInput>(null);

  const handleEmailLogin = useCallback(async () => {
    if (!email.trim() || !password) return;
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithEmail(email.trim(), password);
      if (result.error) {
        setError(translateError(result.error));
      }
    } catch {
      setError('Ошибка соединения. Проверьте интернет.');
    } finally {
      setLoading(false);
    }
  }, [email, password, signInWithEmail]);

  const handleGoogleLogin = useCallback(async () => {
    setLoading(true);
    setLoadingProvider('google');
    setError(null);
    try {
      const result = await signInWithGoogle();
      if (result.error) {
        setError(translateError(result.error));
      }
    } catch {
      setError('Ошибка входа через Google');
    } finally {
      setLoading(false);
      setLoadingProvider(null);
    }
  }, []);

  const handleAppleLogin = useCallback(async () => {
    setLoading(true);
    setLoadingProvider('apple');
    setError(null);
    try {
      const result = await signInWithApple();
      if (result.error) {
        setError(translateError(result.error));
      }
    } catch {
      setError('Ошибка входа через Apple');
    } finally {
      setLoading(false);
      setLoadingProvider(null);
    }
  }, []);

  const handleGitHubLogin = useCallback(async () => {
    setLoading(true);
    setLoadingProvider('github');
    setError(null);
    try {
      const result = await signInWithOAuth('github');
      if (result.error) {
        setError(translateError(result.error));
        return;
      }
      if (result.url) {
        await Linking.openURL(result.url);
      }
    } catch {
      setError('Ошибка входа через GitHub');
    } finally {
      setLoading(false);
      setLoadingProvider(null);
    }
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
          loading={loadingProvider === 'github'}
        />
        <OAuthButton
          label="Продолжить с Google"
          icon={<GoogleIcon />}
          onPress={handleGoogleLogin}
          disabled={loading}
          loading={loadingProvider === 'google'}
        />
        {Platform.OS === 'ios' && (
          <OAuthButton
            label="Продолжить с Apple"
            icon={<AppleIcon />}
            onPress={handleAppleLogin}
            disabled={loading}
            loading={loadingProvider === 'apple'}
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
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
          blurOnSubmit={false}
        />
        <AuthInput
          ref={passwordRef}
          placeholder="Пароль"
          value={password}
          onChangeText={setPassword}
          isPassword
          autoComplete="password"
          textContentType="password"
          returnKeyType="go"
          onSubmitEditing={handleEmailLogin}
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
