import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  scheduleDailyReminder,
  cancelReminder,
  getReminderSchedule,
} from '../services/reminder-scheduler';

const COLORS = {
  background: '#0D0D0D',
  accent: '#D4944A',
  text: '#F5F5F5',
  textMuted: '#666',
  accentDim: 'rgba(212,148,74,0.15)',
  warning: '#E8A54C',
};

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 15, 30, 45];
const FONT_MONO = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

interface ReminderSettingsScreenProps {
  visible: boolean;
  onClose: () => void;
}

export const ReminderSettingsScreen: React.FC<ReminderSettingsScreenProps> = ({
  visible,
  onClose,
}) => {
  const [selectedHour, setSelectedHour] = useState(9);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      void loadSchedule();
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 250,
        useNativeDriver: true,
      }).start();
    } else {
      scaleAnim.setValue(0);
    }
  }, [visible, scaleAnim]);

  const loadSchedule = async () => {
    const schedule = await getReminderSchedule();
    if (schedule) {
      setSelectedHour(schedule.hour);
      setSelectedMinute(schedule.minute);
    }
  };

  const handleSave = async () => {
    await scheduleDailyReminder(selectedHour, selectedMinute);
    onClose();
  };

  const handleDisable = async () => {
    await cancelReminder();
    onClose();
  };

  const pad = (n: number): string => n.toString().padStart(2, '0');

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[styles.card, { transform: [{ scale: scaleAnim }] }]}
        >
          <Text style={styles.title}>Напоминания о занятиях</Text>
          <Text style={styles.subtitle}>
            Выбери время для ежедневного напоминания
          </Text>

          <View style={styles.pickerRow}>
            <View style={styles.pickerColumn}>
              <Text style={styles.pickerLabel}>Часы</Text>
              <ScrollView
                style={styles.pickerScroll}
                showsVerticalScrollIndicator={false}
              >
                {HOURS.map(h => (
                  <Pressable
                    key={`h-${h}`}
                    style={[
                      styles.pickerItem,
                      selectedHour === h && styles.pickerItemSelected,
                    ]}
                    onPress={() => setSelectedHour(h)}
                  >
                    <Text
                      style={[
                        styles.pickerItemText,
                        selectedHour === h && styles.pickerItemTextSelected,
                      ]}
                    >
                      {pad(h)}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            <Text style={styles.pickerSeparator}>:</Text>

            <View style={styles.pickerColumn}>
              <Text style={styles.pickerLabel}>Минуты</Text>
              <ScrollView
                style={styles.pickerScroll}
                showsVerticalScrollIndicator={false}
              >
                {MINUTES.map(m => (
                  <Pressable
                    key={`m-${m}`}
                    style={[
                      styles.pickerItem,
                      selectedMinute === m && styles.pickerItemSelected,
                    ]}
                    onPress={() => setSelectedMinute(m)}
                  >
                    <Text
                      style={[
                        styles.pickerItemText,
                        selectedMinute === m && styles.pickerItemTextSelected,
                      ]}
                    >
                      {pad(m)}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </View>

          <Pressable style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Сохранить</Text>
          </Pressable>

          <Pressable style={styles.disableButton} onPress={handleDisable}>
            <Text style={styles.disableButtonText}>Отключить</Text>
          </Pressable>

          <Pressable style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Закрыть</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: 300,
    backgroundColor: COLORS.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.accent,
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    fontFamily: FONT_MONO,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontFamily: FONT_MONO,
    marginBottom: 20,
    textAlign: 'center',
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  pickerColumn: {
    alignItems: 'center',
    flex: 1,
  },
  pickerLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontFamily: FONT_MONO,
    marginBottom: 8,
  },
  pickerScroll: {
    maxHeight: 180,
  },
  pickerItem: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 2,
    alignItems: 'center',
  },
  pickerItemSelected: {
    backgroundColor: COLORS.accentDim,
  },
  pickerItemText: {
    fontSize: 20,
    color: COLORS.textMuted,
    fontFamily: FONT_MONO,
  },
  pickerItemTextSelected: {
    color: COLORS.accent,
    fontWeight: '700',
  },
  pickerSeparator: {
    fontSize: 24,
    color: COLORS.accent,
    fontFamily: FONT_MONO,
    fontWeight: '700',
    marginTop: 20,
    marginHorizontal: 4,
  },
  saveButton: {
    width: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.background,
    fontFamily: FONT_MONO,
  },
  disableButton: {
    width: '100%',
    backgroundColor: COLORS.accentDim,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  disableButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.warning,
    fontFamily: FONT_MONO,
  },
  closeButton: {
    width: '100%',
    paddingVertical: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontFamily: FONT_MONO,
  },
});
