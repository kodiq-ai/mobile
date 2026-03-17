import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  type ImageSourcePropType,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewToken,
} from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { KodiqLogo } from '../components/icons/KodiqLogo';
import { COLORS } from '../config';

// Screenshot assets
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const IMG_GAMIFICATION: ImageSourcePropType = require('../assets/onboarding/window_gamification.jpg');
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const IMG_COMMUNITY: ImageSourcePropType = require('../assets/onboarding/window_community.jpg');

const ONBOARDING_DONE_KEY = 'onboarding_done';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const MONO = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

// ─── Gradient Background ────────────────────────────────────────────
// SVG-based radial-like gradient using multiple linear overlays
function GradientBg({ accentColor = '#c4a882' }: { accentColor?: string }) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="g1" x1="0.5" y1="0" x2="0.5" y2="1">
            <Stop offset="0" stopColor={accentColor} stopOpacity="0.08" />
            <Stop
              offset="0.5"
              stopColor={COLORS.background}
              stopOpacity="0.0"
            />
            <Stop offset="1" stopColor={accentColor} stopOpacity="0.04" />
          </LinearGradient>
          <LinearGradient id="g2" x1="0" y1="0.3" x2="1" y2="0.7">
            <Stop offset="0" stopColor={accentColor} stopOpacity="0.06" />
            <Stop offset="1" stopColor={COLORS.background} stopOpacity="0" />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#g1)" />
        <Rect width="100%" height="100%" fill="url(#g2)" />
      </Svg>
    </View>
  );
}

// ─── Code-Rendered UI Mocks ─────────────────────────────────────────

