import React, { useEffect, useRef } from 'react';
import {
  Animated,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS } from '../config';
import type { NotificationData } from '../services/notification-handler';
import { hapticLight } from '../utils/haptics';

const AUTO_DISMISS_MS = 4000;
const SWIPE_THRESHOLD = 30;

const TYPE_ICONS: Record<string, string> = {
  lesson: '\u{1F4DA}',
  streak: '\u{1F525}',
  social: '\u{1F4AC}',
  system: '\u{2699}\u{FE0F}',
};

interface ToastBannerProps {
  visible: boolean;
  title: string;
  body: string;
  data?: NotificationData;
  onPress: () => void;
  onDismiss: () => void;
}

export function ToastBanner({
  visible,
  title,
  body,
  data,
  onPress,
  onDismiss,
}: ToastBannerProps) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-120)).current;
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) =>
        gestureState.dy < -SWIPE_THRESHOLD,
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy < -SWIPE_THRESHOLD) {
          animateOut();
        }
      },
    }),
  ).current;

  const animateOut = () => {
    if (dismissTimer.current) {
      clearTimeout(dismissTimer.current);
      dismissTimer.current = null;
    }
    Animated.spring(translateY, {
      toValue: -120,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start(() => onDismiss());
  };

  useEffect(() => {
    if (visible) {
      hapticLight();
      Animated.spring(translateY, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();

      dismissTimer.current = setTimeout(animateOut, AUTO_DISMISS_MS);
    }

    return () => {
      if (dismissTimer.current) {
        clearTimeout(dismissTimer.current);
        dismissTimer.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  if (!visible) return null;

  const icon = TYPE_ICONS[data?.type ?? ''] ?? '\u{1F514}';

  return (
    <Animated.View
      style={[
        styles.container,
        { paddingTop: insets.top, transform: [{ translateY }] },
      ]}
      {...panResponder.panHandlers}
    >
      <Pressable style={styles.inner} onPress={onPress}>
        <Text style={styles.icon}>{icon}</Text>
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.body} numberOfLines={2}>
            {body}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 99999,
    backgroundColor: COLORS.surfaceElevated,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  icon: {
    fontSize: 22,
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  body: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
    color: COLORS.textSecondary,
    letterSpacing: 0.2,
  },
});
