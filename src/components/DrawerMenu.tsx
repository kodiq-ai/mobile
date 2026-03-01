import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS } from '../config';
import type { DrawerSection } from '../types/nav';
import { hapticLight, hapticMedium } from '../utils/haptics';
import { KodiqLogo } from './icons/KodiqLogo';
import { getNavIcon } from './icons/NavIcons';

const DRAWER_WIDTH = 280;

interface DrawerMenuProps {
  visible: boolean;
  sections: DrawerSection[];
  onClose: () => void;
  onNavigate: (path: string, external?: boolean) => void;
  onLogout: () => void;
  userEmail?: string;
}

export function DrawerMenu({
  visible,
  sections,
  onClose,
  onNavigate,
  onLogout,
  userEmail,
}: DrawerMenuProps) {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (visible) {
      setIsMounted(true);
      hapticMedium();
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (isMounted) {
      // Animate close, then unmount
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -DRAWER_WIDTH,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => setIsMounted(false));
    }
  }, [visible, slideAnim, overlayAnim, isMounted]);

  const CloseIcon = getNavIcon('X');
  const LogOutIcon = getNavIcon('LogOut');

  if (!isMounted) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* Overlay */}
      <Animated.View
        style={[styles.overlay, { opacity: overlayAnim }]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* Drawer panel */}
      <Animated.View
        style={[
          styles.drawer,
          {
            width: Math.min(DRAWER_WIDTH, screenWidth * 0.8),
            transform: [{ translateX: slideAnim }],
            paddingTop: insets.top + 8,
            paddingBottom: insets.bottom + 8,
          },
        ]}
      >
        {/* Header */}
        <View style={styles.drawerHeader}>
          <KodiqLogo size={28} />
          <Text style={styles.drawerTitle}>Kodiq Academy</Text>
          <Pressable
            onPress={onClose}
            style={styles.closeButton}
            accessibilityRole="button"
            accessibilityLabel="Закрыть меню"
          >
            <CloseIcon size={20} color={COLORS.textMuted} />
          </Pressable>
        </View>

        {/* User info */}
        {userEmail && (
          <View style={styles.userSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {userEmail[0]?.toUpperCase() ?? '?'}
              </Text>
            </View>
            <Text style={styles.userEmail} numberOfLines={1}>
              {userEmail}
            </Text>
          </View>
        )}

        {/* Sections */}
        <ScrollView
          style={styles.scrollArea}
          showsVerticalScrollIndicator={false}
        >
          {sections.map((section, si) => (
            <View key={section.title ?? `section-${si}`} style={styles.section}>
              {section.title && (
                <Text style={styles.sectionTitle}>{section.title}</Text>
              )}
              {section.items.map((item) => {
                const Icon = getNavIcon(item.icon);
                return (
                  <Pressable
                    key={item.id}
                    style={styles.menuItem}
                    onPress={() => {
                      hapticLight();
                      onNavigate(item.path, item.external);
                      onClose();
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={item.labelFallback}
                  >
                    <Icon size={18} color={COLORS.textSecondary} />
                    <Text style={styles.menuItemText}>
                      {item.labelFallback}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </ScrollView>

        {/* Logout */}
        <View style={styles.logoutSection}>
          <View style={styles.logoutBorder} />
          <Pressable
            style={styles.menuItem}
            onPress={() => {
              onLogout();
              onClose();
            }}
            accessibilityRole="button"
            accessibilityLabel="Выйти"
          >
            <LogOutIcon size={18} color={COLORS.error} />
            <Text style={[styles.menuItemText, { color: COLORS.error }]}>
              Выйти
            </Text>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: COLORS.surface,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  drawerTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
    letterSpacing: 0.5,
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 10,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.accentDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.accent,
  },
  userEmail: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 11,
    color: COLORS.textSecondary,
    flex: 1,
  },
  scrollArea: {
    flex: 1,
    paddingTop: 4,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 9,
    fontWeight: '600',
    color: COLORS.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
  },
  menuItemText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13,
    color: COLORS.text,
    letterSpacing: 0.3,
  },
  logoutSection: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
  },
  logoutBorder: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: 8,
  },
});
