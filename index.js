import messaging from '@react-native-firebase/messaging';
import { AppRegistry } from 'react-native';

import App from './App';
import { name as appName } from './app.json';

// Handle push notifications received while app is in background/quit
messaging().setBackgroundMessageHandler(async (_remoteMessage) => {
  // Notification display is handled automatically by FCM.
  // This handler is for data-only messages or custom processing.
});

AppRegistry.registerComponent(appName, () => App);