/** Mini program accordion — 6 parts */
function ProgramMock() {
  const parts = [
    { num: '0', label: 'Добро пожаловать', info: '1 модуль · 4 урока' },
    { num: 'I', label: 'Учись', info: '6 модулей · 60 уроков' },
    { num: 'II', label: 'Создавай', info: '8 модулей · 64 урока' },
    { num: 'III', label: 'Запускай', info: '7 модулей · 53 урока' },
    { num: 'IV', label: 'Привлекай клиентов', info: '10 модулей · 91 урок' },
    { num: 'V', label: 'Масштабируй', info: '6 модулей · 39 уроков' },
  ];
  return (
    <View style={mockStyles.programContainer}>
      {parts.map((p, i) => (
        <View key={i} style={mockStyles.programRow}>
          <View style={mockStyles.programCircle}>
            <Text style={mockStyles.programNum}>{p.num}</Text>
          </View>
          <View style={mockStyles.programText}>
            <Text style={mockStyles.programLabel}>{p.label}</Text>
            <Text style={mockStyles.programInfo}>{p.info}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

/** AI Co-Founder chat mock */
function AIChatMock() {
  return (
    <View style={mockStyles.chatContainer}>
      <View style={mockStyles.chatHeader}>
        <View style={mockStyles.chatDot} />
        <Text style={mockStyles.chatHeaderText}>AI CO-FOUNDER CHAT</Text>
      </View>
      {/* User message */}
      <View style={mockStyles.chatUserBubble}>
        <Text style={mockStyles.chatText}>
          У меня есть идея для маркетплейса
        </Text>
      </View>
      {/* AI response */}
      <View style={mockStyles.chatAiBubble}>
        <Text style={mockStyles.chatText}>
          Отличная точка! Давай разберёмся: кто твои покупатели?
        </Text>
      </View>
      {/* Typing indicator */}
      <View style={mockStyles.chatTyping}>
        <Text style={mockStyles.chatTypingDots}>• • •</Text>
      </View>
      {/* Role cards row */}
      <View style={mockStyles.rolesRow}>
        {['🎓', '💼', '🎨', '📈', '⚙️'].map((emoji, i) => (
          <View key={i} style={mockStyles.roleCard}>
            <Text style={mockStyles.roleEmoji}>{emoji}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

/** What you'll build — checklist */
function ResultsMock() {
  const items = [
    'Полноценный сайт',
    'Мобильное приложение',
    'Свой онлайн-сервис',
    'Стратегию запуска',
  ];
  return (
    <View style={mockStyles.resultsContainer}>
      {items.map((item, i) => (
        <View key={i} style={mockStyles.resultsRow}>
          <View style={mockStyles.checkCircle}>
            <Text style={mockStyles.checkMark}>✓</Text>
          </View>
          <Text style={mockStyles.resultsText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

/** Screenshot image displayed as a floating card */
function ScreenshotCard({
  source,
  aspectRatio,
}: {
  source: ImageSourcePropType;
  aspectRatio: number;
}) {
  return (
    <View style={mockStyles.screenshotWrapper}>
      <Image
        source={source}
        style={[mockStyles.screenshotImage, { aspectRatio }]}
        resizeMode="contain"
      />
    </View>
  );
}

// ─── Slide Data ─────────────────────────────────────────────────────

interface Slide {
  id: string;
  title: string;
  subtitle: string;
  accentGradient?: string;
  renderVisual?: () => React.ReactNode;
}

const SLIDES: Slide[] = [
  {
    id: 'hero',
    title: 'AI Solo Founder',
    subtitle: 'Программа от нуля до своего SaaS\nс AI в роли напарника',
    accentGradient: '#c4a882',
  },
  {
    id: 'program',
    title: '37 модулей · 311 уроков',
    subtitle: 'От основ до масштабирования бизнеса',
    accentGradient: '#a89070',
    renderVisual: () => <ProgramMock />,
  },
  {
    id: 'ai-mentor',
    title: 'AI-наставник 24/7',
    subtitle: 'Персональный помощник\nна каждом шаге обучения',
    accentGradient: '#8ab4c4',
    renderVisual: () => <AIChatMock />,
  },
  {
    id: 'gamification',
    title: 'Учись как в игре',
    subtitle: 'Уровни, серии, значки и рейтинг',
    accentGradient: '#c4a055',
    renderVisual: () => (
      <ScreenshotCard source={IMG_GAMIFICATION} aspectRatio={960 / 190} />
    ),
  },
  {
    id: 'workspace',
    title: 'AI Workspace',
    subtitle: 'Пиши код с AI-напарником\nпрямо в браузере',
    accentGradient: '#7a9ac4',
    renderVisual: () => (
      <View style={mockStyles.workspaceContainer}>
        <View style={mockStyles.wsTopBar}>
          <View style={[mockStyles.wsDot, { backgroundColor: '#c4705a' }]} />
          <View style={[mockStyles.wsDot, { backgroundColor: '#d4944a' }]} />
          <View style={[mockStyles.wsDot, { backgroundColor: '#6a9a5a' }]} />
          <Text style={mockStyles.wsTitle}>workspace.tsx</Text>
        </View>
        <View style={mockStyles.wsCode}>
          <Text style={mockStyles.wsLineNum}>1</Text>
          <Text style={[mockStyles.wsCodeText, { color: '#c4a882' }]}>
            {'function '}
          </Text>
          <Text style={[mockStyles.wsCodeText, { color: '#ece8e1' }]}>
            buildSaaS
          </Text>
          <Text style={[mockStyles.wsCodeText, { color: '#8a8780' }]}>
            {'() {'}
          </Text>
        </View>
        <View style={mockStyles.wsCode}>
          <Text style={mockStyles.wsLineNum}>2</Text>
          <Text style={[mockStyles.wsCodeText, { color: '#8ab4c4' }]}>
            {'  // AI помогает на каждом шаге'}
          </Text>
        </View>
        <View style={mockStyles.wsCode}>
          <Text style={mockStyles.wsLineNum}>3</Text>
          <Text style={[mockStyles.wsCodeText, { color: '#c4a882' }]}>
            {'  const '}
          </Text>
          <Text style={[mockStyles.wsCodeText, { color: '#ece8e1' }]}>
            product
          </Text>
          <Text style={[mockStyles.wsCodeText, { color: '#8a8780' }]}>
            {' = ai.'}
          </Text>
          <Text style={[mockStyles.wsCodeText, { color: '#6a9a5a' }]}>
            create
          </Text>
          <Text style={[mockStyles.wsCodeText, { color: '#8a8780' }]}>
            {'()'}
          </Text>
        </View>
      </View>
    ),
  },
  {
    id: 'community',
    title: 'Сообщество',
    subtitle: 'Делись проектами,\nполучай фидбек от других студентов',
    accentGradient: '#82c4a8',
    renderVisual: () => (
      <ScreenshotCard source={IMG_COMMUNITY} aspectRatio={960 / 530} />
    ),
  },
  {
    id: 'results',
    title: 'От идеи до SaaS',
    subtitle: 'Реальные навыки, реальный бизнес',
    accentGradient: '#c4a882',
    renderVisual: () => <ResultsMock />,
  },
  {
    id: 'cta',
    title: 'Начни бесплатно',
    subtitle: '7 дней бесплатно.\nБез карты. Отмена в любой момент.',
    accentGradient: '#c4a882',
  },
];

// ─── Main Component ─────────────────────────────────────────────────

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

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems[0]) {
        setActiveIndex(viewableItems[0].index ?? 0);
      }
    },
  ).current;

  const handleNext = useCallback(() => {
    if (activeIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: activeIndex + 1,
        animated: true,
      });
    } else {
      void handleComplete();
    }
  }, [activeIndex, handleComplete]);

  const renderSlide = useCallback(({ item }: { item: Slide }) => {
    const isHero = item.id === 'hero';
    const isCta = item.id === 'cta';

    return (
      <View style={styles.slide}>
        {/* SVG gradient background */}
        <GradientBg accentColor={item.accentGradient} />

        {/* Visual content area */}
        <View style={styles.visualArea}>
          {isHero ? (
            <View style={styles.heroContent}>
              <KodiqLogo size={72} />
              <Text style={styles.heroBadge}>KODIQ ACADEMY</Text>
            </View>
          ) : isCta ? (
            <View style={styles.heroContent}>
              <KodiqLogo size={56} />
              <Text style={styles.ctaBadge}>🚀</Text>
            </View>
          ) : item.renderVisual ? (
            item.renderVisual()
          ) : null}
        </View>

        {/* Text content */}
        <View style={styles.textArea}>
          <Text style={styles.slideTitle}>{item.title}</Text>
          <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
        </View>
      </View>
    );
  }, []);

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
        keyExtractor={item => item.id}
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

        <Pressable style={styles.ctaButton} onPress={handleNext}>
          <Text style={styles.ctaText}>{isLastSlide ? 'Начать' : 'Далее'}</Text>
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

// ─── Styles ─────────────────────────────────────────────────────────

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
    fontFamily: MONO,
    fontSize: 13,
    color: COLORS.textMuted,
    letterSpacing: 0.3,
  },
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
  },
  visualArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  textArea: {
    paddingHorizontal: 32,
    paddingBottom: 16,
    alignItems: 'center',
  },
  slideTitle: {
    fontFamily: MONO,
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  slideSubtitle: {
    fontFamily: MONO,
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    letterSpacing: 0.2,
  },
  heroContent: {
    alignItems: 'center',
    gap: 16,
  },
  heroBadge: {
    fontFamily: MONO,
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.accent,
    letterSpacing: 3,
    marginTop: 8,
  },
  ctaBadge: {
    fontSize: 48,
    marginTop: 8,
  },
  bottom: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    alignItems: 'center',
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
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
    fontFamily: MONO,
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
});

// ─── Mock Styles ────────────────────────────────────────────────────

const mockStyles = StyleSheet.create({
  // Program accordion
  programContainer: {
    width: '100%',
    gap: 6,
  },
  programRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 12,
  },
  programCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  programNum: {
    fontFamily: MONO,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.accent,
  },
  programText: {
    flex: 1,
  },
  programLabel: {
    fontFamily: MONO,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    letterSpacing: 0.2,
  },
  programInfo: {
    fontFamily: MONO,
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
    letterSpacing: 0.2,
  },
  // AI Chat mock
  chatContainer: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    gap: 10,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  chatDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accent,
  },
  chatHeaderText: {
    fontFamily: MONO,
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.accent,
    letterSpacing: 1.5,
  },
  chatUserBubble: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    paddingVertical: 10,
    paddingHorizontal: 14,
    maxWidth: '85%',
  },
  chatAiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 10,
    paddingHorizontal: 14,
    maxWidth: '85%',
  },
  chatText: {
    fontFamily: MONO,
    fontSize: 11,
    color: COLORS.text,
    lineHeight: 16,
    letterSpacing: 0.2,
  },
  chatTyping: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  chatTypingDots: {
    fontFamily: MONO,
    fontSize: 12,
    color: COLORS.textMuted,
    letterSpacing: 2,
  },
  rolesRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  roleCard: {
    flex: 1,
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 8,
    alignItems: 'center',
  },
  roleEmoji: {
    fontSize: 16,
  },
  // Screenshot card
  screenshotWrapper: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    // Shadow
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  screenshotImage: {
    width: '100%',
    height: undefined,
  },
  // Workspace code editor mock
  workspaceContainer: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  wsTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  wsDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  wsTitle: {
    fontFamily: MONO,
    fontSize: 11,
    color: COLORS.textMuted,
    marginLeft: 8,
    letterSpacing: 0.3,
  },
  wsCode: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 14,
  },
  wsLineNum: {
    fontFamily: MONO,
    fontSize: 10,
    color: COLORS.textMuted,
    width: 20,
    textAlign: 'right',
    marginRight: 12,
  },
  wsCodeText: {
    fontFamily: MONO,
    fontSize: 12,
    letterSpacing: 0.3,
  },
  // Results checklist
  resultsContainer: {
    width: '100%',
    gap: 8,
  },
  resultsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 14,
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.accentDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    fontFamily: MONO,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.accent,
  },
  resultsText: {
    fontFamily: MONO,
    fontSize: 13,
    color: COLORS.text,
    flex: 1,
    letterSpacing: 0.2,
  },
});
