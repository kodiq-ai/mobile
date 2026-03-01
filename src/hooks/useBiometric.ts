import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import * as Keychain from 'react-native-keychain';

const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';
const LOCK_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

type BiometricState = 'idle' | 'locked' | 'prompting';

interface UseBiometricResult {
  /** Whether biometric is available on device */
  isAvailable: boolean;
  /** Whether user has enabled biometric */
  isEnabled: boolean;
  /** Current lock state */
  state: BiometricState;
  /** Enable biometric auth */
  enable: () => Promise<boolean>;
  /** Disable biometric auth */
  disable: () => Promise<void>;
  /** Attempt biometric unlock */
  unlock: () => Promise<boolean>;
  /** Dismiss lock (sign out fallback) */
  dismiss: () => void;
}

export function useBiometric(isAuthenticated: boolean): UseBiometricResult {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [state, setState] = useState<BiometricState>('idle');
  const backgroundTimestamp = useRef<number | null>(null);

  // Check biometric availability and saved preference
  useEffect(() => {
    if (!isAuthenticated) return;

    (async () => {
      try {
        const supported = await Keychain.getSupportedBiometryType();
        setIsAvailable(supported !== null);
      } catch {
        setIsAvailable(false);
      }

      try {
        const enabled = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
        setIsEnabled(enabled === 'true');
      } catch {
        setIsEnabled(false);
      }
    })();
  }, [isAuthenticated]);

  // Track app state for background timeout
  useEffect(() => {
    if (!isAuthenticated || !isEnabled) return;

    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'background' || nextState === 'inactive') {
        backgroundTimestamp.current = Date.now();
      } else if (nextState === 'active' && backgroundTimestamp.current) {
        const elapsed = Date.now() - backgroundTimestamp.current;
        backgroundTimestamp.current = null;
        if (elapsed >= LOCK_TIMEOUT_MS) {
          setState('locked');
        }
      }
    });

    return () => subscription.remove();
  }, [isAuthenticated, isEnabled]);

  const enable = useCallback(async (): Promise<boolean> => {
    try {
      const result = await Keychain.setGenericPassword(
        'biometric_check',
        'enabled',
        {
          service: 'ai.kodiq.biometric',
          accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY,
          accessible: Keychain.ACCESSIBLE.WHEN_PASSCODE_SET_THIS_DEVICE_ONLY,
        },
      );
      if (result) {
        await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, 'true');
        setIsEnabled(true);
        return true;
      }
    } catch {
      // Biometric enrollment failed
    }
    return false;
  }, []);

  const disable = useCallback(async () => {
    try {
      await Keychain.resetGenericPassword({ service: 'ai.kodiq.biometric' });
    } catch {
      // Ignore
    }
    await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, 'false');
    setIsEnabled(false);
    setState('idle');
  }, []);

  const unlock = useCallback(async (): Promise<boolean> => {
    setState('prompting');
    try {
      const credentials = await Keychain.getGenericPassword({
        service: 'ai.kodiq.biometric',
        authenticationPrompt: {
          title: 'Разблокировка',
          subtitle: 'Подтвердите личность',
          cancel: 'Отмена',
        },
      });
      if (credentials) {
        setState('idle');
        return true;
      }
    } catch {
      // Biometric check failed
    }
    setState('locked');
    return false;
  }, []);

  const dismiss = useCallback(() => {
    setState('idle');
  }, []);

  return { isAvailable, isEnabled, state, enable, disable, unlock, dismiss };
}
