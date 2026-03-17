# Kodiq Mobile

> React Native WebView wrapper for kodiq.ai/academy.

## Tech Stack

- **React Native** 0.84.1 (New Architecture disabled)
- **WebView** (`react-native-webview`) — renders kodiq.ai/academy
- **Auth**: Supabase (OAuth + email), session injected into WebView via localStorage + cookies
- **Push**: Firebase Cloud Messaging (`@react-native-firebase/messaging`)
- **Analytics**: PostHog (`posthog-react-native`) + Firebase Analytics
- **Package**: `ai.kodiq`

## Architecture

```
App.tsx                          — Root: providers, screen routing, hooks orchestration
├── src/hooks/
│   ├── useConnectivity.ts       — Network state + retry
│   ├── useDeepLinks.ts          — Push notification URLs + OAuth callbacks
│   ├── useSplashFade.ts         — Splash fade-out animation
│   ├── useSessionAnalytics.ts   — Consent, PostHog, user identification
│   ├── useBiometric.ts          — Biometric lock/unlock
│   ├── useForceUpdate.ts        — App version check (force/soft update)
│   ├── useWhatsNew.ts           — What's new modal
│   └── useNavConfig.ts          — Server-driven navigation config
├── src/screens/
│   ├── WebViewScreen.tsx         — Main WebView + native chrome (header, tabs, drawer)
│   ├── LoginScreen.tsx           — Email/password + OAuth
│   ├── ConsentScreen.tsx         — Privacy consent
│   ├── OnboardingScreen.tsx      — First-launch slides
│   └── ...
├── src/services/
│   ├── webview-injection.ts      — Session injection JS builders
│   ├── webview-bridge.ts         — WebView message handler
│   ├── push.ts                   — FCM token registration
│   ├── analytics.ts              — Firebase Analytics wrapper
│   ├── connectivity.ts           — NetInfo wrapper
│   └── consent.ts                — Privacy consent storage
├── src/types/
│   └── bridge.ts                 — WebToNativeMessage / NativeToWebMessage types
└── src/utils/
    ├── auth-headers.ts           — Bearer token header builder
    └── fetch-retry.ts            — Fetch with timeout + exponential backoff
```

## Bridge Protocol

Web ↔ Native communication via `window.ReactNativeWebView.postMessage()`.

**Web → Native** (`WebToNativeMessage`):

- `logout` — user signed out in web
- `auth_state` — auth state change
- `page_meta` — title, path, canGoBack (drives native header/tabs)
- `notification_count` — unread count badge
- `share` — native share sheet
- `milestone` — achievement (triggers haptics + app rating prompt)
- `streak_update` — updates home screen widget

**Native → Web** (`NativeToWebMessage`):

- `navigate` — SPA navigation via Next.js router
- `connectivity` — online/offline state
- `set_locale` — language switch

## Commands

```bash
pnpm android          # Build + run on connected device/emulator
pnpm ios              # Build + run on iOS simulator
pnpm start            # Metro bundler
pnpm lint             # ESLint
pnpm clean            # Gradle clean
```

## Known Issues

- Firebase namespaced API deprecation warnings (migration to modular v22 planned separately)
- No test suite yet
- 5 pre-existing lint errors in SkeletonLoader, NavIcons, OnboardingScreen, widget.ts

## Conventions

- Path aliases: `../` relative imports (no `@/` alias configured)
- All API calls use `fetchWithRetry` with Bearer auth via `buildAuthHeaders()`
- WebView JS injection: pure string functions in `webview-injection.ts`
- Bridge messages: typed union in `types/bridge.ts`
