import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout } from '../store/slices/authSlice';
import { authApi } from '../models/api/authApi';
import apiClient from '../models/api/apiClient';
import { useIdleTimeout } from '../hooks/useIdleTimeout';

const IDLE_TIMEOUT = 30 * 60 * 1000;    // 30 minutes
const WARNING_DURATION = 3 * 60 * 1000;  // 3 minutes

interface UseSessionViewModelOptions {
  logoutRedirectPath?: string;
}

export function useSessionViewModel(options?: UseSessionViewModelOptions) {
  const logoutRedirectPath = options?.logoutRedirectPath || '/login';
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const language = useAppSelector((state) => state.ui.language) as 'en' | 'sv';

  const [showWarning, setShowWarning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopCountdown = useCallback(() => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  }, []);

  const performLogout = useCallback(() => {
    stopCountdown();
    setShowWarning(false);

    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      authApi.revokeToken(refreshToken).catch(() => {});
    }

    dispatch(logout());
    navigate(`${logoutRedirectPath}?reason=idle`);
  }, [dispatch, navigate, logoutRedirectPath, stopCountdown]);

  const onWarning = useCallback(() => {
    setShowWarning(true);
    setRemainingSeconds(Math.ceil(WARNING_DURATION / 1000));

    stopCountdown();
    countdownRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          performLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [stopCountdown, performLogout]);

  const onIdle = useCallback(() => {
    performLogout();
  }, [performLogout]);

  const onActive = useCallback(() => {
    stopCountdown();
    setShowWarning(false);
  }, [stopCountdown]);

  const { resetActivity } = useIdleTimeout({
    idleTimeout: IDLE_TIMEOUT,
    warningDuration: WARNING_DURATION,
    onWarning,
    onIdle,
    onActive,
    enabled: isAuthenticated,
  });

  const handleStayLoggedIn = useCallback(async () => {
    stopCountdown();
    setShowWarning(false);
    resetActivity();

    // Refresh token to extend session
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      try {
        const response = await authApi.refreshToken(refreshToken);
        if (response.success && response.data) {
          apiClient.setAccessToken(response.data.token);
          localStorage.setItem('refresh_token', response.data.refreshToken);
        }
      } catch {
        // Token refresh failed — session may still work with existing access token
      }
    }
  }, [stopCountdown, resetActivity]);

  const handleLogoutNow = useCallback(() => {
    performLogout();
  }, [performLogout]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCountdown();
    };
  }, [stopCountdown]);

  return {
    showWarning,
    remainingSeconds,
    warningDurationSeconds: Math.ceil(WARNING_DURATION / 1000),
    handleStayLoggedIn,
    handleLogoutNow,
    language,
  };
}
