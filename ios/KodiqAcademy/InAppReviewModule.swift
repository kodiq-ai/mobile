import StoreKit

@objc(InAppReview)
class InAppReviewModule: NSObject {

  @objc
  func requestReview(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    DispatchQueue.main.async {
      guard let scene = UIApplication.shared.connectedScenes
        .compactMap({ $0 as? UIWindowScene })
        .first(where: { $0.activationState == .foregroundActive })
      else {
        reject("NO_SCENE", "No active window scene", nil)
        return
      }

      if #available(iOS 16.0, *) {
        AppStore.requestReview(in: scene)
      } else if #available(iOS 14.0, *) {
        SKStoreReviewController.requestReview(in: scene)
      }

      // Apple doesn't tell us if user actually reviewed
      resolve(true)
    }
  }

  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }
}
