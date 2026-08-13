import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  validateTwoFactorLogin,
  sendTwoFactorRecoveryCode,
  verifyTwoFactorRecoveryCode,
  clearTwoFactorPending,
} from '../store/slices/twoFactorSlice';
import { fetchServerCart, mergeServerCart, syncCartToServer } from '../store/slices/cartSlice';
import OtpInput from '../components/ui/OtpInput';
import AmbientBackground from '../components/common/AmbientBackground';

const TwoFactorLoginPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const language = useAppSelector((state) => state.ui.language);
  const { settings } = useAppSelector((state) => state.siteSettings);
  const { pendingLogin } = useAppSelector((state) => state.twoFactor);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const user = useAppSelector((state) => state.auth.user);

  const [mode, setMode] = useState<'authenticator' | 'recovery'>('authenticator');
  const [recoveryStep, setRecoveryStep] = useState<'request' | 'verify'>('request');
  const [otpValue, setOtpValue] = useState('');
  const [otpError, setOtpError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const siteName = settings
    ? (language === 'en' ? settings.siteName_en : settings.siteName_sv)
    : 'Golden Portfolio';

  // Redirect if no temp token
  useEffect(() => {
    if (!pendingLogin.tempToken) {
      navigate('/login', { replace: true });
    }
  }, [pendingLogin.tempToken, navigate]);

  // Handle successful login — sync cart and redirect
  useEffect(() => {
    if (isAuthenticated && user) {
      const syncAndRedirect = async () => {
        try {
          const cartResult = await dispatch(fetchServerCart());
          if (fetchServerCart.fulfilled.match(cartResult) && cartResult.payload.items.length > 0) {
            dispatch(mergeServerCart(cartResult.payload.items));
          }
          await dispatch(syncCartToServer());
        } catch {
          // Cart sync failure is non-critical
        }
        navigate(user.role === 'admin' ? '/admin' : '/', { replace: true });
      };
      syncAndRedirect();
    }
  }, [isAuthenticated, user]);

  const handleVerifyAuthenticator = async () => {
    if (otpValue.length !== 6 || !pendingLogin.tempToken) return;
    setOtpError(false);
    setErrorMessage('');

    const result = await dispatch(
      validateTwoFactorLogin({ tempToken: pendingLogin.tempToken, token: otpValue })
    );
    if (!validateTwoFactorLogin.fulfilled.match(result)) {
      setOtpError(true);
      setErrorMessage(language === 'en' ? 'Invalid or expired code' : 'Ogiltig eller utgången kod');
      setOtpValue('');
    }
  };

  const handleSendRecovery = async () => {
    if (!pendingLogin.tempToken) return;
    setErrorMessage('');
    const result = await dispatch(sendTwoFactorRecoveryCode(pendingLogin.tempToken));
    if (sendTwoFactorRecoveryCode.fulfilled.match(result)) {
      setRecoveryStep('verify');
    } else {
      setErrorMessage(language === 'en' ? 'Failed to send recovery code' : 'Kunde inte skicka återställningskod');
    }
  };

  const handleVerifyRecovery = async () => {
    if (otpValue.length !== 6 || !pendingLogin.tempToken) return;
    setOtpError(false);
    setErrorMessage('');

    const result = await dispatch(
      verifyTwoFactorRecoveryCode({ tempToken: pendingLogin.tempToken, code: otpValue })
    );
    if (!verifyTwoFactorRecoveryCode.fulfilled.match(result)) {
      setOtpError(true);
      setErrorMessage(language === 'en' ? 'Invalid or expired recovery code' : 'Ogiltig eller utgången återställningskod');
      setOtpValue('');
    }
  };

  // Auto-submit on 6 digits
  useEffect(() => {
    if (otpValue.length === 6) {
      if (mode === 'authenticator') {
        handleVerifyAuthenticator();
      } else if (mode === 'recovery' && recoveryStep === 'verify') {
        handleVerifyRecovery();
      }
    }
  }, [otpValue]);

  const handleBackToLogin = () => {
    dispatch(clearTwoFactorPending());
    navigate('/login');
  };

  const switchMode = (newMode: 'authenticator' | 'recovery') => {
    setMode(newMode);
    setOtpValue('');
    setOtpError(false);
    setErrorMessage('');
    if (newMode === 'recovery') setRecoveryStep('request');
  };

  if (!pendingLogin.tempToken) return null;

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-gray-50 dark:bg-surface-950 font-sans">
      {/* Ambient background */}
      <AmbientBackground />

      <div className="relative z-10 w-full max-w-md px-4 py-12">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center group">
            {settings?.logoFile || settings?.logoUrl ? (
              <img src={settings.logoFile || settings.logoUrl} alt={siteName} className="h-10 w-auto object-contain transition-transform group-hover:scale-105" />
            ) : null}
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-light-xl border border-gray-200 dark:bg-surface-850 dark:shadow-dark-xl dark:border-surface-700 p-5 sm:p-8">
          {mode === 'authenticator' ? (
            <div className="space-y-6">
              {/* Icon */}
              <div className="flex justify-center">
                <div className="w-14 h-14 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <svg className="w-7 h-7 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>

              <div className="text-center">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {language === 'en' ? 'Check your authenticator app' : 'Kontrollera din autentiseringsapp'}
                </h2>
                <p className="text-sm text-gray-500 dark:text-neutral-400">
                  {language === 'en'
                    ? 'Enter the 6-digit code shown in your authenticator app.'
                    : 'Ange den 6-siffriga koden som visas i din autentiseringsapp.'}
                </p>
              </div>

              <div>
                <OtpInput
                  value={otpValue}
                  onChange={(val) => {
                    setOtpValue(val);
                    setOtpError(false);
                    setErrorMessage('');
                  }}
                  error={otpError}
                  disabled={pendingLogin.isLoading}
                  autoFocus
                />
                {errorMessage && (
                  <p className="text-red-500 text-xs text-center mt-2">{errorMessage}</p>
                )}
              </div>

              <button
                onClick={handleVerifyAuthenticator}
                disabled={otpValue.length !== 6 || pendingLogin.isLoading}
                className="w-full px-6 py-3.5 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {pendingLogin.isLoading ? (
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : null}
                {language === 'en' ? 'Verify' : 'Verifiera'}
              </button>

              <div className="text-center">
                <button
                  onClick={() => switchMode('recovery')}
                  className="text-sm text-primary-600 dark:text-primary-400 font-medium hover:underline py-2 px-4"
                >
                  {language === 'en' ? 'Use a recovery code instead' : 'Använd en återställningskod istället'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Recovery mode */}
              <div className="flex justify-center">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <svg className="w-7 h-7 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>

              {recoveryStep === 'request' ? (
                <>
                  <div className="text-center">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {language === 'en' ? 'Email recovery' : 'E-poståterställning'}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-neutral-400">
                      {language === 'en'
                        ? "We'll send a 6-digit code to the email address on your account."
                        : 'Vi skickar en 6-siffrig kod till e-postadressen kopplad till ditt konto.'}
                    </p>
                  </div>

                  <button
                    onClick={handleSendRecovery}
                    disabled={pendingLogin.isLoading}
                    className="w-full px-6 py-3.5 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {pendingLogin.isLoading ? (
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : null}
                    {language === 'en' ? 'Send recovery code' : 'Skicka återställningskod'}
                  </button>
                  {errorMessage && (
                    <p className="text-red-500 text-xs text-center">{errorMessage}</p>
                  )}
                </>
              ) : (
                <>
                  <div className="text-center">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {language === 'en' ? 'Enter recovery code' : 'Ange återställningskod'}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-neutral-400">
                      {language === 'en'
                        ? 'A code was sent to your email. It expires in 10 minutes.'
                        : 'En kod har skickats till din e-post. Den upphör att gälla om 10 minuter.'}
                    </p>
                  </div>

                  <div>
                    <OtpInput
                      value={otpValue}
                      onChange={(val) => {
                        setOtpValue(val);
                        setOtpError(false);
                        setErrorMessage('');
                      }}
                      error={otpError}
                      disabled={pendingLogin.isLoading}
                      autoFocus
                    />
                    {errorMessage && (
                      <p className="text-red-500 text-xs text-center mt-2">{errorMessage}</p>
                    )}
                  </div>

                  <button
                    onClick={handleVerifyRecovery}
                    disabled={otpValue.length !== 6 || pendingLogin.isLoading}
                    className="w-full px-6 py-3.5 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {pendingLogin.isLoading ? (
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : null}
                    {language === 'en' ? 'Verify Recovery Code' : 'Verifiera återställningskod'}
                  </button>
                </>
              )}

              <div className="text-center">
                <button
                  onClick={() => switchMode('authenticator')}
                  className="text-sm text-primary-600 dark:text-primary-400 font-medium hover:underline py-2 px-4"
                >
                  {language === 'en' ? 'Back to authenticator code' : 'Tillbaka till autentiseringskod'}
                </button>
              </div>
            </div>
          )}

          {/* Back to login */}
          <div className="text-center mt-6 pt-4 border-t border-gray-200 dark:border-surface-700">
            <button
              onClick={handleBackToLogin}
              className="text-sm text-gray-400 hover:text-gray-600 dark:text-neutral-500 dark:hover:text-neutral-300 transition-colors font-medium py-2 px-4"
            >
              {language === 'en' ? 'Back to login' : 'Tillbaka till inloggning'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorLoginPage;
