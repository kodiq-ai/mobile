import { NativeModules } from 'react-native';

export interface ReminderSchedule {
  hour: number;
  minute: number;
}

const ReminderScheduler = NativeModules.ReminderScheduler as
  | {
      scheduleDaily: (hour: number, minute: number) => Promise<boolean>;
      cancel: () => Promise<boolean>;
      getSchedule: () => Promise<ReminderSchedule | null>;
    }
  | undefined;

export const scheduleDailyReminder = async (
  hour: number,
  minute: number,
): Promise<boolean> => {
  if (!ReminderScheduler) return false;
  return ReminderScheduler.scheduleDaily(hour, minute);
};

export const cancelReminder = async (): Promise<boolean> => {
  if (!ReminderScheduler) return false;
  return ReminderScheduler.cancel();
};

export const getReminderSchedule =
  async (): Promise<ReminderSchedule | null> => {
    if (!ReminderScheduler) return null;
    return ReminderScheduler.getSchedule();
  };

export const isReminderSupported = (): boolean => {
  return ReminderScheduler != null;
};
