import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS } from '../config';

interface AuthLayoutProps {
  title: string;
  highlight?: string;
  subtitle: string;
  children: React.ReactNode;
}

const FONT_MONO = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

export function AuthLayout({
  title,
  highlight,
  subtitle,
  children,
}: AuthLayoutProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 40 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            {/* Logo */}
            <Text style={styles.logo}>kodiq</Text>

            {/* Title with optional cyan highlight */}
            <Text style={styles.title}>
              {title}
              {highlight ? (
                <Text style={styles.highlight}> {highlight}</Text>
              ) : null}
            </Text>

            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>

          <View style={styles.content}>{children}</View>
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
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    fontFamily: FONT_MONO,
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -0.5,
    marginBottom: 24,
  },
  title: {
    fontFamily: FONT_MONO,
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  highlight: {
    color: COLORS.accent,
  },
  subtitle: {
    fontFamily: FONT_MONO,
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    letterSpacing: 0.5,
    marginTop: 8,
  },
  content: {
    width: '100%',
    maxWidth: 360,
    alignSelf: 'center',
    gap: 16,
  },
});
