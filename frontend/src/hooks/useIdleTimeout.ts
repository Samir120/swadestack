import { useEffect, useRef, useCallback } from 'react';

interface UseIdleTimeoutOptions {
  idleTimeout: number;       // ms before user is considered idle
  warningDuration: number;   // ms before idle that warning fires
  onWarning: () => void;
  onIdle: () => void;
  onActive?: () => void;
  enabled: boolean;
}

const ACTIVITY_STORAGE_KEY = 'last_activity';
const THROTTLE_MS = 30_000; // 30 seconds
const CHECK_INTERVAL_MS = 30_000; // 30 seconds

export function useIdleTimeout({
  idleTimeout,
  warningDuration,
  onWarning,
  onIdle,
  onActive,
  enabled,
}: UseIdleTimeoutOptions) {
  const lastActivityRef = useRef(Date.now());
  const lastThrottleRef = useRef(0);
  const warningFiredRef = useRef(false);
  const idleFiredRef = useRef(false);

  // Stable callback refs
  const onWarningRef = useRef(onWarning);
  const onIdleRef = useRef(onIdle);
  const onActiveRef = useRef(onActive);
  onWarningRef.current = onWarning;
  onIdleRef.current = onIdle;
  onActiveRef.current = onActive;

  const updateActivity = useCallback(() => {
    // Don't register activity while warning modal is showing —
    // user must explicitly choose "Stay Logged In" or "Log Out Now"
    if (warningFiredRef.current) return;

    const now = Date.now();
    lastActivityRef.current = now;

    // Throttle localStorage writes
    if (now - lastThrottleRef.current > THROTTLE_MS) {
      lastThrottleRef.current = now;
      localStorage.setItem(ACTIVITY_STORAGE_KEY, now.toString());
    }
  }, []);

  const resetActivity = useCallback(() => {
    const now = Date.now();
    lastActivityRef.current = now;
    lastThrottleRef.current = now;
    localStorage.setItem(ACTIVITY_STORAGE_KEY, now.toString());
    warningFiredRef.current = false;
    idleFiredRef.current = false;
  }, []);

  const getRemainingTime = useCallback(() => {
    const elapsed = Date.now() - lastActivityRef.current;
    return Math.max(0, idleTimeout - elapsed);
  }, [idleTimeout]);

  useEffect(() => {
    if (!enabled) return;

    // Initialize
    resetActivity();

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach((event) => {
      window.addEventListener(event, updateActivity, { passive: true });
    });

    // Check interval for warning/idle thresholds
    const intervalId = setInterval(() => {
      const elapsed = Date.now() - lastActivityRef.current;
      const warningThreshold = idleTimeout - warningDuration;

      if (elapsed >= idleTimeout && !idleFiredRef.current) {
        idleFiredRef.current = true;
        onIdleRef.current();
      } else if (elapsed >= warningThreshold && !warningFiredRef.current) {
        warningFiredRef.current = true;
        onWarningRef.current();
      }
    }, CHECK_INTERVAL_MS);

    // Multi-tab sync: listen for activity and logout from other tabs
    const handleStorage = (e: StorageEvent) => {
      if (e.key === ACTIVITY_STORAGE_KEY && e.newValue) {
        const otherTabActivity = parseInt(e.newValue, 10);
        if (otherTabActivity > lastActivityRef.current) {
          lastActivityRef.current = otherTabActivity;
          if (warningFiredRef.current) {
            warningFiredRef.current = false;
            idleFiredRef.current = false;
            onActiveRef.current?.();
          }
        }
      }

      if (e.key === 'logout_timestamp' && e.newValue) {
        onIdleRef.current();
      }
    };

    window.addEventListener('storage', handleStorage);

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, updateActivity);
      });
      clearInterval(intervalId);
      window.removeEventListener('storage', handleStorage);
    };
  }, [enabled, idleTimeout, warningDuration, updateActivity, resetActivity]);

  return { resetActivity, getRemainingTime };
}
