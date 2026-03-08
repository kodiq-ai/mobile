import { Platform } from 'react-native';
import ReactNativeHapticFeedback, {
  HapticFeedbackTypes,
} from 'react-native-haptic-feedback';

const options = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

/** Light tap — tab press, menu item tap */
export function hapticLight() {
  if (Platform.OS === 'web') return;
  ReactNativeHapticFeedback.trigger(HapticFeedbackTypes.impactLight, options);
}

/** Medium impact — drawer open, significant action */
export function hapticMedium() {
  if (Platform.OS === 'web') return;
  ReactNativeHapticFeedback.trigger(HapticFeedbackTypes.impactMedium, options);
}

/** Success notification — milestone achieved, task completed */
export function hapticSuccess() {
  if (Platform.OS === 'web') return;
  ReactNativeHapticFeedback.trigger(
    HapticFeedbackTypes.notificationSuccess,
    options,
  );
}

/** Error notification — auth failure, biometric rejection */
export function hapticError() {
  if (Platform.OS === 'web') return;
  ReactNativeHapticFeedback.trigger(
    HapticFeedbackTypes.notificationError,
    options,
  );
}

/** Selection tick — toggle, picker change */
export function hapticSelection() {
  if (Platform.OS === 'web') return;
  ReactNativeHapticFeedback.trigger(HapticFeedbackTypes.selection, options);
}

/** Streak milestone — medium impact followed by success notification */
export function hapticStreakMilestone() {
  if (Platform.OS === 'web') return;
  ReactNativeHapticFeedback.trigger(HapticFeedbackTypes.impactMedium, options);
  setTimeout(() => {
    ReactNativeHapticFeedback.trigger(
      HapticFeedbackTypes.notificationSuccess,
      options,
    );
  }, 100);
}

/** Celebration — escalating impact pattern for achievements */
export function hapticCelebration() {
  if (Platform.OS === 'web') return;
  ReactNativeHapticFeedback.trigger(HapticFeedbackTypes.impactLight, options);
  setTimeout(() => {
    ReactNativeHapticFeedback.trigger(
      HapticFeedbackTypes.impactMedium,
      options,
    );
  }, 60);
  setTimeout(() => {
    ReactNativeHapticFeedback.trigger(
      HapticFeedbackTypes.notificationSuccess,
      options,
    );
  }, 120);
}

/** Error pattern — error notification followed by warning */
export function hapticErrorPattern() {
  if (Platform.OS === 'web') return;
  ReactNativeHapticFeedback.trigger(
    HapticFeedbackTypes.notificationError,
    options,
  );
  setTimeout(() => {
    ReactNativeHapticFeedback.trigger(
      HapticFeedbackTypes.notificationWarning,
      options,
    );
  }, 150);
}
