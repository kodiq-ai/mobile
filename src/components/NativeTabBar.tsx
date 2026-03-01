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
import { hapticLight } from '../utils/haptics';
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
  // Special paths like __ai_mentor__ are never "active" by URL
  if (tabPath.startsWith('__')) return false;
  return currentPath.startsWith(tabPath);
}

/** Render a regular flat tab */
function FlatTab({
  tab,
  active,
  notificationCount,
  onPress,
}: {
  tab: TabItem;
  active: boolean;
  notificationCount: number;
  onPress: () => void;
}) {
  const Icon = getNavIcon(tab.icon);
  const showBadge = tab.badge === 'notifications' && notificationCount > 0;

  return (
    <Pressable
      style={styles.tab}
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      accessibilityLabel={tab.labelFallback}
    >
      <View style={styles.iconContainer}>
        <Icon size={20} color={active ? COLORS.accent : COLORS.textMuted} />
        {showBadge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {notificationCount > 9 ? '9+' : String(notificationCount)}
            </Text>
          </View>
        )}
      </View>
      <Text
        style={[styles.label, { color: active ? COLORS.accent : COLORS.textMuted }]}
        numberOfLines={1}
      >
        {tab.labelFallback}
      </Text>
    </Pressable>
  );
}

/** Render the raised center button (AI Mentor) */
function RaisedTab({
  tab,
  onPress,
}: {
  tab: TabItem;
  onPress: () => void;
}) {
  const Icon = getNavIcon(tab.icon);

  return (
    <Pressable
      style={styles.raisedWrapper}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={tab.labelFallback}
    >
      <View style={styles.raisedCircle}>
        <Icon size={22} color="#000" />
      </View>
      <Text style={styles.raisedLabel} numberOfLines={1}>
        {tab.labelFallback}
      </Text>
    </Pressable>
  );
}

export function NativeTabBar({
  tabs,
  activePath,
  notificationCount,
  onTabPress,
}: NativeTabBarProps) {
  const insets = useSafeAreaInsets();

  // Split tabs: left group → raised center → right group
  const raisedIndex = tabs.findIndex((t) => t.style === 'raised');
  const hasRaised = raisedIndex !== -1;

  const leftTabs = hasRaised ? tabs.slice(0, raisedIndex) : tabs;
  const raisedTab = hasRaised ? tabs[raisedIndex] : null;
  const rightTabs = hasRaised ? tabs.slice(raisedIndex + 1) : [];

  const handlePress = (tab: TabItem) => {
    hapticLight();
    onTabPress(tab.path);
  };

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 4) }]}>
      <View style={styles.border} />
      <View style={styles.tabRow}>
        {leftTabs.map((tab) => (
          <FlatTab
            key={tab.id}
            tab={tab}
            active={isTabActive(tab.path, activePath)}
            notificationCount={notificationCount}
            onPress={() => handlePress(tab)}
          />
        ))}

        {raisedTab && (
          <RaisedTab
            tab={raisedTab}
            onPress={() => handlePress(raisedTab)}
          />
        )}

        {rightTabs.map((tab) => (
          <FlatTab
            key={tab.id}
            tab={tab}
            active={isTabActive(tab.path, activePath)}
            notificationCount={notificationCount}
            onPress={() => handlePress(tab)}
          />
        ))}
      </View>
    </View>
  );
}

const RAISED_SIZE = 48;

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
  // Raised center button
  raisedWrapper: {
    flex: 1,
    alignItems: 'center',
    marginTop: -12,
  },
  raisedCircle: {
    width: RAISED_SIZE,
    height: RAISED_SIZE,
    borderRadius: RAISED_SIZE / 2,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    // Shadow
    ...Platform.select({
      ios: {
        shadowColor: COLORS.accent,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  raisedLabel: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 9,
    marginTop: 2,
    letterSpacing: 0.3,
    color: COLORS.accent,
  },
});
