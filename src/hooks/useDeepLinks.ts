import {
  getMessaging,
  getInitialNotification,
  onNotificationOpenedApp,
} from '@react-native-firebase/messaging';
import { useCallback, useEffect, useState } from 'react';
import { Linking } from 'react-native';

import { supabase } from '../auth/supabase';

/**
 * Handles deep links from push notifications and OAuth callbacks (kodiq://).
 */
export function useDeepLinks(): { deepLinkUrl: string | null } {
  const [deepLinkUrl, setDeepLinkUrl] = useState<string | null>(null);

  const handleDeepLink = useCallback((url: string) => {
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
              console.error(
                '[DeepLink] Session exchange failed:',
                error.message,
              );
            }
          })
          .catch(err => {
            console.error('[DeepLink] Session exchange error:', err);
          });
      }
      return;
    }

    // Regular deep link (push notification URL)
    const path = url.replace(/^kodiq:\/\//, '/');
    setDeepLinkUrl(path);
  }, []);

  useEffect(() => {
    const messaging = getMessaging();

    // App opened from killed state by notification
    void getInitialNotification(messaging).then(remoteMessage => {
      if (remoteMessage?.data?.url) {
        setDeepLinkUrl(remoteMessage.data.url as string);
      }
    });

    // Background notification tap
    const unsubscribeNotification = onNotificationOpenedApp(
      messaging,
      remoteMessage => {
        if (remoteMessage.data?.url) {
          setDeepLinkUrl(remoteMessage.data.url as string);
        }
      },
    );

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
      linkingSubscription.remove();
    };
  }, [handleDeepLink]);

  return { deepLinkUrl };
}
