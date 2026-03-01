import AsyncStorage from '@react-native-async-storage/async-storage';

const CONSENT_KEY = 'privacy_consent';

export interface ConsentChoices {
  /** Essential: auth, crash reporting — always true */
  essential: true;
  /** Analytics: PostHog, Firebase Analytics */
  analytics: boolean;
}

const DEFAULT_CHOICES: ConsentChoices = {
  essential: true,
  analytics: false,
};

/** Load saved consent choices. Returns null if never set (first launch). */
export async function loadConsent(): Promise<ConsentChoices | null> {
  try {
    const raw = await AsyncStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ConsentChoices;
  } catch {
    return null;
  }
}

/** Save consent choices */
export async function saveConsent(choices: ConsentChoices): Promise<void> {
  await AsyncStorage.setItem(CONSENT_KEY, JSON.stringify(choices));
}

/** Get default choices (all off except essential) */
export function getDefaultChoices(): ConsentChoices {
  return { ...DEFAULT_CHOICES };
}
