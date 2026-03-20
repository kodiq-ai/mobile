import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

/** Light tap — tab press, menu item tap */
export function hapticLight() {
  if (Platform.OS === 'web') return;
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

/** Medium impact — drawer open, significant action */
export function hapticMedium() {
  if (Platform.OS === 'web') return;
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}

/** Success notification — milestone achieved, task completed */
export function hapticSuccess() {
  if (Platform.OS === 'web') return;
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

/** Error notification — auth failure, biometric rejection */
export function hapticError() {
  if (Platform.OS === 'web') return;
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
}

/** Selection tick — toggle, picker change */
export function hapticSelection() {
  if (Platform.OS === 'web') return;
  void Haptics.selectionAsync();
}
