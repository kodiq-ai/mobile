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

/** Selection tick — toggle, picker change */
export function hapticSelection() {
  if (Platform.OS === 'web') return;
  ReactNativeHapticFeedback.trigger(HapticFeedbackTypes.selection, options);
}
