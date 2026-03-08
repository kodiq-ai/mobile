/**
 * Bridge message types for WebView ↔ Native communication.
 *
 * Web → Native: window.ReactNativeWebView.postMessage(JSON.stringify(msg))
 * Native → Web: webViewRef.injectJavaScript(...)
 */

/** Messages sent from WebView (web) to Native */
export type WebToNativeMessage =
  | { type: 'navigation'; url: string }
  | { type: 'auth_state'; authenticated: boolean }
  | { type: 'theme'; mode: 'dark' | 'light' }
  | { type: 'logout' }
  | { type: 'page_meta'; title: string; path: string; canGoBack: boolean }
  | { type: 'notification_count'; count: number }
  | { type: 'milestone'; event: string }
  | { type: 'share'; title: string; text?: string; url?: string }
  | {
      type: 'streak_update';
      streak: number;
      challengeDone: boolean;
      dailyGoalProgress?: number;
      dailyGoalTarget?: number;
      nextLessonTitle?: string;
    }
  | {
      type: 'xp_update';
      xp: number;
      level: number;
      xpToNextLevel: number;
      badge?: { id: string; name: string; icon: string; description: string };
    }
  | { type: 'cache_lesson'; lessonId: string; html: string; title: string };

/** Messages sent from Native to WebView (web) */
export type NativeToWebMessage =
  | { type: 'connectivity'; online: boolean }
  | { type: 'push_token'; token: string }
  | { type: 'navigate'; path: string }
  | { type: 'set_locale'; locale: 'ru' | 'en' }
  | { type: 'serve_cached'; lessonId: string; html: string };

/** Global declaration injected into WebView */
declare global {
  interface Window {
    __KODIQ_NATIVE__?: boolean;
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
  }
}
