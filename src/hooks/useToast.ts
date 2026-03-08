import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastEntry {
  id: number;
  message: string;
  type: ToastType;
}

export interface ToastContextValue {
  toasts: ToastEntry[];
  show: (message: string, type?: ToastType) => void;
  dismiss: (id: number) => void;
}

const AUTO_DISMISS_MS = 3000;

export const ToastContext = createContext<ToastContextValue | null>(null);

export function useToastProvider(): ToastContextValue {
  const [toasts, setToasts] = useState<ToastEntry[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const show = useCallback(
    (message: string, type: ToastType = 'info') => {
      const id = nextId.current++;
      setToasts(prev => [...prev, { id, message, type }]);
      setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
    },
    [dismiss],
  );

  return { toasts, show, dismiss };
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return ctx;
}
