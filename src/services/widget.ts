import { NativeModules, Platform } from 'react-native';

interface StreakWidgetModule {
  updateStreak(streak: number, challengeDone: boolean): Promise<boolean>;
}

const { StreakWidget } = NativeModules as {
  StreakWidget?: StreakWidgetModule;
};

/**
 * Update the home screen widget with current streak data.
 * Android: SharedPreferences + AppWidgetManager
 * iOS: UserDefaults (App Group) + WidgetCenter.reloadAllTimelines()
 * Safe to call on any platform — noop if native module unavailable.
 */
export async function updateStreakWidget(
  streak: number,
  challengeDone: boolean,
): Promise<void> {
  if (StreakWidget) {
    await StreakWidget.updateStreak(streak, challengeDone);
  }
}
