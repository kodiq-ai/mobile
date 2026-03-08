import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { COLORS } from '../config';
import { hapticSuccess } from '../utils/haptics';

interface BadgeInfo {
  id: string;
  name: string;
  icon: string;
  description: string;
}

interface BadgeModalProps {
  visible: boolean;
  badge: BadgeInfo | null;
  onDismiss: () => void;
}

export function BadgeModal({ visible, badge, onDismiss }: BadgeModalProps) {
  const scale = useRef(new Animated.Value(0)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible && badge) {
      hapticSuccess();
      scale.setValue(0);
      overlayOpacity.setValue(0);

      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();

      Animated.spring(scale, {
        toValue: 1,
        friction: 5,
        tension: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, badge, scale, overlayOpacity]);

  if (!visible || !badge) return null;

  return (
    <TouchableWithoutFeedback onPress={onDismiss}>
      <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
        <TouchableWithoutFeedback>
          <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
            <Text style={styles.icon}>{badge.icon}</Text>
            <Text style={styles.badgeName}>{badge.name}</Text>
            <Text style={styles.description}>{badge.description}</Text>
            <TouchableOpacity
              style={styles.dismissButton}
              onPress={onDismiss}
              activeOpacity={0.7}
            >
              <Text style={styles.dismissText}>Круто!</Text>
            </TouchableOpacity>
          </Animated.View>
        </TouchableWithoutFeedback>
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
  card: {
    width: 280,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.accent,
    borderRadius: 16,
    paddingVertical: 28,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  badgeName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  dismissButton: {
    backgroundColor: COLORS.accentDim,
    borderWidth: 1,
    borderColor: COLORS.accent,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 32,
  },
  dismissText: {
    color: COLORS.accent,
    fontSize: 16,
    fontWeight: '600',
  },
});
