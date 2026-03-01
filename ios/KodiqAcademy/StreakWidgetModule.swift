import Foundation
import WidgetKit

@objc(StreakWidget)
class StreakWidgetModule: NSObject {

  @objc
  func updateStreak(_ streak: Int, challengeDone: Bool, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    let defaults = UserDefaults(suiteName: "group.ai.kodiq")
    defaults?.set(streak, forKey: "streak_count")
    defaults?.set(challengeDone, forKey: "challenge_done")

    if #available(iOS 14.0, *) {
      WidgetCenter.shared.reloadAllTimelines()
    }

    resolve(true)
  }

  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }
}
