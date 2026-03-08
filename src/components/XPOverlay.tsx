import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../config';

interface XPOverlayProps {
  visible: boolean;
  xp: number;
  level: number;
  xpToNextLevel: number;
  onDismiss: () => void;
}

export function XPOverlay({
  visible,
  xp,
  level,
  xpToNextLevel,
  onDismiss,
}: XPOverlayProps) {
  const translateY = useRef(new Animated.Value(60)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const isShowing = useRef(false);

  useEffect(() => {
    if (visible && !isShowing.current) {
      isShowing.current = true;
      translateY.setValue(60);
      opacity.setValue(0);

      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          friction: 6,
          tension: 200,
          useNativeDriver: true,
        }),
        Animated.spring(opacity, {
          toValue: 1,
          friction: 6,
          tension: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (!visible && isShowing.current) {
      isShowing.current = false;

      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -20,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onDismiss();
      });
    }
  }, [visible, translateY, opacity, onDismiss]);

  if (!visible && !isShowing.current) return null;

  return (
    <Animated.View
      style={[styles.container, { opacity, transform: [{ translateY }] }]}
      pointerEvents="none"
    >
      <View style={styles.pill}>
        <Text style={styles.xpText}>+{xp} XP</Text>
        <View style={styles.divider} />
        <Text style={styles.levelText}>Lv {level}</Text>
        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBarFill,
              {
                width:
                  xpToNextLevel > 0
                    ? `${Math.min(
                        100,
                        ((xpToNextLevel - (xpToNextLevel - xp)) /
                          xpToNextLevel) *
                          100,
                      )}%`
                    : '0%',
              },
            ]}
          />
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    zIndex: 1000,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accentDim,
    borderWidth: 1,
    borderColor: COLORS.accent,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 8,
  },
  xpText: {
    color: COLORS.accent,
    fontSize: 15,
    fontWeight: '700',
  },
  divider: {
    width: 1,
    height: 14,
    backgroundColor: COLORS.accent,
    opacity: 0.3,
  },
  levelText: {
    color: COLORS.accent,
    fontSize: 13,
    fontWeight: '600',
  },
  progressBarBg: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(196, 168, 130, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: 2,
  },
});
