import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { COLORS } from '../config';

const SHIMMER_DURATION = 1200;

function ShimmerBlock({
  width,
  height,
  borderRadius = 8,
  style,
}: {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: object;
}) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: SHIMMER_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: SHIMMER_DURATION,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width: width as number,
          height,
          borderRadius,
          backgroundColor: COLORS.surfaceElevated,
          opacity,
        },
        style,
      ]}
    />
  );
}

export type SkeletonVariant = 'grid' | 'lesson' | 'dashboard' | 'feed';

interface SkeletonLoaderProps {
  variant?: SkeletonVariant;
}

/** Skeleton placeholder with contextual variants */
export function SkeletonLoader({ variant = 'grid' }: SkeletonLoaderProps) {
  const renderContent = () => {
    switch (variant) {
      case 'lesson':
        return (
          <>
            <ShimmerBlock
              width="100%"
              height={160}
              borderRadius={12}
              style={styles.title}
            />
            <ShimmerBlock width="100%" height={12} style={styles.textLine} />
            <ShimmerBlock width="90%" height={12} style={styles.textLine} />
            <ShimmerBlock width="80%" height={12} style={styles.textLine} />
            <ShimmerBlock width="70%" height={12} style={styles.textLine} />
            <ShimmerBlock
              width="100%"
              height={8}
              borderRadius={4}
              style={styles.progressBar}
            />
          </>
        );

      case 'dashboard':
        return (
          <>
            <View style={styles.cardRow}>
              <ShimmerBlock width="48%" height={80} borderRadius={12} />
              <ShimmerBlock width="48%" height={80} borderRadius={12} />
            </View>
            <ShimmerBlock
              width="100%"
              height={160}
              borderRadius={12}
              style={styles.chartArea}
            />
            {[0, 1, 2].map(i => (
              <ShimmerBlock
                key={i}
                width="100%"
                height={48}
                borderRadius={8}
                style={styles.listItem}
              />
            ))}
          </>
        );

      case 'feed':
        return (
          <>
            {[0, 1, 2, 3].map(i => (
              <View key={i} style={styles.feedItem}>
                <ShimmerBlock width={40} height={40} borderRadius={20} />
                <View style={styles.feedText}>
                  <ShimmerBlock width="70%" height={14} />
                  <ShimmerBlock
                    width="50%"
                    height={10}
                    style={styles.cardSub}
                  />
                </View>
              </View>
            ))}
          </>
        );

      case 'grid':
      default:
        return (
          <>
            {/* Page title skeleton */}
            <ShimmerBlock width={180} height={24} style={styles.title} />

            {/* Search bar skeleton */}
            <ShimmerBlock
              width="100%"
              height={40}
              borderRadius={10}
              style={styles.search}
            />

            {/* Course cards grid (2 columns, 3 rows) */}
            {[0, 1, 2].map(row => (
              <View key={row} style={styles.cardRow}>
                <View style={styles.card}>
                  <ShimmerBlock width="100%" height={100} borderRadius={10} />
                  <ShimmerBlock
                    width="80%"
                    height={14}
                    style={styles.cardTitle}
                  />
                  <ShimmerBlock
                    width="50%"
                    height={10}
                    style={styles.cardSub}
                  />
                </View>
                <View style={styles.card}>
                  <ShimmerBlock width="100%" height={100} borderRadius={10} />
                  <ShimmerBlock
                    width="70%"
                    height={14}
                    style={styles.cardTitle}
                  />
                  <ShimmerBlock
                    width="60%"
                    height={10}
                    style={styles.cardSub}
                  />
                </View>
              </View>
            ))}
          </>
        );
    }
  };

  return <View style={styles.container}>{renderContent()}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  title: {
    marginBottom: 16,
  },
  search: {
    marginBottom: 20,
  },
  cardRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  card: {
    flex: 1,
  },
  cardTitle: {
    marginTop: 8,
  },
  cardSub: {
    marginTop: 6,
  },
  textLine: {
    marginBottom: 10,
  },
  feedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  feedText: {
    flex: 1,
  },
  progressBar: {
    marginTop: 20,
  },
  chartArea: {
    marginBottom: 16,
  },
  listItem: {
    marginBottom: 8,
  },
});
