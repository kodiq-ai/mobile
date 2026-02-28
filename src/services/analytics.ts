import * as Sentry from '@sentry/react-native';
import analytics from '@react-native-firebase/analytics';
import crashlytics from '@react-native-firebase/crashlytics';

/** Initialize Firebase Analytics + Crashlytics */
export async function initAnalytics(): Promise<void> {
  await crashlytics().setCrashlyticsCollectionEnabled(true);
  await analytics().setAnalyticsCollectionEnabled(true);
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
