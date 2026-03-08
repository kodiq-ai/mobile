#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(InAppReview, NSObject)

RCT_EXTERN_METHOD(requestReview:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

@end
