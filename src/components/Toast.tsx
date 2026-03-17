import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS } from '../config';
import {
  ToastContext,
  type ToastEntry,
  type ToastType,
  useToastProvider,
} from '../hooks/useToast';
import { hapticError, hapticSuccess } from '../utils/haptics';

const SLIDE_DURATION = 300;

const TYPE_COLORS: Record<ToastType, string> = {
  success: COLORS.success,
  error: COLORS.error,
  info: COLORS.accent,
};

function ToastItem({
  entry,
  onDismiss,
}: {
  entry: ToastEntry;
  onDismiss: () => void;
}) {
  const translateY = useRef(new Animated.Value(80)).current;

  useEffect(() => {
    // Haptic on mount
    if (entry.type === 'success') hapticSuccess();
    else if (entry.type === 'error') hapticError();

    Animated.timing(translateY, {
      toValue: 0,
      duration: SLIDE_DURATION,
      useNativeDriver: true,
    }).start();
  }, [translateY, entry.type]);

  const handleDismiss = () => {
    Animated.timing(translateY, {
      toValue: 80,
      duration: SLIDE_DURATION,
      useNativeDriver: true,
    }).start(onDismiss);
  };

  return (
    <Animated.View style={[styles.toast, { transform: [{ translateY }] }]}>
      <Pressable style={styles.toastInner} onPress={handleDismiss}>
        <View
          style={[
            styles.indicator,
            { backgroundColor: TYPE_COLORS[entry.type] },
          ]}
        />
        <Text style={styles.toastText} numberOfLines={2}>
          {entry.message}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

function ToastContainer() {
  const insets = useSafeAreaInsets();
  const { toasts, dismiss } = React.useContext(ToastContext)!;

  if (toasts.length === 0) return null;

  return (
    <View
      style={[styles.container, { bottom: insets.bottom + 16 }]}
      pointerEvents="box-none"
    >
      {toasts.map(entry => (
        <ToastItem
          key={entry.id}
          entry={entry}
          onDismiss={() => dismiss(entry.id)}
        />
      ))}
    </View>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const value = useToastProvider();

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    alignItems: 'center',
    zIndex: 9999,
  },
  toast: {
    width: '100%',
    marginTop: 8,
  },
  toastInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  indicator: {
    width: 4,
    height: 20,
    borderRadius: 2,
    marginRight: 12,
  },
  toastText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
    color: COLORS.text,
    flex: 1,
    letterSpacing: 0.3,
  },
});
