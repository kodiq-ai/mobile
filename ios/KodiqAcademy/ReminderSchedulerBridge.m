#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(ReminderScheduler, NSObject)

RCT_EXTERN_METHOD(scheduleDaily:(int)hour
                  minute:(int)minute
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(cancel:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getSchedule:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

@end
