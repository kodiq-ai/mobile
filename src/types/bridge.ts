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
  | { type: 'theme'; mode: 'dark' | 'light' };

/** Messages sent from Native to WebView (web) */
export type NativeToWebMessage =
  | { type: 'connectivity'; online: boolean }
  | { type: 'push_token'; token: string };

/** Global declaration injected into WebView */
declare global {
  interface Window {
    __KODIQ_NATIVE__?: boolean;
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
  }
}
