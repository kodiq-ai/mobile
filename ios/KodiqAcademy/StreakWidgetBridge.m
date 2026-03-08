#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(StreakWidget, NSObject)

RCT_EXTERN_METHOD(updateStreak:(int)streak
                  challengeDone:(BOOL)challengeDone
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(updateExtended:(int)streak
                  done:(BOOL)done
                  progress:(double)progress
                  lessonTitle:(NSString *)lessonTitle)

@end
