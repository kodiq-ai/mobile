import React from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { COLORS } from '../config';
import type { WhatsNewEntry } from '../hooks/useWhatsNew';
import { getNavIcon } from './icons/NavIcons';

interface WhatsNewModalProps {
  visible: boolean;
  entries: WhatsNewEntry[];
  onDismiss: () => void;
}

export function WhatsNewModal({
  visible,
  entries,
  onDismiss,
}: WhatsNewModalProps) {
  const StarIcon = getNavIcon('Star');

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <StarIcon size={24} color={COLORS.accent} />
            <Text style={styles.headerTitle}>Что нового</Text>
          </View>

          {/* Entries */}
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {entries.map((entry) => (
              <View key={entry.version} style={styles.entry}>
                <Text style={styles.versionBadge}>v{entry.version}</Text>
                <Text style={styles.entryTitle}>{entry.title}</Text>
                {entry.items.map((item, i) => (
                  <View key={i} style={styles.itemRow}>
                    <Text style={styles.bullet}>{'•'}</Text>
                    <Text style={styles.itemText}>{item}</Text>
                  </View>
                ))}
              </View>
            ))}
          </ScrollView>

          {/* Dismiss button */}
          <Pressable style={styles.button} onPress={onDismiss}>
            <Text style={styles.buttonText}>Отлично!</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxHeight: '70%',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  headerTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: 0.3,
  },
  content: {
    marginBottom: 20,
  },
  entry: {
    marginBottom: 16,
  },
  versionBadge: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.accent,
    backgroundColor: COLORS.accentDim,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 6,
    letterSpacing: 0.5,
    overflow: 'hidden',
  },
  entryTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    gap: 8,
    paddingLeft: 4,
    marginBottom: 4,
  },
  bullet: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13,
    color: COLORS.textMuted,
  },
  itemText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13,
    color: COLORS.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  button: {
    backgroundColor: COLORS.accent,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
  },
});
