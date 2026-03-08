import React, { useCallback, useEffect, useRef } from 'react';
import {
  Animated,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { COLORS } from '../config';

interface CacheIndexEntry {
  lessonId: string;
  title: string;
  cachedAt: number;
}

interface DownloadManagerProps {
  visible: boolean;
  cachedLessons: CacheIndexEntry[];
  cacheSize: number;
  onRemoveLesson: (lessonId: string) => void;
  onClearAll: () => void;
  onClose: () => void;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(timestamp: number): string {
  const d = new Date(timestamp);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

export function DownloadManager({
  visible,
  cachedLessons,
  cacheSize,
  onRemoveLesson,
  onClearAll,
  onClose,
}: DownloadManagerProps) {
  const translateY = useRef(new Animated.Value(400)).current;

  useEffect(() => {
    Animated.spring(translateY, {
      toValue: visible ? 0 : 400,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  }, [visible, translateY]);

  const renderItem = useCallback(
    ({ item }: { item: CacheIndexEntry }) => (
      <View style={styles.row}>
        <View style={styles.rowContent}>
          <Text style={styles.rowTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.rowDate}>{formatDate(item.cachedAt)}</Text>
        </View>
        <Pressable
          style={styles.deleteBtn}
          onPress={() => onRemoveLesson(item.lessonId)}
        >
          <Text style={styles.deleteBtnText}>Удалить</Text>
        </Pressable>
      </View>
    ),
    [onRemoveLesson],
  );

  const keyExtractor = useCallback(
    (item: CacheIndexEntry) => item.lessonId,
    [],
  );

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <Animated.View style={[styles.panel, { transform: [{ translateY }] }]}>
        <View style={styles.handle} />

        <View style={styles.header}>
          <Text style={styles.headerTitle}>Загруженные уроки</Text>
          <Text style={styles.headerMeta}>
            {cachedLessons.length} шт. &middot; {formatBytes(cacheSize)}
          </Text>
        </View>

        {cachedLessons.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Нет загруженных уроков</Text>
          </View>
        ) : (
          <FlatList
            data={cachedLessons}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            style={styles.list}
            showsVerticalScrollIndicator={false}
          />
        )}

        <View style={styles.footer}>
          {cachedLessons.length > 0 && (
            <Pressable style={styles.clearBtn} onPress={onClearAll}>
              <Text style={styles.clearBtnText}>Очистить всё</Text>
            </Pressable>
          )}
          <Pressable style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>Закрыть</Text>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    zIndex: 100,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  panel: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 34,
    maxHeight: '70%',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.borderStrong,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  headerMeta: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  list: {
    flexGrow: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  rowContent: {
    flex: 1,
    marginRight: 12,
  },
  rowTitle: {
    fontSize: 15,
    color: COLORS.text,
    marginBottom: 2,
  },
  rowDate: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  deleteBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(196, 112, 90, 0.15)',
  },
  deleteBtnText: {
    fontSize: 13,
    color: COLORS.error,
    fontWeight: '600',
  },
  empty: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  footer: {
    marginTop: 16,
    gap: 10,
  },
  clearBtn: {
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(196, 112, 90, 0.12)',
  },
  clearBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.error,
  },
  closeBtn: {
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: COLORS.accentDim,
  },
  closeBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.accent,
  },
});
