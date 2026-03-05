import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  initiateTwoFactorSetup,
  verifyAndEnableTwoFactor,
  fetchTwoFactorStatus,
  clearSetup,
} from '../../store/slices/twoFactorSlice';
import OtpInput from '../ui/OtpInput';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'sv';
}

const TwoFactorSetupModal: React.FC<Props> = ({ isOpen, onClose, language }) => {
  const dispatch = useAppDispatch();
  const { setup } = useAppSelector((state) => state.twoFactor);
  const [step, setStep] = useState(1);
  const [otpValue, setOtpValue] = useState('');
  const [otpError, setOtpError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [showManualKey, setShowManualKey] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setOtpValue('');
      setOtpError(false);
      setErrorMessage('');
      setCopied(false);
      setShowManualKey(false);
      dispatch(clearSetup());
    }
  }, [isOpen, dispatch]);

  const handleContinueToSetup = async () => {
    const result = await dispatch(initiateTwoFactorSetup());
    if (initiateTwoFactorSetup.fulfilled.match(result)) {
      setStep(2);
    }
  };

  const handleVerify = async () => {
    if (otpValue.length !== 6) return;
    setOtpError(false);
    setErrorMessage('');

    const result = await dispatch(verifyAndEnableTwoFactor(otpValue));
    if (verifyAndEnableTwoFactor.fulfilled.match(result)) {
      setStep(3);
    } else {
      setOtpError(true);
      setErrorMessage(
        language === 'en' ? 'Invalid code. Please try again.' : 'Ogiltig kod. Försök igen.'
      );
      setOtpValue('');
    }
  };

  const handleDone = () => {
    dispatch(fetchTwoFactorStatus());
    onClose();
  };

  const handleCopyKey = async () => {
    if (setup.manualEntryCode) {
      await navigator.clipboard.writeText(setup.manualEntryCode.replace(/\s/g, ''));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Auto-submit when all 6 digits entered
  useEffect(() => {
    if (otpValue.length === 6 && step === 2) {
      handleVerify();
    }
  }, [otpValue]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div
        className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-white dark:bg-surface-850 rounded-2xl shadow-2xl border border-gray-200 dark:border-surface-700"
        role="dialog"
        aria-modal="true"
        aria-label={language === 'en' ? 'Set up two-factor authentication' : 'Konfigurera tvåfaktorsautentisering'}
      >
        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 pt-4 sm:pt-6 pb-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  s < step
                    ? 'bg-green-500 text-white'
                    : s === step
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 dark:bg-surface-700 text-gray-400 dark:text-neutral-500'
                }`}
              >
                {s < step ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  s
                )}
              </div>
              {s < 3 && (
                <div className={`w-8 h-0.5 transition-colors duration-300 ${s < step ? 'bg-green-500' : 'bg-gray-200 dark:bg-surface-700'}`} />
              )}
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-gray-400 dark:text-neutral-500 mb-4">
          {language === 'en' ? `Step ${step} of 3` : `Steg ${step} av 3`}
        </p>

        <div className="px-4 sm:px-6 pb-4 sm:pb-6">
          {/* Step 1: Intro */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="text-center">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {language === 'en' ? 'Secure your account' : 'Säkra ditt konto'}
                </h2>
                <p className="text-sm text-gray-500 dark:text-neutral-400">
                  {language === 'en'
                    ? 'Prevents unauthorized access even if your password is compromised.'
                    : 'Förhindrar obehörig åtkomst även om ditt lösenord äventyras.'}
                </p>
              </div>

              {/* Method card */}
              <div className="border-2 border-primary-500 dark:border-primary-400 rounded-xl p-4 bg-primary-50/50 dark:bg-primary-900/10 relative">
                <div className="absolute top-3 right-3">
                  <div className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                      {language === 'en' ? 'Authenticator App' : 'Autentiseringsapp'}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">
                      {language === 'en'
                        ? 'Get codes from Google Authenticator, Authy, 1Password, or any TOTP app.'
                        : 'Hämta koder från Google Authenticator, Authy, 1Password eller valfri TOTP-app.'}
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-400 dark:text-neutral-500 text-center">
                {language === 'en'
                  ? 'Already have an authenticator app? You\'re ready to go.'
                  : 'Har du redan en autentiseringsapp? Då är du redo.'}
              </p>

              <button
                onClick={handleContinueToSetup}
                disabled={setup.isLoading}
                className="w-full px-6 py-3.5 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {setup.isLoading ? (
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : null}
                {language === 'en' ? 'Continue' : 'Fortsätt'}
              </button>
            </div>
          )}

          {/* Step 2: QR Code & Verification */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="text-center">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {language === 'en' ? 'Set up authenticator' : 'Konfigurera autentiserare'}
                </h2>
              </div>

              {/* Instructions */}
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary-600 dark:text-primary-400">1</span>
                  <span className="text-gray-600 dark:text-neutral-300">
                    {language === 'en' ? 'Open your authenticator app' : 'Öppna din autentiseringsapp'}
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary-600 dark:text-primary-400">2</span>
                  <span className="text-gray-600 dark:text-neutral-300">
                    {language === 'en' ? 'Scan the QR code or enter the key manually' : 'Skanna QR-koden eller ange nyckeln manuellt'}
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary-600 dark:text-primary-400">3</span>
                  <span className="text-gray-600 dark:text-neutral-300">
                    {language === 'en' ? 'Enter the 6-digit code shown in the app' : 'Ange den 6-siffriga koden som visas i appen'}
                  </span>
                </div>
              </div>

              {/* QR Code */}
              {setup.qrCodeDataUrl && (
                <div className="flex justify-center">
                  <div className="p-3 bg-white rounded-xl border border-gray-200 dark:border-surface-600 shadow-sm">
                    <img src={setup.qrCodeDataUrl} alt="QR Code" className="w-40 h-40 sm:w-48 sm:h-48" />
                  </div>
                </div>
              )}

              {/* Manual key toggle */}
              <div className="text-center">
                <button
                  onClick={() => setShowManualKey(!showManualKey)}
                  className="text-xs text-primary-600 dark:text-primary-400 hover:underline font-medium"
                >
                  {language === 'en' ? "Can't scan the code?" : 'Kan du inte skanna koden?'}
                </button>
              </div>

              {showManualKey && setup.manualEntryCode && (
                <div className="bg-gray-50 dark:bg-surface-800 rounded-xl p-3 border border-gray-200 dark:border-surface-700">
                  <div className="flex items-center justify-between gap-2">
                    <code className="text-xs sm:text-sm font-mono font-bold text-gray-900 dark:text-white tracking-wider break-all min-w-0">
                      {setup.manualEntryCode}
                    </code>
                    <button
                      onClick={handleCopyKey}
                      className="text-xs px-2.5 py-1.5 rounded-lg bg-gray-200 dark:bg-surface-700 text-gray-600 dark:text-neutral-300 hover:bg-gray-300 dark:hover:bg-surface-600 transition-colors font-medium flex-shrink-0"
                    >
                      {copied
                        ? (language === 'en' ? 'Copied!' : 'Kopierad!')
                        : (language === 'en' ? 'Copy' : 'Kopiera')}
                    </button>
                  </div>
                </div>
              )}

              {/* OTP Input */}
              <div>
                <OtpInput
                  value={otpValue}
                  onChange={(val) => {
                    setOtpValue(val);
                    setOtpError(false);
                    setErrorMessage('');
                  }}
                  error={otpError}
                  disabled={setup.isLoading}
                  autoFocus
                />
                {errorMessage && (
                  <p className="text-red-500 text-xs text-center mt-2">{errorMessage}</p>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-surface-600 text-gray-700 dark:text-neutral-300 font-bold text-sm hover:bg-gray-50 dark:hover:bg-surface-800 transition-colors"
                >
                  {language === 'en' ? 'Back' : 'Tillbaka'}
                </button>
                <button
                  onClick={handleVerify}
                  disabled={otpValue.length !== 6 || setup.isLoading}
                  className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-xl font-bold text-sm hover:bg-primary-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {setup.isLoading ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : null}
                  {language === 'en' ? 'Enable 2FA' : 'Aktivera 2FA'}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Success */}
          {step === 3 && (
            <div className="space-y-5 text-center py-4">
              {/* Animated checkmark */}
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center animate-scale-in">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {language === 'en' ? 'Two-Factor Authentication Enabled' : 'Tvåfaktorsautentisering aktiverad'}
                </h2>
                <p className="text-sm text-gray-500 dark:text-neutral-400">
                  {language === 'en'
                    ? 'Your account is now more secure. If you lose access to your authenticator, you can use email recovery at login.'
                    : 'Ditt konto är nu säkrare. Om du tappar åtkomst till din autentiserare kan du använda e-poståterställning vid inloggning.'}
                </p>
              </div>

              <button
                onClick={handleDone}
                className="w-full px-6 py-3.5 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-500 transition-all"
              >
                {language === 'en' ? 'Done' : 'Klar'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TwoFactorSetupModal;
