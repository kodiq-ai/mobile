import type { Session } from '@supabase/supabase-js';
import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { unregisterPushToken } from '../services/push';
import { supabase } from './supabase';

interface AuthContextValue {
  session: Session | null;
  isLoading: boolean;
  signInWithEmail: (
    email: string,
    password: string,
  ) => Promise<{ error?: string }>;
  signUpWithEmail: (
    email: string,
    password: string,
    fullName: string,
  ) => Promise<{ error?: string; success?: boolean }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  signInWithIdToken: (
    provider: 'google' | 'apple',
    idToken: string,
    nonce?: string,
  ) => Promise<{ error?: string }>;
  signInWithOAuth: (provider: 'github') => Promise<{
    error?: string;
    url?: string;
  }>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Restore persisted session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setIsLoading(false);
    });

    // Listen for auth state changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) return { error: error.message };
      return {};
    },
    [],
  );

  const signUpWithEmail = useCallback(
    async (email: string, password: string, fullName: string) => {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, source: 'academy-mobile', locale: 'ru' },
        },
      });
      if (error) return { error: error.message };
      return { success: true };
    },
    [],
  );

  const handleSignOut = useCallback(async () => {
    // Unregister push token before clearing session (needs auth)
    const currentSession = await supabase.auth.getSession();
    const token = currentSession.data.session?.access_token;
    await unregisterPushToken(token);

    await supabase.auth.signOut();
    setSession(null);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://kodiq.ai/auth/callback?next=/auth/reset-password/update',
    });
    if (error) return { error: error.message };
    return {};
  }, []);

  const signInWithIdToken = useCallback(
    async (
      provider: 'google' | 'apple',
      idToken: string,
      nonce?: string,
    ) => {
      const { error } = await supabase.auth.signInWithIdToken({
        provider,
        token: idToken,
        ...(nonce ? { nonce } : {}),
      });
      if (error) return { error: error.message };
      return {};
    },
    [],
  );

  const signInWithOAuth = useCallback(async (provider: 'github') => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: 'kodiq://auth/callback',
        skipBrowserRedirect: true,
      },
    });
    if (error) return { error: error.message };
    return { url: data.url };
  }, []);

  const value = useMemo(
    () => ({
      session,
      isLoading,
      signInWithEmail,
      signUpWithEmail,
      signOut: handleSignOut,
      resetPassword,
      signInWithIdToken,
      signInWithOAuth,
    }),
    [
      session,
      isLoading,
      signInWithEmail,
      signUpWithEmail,
      handleSignOut,
      resetPassword,
      signInWithIdToken,
      signInWithOAuth,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
