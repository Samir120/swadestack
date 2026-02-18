import React from 'react';
import { AnimatePresence } from 'framer-motion';
import ToastItem from './ToastItem';
import type { Toast } from './ToastContext';

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col gap-3">
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;
