import type { Session } from '@supabase/supabase-js';
import { useEffect, useRef, useState } from 'react';
import type { PostHog } from 'posthog-react-native';

import {
  clearAnalyticsUser,
  initAnalytics,
  setAnalyticsUser,
} from '../services/analytics';
import { type ConsentChoices, loadConsent } from '../services/consent';

interface SessionAnalyticsState {
  consent: ConsentChoices | null;
  consentLoaded: boolean;
  accessTokenRef: React.RefObject<string | null>;
  setConsent: (choices: ConsentChoices) => void;
}

/**
 * Manages analytics consent, PostHog opt-in/out, and user identification.
 * Keeps `accessTokenRef` in sync with the current session for push callbacks.
 */
export function useSessionAnalytics(
  session: Session | null,
  posthog: PostHog,
): SessionAnalyticsState {
  const [consent, setConsent] = useState<ConsentChoices | null>(null);
  const [consentLoaded, setConsentLoaded] = useState(false);
  const accessTokenRef = useRef<string | null>(null);

  // Load consent + initialize analytics respecting consent
  useEffect(() => {
    void loadConsent().then(saved => {
      setConsent(saved);
      setConsentLoaded(true);
      void initAnalytics(saved?.analytics ?? false);
    });
  }, []);

  // Apply consent to PostHog
  useEffect(() => {
    if (!consentLoaded) return;
    if (consent?.analytics) {
      void posthog.optIn();
      void posthog.register({ $product: 'Kodiq App' });
    } else {
      void posthog.optOut();
    }
  }, [consent, consentLoaded, posthog]);

  // Set/clear analytics user when session changes (Firebase + PostHog)
  useEffect(() => {
    if (session?.user?.id) {
      void setAnalyticsUser(session.user.id);
      posthog.identify(session.user.id, {
        ...(session.user.email ? { email: session.user.email } : {}),
        source: 'academy-mobile',
      });
    } else {
      void clearAnalyticsUser();
      posthog.reset();
    }
  }, [session?.user?.id, session?.user?.email, posthog]);

  // Keep access token ref fresh for push service callbacks
  useEffect(() => {
    accessTokenRef.current = session?.access_token ?? null;
  }, [session]);

  return { consent, consentLoaded, accessTokenRef, setConsent };
}
