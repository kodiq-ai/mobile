import UserNotifications

@objc(ReminderScheduler)
class ReminderSchedulerModule: NSObject {

  private static let requestIdentifier = "kodiq_daily_reminder"
  private static let defaultsKeyHour = "reminder_hour"
  private static let defaultsKeyMinute = "reminder_minute"
  private static let defaultsKeyEnabled = "reminder_enabled"
  private static let streakKey = "current_streak"
  private static let streakSuite = "kodiq_streak_data"

  // MARK: - scheduleDaily

  @objc
  func scheduleDaily(_ hour: Int, minute: Int, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    let center = UNUserNotificationCenter.current()

    // Request permission first (no-op if already granted)
    center.requestAuthorization(options: [.alert, .sound, .badge]) { granted, error in
      if let error = error {
        reject("PERMISSION_ERROR", error.localizedDescription, error)
        return
      }
      guard granted else {
        reject("PERMISSION_DENIED", "Notification permission denied", nil)
        return
      }

      // Remove existing reminder before scheduling new one
      center.removePendingNotificationRequests(withIdentifiers: [ReminderSchedulerModule.requestIdentifier])

      let content = UNMutableNotificationContent()
      content.title = "Время учиться! 📚"
      content.body = self.buildNotificationBody()
      content.sound = .default

      var dateComponents = DateComponents()
      dateComponents.hour = hour
      dateComponents.minute = minute

      let trigger = UNCalendarNotificationTrigger(dateMatching: dateComponents, repeats: true)
      let request = UNNotificationRequest(
        identifier: ReminderSchedulerModule.requestIdentifier,
        content: content,
        trigger: trigger
      )

      center.add(request) { error in
        if let error = error {
          reject("SCHEDULE_ERROR", error.localizedDescription, error)
          return
        }

        // Save to UserDefaults
        UserDefaults.standard.set(hour, forKey: ReminderSchedulerModule.defaultsKeyHour)
        UserDefaults.standard.set(minute, forKey: ReminderSchedulerModule.defaultsKeyMinute)
        UserDefaults.standard.set(true, forKey: ReminderSchedulerModule.defaultsKeyEnabled)

        resolve(true)
      }
    }
  }

  // MARK: - cancel

  @objc
  func cancel(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    UNUserNotificationCenter.current()
      .removePendingNotificationRequests(withIdentifiers: [ReminderSchedulerModule.requestIdentifier])

    UserDefaults.standard.set(false, forKey: ReminderSchedulerModule.defaultsKeyEnabled)
    UserDefaults.standard.removeObject(forKey: ReminderSchedulerModule.defaultsKeyHour)
    UserDefaults.standard.removeObject(forKey: ReminderSchedulerModule.defaultsKeyMinute)

    resolve(true)
  }

  // MARK: - getSchedule

  @objc
  func getSchedule(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    let enabled = UserDefaults.standard.bool(forKey: ReminderSchedulerModule.defaultsKeyEnabled)
    guard enabled else {
      resolve(NSNull())
      return
    }

    let hour = UserDefaults.standard.integer(forKey: ReminderSchedulerModule.defaultsKeyHour)
    let minute = UserDefaults.standard.integer(forKey: ReminderSchedulerModule.defaultsKeyMinute)

    resolve(["hour": hour, "minute": minute])
  }

  // MARK: - Helpers

  private func buildNotificationBody() -> String {
    let defaults = UserDefaults(suiteName: ReminderSchedulerModule.streakSuite)
    let streak = defaults?.integer(forKey: ReminderSchedulerModule.streakKey) ?? 0

    switch streak {
    case 7...:
      return "Серия \(streak) дней! Не останавливайся 🔥"
    case 1...:
      return "Серия \(streak) дней. Продолжай учиться!"
    default:
      return "Начни сегодня и построй серию занятий!"
    }
  }

  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }
}
