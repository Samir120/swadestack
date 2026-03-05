import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { disableTwoFactor, fetchTwoFactorStatus } from '../../store/slices/twoFactorSlice';
import { PasswordInput } from '../common/PasswordInput';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'sv';
}

const TwoFactorDisableModal: React.FC<Props> = ({ isOpen, onClose, language }) => {
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state) => state.twoFactor);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setPassword('');
      setError('');
    }
  }, [isOpen]);

  const handleDisable = async () => {
    if (!password) return;
    setError('');

    const result = await dispatch(disableTwoFactor(password));
    if (disableTwoFactor.fulfilled.match(result)) {
      dispatch(fetchTwoFactorStatus());
      onClose();
    } else {
      setError(
        result.error.message?.includes('Incorrect password')
          ? (language === 'en' ? 'Incorrect password' : 'Felaktigt lösenord')
          : (language === 'en' ? 'Failed to disable 2FA' : 'Kunde inte inaktivera 2FA')
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div
        className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-white dark:bg-surface-850 rounded-2xl shadow-2xl border border-gray-200 dark:border-surface-700"
        role="dialog"
        aria-modal="true"
        aria-label={language === 'en' ? 'Disable two-factor authentication' : 'Inaktivera tvåfaktorsautentisering'}
      >
        {/* Warning banner */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-700/30 px-4 sm:px-6 py-3">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
              {language === 'en' ? 'This will reduce your account security.' : 'Detta minskar säkerheten för ditt konto.'}
            </p>
          </div>
        </div>

        <div className="px-4 sm:px-6 py-4 sm:py-5 space-y-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
              {language === 'en' ? 'Disable Two-Factor Authentication' : 'Inaktivera tvåfaktorsautentisering'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-neutral-400">
              {language === 'en'
                ? 'Enter your password to confirm this action.'
                : 'Ange ditt lösenord för att bekräfta denna åtgärd.'}
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-gray-500 dark:text-neutral-400 uppercase tracking-wider ml-1 font-medium">
              {language === 'en' ? 'Password' : 'Lösenord'}
            </label>
            <PasswordInput
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              className="form-input"
              autoFocus
            />
            {error && <p className="text-red-500 text-xs ml-1">{error}</p>}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-surface-600 text-gray-700 dark:text-neutral-300 font-bold text-sm hover:bg-gray-50 dark:hover:bg-surface-800 transition-colors"
            >
              {language === 'en' ? 'Cancel' : 'Avbryt'}
            </button>
            <button
              onClick={handleDisable}
              disabled={!password || isLoading}
              className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : null}
              {language === 'en' ? 'Disable 2FA' : 'Inaktivera 2FA'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorDisableModal;
