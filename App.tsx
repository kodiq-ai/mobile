import React, { useCallback, useEffect, useState } from 'react';
import { Animated, StatusBar, StyleSheet } from 'react-native';
import { PostHogProvider, usePostHog } from 'posthog-react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from './src/auth/AuthContext';
import { useAuth } from './src/auth/useAuth';
import { AnimatedScreen } from './src/components/AnimatedScreen';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { COLORS, POSTHOG_API_KEY, POSTHOG_HOST } from './src/config';
import { useConnectivity } from './src/hooks/useConnectivity';
import { useDeepLinks } from './src/hooks/useDeepLinks';
import { useForceUpdate } from './src/hooks/useForceUpdate';
import { useSessionAnalytics } from './src/hooks/useSessionAnalytics';
import { useSplashFade } from './src/hooks/useSplashFade';
import { setAnalyticsConsent, trackScreen } from './src/services/analytics';
import {
  type ConsentChoices,
  getDefaultChoices,
  saveConsent,
} from './src/services/consent';
import { BiometricLockScreen } from './src/screens/BiometricLockScreen';
import { ConsentScreen } from './src/screens/ConsentScreen';
import { EmailSentScreen } from './src/screens/EmailSentScreen';
import { ForceUpdateScreen } from './src/screens/ForceUpdateScreen';
import { ForgotPasswordScreen } from './src/screens/ForgotPasswordScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { OfflineScreen } from './src/screens/OfflineScreen';
import {
  OnboardingScreen,
  isOnboardingDone,
} from './src/screens/OnboardingScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { SplashScreen } from './src/screens/SplashScreen';
import { WebViewScreen } from './src/screens/WebViewScreen';
import { WhatsNewModal } from './src/components/WhatsNewModal';
import { useBiometric } from './src/hooks/useBiometric';
import { useWhatsNew } from './src/hooks/useWhatsNew';
import { onTokenRefresh, registerPushToken } from './src/services/push';

type AuthScreen = 'login' | 'register' | 'forgot' | 'email-sent';

function AppContent() {
  const { session, isLoading, signOut } = useAuth();
  const posthog = usePostHog();
  const biometric = useBiometric(!!session);
  const whatsNew = useWhatsNew();
  const {
    status: updateStatus,
    storeUrl,
    dismiss: dismissUpdate,
  } = useForceUpdate();

  const connectivity = useConnectivity();
  const { deepLinkUrl } = useDeepLinks();
  const analytics = useSessionAnalytics(session, posthog);

  const [authScreen, setAuthScreen] = useState<AuthScreen>('login');
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);

  // Check onboarding status
  useEffect(() => {
    isOnboardingDone().then(done => setShowOnboarding(!done));
  }, []);

  // Hide splash after minimum display time (matches connectivity timer)
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Push token registration when authenticated
  useEffect(() => {
    if (!session || !connectivity.connectivityReady || connectivity.isOffline)
      return;
    void registerPushToken(session.access_token);
    const unsubscribeTokenRefresh = onTokenRefresh(
      () => analytics.accessTokenRef.current,
    );
    return () => unsubscribeTokenRefresh();
    // analytics.accessTokenRef is a stable ref — no need to re-run on change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, connectivity.connectivityReady, connectivity.isOffline]);

  const splash = useSplashFade(showSplash, isLoading);

  const handleAuthNavigate = useCallback(
    (screen: AuthScreen) => {
      setAuthScreen(screen);
      void trackScreen(screen);
      posthog.screen(screen);
    },
    [posthog],
  );

  const handleConsentSave = useCallback(
    (choices: ConsentChoices) => {
      analytics.setConsent(choices);
      void saveConsent(choices);
      void setAnalyticsConsent(choices.analytics);
    },
    [analytics],
  );

  // Show splash with fade-out
  if (splash.splashVisible) {
    return (
      <Animated.View
        style={[appStyles.fill, { opacity: splash.splashOpacity }]}
      >
        <SplashScreen />
      </Animated.View>
    );
  }

  // Force update — blocking screen
  if (updateStatus === 'force') {
    return <ForceUpdateScreen storeUrl={storeUrl} />;
  }

  // Offline on cold start (no previous WebView cache)
  if (!connectivity.wasReady && connectivity.isOffline && !session) {
    return <OfflineScreen onRetry={connectivity.retry} />;
  }

  // Onboarding — first launch only
  if (showOnboarding) {
    return (
      <AnimatedScreen screenKey="onboarding">
        <OnboardingScreen onComplete={() => setShowOnboarding(false)} />
      </AnimatedScreen>
    );
  }

  // Consent screen — after onboarding, before auth
  if (analytics.consentLoaded && !analytics.consent) {
    return (
      <AnimatedScreen screenKey="consent">
        <ConsentScreen
          initialChoices={getDefaultChoices()}
          onSave={handleConsentSave}
        />
      </AnimatedScreen>
    );
  }

  // Not authenticated → auth screens with transition
  if (!session) {
    const screen = (() => {
      switch (authScreen) {
        case 'register':
          return <RegisterScreen onNavigate={handleAuthNavigate} />;
        case 'forgot':
          return <ForgotPasswordScreen onNavigate={handleAuthNavigate} />;
        case 'email-sent':
          return <EmailSentScreen onNavigate={handleAuthNavigate} />;
        default:
          return <LoginScreen onNavigate={handleAuthNavigate} />;
      }
    })();

    return <AnimatedScreen screenKey={authScreen}>{screen}</AnimatedScreen>;
  }

  // Biometric lock gate
  if (biometric.state === 'locked' || biometric.state === 'prompting') {
    return (
      <BiometricLockScreen onUnlock={biometric.unlock} onSignOut={signOut} />
    );
  }

  // Authenticated → WebView with session injection
  return (
    <AnimatedScreen screenKey="webview">
      <WebViewScreen
        isOffline={connectivity.isOffline}
        deepLinkUrl={deepLinkUrl}
        session={session}
        updateBanner={
          updateStatus === 'soft'
            ? { storeUrl, onDismiss: dismissUpdate }
            : undefined
        }
      />
      <WhatsNewModal
        visible={whatsNew.shouldShow}
        entries={whatsNew.entries}
        onDismiss={() => void whatsNew.dismiss()}
      />
    </AnimatedScreen>
  );
}

const appStyles = StyleSheet.create({
  fill: {
    flex: 1,
  },
});

export default function App() {
  return (
    <ErrorBoundary>
      <PostHogProvider
        apiKey={POSTHOG_API_KEY}
        options={{
          host: POSTHOG_HOST,
          enableSessionReplay: true,
          sessionReplayConfig: {
            maskAllTextInputs: true,
            maskAllImages: false,
          },
        }}
        autocapture={{
          captureTouches: true,
          captureScreens: true,
        }}
      >
        <SafeAreaProvider>
          <StatusBar
            barStyle="light-content"
            backgroundColor={COLORS.background}
            translucent={false}
          />
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </SafeAreaProvider>
      </PostHogProvider>
    </ErrorBoundary>
  );
}
