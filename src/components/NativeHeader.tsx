import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { COLORS } from '../config';
import type { MobileNavConfig } from '../types/nav';
import { KodiqLogo } from './icons/KodiqLogo';
import { getNavIcon } from './icons/NavIcons';

const FADE_DURATION = 150;

interface NativeHeaderProps {
  config: MobileNavConfig;
  title: string;
  canGoBack: boolean;
  notificationCount: number;
  onBurgerPress: () => void;
  onBackPress: () => void;
  onNotificationPress: () => void;
  onSearchPress: () => void;
}

export function NativeHeader({
  config,
  title,
  canGoBack,
  notificationCount,
  onBurgerPress,
  onBackPress,
  onNotificationPress,
  onSearchPress,
}: NativeHeaderProps) {
  const MenuIcon = getNavIcon('Menu');
  const BackIcon = getNavIcon('ChevronLeft');
  const BellIcon = getNavIcon('Bell');
  const SearchIcon = getNavIcon('Search');
  const showBadge = notificationCount > 0;

  // Animated title transition
  const titleOpacity = useRef(new Animated.Value(1)).current;
  const [displayTitle, setDisplayTitle] = useState(title);
  const prevTitle = useRef(title);

  useEffect(() => {
    if (title === prevTitle.current) return;
    prevTitle.current = title;

    // Fade out → update → fade in
    Animated.timing(titleOpacity, {
      toValue: 0,
      duration: FADE_DURATION,
      useNativeDriver: true,
    }).start(() => {
      setDisplayTitle(title);
      Animated.timing(titleOpacity, {
        toValue: 1,
        duration: FADE_DURATION,
        useNativeDriver: true,
      }).start();
    });
  }, [title, titleOpacity]);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {/* Left: burger or back */}
        <View style={styles.leftSection}>
          {canGoBack ? (
            <Pressable
              onPress={onBackPress}
              style={styles.iconButton}
              accessibilityRole="button"
              accessibilityLabel="Назад"
            >
              <BackIcon size={22} color={COLORS.text} />
            </Pressable>
          ) : (
            <Pressable
              onPress={onBurgerPress}
              style={styles.iconButton}
              accessibilityRole="button"
              accessibilityLabel="Меню"
            >
              <MenuIcon size={22} color={COLORS.text} />
            </Pressable>
          )}

          {/* Logo + wordmark */}
          {config.header.showLogo && !canGoBack && (
            <View style={styles.logo}>
              <KodiqLogo size={30} />
              <Text style={styles.wordmark}>Kodiq</Text>
            </View>
          )}

          {/* Animated title when navigating deep */}
          {canGoBack && displayTitle ? (
            <Animated.Text
              style={[styles.title, { opacity: titleOpacity }]}
              numberOfLines={1}
            >
              {displayTitle}
            </Animated.Text>
          ) : null}
        </View>

        {/* Right: search + notifications */}
        <View style={styles.rightSection}>
          {config.header.showSearch && (
            <Pressable
              onPress={onSearchPress}
              style={styles.iconButton}
              accessibilityRole="button"
              accessibilityLabel="Поиск"
            >
              <SearchIcon size={18} color={COLORS.textSecondary} />
            </Pressable>
          )}

          {config.header.showNotifications && (
            <Pressable
              onPress={onNotificationPress}
              style={styles.iconButton}
              accessibilityRole="button"
              accessibilityLabel="Уведомления"
            >
              <View>
                <BellIcon size={18} color={COLORS.textSecondary} />
                {showBadge && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {notificationCount > 9 ? '9+' : String(notificationCount)}
                    </Text>
                  </View>
                )}
              </View>
            </Pressable>
          )}
        </View>
      </View>
      <View style={styles.border} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
    paddingHorizontal: 12,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: -4,
    gap: 6,
  },
  wordmark: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: 1,
  },
  title: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '600',
    flex: 1,
    letterSpacing: 0.3,
  },
  border: {
    height: 1,
    backgroundColor: COLORS.borderStrong,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    backgroundColor: COLORS.error,
    borderRadius: 7,
    minWidth: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  badgeText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 8,
    fontWeight: '700',
    color: '#fff',
  },
});
