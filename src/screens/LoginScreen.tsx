import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Linking,
  Platform,
  StyleSheet,
  Text,
  type TextInput,
  View,
} from 'react-native';

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

  // Stagger entrance animation (4 groups: oauth, divider, form, links)
  const oauthOpacity = useRef(new Animated.Value(0)).current;
  const dividerOpacity = useRef(new Animated.Value(0)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;
  const linksOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(80, [
      Animated.spring(oauthOpacity, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(dividerOpacity, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(formOpacity, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(linksOpacity, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [oauthOpacity, dividerOpacity, formOpacity, linksOpacity]);

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

  const handleOAuthLogin = useCallback(
    async (provider: 'google' | 'apple' | 'github') => {
      setLoading(true);
      setLoadingProvider(provider);
      setError(null);
      try {
        const result = await signInWithOAuth(provider);
        if (result.error) {
          setError(translateError(result.error));
          return;
        }
        if (result.url) {
          await Linking.openURL(result.url);
        }
      } catch {
        setError(`Ошибка входа через ${provider}`);
      } finally {
        setLoading(false);
        setLoadingProvider(null);
      }
    },
    [signInWithOAuth],
  );

  const handleGitHubLogin = useCallback(
    () => handleOAuthLogin('github'),
    [handleOAuthLogin],
  );
  const handleGoogleLogin = useCallback(
    () => handleOAuthLogin('google'),
    [handleOAuthLogin],
  );
  const handleAppleLogin = useCallback(
    () => handleOAuthLogin('apple'),
    [handleOAuthLogin],
  );

  return (
    <AuthLayout
      title="Вход в"
      highlight="Academy"
      subtitle="Продолжайте обучение"
    >
      {/* OAuth buttons */}
      <Animated.View style={{ opacity: oauthOpacity }}>
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
      </Animated.View>

      <Animated.View style={{ opacity: dividerOpacity }}>
        <AuthDivider />
      </Animated.View>

      {/* Email / Password */}
      <Animated.View style={{ opacity: formOpacity }}>
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
      </Animated.View>

      {/* Links */}
      <Animated.View style={{ opacity: linksOpacity }}>
        <View style={styles.links}>
          <Text style={styles.link} onPress={() => onNavigate('register')}>
            Создать аккаунт
          </Text>
          <Text style={styles.link} onPress={() => onNavigate('forgot')}>
            Забыли пароль?
          </Text>
        </View>
      </Animated.View>
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
