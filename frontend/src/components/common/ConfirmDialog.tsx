import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { FaExclamationTriangle, FaTimes, FaTrash, FaCheck } from 'react-icons/fa';

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  icon?: ReactNode;
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | null>(null);

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context.confirm;
};

interface ConfirmProviderProps {
  children: ReactNode;
}

export const ConfirmProvider: React.FC<ConfirmProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [resolveRef, setResolveRef] = useState<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setOptions(opts);
      setIsOpen(true);
      setResolveRef(() => resolve);
    });
  }, []);

  const handleConfirm = () => {
    setIsOpen(false);
    resolveRef?.(true);
  };

  const handleCancel = () => {
    setIsOpen(false);
    resolveRef?.(false);
  };

  const getTypeStyles = () => {
    switch (options?.type) {
      case 'danger':
        return {
          iconBg: 'bg-red-100 dark:bg-red-900/30',
          iconColor: 'text-red-400',
          confirmBg: 'bg-red-600 hover:bg-red-500',
          defaultIcon: <FaTrash className="text-lg" />,
        };
      case 'warning':
        return {
          iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
          iconColor: 'text-yellow-400',
          confirmBg: 'bg-yellow-600 hover:bg-yellow-500',
          defaultIcon: <FaExclamationTriangle className="text-lg" />,
        };
      case 'info':
      default:
        return {
          iconBg: 'bg-primary-100 dark:bg-primary-600/20',
          iconColor: 'text-primary-600 dark:text-primary-400',
          confirmBg: 'bg-primary-600 hover:bg-primary-500',
          defaultIcon: <FaCheck className="text-lg" />,
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}

      {/* Modal Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={handleCancel}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          {/* Modal */}
          <div
            className="relative bg-white border border-gray-200 rounded-2xl shadow-light-xl dark:bg-surface-850 dark:border-surface-700 dark:shadow-dark-xl w-full max-w-md transform transition-all animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleCancel}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:text-neutral-500 dark:hover:text-neutral-300 dark:hover:bg-surface-800 rounded-lg transition-colors"
            >
              <FaTimes size={14} />
            </button>

            {/* Content */}
            <div className="p-6 pt-8">
              {/* Icon */}
              <div className={`w-16 h-16 ${styles.iconBg} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <div className={styles.iconColor}>
                  {options?.icon || styles.defaultIcon}
                </div>
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">
                {options?.title || 'Confirm Action'}
              </h3>

              {/* Message */}
              <p className="text-sm text-gray-500 dark:text-neutral-400 text-center leading-relaxed">
                {options?.message}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 p-6 pt-2">
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 font-bold text-sm rounded-xl hover:bg-gray-100 dark:border-surface-700 dark:text-neutral-300 dark:hover:bg-surface-800 transition-colors active:scale-[0.98]"
              >
                {options?.cancelText || 'Cancel'}
              </button>
              <button
                onClick={handleConfirm}
                className={`flex-1 px-4 py-3 text-white font-bold text-sm rounded-xl transition-colors active:scale-[0.98] ${styles.confirmBg}`}
              >
                {options?.confirmText || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};

export default ConfirmProvider;
