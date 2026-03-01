/**
 * Android Notification Channel IDs.
 *
 * Channels are created natively in MainApplication.kt (Android 8+ requirement).
 * These IDs must match the native channel IDs exactly.
 *
 * When sending push from the server, include `android.channelId` in the FCM payload
 * to route notifications to the correct channel.
 */
export const NOTIFICATION_CHANNELS = {
  /** New lessons, modules, content updates */
  LESSONS: 'lessons',
  /** Streak reminders, spaced repetition, daily challenges */
  REMINDERS: 'reminders',
  /** Comments, peer review, feed activity */
  SOCIAL: 'social',
  /** App updates, maintenance */
  SYSTEM: 'system',
} as const;

export type NotificationChannelId =
  (typeof NOTIFICATION_CHANNELS)[keyof typeof NOTIFICATION_CHANNELS];
