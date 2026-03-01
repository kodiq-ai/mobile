import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ViewToken,
} from 'react-native';

import { KodiqLogo } from '../components/icons/KodiqLogo';
import { getNavIcon } from '../components/icons/NavIcons';
import { COLORS } from '../config';

const ONBOARDING_DONE_KEY = 'onboarding_done';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Slide {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  description: string;
}

const SLIDES: Slide[] = [
  {
    id: 'hero',
    icon: 'Star',
    title: 'Стань AI Solo Founder',
    subtitle: 'Kodiq Academy',
    description:
      'Пошаговая программа от нуля до AI-бизнеса. Практика, реальные проекты, сообщество.',
  },
  {
    id: 'modules',
    icon: 'BookOpen',
    title: '37 модулей',
    subtitle: 'От нуля до бизнеса',
    description:
      'Структурированная карта навыков: Python, ML, LLM, продуктовая разработка, маркетинг.',
  },
  {
    id: 'pace',
    icon: 'RefreshCw',
    title: 'Учись в своём темпе',
    subtitle: 'Streak · Повторение · Вызовы',
    description:
      'Ежедневные серии, интервальное повторение и мини-челленджи для закрепления навыков.',
  },
  {
    id: 'start',
    icon: 'Code',
    title: 'Начни бесплатно',
    subtitle: 'Первые 5 модулей — без оплаты',
    description:
      'Зарегистрируйся и получи доступ к первым урокам прямо сейчас.',
  },
];

interface OnboardingScreenProps {
  onComplete: () => void;
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const flatListRef = useRef<FlatList>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleComplete = useCallback(async () => {
    await AsyncStorage.setItem(ONBOARDING_DONE_KEY, 'true');
    onComplete();
  }, [onComplete]);

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems[0]) {
        setActiveIndex(viewableItems[0].index ?? 0);
      }
    },
  ).current;

  const handleNext = useCallback(() => {
    if (activeIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
    } else {
      void handleComplete();
    }
  }, [activeIndex, handleComplete]);

  const renderSlide = useCallback(
    ({ item }: { item: Slide }) => {
      const Icon = getNavIcon(item.icon);
      return (
        <View style={styles.slide}>
          <View style={styles.iconCircle}>
            <Icon size={40} color={COLORS.accent} />
          </View>
          <Text style={styles.slideTitle}>{item.title}</Text>
          <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
          <Text style={styles.slideDescription}>{item.description}</Text>
        </View>
      );
    },
    [],
  );

  const isLastSlide = activeIndex === SLIDES.length - 1;

  return (
    <View style={styles.container}>
      {/* Header with logo + skip */}
      <View style={styles.header}>
        <KodiqLogo size={24} />
        {!isLastSlide && (
          <Pressable onPress={() => void handleComplete()}>
            <Text style={styles.skipText}>Пропустить</Text>
          </Pressable>
        )}
      </View>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false },
        )}
        viewabilityConfig={viewabilityConfig}
        onViewableItemsChanged={onViewableItemsChanged}
      />

      {/* Bottom: dots + button */}
      <View style={styles.bottom}>
        {/* Page indicators */}
        <View style={styles.dots}>
          {SLIDES.map((_, i) => {
            const inputRange = [
              (i - 1) * SCREEN_WIDTH,
              i * SCREEN_WIDTH,
              (i + 1) * SCREEN_WIDTH,
            ];
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [6, 20, 6],
              extrapolate: 'clamp',
            });
            const dotOpacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });
            return (
              <Animated.View
                key={i}
                style={[
                  styles.dot,
                  {
                    width: dotWidth,
                    opacity: dotOpacity,
                    backgroundColor: COLORS.accent,
                  },
                ]}
              />
            );
          })}
        </View>

        {/* CTA button */}
        <Pressable style={styles.ctaButton} onPress={handleNext}>
          <Text style={styles.ctaText}>
            {isLastSlide ? 'Начать' : 'Далее'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

/** Check if onboarding was completed */
export async function isOnboardingDone(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(ONBOARDING_DONE_KEY);
    return value === 'true';
  } catch {
    return false;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  skipText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13,
    color: COLORS.textMuted,
    letterSpacing: 0.3,
  },
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.accentDim,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  slideTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  slideSubtitle: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.accent,
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  slideDescription: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    letterSpacing: 0.2,
  },
  bottom: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    alignItems: 'center',
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 24,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  ctaButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  ctaText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
});
