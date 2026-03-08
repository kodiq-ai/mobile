import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';

const PARTICLE_COUNT = 40;
const DURATION = 2000;
const COLORS = ['#c4a882', '#dac4a0', '#6a9a5a', '#c4705a', '#d4944a'];

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ParticleConfig {
  color: string;
  width: number;
  height: number;
  startX: number;
  startY: number;
  endY: number;
  driftX: number;
  rotation: number;
  startScale: number;
}

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function buildParticleConfigs(): ParticleConfig[] {
  return Array.from({ length: PARTICLE_COUNT }, () => ({
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    width: randomBetween(8, 12),
    height: randomBetween(4, 6),
    startX:
      SCREEN_WIDTH / 2 + randomBetween(-SCREEN_WIDTH / 4, SCREEN_WIDTH / 4),
    startY: randomBetween(-50, 50),
    endY: SCREEN_HEIGHT + 100,
    driftX: randomBetween(-SCREEN_WIDTH / 3, SCREEN_WIDTH / 3),
    rotation: randomBetween(360, 720),
    startScale: randomBetween(0.5, 1.2),
  }));
}

interface ConfettiOverlayProps {
  visible: boolean;
  onComplete: () => void;
}

export function ConfettiOverlay({ visible, onComplete }: ConfettiOverlayProps) {
  const progressRef = useRef<Animated.Value[]>([]);
  const configsRef = useRef<ParticleConfig[]>([]);

  // Lazily initialize animated values
  if (progressRef.current.length === 0) {
    progressRef.current = Array.from(
      { length: PARTICLE_COUNT },
      () => new Animated.Value(0),
    );
  }

  useEffect(() => {
    if (!visible) return;

    // Generate fresh random configs each time confetti fires
    configsRef.current = buildParticleConfigs();

    const animations = progressRef.current.map(anim => {
      anim.setValue(0);
      return Animated.timing(anim, {
        toValue: 1,
        duration: DURATION,
        useNativeDriver: true,
      });
    });

    Animated.parallel(animations).start(() => {
      onComplete();
    });
  }, [visible, onComplete]);

  if (!visible) return null;

  return (
    <View style={styles.overlay} pointerEvents="none">
      {progressRef.current.map((progress, i) => {
        const cfg = configsRef.current[i];
        if (!cfg) return null;

        const translateY = progress.interpolate({
          inputRange: [0, 1],
          outputRange: [cfg.startY, cfg.endY],
        });

        const translateX = progress.interpolate({
          inputRange: [0, 0.25, 0.5, 0.75, 1],
          outputRange: [0, cfg.driftX * 0.5, cfg.driftX, cfg.driftX * 0.5, 0],
        });

        const rotate = progress.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', `${cfg.rotation}deg`],
        });

        const opacity = progress.interpolate({
          inputRange: [0, 0.7, 1],
          outputRange: [1, 1, 0],
        });

        const scale = progress.interpolate({
          inputRange: [0, 1],
          outputRange: [cfg.startScale, 0.3],
        });

        return (
          <Animated.View
            key={i}
            style={[
              styles.particle,
              {
                width: cfg.width,
                height: cfg.height,
                backgroundColor: cfg.color,
                left: cfg.startX,
                transform: [
                  { translateY },
                  { translateX },
                  { rotate },
                  { scale },
                ],
                opacity,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
  particle: {
    position: 'absolute',
    top: 0,
    borderRadius: 2,
  },
});
