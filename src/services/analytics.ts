import * as Sentry from '@sentry/react-native';
import {
  getAnalytics,
  setAnalyticsCollectionEnabled,
  setUserId as setAnalyticsUserId,
  logEvent,
} from '@react-native-firebase/analytics';
import {
  getCrashlytics,
  setCrashlyticsCollectionEnabled,
  setUserId as setCrashlyticsUserId,
} from '@react-native-firebase/crashlytics';

const analyticsInstance = getAnalytics();
const crash = getCrashlytics();

/** Initialize Firebase Analytics + Crashlytics, respecting consent */
export async function initAnalytics(analyticsConsent = true): Promise<void> {
  // Crashlytics is essential — always enabled
  await setCrashlyticsCollectionEnabled(crash, true);
  // Firebase Analytics respects user consent
  await setAnalyticsCollectionEnabled(analyticsInstance, analyticsConsent);
}

/** Update analytics collection based on consent change */
export async function setAnalyticsConsent(enabled: boolean): Promise<void> {
  await setAnalyticsCollectionEnabled(analyticsInstance, enabled);
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
}

/** Track custom event */
export async function trackEvent(
  name: string,
  params?: Record<string, string | number>,
): Promise<void> {
  await logEvent(analyticsInstance, name, params);
}
