import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  type LayoutChangeEvent,
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
    return (
      currentPath === '/' ||
      currentPath === '/academy' ||
      /^\/[a-z0-9-]+\/[a-z0-9-]+$/.test(currentPath)
    );
  }
  if (tabPath.startsWith('__')) return false;
  return currentPath.startsWith(tabPath);
}

/** Render a regular flat tab with press scale */
function FlatTab({
  tab,
  active,
  notificationCount,
  onPress,
  onLayout,
}: {
  tab: TabItem;
  active: boolean;
  notificationCount: number;
  onPress: () => void;
  onLayout?: (e: LayoutChangeEvent) => void;
}) {
  const Icon = getNavIcon(tab.icon);
  const showBadge = tab.badge === 'notifications' && notificationCount > 0;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.85,
      useNativeDriver: true,
      friction: 5,
      tension: 300,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 5,
      tension: 300,
    }).start();
  };

  return (
    <Pressable
      style={styles.tab}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onLayout={onLayout}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      accessibilityLabel={tab.labelFallback}
    >
      <Animated.View
        style={[styles.iconContainer, { transform: [{ scale: scaleAnim }] }]}
      >
        <Icon size={20} color={active ? COLORS.accent : COLORS.textMuted} />
        {showBadge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {notificationCount > 9 ? '9+' : String(notificationCount)}
            </Text>
          </View>
        )}
      </Animated.View>
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
}

/** Render the raised center button (AI Mentor) with glow */
function RaisedTab({
  tab,
  active,
  onPress,
}: {
  tab: TabItem;
  active: boolean;
  onPress: () => void;
}) {
  const Icon = getNavIcon(tab.icon);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: active ? 1.05 : 1,
      useNativeDriver: true,
      friction: 5,
      tension: 300,
    }).start();
  }, [active, scaleAnim]);

  const onPressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
      friction: 5,
      tension: 300,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: active ? 1.05 : 1,
      useNativeDriver: true,
      friction: 5,
      tension: 300,
    }).start();
  };

  return (
    <Pressable
      style={styles.raisedWrapper}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      accessibilityRole="button"
      accessibilityLabel={tab.labelFallback}
    >
      <Animated.View
        style={[
          styles.raisedCircle,
          active && styles.raisedCircleActive,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Icon size={22} color="#000" />
      </Animated.View>
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
  const dotX = useRef(new Animated.Value(0)).current;
  const [tabLayouts, setTabLayouts] = useState<
    Record<string, { x: number; width: number }>
  >({});
  const tabRowX = useRef(0);

  // Split tabs
  const raisedIndex = tabs.findIndex(t => t.style === 'raised');
  const hasRaised = raisedIndex !== -1;
  const leftTabs = hasRaised ? tabs.slice(0, raisedIndex) : tabs;
  const raisedTab = hasRaised ? tabs[raisedIndex] : null;
  const rightTabs = hasRaised ? tabs.slice(raisedIndex + 1) : [];

  // Find active flat tab
  const flatTabs = [...leftTabs, ...rightTabs];
  const activeTab = flatTabs.find(t => isTabActive(t.path, activePath));

  // Animate dot to active tab center
  useEffect(() => {
    if (!activeTab) return;
    const layout = tabLayouts[activeTab.id];
    if (!layout) return;

    const targetX = layout.x + layout.width / 2 - 2 - tabRowX.current; // -2 for dot width/2
    Animated.spring(dotX, {
      toValue: targetX,
      useNativeDriver: true,
      friction: 6,
      tension: 300,
    }).start();
  }, [activeTab, tabLayouts, dotX]);

  const handleTabLayout = useCallback((tabId: string, e: LayoutChangeEvent) => {
    const { x, width } = e.nativeEvent.layout;
    setTabLayouts(prev => ({ ...prev, [tabId]: { x, width } }));
  }, []);

  const handleRowLayout = useCallback((e: LayoutChangeEvent) => {
    tabRowX.current = e.nativeEvent.layout.x;
  }, []);

  const handlePress = (tab: TabItem) => {
    hapticLight();
    onTabPress(tab.path);
  };

  return (
    <View
      style={[styles.container, { paddingBottom: Math.max(insets.bottom, 4) }]}
    >
      <View style={styles.border} />
      <View style={styles.tabRow} onLayout={handleRowLayout}>
        {leftTabs.map(tab => (
          <FlatTab
            key={tab.id}
            tab={tab}
            active={isTabActive(tab.path, activePath)}
            notificationCount={notificationCount}
            onPress={() => handlePress(tab)}
            onLayout={e => handleTabLayout(tab.id, e)}
          />
        ))}

        {raisedTab && (
          <RaisedTab
            tab={raisedTab}
            active={
              raisedTab.path.startsWith('__')
                ? false
                : isTabActive(raisedTab.path, activePath)
            }
            onPress={() => handlePress(raisedTab)}
          />
        )}

        {rightTabs.map(tab => (
          <FlatTab
            key={tab.id}
            tab={tab}
            active={isTabActive(tab.path, activePath)}
            notificationCount={notificationCount}
            onPress={() => handlePress(tab)}
            onLayout={e => handleTabLayout(tab.id, e)}
          />
        ))}
      </View>

      {/* Animated dot indicator */}
      {activeTab && (
        <View style={styles.dotRow} pointerEvents="none">
          <Animated.View
            style={[styles.dot, { transform: [{ translateX: dotX }] }]}
          />
        </View>
      )}
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
  raisedCircleActive: {
    ...Platform.select({
      ios: {
        shadowOpacity: 0.6,
        shadowRadius: 12,
      },
      android: {
        elevation: 12,
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
  // Dot indicator
  dotRow: {
    height: 8,
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    left: 0,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.accent,
  },
});
