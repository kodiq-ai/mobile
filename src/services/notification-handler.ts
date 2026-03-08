import { getMessaging, onMessage } from '@react-native-firebase/messaging';

import { recordNotificationReceived } from './notification-preferences';

export interface NotificationData {
  url?: string;
  lesson_title?: string;
  streak_count?: string;
  module_title?: string;
  type?: 'lesson' | 'streak' | 'social' | 'system';
}

export interface ToastConfig {
  title: string;
  body: string;
  data?: NotificationData;
}

type ToastCallback = (config: ToastConfig) => void;

/**
 * Subscribe to foreground FCM messages.
 * Returns unsubscribe function.
 */
export function onForegroundMessage(callback: ToastCallback): () => void {
  const messaging = getMessaging();
  return onMessage(messaging, remoteMessage => {
    const notification = remoteMessage.notification;
    if (!notification) return;

    void recordNotificationReceived();

    callback({
      title: notification.title ?? '',
      body: notification.body ?? '',
      data: remoteMessage.data as unknown as NotificationData,
    });
  });
}
