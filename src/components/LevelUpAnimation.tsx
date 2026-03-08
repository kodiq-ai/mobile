import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { COLORS } from '../config';
import { hapticCelebration } from '../utils/haptics';

interface LevelUpAnimationProps {
  visible: boolean;
  level: number;
  onDismiss: () => void;
}

export function LevelUpAnimation({
  visible,
  level,
  onDismiss,
}: LevelUpAnimationProps) {
  const scale = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(20)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (visible) {
      hapticCelebration();

      scale.setValue(0);
      textOpacity.setValue(0);
      textTranslateY.setValue(20);
      overlayOpacity.setValue(0);

      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();

      Animated.spring(scale, {
        toValue: 1,
        friction: 4,
        tension: 200,
        useNativeDriver: true,
      }).start();

      Animated.sequence([
        Animated.delay(300),
        Animated.parallel([
          Animated.timing(textOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.spring(textTranslateY, {
            toValue: 0,
            friction: 6,
            tension: 200,
            useNativeDriver: true,
          }),
        ]),
      ]).start();

      dismissTimer.current = setTimeout(onDismiss, 2500);
    }

    return () => {
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
    };
  }, [visible, scale, textOpacity, textTranslateY, overlayOpacity, onDismiss]);

  if (!visible) return null;

  return (
    <TouchableWithoutFeedback onPress={onDismiss}>
      <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
        <View style={styles.center}>
          <Animated.Text
            style={[styles.levelNumber, { transform: [{ scale }] }]}
          >
            {level}
          </Animated.Text>
          <Animated.Text
            style={[
              styles.levelLabel,
              {
                opacity: textOpacity,
                transform: [{ translateY: textTranslateY }],
              },
            ]}
          >
            Level {level}!
          </Animated.Text>
          <Animated.Text
            style={[
              styles.subtitle,
              {
                opacity: textOpacity,
                transform: [{ translateY: textTranslateY }],
              },
            ]}
          >
            Новый уровень достигнут
          </Animated.Text>
        </View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  center: {
    alignItems: 'center',
  },
  levelNumber: {
    fontSize: 80,
    fontWeight: '800',
    color: COLORS.accent,
    marginBottom: 8,
  },
  levelLabel: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
});
