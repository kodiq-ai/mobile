import * as Sentry from '@sentry/react-native';
import analytics from '@react-native-firebase/analytics';
import crashlytics from '@react-native-firebase/crashlytics';

/** Initialize Firebase Analytics + Crashlytics, respecting consent */
export async function initAnalytics(analyticsConsent = true): Promise<void> {
  // Crashlytics is essential — always enabled
  await crashlytics().setCrashlyticsCollectionEnabled(true);
  // Firebase Analytics respects user consent
  await analytics().setAnalyticsCollectionEnabled(analyticsConsent);
}

/** Update analytics collection based on consent change */
export async function setAnalyticsConsent(enabled: boolean): Promise<void> {
  await analytics().setAnalyticsCollectionEnabled(enabled);
}

/** Set user ID for Analytics, Crashlytics, and Sentry */
export async function setAnalyticsUser(userId: string): Promise<void> {
  Sentry.setUser({ id: userId });
  await Promise.all([
    analytics().setUserId(userId),
    crashlytics().setUserId(userId),
  ]);
}

/** Clear user on logout */
export async function clearAnalyticsUser(): Promise<void> {
  Sentry.setUser(null);
  await Promise.all([
    analytics().setUserId(null),
    crashlytics().setUserId(''),
  ]);
}

/** Track screen view */
export async function trackScreen(screenName: string): Promise<void> {
  await analytics().logScreenView({
    screen_name: screenName,
    screen_class: screenName,
  });
}

/** Track custom event */
export async function trackEvent(
  name: string,
  params?: Record<string, string | number>,
): Promise<void> {
  await analytics().logEvent(name, params);
}
