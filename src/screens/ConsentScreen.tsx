import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';

import { KodiqLogo } from '../components/icons/KodiqLogo';
import { COLORS } from '../config';
import type { ConsentChoices } from '../services/consent';

interface ConsentScreenProps {
  initialChoices: ConsentChoices;
  onSave: (choices: ConsentChoices) => void;
}

export function ConsentScreen({ initialChoices, onSave }: ConsentScreenProps) {
  const [analytics, setAnalytics] = useState(initialChoices.analytics);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <KodiqLogo size={32} />
        <Text style={styles.title}>Конфиденциальность</Text>
        <Text style={styles.subtitle}>
          Мы уважаем вашу приватность. Выберите, какие данные вы разрешаете собирать.
        </Text>

        {/* Essential — always on */}
        <View style={styles.category}>
          <View style={styles.categoryHeader}>
            <Text style={styles.categoryTitle}>Основные</Text>
            <View style={styles.alwaysOn}>
              <Text style={styles.alwaysOnText}>Всегда вкл.</Text>
            </View>
          </View>
          <Text style={styles.categoryDesc}>
            Авторизация, отчёты об ошибках и мониторинг стабильности. Необходимы для работы приложения.
          </Text>
        </View>

        {/* Analytics — opt-in */}
        <View style={styles.category}>
          <View style={styles.categoryHeader}>
            <Text style={styles.categoryTitle}>Аналитика</Text>
            <Switch
              value={analytics}
              onValueChange={setAnalytics}
              trackColor={{
                false: COLORS.surfaceElevated,
                true: COLORS.accentDim,
              }}
              thumbColor={analytics ? COLORS.accent : COLORS.textMuted}
            />
          </View>
          <Text style={styles.categoryDesc}>
            Помогает нам улучшать приложение: какие экраны популярны, где возникают проблемы. Данные анонимизированы.
          </Text>
        </View>

        {/* Privacy policy link */}
        <Text style={styles.privacyNote}>
          Подробнее в{' '}
          <Text style={styles.privacyLink}>Политике конфиденциальности</Text>
          {'\n'}Вы можете изменить выбор в любое время в настройках.
        </Text>
      </ScrollView>

      {/* Buttons */}
      <View style={styles.buttons}>
        <Pressable
          style={styles.acceptAllButton}
          onPress={() => onSave({ essential: true, analytics: true })}
        >
          <Text style={styles.acceptAllText}>Принять всё</Text>
        </Pressable>
        <Pressable
          style={styles.saveButton}
          onPress={() => onSave({ essential: true, analytics })}
        >
          <Text style={styles.saveText}>Сохранить выбор</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 16,
  },
  title: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 20,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 8,
    marginBottom: 28,
    lineHeight: 20,
  },
  category: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    letterSpacing: 0.3,
  },
  alwaysOn: {
    backgroundColor: COLORS.accentDim,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  alwaysOnText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.accent,
    letterSpacing: 0.5,
  },
  categoryDesc: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 18,
  },
  privacyNote: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 18,
  },
  privacyLink: {
    color: COLORS.accent,
    textDecorationLine: 'underline',
  },
  buttons: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    gap: 10,
  },
  acceptAllButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  acceptAllText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
  },
  saveButton: {
    backgroundColor: COLORS.surfaceElevated,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  saveText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    letterSpacing: 0.3,
  },
});
