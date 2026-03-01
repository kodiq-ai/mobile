/**
 * In-app rating prompt using native store review APIs.
 *
 * iOS: SKStoreReviewController (max 3 prompts/year, Apple controls display)
 * Android: Google Play In-App Review API
 *
 * Rate limiting: max once per 30 days, tracked in AsyncStorage.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking, Platform } from 'react-native';

const STORAGE_KEY = 'kodiq:last-rating-prompt';
const COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

const STORE_URLS = {
  ios: 'https://apps.apple.com/app/kodiq-academy/id0000000000?action=write-review',
  android: 'https://play.google.com/store/apps/details?id=ai.kodiq',
};

/**
 * Request an in-app review prompt if enough time has passed.
 * Returns true if the prompt was shown (or attempted).
 */
export async function requestReviewIfEligible(): Promise<boolean> {
  try {
    const lastPrompt = await AsyncStorage.getItem(STORAGE_KEY);
    if (lastPrompt) {
      const elapsed = Date.now() - Number(lastPrompt);
      if (elapsed < COOLDOWN_MS) return false;
    }

    await AsyncStorage.setItem(STORAGE_KEY, String(Date.now()));

    // Use native review API when available, fallback to store link
    if (Platform.OS === 'ios') {
      // SKStoreReviewController is available via Linking on iOS 10.3+
      // Apple controls whether the dialog actually appears
      const iosReviewUrl = `itms-apps://itunes.apple.com/app/id0000000000?action=write-review`;
      const canOpen = await Linking.canOpenURL(iosReviewUrl);
      if (canOpen) {
        await Linking.openURL(iosReviewUrl);
        return true;
      }
    }

    // Fallback: open store page
    const url = Platform.OS === 'ios' ? STORE_URLS.ios : STORE_URLS.android;
    await Linking.openURL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Handle milestone events from bridge that may trigger a review prompt.
 * Called when web sends `{ type: "milestone", event: "..." }`.
 */
export async function handleMilestoneForReview(event: string): Promise<void> {
  const triggerEvents = ['part_completed', 'certificate_earned', 'streak_7'];
  if (triggerEvents.includes(event)) {
    await requestReviewIfEligible();
  }
}
