import {
  getAnalytics,
  logEvent,
  setAnalyticsCollectionEnabled,
  setConsent,
  setUserId as setAnalyticsUserId,
  setUserProperty,
} from '@react-native-firebase/analytics';
import {
  getCrashlytics,
  log as crashlyticsLog,
  recordError,
  setAttribute,
  setCrashlyticsCollectionEnabled,
  setUserId as setCrashlyticsUserId,
} from '@react-native-firebase/crashlytics';
import * as Sentry from '@sentry/react-native';
import { Platform } from 'react-native';

const analyticsInstance = getAnalytics();
const crash = getCrashlytics();

/** Initialize Firebase Analytics + Crashlytics, respecting consent */
export async function initAnalytics(analyticsConsent = true): Promise<void> {
  // Crashlytics is essential — always enabled (legitimate interest for app stability)
  await setCrashlyticsCollectionEnabled(crash, true);

  // Firebase Analytics respects user consent (GDPR granular consent)
  await setAnalyticsCollectionEnabled(analyticsInstance, analyticsConsent);
  await setConsent(analyticsInstance, {
    analytics_storage: analyticsConsent,
    ad_storage: false,
    ad_user_data: false,
    ad_personalization: false,
  });

  // Set default user properties
  await setUserProperty(analyticsInstance, 'platform', Platform.OS);

  const pkg = require('../../package.json') as { version: string };
  await setUserProperty(analyticsInstance, 'app_version', pkg.version);
  await setAttribute(crash, 'platform', Platform.OS);
}

/** Update analytics collection based on consent change */
export async function setAnalyticsConsent(enabled: boolean): Promise<void> {
  await setAnalyticsCollectionEnabled(analyticsInstance, enabled);
  await setConsent(analyticsInstance, {
    analytics_storage: enabled,
    ad_storage: false,
    ad_user_data: false,
    ad_personalization: false,
  });
  await setUserProperty(
    analyticsInstance,
    'consent_analytics',
    String(enabled),
  );
}

/** Set user ID for Analytics, Crashlytics, and Sentry */
export async function setAnalyticsUser(userId: string): Promise<void> {
  Sentry.setUser({ id: userId });
  await Promise.all([
    setAnalyticsUserId(analyticsInstance, userId),
    setCrashlyticsUserId(crash, userId),
  ]);
}

/** Clear user on logout */
export async function clearAnalyticsUser(): Promise<void> {
  Sentry.setUser(null);
  await Promise.all([
    setAnalyticsUserId(analyticsInstance, null),
    setCrashlyticsUserId(crash, ''),
  ]);
}

/** Track screen view */
export async function trackScreen(screenName: string): Promise<void> {
  await logEvent(analyticsInstance, 'screen_view', {
    screen_name: screenName,
    screen_class: screenName,
  });
  await setAttribute(crash, 'last_screen', screenName);
  crashlyticsLog(crash, `Screen: ${screenName}`);
}

/** Track custom event */
export async function trackEvent(
  name: string,
  params?: Record<string, string | number>,
): Promise<void> {
  await logEvent(analyticsInstance, name, params);
}

/** Record error in Crashlytics (for non-fatal JS errors) */
export function recordJSError(error: Error): void {
  recordError(crash, error);
}

/** Add Crashlytics breadcrumb log */
export function addCrashlyticsBreadcrumb(message: string): void {
  crashlyticsLog(crash, message);
}
