import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  login,
  register,
  logout,
  fetchProfile,
  verifyEmail,
  resendVerification,
  clearRegistrationState,
  forgotPassword,
  resetPassword,
  validatePasswordReset2fa,
  setPasswordResetPending,
  clearPasswordResetPending,
  isRequiresTwoFactor,
} from '../store/slices/authSlice';
import { setTwoFactorPending } from '../store/slices/twoFactorSlice';
import { fetchServerCart, mergeServerCart, syncCartToServer } from '../store/slices/cartSlice';
import { authApi } from '../models/api/authApi';
import { LoginData, RegisterData } from '../models/types/user.types';
export const useAuthViewModel = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, error, registrationSuccess, registrationEmail } =
    useAppSelector((state) => state.auth);

  /**
   * Login user
   */
  const loginUser = async (data: LoginData) => {
    const result = await dispatch(login(data));
    if (login.fulfilled.match(result)) {
      // Check if 2FA is required
      if (isRequiresTwoFactor(result.payload)) {
        dispatch(setTwoFactorPending(result.payload.tempToken));
        navigate('/2fa-verify');
        return { success: true, requiresTwoFactor: true };
      }

      // Merge server cart with local cart after login
      try {
        const cartResult = await dispatch(fetchServerCart());
        if (fetchServerCart.fulfilled.match(cartResult) && cartResult.payload.items.length > 0) {
          dispatch(mergeServerCart(cartResult.payload.items));
        }
        // Sync merged cart back to server (await to ensure it completes before navigation)
        await dispatch(syncCartToServer());
      } catch {
        // Cart sync failure is non-critical
      }

      // Check if user is admin and redirect accordingly
      const userData = result.payload.user;
      if (userData.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
      return { success: true };
    }
    return { success: false, error: result.error.message };
  };

  /**
   * Register new user (no auto-login - user must verify email)
   */
  const registerUser = async (data: RegisterData) => {
    const result = await dispatch(register(data));
    if (register.fulfilled.match(result)) {
      return { success: true };
    }
    return { success: false, error: result.error.message };
  };

  /**
   * Verify email with token
   */
  const verifyEmailToken = async (token: string) => {
    const result = await dispatch(verifyEmail(token));
    if (verifyEmail.fulfilled.match(result)) {
      return { success: true };
    }
    return { success: false, error: result.error.message };
  };

  /**
   * Resend verification email
   */
  const resendVerificationEmail = async (email: string) => {
    const result = await dispatch(resendVerification(email));
    if (resendVerification.fulfilled.match(result)) {
      return { success: true };
    }
    return { success: false, error: result.error.message };
  };

  /**
   * Clear registration state
   */
  const clearRegistration = () => {
    dispatch(clearRegistrationState());
  };

  /**
   * Request password reset email
   */
  const requestPasswordReset = async (email: string) => {
    const result = await dispatch(forgotPassword(email));
    if (forgotPassword.fulfilled.match(result)) {
      if (result.payload.requiresTwoFactor) {
        dispatch(setPasswordResetPending(result.payload.tempToken));
        return { success: true, requiresTwoFactor: true };
      }
      return { success: true };
    }
    return { success: false, error: result.error.message };
  };

  const validatePasswordReset2faCode = async (tempToken: string, token: string) => {
    const result = await dispatch(validatePasswordReset2fa({ tempToken, token }));
    if (validatePasswordReset2fa.fulfilled.match(result)) {
      const resetToken = result.payload;
      dispatch(clearPasswordResetPending());
      navigate(`/reset-password/${resetToken}`);
      return { success: true };
    }
    return { success: false, error: result.error.message };
  };

  const cancelPasswordReset2fa = () => {
    dispatch(clearPasswordResetPending());
  };

  /**
   * Reset password with token
   */
  const resetUserPassword = async (token: string, newPassword: string) => {
    const result = await dispatch(resetPassword({ token, newPassword }));
    if (resetPassword.fulfilled.match(result)) {
      return { success: true };
    }
    return { success: false, error: result.error.message };
  };

  /**
   * Logout user
   * Revokes refresh token on server, clears local state, and navigates
   */
  const logoutUser = async (options?: { reason?: string; redirectPath?: string }) => {
    // Revoke refresh token on server (fire-and-forget)
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      authApi.revokeToken(refreshToken).catch(() => {});
    }

    dispatch(logout());

    const path = options?.redirectPath || '/login';
    const query = options?.reason ? `?reason=${options.reason}` : '';
    navigate(`${path}${query}`);
  };

  /**
   * Load user profile
   */
  const loadProfile = () => {
    if (isAuthenticated && !user) {
      dispatch(fetchProfile());
    }
  };

  // Note: initial session rehydration is handled by rehydrateSession in App.tsx.
  // loadProfile() is available for manual refreshes if needed.

  /**
   * Check if user is admin
   */
  const isAdmin = (): boolean => {
    return user?.role === 'admin';
  };

  /**
   * Get user full name
   */
  const getUserFullName = (): string => {
    if (!user) return '';
    return `${user.firstName} ${user.lastName}`;
  };

  /**
   * Get user initials
   */
  const getUserInitials = (): string => {
    if (!user) return '';
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  };

  /**
   * Validate email format
   */
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  /**
   * Validate password strength
   */
  const isValidPassword = (password: string): {
    isValid: boolean;
    errors: string[];
  } => {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }
    if (!/[a-zA-Z]/.test(password)) {
      errors.push('Password must contain letters');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain numbers');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  /**
   * Check if passwords match
   */
  const passwordsMatch = (password: string, confirmPassword: string): boolean => {
    return password === confirmPassword;
  };

  /**
   * Require authentication - redirect if not authenticated
   */
  const requireAuth = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return false;
    }
    return true;
  };

  /**
   * Require admin - redirect if not admin
   */
  const requireAdmin = () => {
    if (!isAuthenticated || !isAdmin()) {
      navigate('/');
      return false;
    }
    return true;
  };

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,
    registrationSuccess,
    registrationEmail,

    // Actions
    loginUser,
    registerUser,
    logoutUser,
    loadProfile,
    verifyEmailToken,
    resendVerificationEmail,
    clearRegistration,
    requestPasswordReset,
    resetUserPassword,
    validatePasswordReset2faCode,
    cancelPasswordReset2fa,

    // Business Logic
    isAdmin,
    getUserFullName,
    getUserInitials,
    isValidEmail,
    isValidPassword,
    passwordsMatch,
    requireAuth,
    requireAdmin,
  };
};

export default useAuthViewModel;
