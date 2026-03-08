import Foundation
import WidgetKit

@objc(StreakWidget)
class StreakWidgetModule: NSObject {

  private let suiteName = "group.ai.kodiq"

  @objc
  func updateStreak(_ streak: Int, challengeDone: Bool, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    let defaults = UserDefaults(suiteName: suiteName)
    defaults?.set(streak, forKey: "streak_count")
    defaults?.set(challengeDone, forKey: "challenge_done")

    reloadWidgets()
    resolve(true)
  }

  @objc
  func updateExtended(_ streak: Int, done: Bool, progress: Double, lessonTitle: NSString?) {
    let defaults = UserDefaults(suiteName: suiteName)
    defaults?.set(streak, forKey: "streak_count")
    defaults?.set(done, forKey: "challenge_done")
    defaults?.set(progress, forKey: "progress")
    if let title = lessonTitle as String? {
      defaults?.set(title, forKey: "lesson_title")
    } else {
      defaults?.removeObject(forKey: "lesson_title")
    }

    reloadWidgets()
  }

  private func reloadWidgets() {
    if #available(iOS 14.0, *) {
      WidgetCenter.shared.reloadAllTimelines()
    }
  }

  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }
}
