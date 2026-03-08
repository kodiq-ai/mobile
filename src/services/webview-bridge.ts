import { Platform, Share } from 'react-native';

import { promptAppRating } from './app-rating';
import { updateExtendedWidget, updateStreakWidget } from './widget';
import type { WebToNativeMessage } from '../types/bridge';
import { hapticCelebration, hapticSuccess } from '../utils/haptics';
import { logger } from '../utils/logger';

const log = logger.child({ module: 'bridge' });

export interface BadgeInfo {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface BridgeCallbacks {
  onSignOut: () => void;
  onPageMeta: (title: string, path: string, canGoBack: boolean) => void;
  onNotificationCount: (count: number) => void;
  onContentLoaded: () => void;
  onCelebration?: () => void;
  onStreakUpdate?: (streak: number, progress?: number, target?: number) => void;
  onXPUpdate?: (
    xp: number,
    level: number,
    xpToNextLevel: number,
    badge?: BadgeInfo,
  ) => void;
  onCacheLesson?: (lessonId: string, html: string, title: string) => void;
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
      if (
        [
          'certificate_earned',
          'streak_7',
          'streak_14',
          'module_completed',
        ].includes(msg.event)
      ) {
        hapticCelebration();
        cb.onCelebration?.();
      } else {
        hapticSuccess();
      }
      void promptAppRating(msg.event);
      break;
    case 'streak_update':
      log.debug({ streak: msg.streak }, 'Streak updated');
      void updateStreakWidget(msg.streak, msg.challengeDone);
      if (msg.dailyGoalProgress != null && msg.dailyGoalTarget != null) {
        updateExtendedWidget(
          msg.streak,
          msg.challengeDone,
          Math.round((msg.dailyGoalProgress / msg.dailyGoalTarget) * 100),
          msg.nextLessonTitle ?? null,
        );
      }
      cb.onStreakUpdate?.(
        msg.streak,
        msg.dailyGoalProgress,
        msg.dailyGoalTarget,
      );
      break;
    case 'xp_update':
      log.debug({ xp: msg.xp, level: msg.level }, 'XP updated');
      cb.onXPUpdate?.(msg.xp, msg.level, msg.xpToNextLevel, msg.badge);
      break;
    case 'cache_lesson':
      log.debug({ lessonId: msg.lessonId }, 'Lesson cache request');
      cb.onCacheLesson?.(msg.lessonId, msg.html, msg.title);
      break;
    case 'navigation':
      break;
  }
}
