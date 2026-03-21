import * as Sentry from '@sentry/react-native';
import {
  getMessaging,
  setBackgroundMessageHandler,
} from '@react-native-firebase/messaging';
import { registerRootComponent } from 'expo';

import App from './App';
import { SENTRY_DSN } from './src/config';

// Initialize Sentry before anything else
Sentry.init({
  dsn: SENTRY_DSN,
  release: `kodiq-mobile@${require('./package.json').version}`,
  tracesSampleRate: 0.2,
  profilesSampleRate: 0.1,
  environment: __DEV__ ? 'development' : 'production',
  enabled: !__DEV__,
  sendDefaultPii: true,
  replaysOnErrorSampleRate: 1.0,
});

// Forward unhandled JS errors to Firebase Crashlytics
import {
  getCrashlytics,
  recordError,
} from '@react-native-firebase/crashlytics';
const defaultHandler = ErrorUtils.getGlobalHandler();
ErrorUtils.setGlobalHandler((error, isFatal) => {
  recordError(getCrashlytics(), error);
  defaultHandler(error, isFatal);
});

// Handle push notifications received while app is in background/quit
setBackgroundMessageHandler(getMessaging(), async _remoteMessage => {
  // Notification display is handled automatically by FCM.
  // This handler is for data-only messages or custom processing.
});

registerRootComponent(Sentry.wrap(App));
