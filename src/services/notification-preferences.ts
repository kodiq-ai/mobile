import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFS_KEY = '@kodiq/notification_prefs';

export type NotificationFrequency = 'normal' | 'reduced' | 'minimal';

interface NotificationPrefs {
  received: number;
  opened: number;
  frequency: NotificationFrequency;
  lastSyncAt: number;
}

async function getPrefs(): Promise<NotificationPrefs> {
  try {
    const raw = await AsyncStorage.getItem(PREFS_KEY);
    if (raw) return JSON.parse(raw) as NotificationPrefs;
  } catch {
    // Corrupted data — reset
  }
  return { received: 0, opened: 0, frequency: 'normal', lastSyncAt: 0 };
}

async function setPrefs(prefs: NotificationPrefs): Promise<void> {
  await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

function computeFrequency(
  received: number,
  opened: number,
): NotificationFrequency {
  if (received < 3) return 'normal';
  const ignored = received - opened;
  if (ignored >= 6) return 'minimal';
  if (ignored >= 3) return 'reduced';
  return 'normal';
}

/** Call when a push notification is received in foreground */
export async function recordNotificationReceived(): Promise<void> {
  const prefs = await getPrefs();
  prefs.received += 1;
  prefs.frequency = computeFrequency(prefs.received, prefs.opened);
  await setPrefs(prefs);
}

/** Call when user opens/taps a notification */
export async function recordNotificationOpened(): Promise<void> {
  const prefs = await getPrefs();
  prefs.opened += 1;
  prefs.frequency = computeFrequency(prefs.received, prefs.opened);
  await setPrefs(prefs);
}

/** Get current notification frequency preference */
export async function getNotificationFrequency(): Promise<NotificationFrequency> {
  const prefs = await getPrefs();
  return prefs.frequency;
}

/** Reset counters (e.g., monthly) */
export async function resetNotificationCounters(): Promise<void> {
  const prefs = await getPrefs();
  prefs.received = 0;
  prefs.opened = 0;
  prefs.frequency = 'normal';
  await setPrefs(prefs);
}
