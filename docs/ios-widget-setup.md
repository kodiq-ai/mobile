# iOS WidgetKit Extension — Setup Guide

> Эти шаги выполняются вручную в Xcode, т.к. `.xcodeproj` нельзя безопасно модифицировать автоматически.

## 1. Add Widget Extension Target

1. Open `ios/KodiqAcademy.xcodeproj` in Xcode
2. File → New → Target → "Widget Extension"
3. Product Name: `StreakWidget`
4. Bundle Identifier: `ai.kodiq.StreakWidget`
5. **Uncheck** "Include Configuration App Intent" (we use StaticConfiguration)
6. Finish → Activate scheme

## 2. Replace generated files

1. Delete the auto-generated Swift files in `StreakWidget/` group
2. Add existing files from `ios/StreakWidget/`:
   - `StreakWidget.swift`
   - `Info.plist`

## 3. App Group

1. Select **KodiqAcademy** target → Signing & Capabilities → + Capability → App Groups
2. Add group: `group.ai.kodiq`
3. Select **StreakWidget** target → same → add `group.ai.kodiq`

## 4. Add Bridge files to main target

1. Ensure these files are in the KodiqAcademy target (not StreakWidget):
   - `ios/KodiqAcademy/StreakWidgetModule.swift`
   - `ios/KodiqAcademy/StreakWidgetBridge.m`
2. If no bridging header exists, Xcode will prompt to create one

## 5. Deployment target

- StreakWidget minimum deployment: iOS 17.0 (WidgetKit `containerBackground`)
- Main app: iOS 15.0 (unchanged)

## 6. Build & Test

```bash
cd ios && pod install
# Build from Xcode or:
npx react-native run-ios
```

Add widget via: Home Screen → Long press → "+" → Search "Kodiq Streak"
