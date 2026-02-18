import React, { useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { Toast, ToastType } from './ToastContext';

const DEFAULT_DURATION = 4000;

type SvgIconProps = { size: number; className?: string };
const CheckIcon: React.FC<SvgIconProps> = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 6 9 17l-5-5"/></svg>
);
const XIcon: React.FC<SvgIconProps> = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);
const AlertTriangleIcon: React.FC<SvgIconProps> = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
);
const InfoIcon: React.FC<SvgIconProps> = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
);

const iconConfig: Record<ToastType, { bg: string; color: string; Icon: React.FC<SvgIconProps> }> = {
  success: {
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    color: 'text-emerald-600 dark:text-emerald-400',
    Icon: CheckIcon,
  },
  error: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    color: 'text-red-600 dark:text-red-400',
    Icon: XIcon,
  },
  warning: {
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    color: 'text-amber-600 dark:text-amber-400',
    Icon: AlertTriangleIcon,
  },
  info: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    color: 'text-blue-600 dark:text-blue-400',
    Icon: InfoIcon,
  },
};

interface ToastItemProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onDismiss }) => {
  const { type, title, description, id, duration } = toast;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const remainingRef = useRef(duration ?? DEFAULT_DURATION);
  const startRef = useRef(Date.now());

  const { bg, color, Icon } = iconConfig[type];

  const startTimer = useCallback(() => {
    startRef.current = Date.now();
    timerRef.current = setTimeout(() => {
      onDismiss(id);
    }, remainingRef.current);
  }, [id, onDismiss]);

  const pauseTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
      remainingRef.current -= Date.now() - startRef.current;
      if (remainingRef.current < 0) remainingRef.current = 0;
    }
  }, []);

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [startTimer]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 80 }}
      transition={{
        type: 'spring',
        stiffness: 500,
        damping: 35,
        mass: 1,
        opacity: { duration: 0.2 },
      }}
      onMouseEnter={pauseTimer}
      onMouseLeave={startTimer}
      className="relative flex items-start gap-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl px-5 py-4 min-w-[320px] max-w-[420px]"
    >
      {/* Icon */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full ${bg} flex items-center justify-center`}>
        <Icon size={16} className={color} />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0 pt-0.5">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">{title}</p>
        {description && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={() => onDismiss(id)}
        className="flex-shrink-0 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        aria-label="Dismiss"
      >
        <XIcon size={14} />
      </button>
    </motion.div>
  );
};

export default ToastItem;
