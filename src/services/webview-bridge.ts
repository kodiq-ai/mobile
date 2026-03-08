import { Platform, Share } from 'react-native';

import { handleMilestoneForReview } from './app-rating';
import { updateStreakWidget } from './widget';
import type { WebToNativeMessage } from '../types/bridge';
import { hapticSuccess } from '../utils/haptics';
import { logger } from '../utils/logger';

const log = logger.child({ module: 'bridge' });

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
  log.debug({ type: msg.type }, 'Message received');

  switch (msg.type) {
    case 'logout':
      log.info('Sign-out requested by web');
      cb.onSignOut();
      break;
    case 'auth_state':
      if (!msg.authenticated) {
        log.info('Auth state: unauthenticated');
        cb.onSignOut();
      }
      break;
    case 'page_meta':
      log.debug({ path: msg.path, title: msg.title }, 'Page meta');
      cb.onPageMeta(msg.title, msg.path, msg.canGoBack);
      if (!contentLoaded) cb.onContentLoaded();
      break;
    case 'notification_count':
      cb.onNotificationCount(msg.count);
      break;
    case 'share':
      log.info({ title: msg.title }, 'Share requested');
      Share.share({
        title: msg.title,
        message: [msg.text, msg.url].filter(Boolean).join('\n'),
        ...(Platform.OS === 'ios' && msg.url ? { url: msg.url } : {}),
      }).catch(() => {});
      break;
    case 'milestone':
      log.info({ event: msg.event }, 'Milestone achieved');
      hapticSuccess();
      void handleMilestoneForReview(msg.event);
      break;
    case 'streak_update':
      log.debug({ streak: msg.streak }, 'Streak updated');
      void updateStreakWidget(msg.streak, msg.challengeDone);
      break;
    case 'navigation':
      break;
  }
}
