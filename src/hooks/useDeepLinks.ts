import {
  getMessaging,
  getInitialNotification,
  onNotificationOpenedApp,
} from '@react-native-firebase/messaging';
import { useCallback, useEffect, useState } from 'react';
import { Linking } from 'react-native';

import { supabase } from '../auth/supabase';
import {
  onForegroundMessage,
  type ToastConfig,
} from '../services/notification-handler';
import { recordNotificationOpened } from '../services/notification-preferences';
import { logger } from '../utils/logger';

const log = logger.child({ module: 'deeplink' });

/**
 * Handles deep links from push notifications and OAuth callbacks (kodiq://).
 * Also manages foreground push notification toast state.
 */
export function useDeepLinks(): {
  deepLinkUrl: string | null;
  toastConfig: ToastConfig | null;
  dismissToast: () => void;
  handleToastPress: () => void;
} {
  const [deepLinkUrl, setDeepLinkUrl] = useState<string | null>(null);
  const [toastConfig, setToastConfig] = useState<ToastConfig | null>(null);

  const handleDeepLink = useCallback((url: string) => {
    // App icon quick actions
    if (url === 'kodiq://ai-mentor') {
      setDeepLinkUrl('__ai_mentor__');
      return;
    }
    if (url === 'kodiq://continue') {
      setDeepLinkUrl('/dashboard');
      return;
    }

    // OAuth callback: kodiq://auth/callback?code=xxx
    if (url.startsWith('kodiq://auth/callback')) {
      // new URL() doesn't support custom schemes — parse query string manually
      const queryString = url.split('?')[1] ?? '';
      const params = new URLSearchParams(queryString);
      const code = params.get('code');
      if (code) {
        supabase.auth
          .exchangeCodeForSession(code)
          .then(({ error }) => {
            if (error) {
              log.error({ err: error.message }, 'Session exchange failed');
            }
          })
          .catch((err: unknown) => {
            log.error({ err }, 'Session exchange error');
          });
      }
      return;
    }

    // Regular deep link (push notification URL)
    const path = url.replace(/^kodiq:\/\//, '/');
    setDeepLinkUrl(path);
  }, []);

  const dismissToast = useCallback(() => {
    setToastConfig(null);
  }, []);

  const handleToastPress = useCallback(() => {
    if (toastConfig?.data?.url) {
      setDeepLinkUrl(toastConfig.data.url);
    }
    setToastConfig(null);
  }, [toastConfig]);

  useEffect(() => {
    const messaging = getMessaging();

    // App opened from killed state by notification
    void getInitialNotification(messaging).then(remoteMessage => {
      if (remoteMessage?.data?.url) {
        void recordNotificationOpened();
        setDeepLinkUrl(remoteMessage.data.url as string);
      }
    });

    // Background notification tap
    const unsubscribeNotification = onNotificationOpenedApp(
      messaging,
      remoteMessage => {
        if (remoteMessage.data?.url) {
          void recordNotificationOpened();
          setDeepLinkUrl(remoteMessage.data.url as string);
        }
      },
    );

    // Foreground push notifications — show in-app toast
    const unsubForeground = onForegroundMessage(config => {
      setToastConfig(config);
    });

    // Handle kodiq:// deep links (OAuth callback + push)
    const linkingSubscription = Linking.addEventListener('url', event => {
      handleDeepLink(event.url);
    });

    // Check if app was opened with a URL (cold start)
    void Linking.getInitialURL().then(url => {
      if (url) handleDeepLink(url);
    });

    return () => {
      unsubscribeNotification();
      unsubForeground();
      linkingSubscription.remove();
    };
  }, [handleDeepLink]);

  return { deepLinkUrl, toastConfig, dismissToast, handleToastPress };
}
