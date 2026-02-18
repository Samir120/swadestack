import React, { createContext, useContext, useCallback, useRef, useState } from 'react';
import ToastContainer from './ToastContainer';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextValue {
  success: (title: string, description?: string, duration?: number) => void;
  error: (title: string, description?: string, duration?: number) => void;
  warning: (title: string, description?: string, duration?: number) => void;
  info: (title: string, description?: string, duration?: number) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const MAX_TOASTS = 3;

let idCounter = 0;

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastsRef = useRef<Toast[]>([]);

  // Keep ref in sync for use in callbacks
  toastsRef.current = toasts;

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (type: ToastType, title: string, description?: string, duration?: number) => {
      const id = `toast-${++idCounter}`;
      const newToast: Toast = { id, type, title, description, duration };

      setToasts((prev) => {
        const next = [newToast, ...prev];
        // Enforce max visible toasts — drop oldest
        if (next.length > MAX_TOASTS) {
          return next.slice(0, MAX_TOASTS);
        }
        return next;
      });
    },
    []
  );

  const success = useCallback(
    (title: string, description?: string, duration?: number) => addToast('success', title, description, duration),
    [addToast]
  );

  const error = useCallback(
    (title: string, description?: string, duration?: number) => addToast('error', title, description, duration),
    [addToast]
  );

  const warning = useCallback(
    (title: string, description?: string, duration?: number) => addToast('warning', title, description, duration),
    [addToast]
  );

  const info = useCallback(
    (title: string, description?: string, duration?: number) => addToast('info', title, description, duration),
    [addToast]
  );

  return (
    <ToastContext.Provider value={{ success, error, warning, info, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
