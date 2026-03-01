import React from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS } from '../config';
import type { TabItem } from '../types/nav';
import { getNavIcon } from './icons/NavIcons';

interface NativeTabBarProps {
  tabs: TabItem[];
  activePath: string;
  notificationCount: number;
  onTabPress: (path: string) => void;
}

/** Match active tab by comparing path prefixes */
function isTabActive(tabPath: string, currentPath: string): boolean {
  if (tabPath === '/') {
    // Root tab: active only for exact "/" or "/academy" or course pages
    return (
      currentPath === '/' ||
      currentPath === '/academy' ||
      /^\/[a-z0-9-]+\/[a-z0-9-]+$/.test(currentPath) // lesson pages
    );
  }
  return currentPath.startsWith(tabPath);
}

export function NativeTabBar({
  tabs,
  activePath,
  notificationCount,
  onTabPress,
}: NativeTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 4) }]}>
      <View style={styles.border} />
      <View style={styles.tabRow}>
        {tabs.map((tab) => {
          const active = isTabActive(tab.path, activePath);
          const Icon = getNavIcon(tab.icon);
          const showBadge = tab.badge === 'notifications' && notificationCount > 0;

          return (
            <Pressable
              key={tab.id}
              style={styles.tab}
              onPress={() => onTabPress(tab.path)}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              accessibilityLabel={tab.labelFallback}
            >
              <View style={styles.iconContainer}>
                <Icon
                  size={20}
                  color={active ? COLORS.accent : COLORS.textMuted}
                />
                {showBadge && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {notificationCount > 9 ? '9+' : String(notificationCount)}
                    </Text>
                  </View>
                )}
              </View>
              <Text
                style={[
                  styles.label,
                  { color: active ? COLORS.accent : COLORS.textMuted },
                ]}
                numberOfLines={1}
              >
                {tab.labelFallback}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
  },
  border: {
    height: 1,
    backgroundColor: COLORS.borderStrong,
  },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 6,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  iconContainer: {
    position: 'relative',
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: COLORS.error,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 9,
    fontWeight: '700',
    color: '#fff',
  },
  label: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 9,
    marginTop: 2,
    letterSpacing: 0.3,
  },
});
