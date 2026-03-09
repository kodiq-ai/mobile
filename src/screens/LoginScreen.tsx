import React, { useCallback, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  type TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '../auth/useAuth';
import { AuthButton } from '../components/AuthButton';
import { AuthDivider } from '../components/AuthDivider';
import { AuthInput } from '../components/AuthInput';
import { OAuthButton } from '../components/OAuthButton';
import { AppleIcon } from '../components/icons/AppleIcon';
import { GitHubIcon } from '../components/icons/GitHubIcon';
import { GoogleIcon } from '../components/icons/GoogleIcon';
import { KodiqLogo } from '../components/icons/KodiqLogo';
import { COLORS } from '../config';
import { translateError } from '../utils/errors';

interface LoginScreenProps {
  onNavigate: (screen: 'register' | 'forgot') => void;
}

const FONT_MONO = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

export function LoginScreen({ onNavigate }: LoginScreenProps) {
  const { signInWithEmail, signInWithOAuth } = useAuth();
  const insets = useSafeAreaInsets();
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
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Brand — square logo + wordmark */}
          <View style={styles.brand}>
            <View style={styles.logoSquare}>
              <KodiqLogo size={64} />
            </View>
            <Text style={styles.wordmark}>Kodiq</Text>
          </View>

          {/* Form */}
          <View style={styles.content}>
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
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  brand: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoSquare: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordmark: {
    fontFamily: FONT_MONO,
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: 2,
    marginTop: 20,
  },
  content: {
    width: '100%',
    maxWidth: 360,
    alignSelf: 'center',
    gap: 16,
  },
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
