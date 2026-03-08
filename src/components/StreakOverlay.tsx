import React, { useRef } from 'react';
import { Animated, PanResponder, StyleSheet, Text, View } from 'react-native';

import { COLORS } from '../config';

const PILL_WIDTH = 140;
const PILL_HEIGHT = 64;
const SWIPE_THRESHOLD = 40;

interface StreakOverlayProps {
  visible: boolean;
  streak: number;
  progress: number;
  target: number;
  translateY: Animated.Value;
  translateX: Animated.Value;
  opacity: Animated.Value;
  onDismiss: () => void;
}

export function StreakOverlay({
  visible,
  streak,
  progress,
  target,
  translateY,
  translateX,
  opacity,
  onDismiss,
}: StreakOverlayProps) {
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dx) > 5,
      onPanResponderMove: (_, gestureState) => {
        // Only allow rightward swipe
        if (gestureState.dx > 0) {
          translateX.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > SWIPE_THRESHOLD) {
          // Swipe off screen
          Animated.parallel([
            Animated.timing(translateX, {
              toValue: 300,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start(() => {
            translateX.setValue(0);
            onDismiss();
          });
        } else {
          // Snap back
          Animated.spring(translateX, {
            toValue: 0,
            friction: 8,
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  if (!visible) return null;

  const progressRatio = target > 0 ? Math.min(progress / target, 1) : 0;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity,
          transform: [{ translateY }, { translateX }],
        },
      ]}
      {...panResponder.panHandlers}
    >
      <View style={styles.pill}>
        <View style={styles.topRow}>
          <Text style={styles.fireEmoji}>{'\uD83D\uDD25'}</Text>
          <Text style={styles.streakText}>{streak}</Text>
          <Text style={styles.streakLabel}>streak</Text>
        </View>
        <View style={styles.progressTrack}>
          <View
            style={[styles.progressFill, { width: `${progressRatio * 100}%` }]}
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
    right: 16,
    zIndex: 50,
  },
  pill: {
    width: PILL_WIDTH,
    height: PILL_HEIGHT,
    backgroundColor: COLORS.surface,
    borderRadius: 32,
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  fireEmoji: {
    fontSize: 16,
    marginRight: 4,
  },
  streakText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.accent,
    marginRight: 4,
  },
  streakLabel: {
    fontSize: 11,
    color: COLORS.text,
    opacity: 0.7,
  },
  progressTrack: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: 2,
  },
});
