import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';

const LAST_SEEN_VERSION_KEY = 'last_seen_version';

// Get app version from native module or package.json fallback
function getAppVersion(): string {
  try {
    // React Native exposes version via PlatformConstants
    const constants =
      Platform.OS === 'android'
        ? (Platform as any).constants
        : (Platform as any).constants;
    return constants?.reactNativeVersion
      ? `${constants.reactNativeVersion.major}.${constants.reactNativeVersion.minor}.${constants.reactNativeVersion.patch}`
      : '1.0.0';
  } catch {
    return '1.0.0';
  }
}

export interface WhatsNewEntry {
  version: string;
  title: string;
  items: string[];
}

// Hardcoded changelog — update with each release
const CHANGELOG: WhatsNewEntry[] = [
  {
    version: '1.1.0',
    title: 'Нативная навигация',
    items: [
      'Нативные табы внизу экрана',
      'Header с логотипом и уведомлениями',
      'Боковое меню (бургер)',
      'Биометрическая разблокировка',
      'Онбординг для новых пользователей',
      'Тактильный отклик при навигации',
    ],
  },
];

interface UseWhatsNewResult {
  /** Whether to show the What's New modal */
  shouldShow: boolean;
  /** Entries to display (newest first) */
  entries: WhatsNewEntry[];
  /** Dismiss and save current version */
  dismiss: () => Promise<void>;
}

export function useWhatsNew(): UseWhatsNewResult {
  const [shouldShow, setShouldShow] = useState(false);
  const [entries, setEntries] = useState<WhatsNewEntry[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const lastSeen = await AsyncStorage.getItem(LAST_SEEN_VERSION_KEY);
        // Find entries newer than last seen version
        const newEntries = lastSeen
          ? CHANGELOG.filter((e) => compareVersions(e.version, lastSeen) > 0)
          : [];

        if (newEntries.length > 0) {
          setEntries(newEntries);
          setShouldShow(true);
        }
      } catch {
        // Ignore
      }
    })();
  }, []);

  const dismiss = useCallback(async () => {
    setShouldShow(false);
    const currentVersion = CHANGELOG[0]?.version ?? getAppVersion();
    await AsyncStorage.setItem(LAST_SEEN_VERSION_KEY, currentVersion);
  }, []);

  return { shouldShow, entries, dismiss };
}

/** Compare semver strings: returns >0 if a>b, <0 if a<b, 0 if equal */
function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const na = pa[i] ?? 0;
    const nb = pb[i] ?? 0;
    if (na !== nb) return na - nb;
  }
  return 0;
}
