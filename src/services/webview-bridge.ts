import { Platform, Share } from 'react-native';

import { handleMilestoneForReview } from './app-rating';
import { updateStreakWidget } from './widget';
import type { WebToNativeMessage } from '../types/bridge';
import { hapticSuccess } from '../utils/haptics';

export interface BridgeCallbacks {
  onSignOut: () => void;
  onPageMeta: (title: string, path: string, canGoBack: boolean) => void;
  onNotificationCount: (count: number) => void;
  onContentLoaded: () => void;
}

/**
 * Process a WebView bridge message and dispatch to the appropriate callback.
 * Handles sign-out, page metadata, notifications, sharing, milestones, and streaks.
 */
export function processWebViewMessage(
  msg: WebToNativeMessage,
  cb: BridgeCallbacks,
  contentLoaded: boolean,
): void {
  switch (msg.type) {
    case 'logout':
      cb.onSignOut();
      break;
    case 'auth_state':
      if (!msg.authenticated) cb.onSignOut();
      break;
    case 'page_meta':
      cb.onPageMeta(msg.title, msg.path, msg.canGoBack);
      if (!contentLoaded) cb.onContentLoaded();
      break;
    case 'notification_count':
      cb.onNotificationCount(msg.count);
      break;
    case 'share':
      Share.share({
        title: msg.title,
        message: [msg.text, msg.url].filter(Boolean).join('\n'),
        ...(Platform.OS === 'ios' && msg.url ? { url: msg.url } : {}),
      }).catch(() => {});
      break;
    case 'milestone':
      hapticSuccess();
      void handleMilestoneForReview(msg.event);
      break;
    case 'streak_update':
      void updateStreakWidget(msg.streak, msg.challengeDone);
      break;
    case 'navigation':
      break;
  }
}
