import * as Sentry from '@sentry/react-native';
import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
import { AppRegistry } from 'react-native';

import App from './App';
import { name as appName } from './app.json';
import { SENTRY_DSN } from './src/config';

// Initialize Sentry before anything else
Sentry.init({
  dsn: SENTRY_DSN,
  release: `kodiq-mobile@${require('./package.json').version}`,
  tracesSampleRate: 0.2,
  environment: __DEV__ ? 'development' : 'production',
  enabled: !__DEV__,
});

// Handle push notifications received while app is in background/quit
setBackgroundMessageHandler(getMessaging(), async (_remoteMessage) => {
  // Notification display is handled automatically by FCM.
  // This handler is for data-only messages or custom processing.
});

AppRegistry.registerComponent(appName, () => Sentry.wrap(App));
