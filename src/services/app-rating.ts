/**
 * In-app rating prompt using Google Play In-App Review API (Android)
 * with session gating, cooldown, and store URL fallback.
 */
import { NativeModules, Platform, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RATING_KEY = '@kodiq/rating';
const MAX_NATIVE_PROMPTS = 3;
const COOLDOWN_MS = 90 * 24 * 60 * 60 * 1000; // 90 days
const MIN_SESSIONS = 5;

interface RatingState {
  promptCount: number;
  lastPromptAt: number;
  sessionCount: number;
}

async function getRatingState(): Promise<RatingState> {
  try {
    const raw = await AsyncStorage.getItem(RATING_KEY);
    if (raw) return JSON.parse(raw) as RatingState;
  } catch {}
  return { promptCount: 0, lastPromptAt: 0, sessionCount: 0 };
}

async function setRatingState(state: RatingState): Promise<void> {
  await AsyncStorage.setItem(RATING_KEY, JSON.stringify(state));
}

export async function recordSession(): Promise<void> {
  const state = await getRatingState();
  state.sessionCount += 1;
  await setRatingState(state);
}

export async function promptAppRating(_event?: string): Promise<void> {
  const state = await getRatingState();

  // Not enough sessions
  if (state.sessionCount < MIN_SESSIONS) return;

  // Max prompts reached — use cooldown
  if (state.promptCount >= MAX_NATIVE_PROMPTS) {
    const elapsed = Date.now() - state.lastPromptAt;
    if (elapsed < COOLDOWN_MS) return;
  }

  // Try native API first
  const InAppReview = NativeModules.InAppReview as
    | { requestReview: () => Promise<boolean> }
    | undefined;
  if (Platform.OS === 'android' && InAppReview?.requestReview) {
    try {
      await InAppReview.requestReview();
      state.promptCount += 1;
      state.lastPromptAt = Date.now();
      await setRatingState(state);
      return;
    } catch {
      // Fall through to store URL
    }
  }

  // Fallback: open store URL
  const storeUrl = Platform.select({
    android: 'https://play.google.com/store/apps/details?id=ai.kodiq',
    ios: 'https://apps.apple.com/app/kodiq/id000000000',
  });
  if (storeUrl) {
    state.promptCount += 1;
    state.lastPromptAt = Date.now();
    await setRatingState(state);
    void Linking.openURL(storeUrl);
  }
}
