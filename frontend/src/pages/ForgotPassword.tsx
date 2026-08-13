import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { useAuthViewModel } from '../viewmodels/authViewModel';
import OtpInput from '../components/ui/OtpInput';
import AmbientBackground from '../components/common/AmbientBackground';

const ForgotPassword: React.FC = () => {
  const language = useAppSelector((state) => state.ui.language);
  const { settings } = useAppSelector((state) => state.siteSettings);
  const passwordResetPending = useAppSelector((state) => state.auth.passwordResetPending);
  const { requestPasswordReset, validatePasswordReset2faCode, cancelPasswordReset2fa, isLoading } = useAuthViewModel();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  // 2FA verification state
  const [otpValue, setOtpValue] = useState('');
  const [otpError, setOtpError] = useState(false);
  const [twoFaError, setTwoFaError] = useState('');
  const [twoFaLoading, setTwoFaLoading] = useState(false);

  const siteName = settings
    ? (language === 'en' ? settings.siteName_en : settings.siteName_sv)
    : 'Golden Portfolio';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError(language === 'en' ? 'Email is required' : 'E-post krävs');
      return;
    }

    const result = await requestPasswordReset(email);
    if (result.success) {
      if ('requiresTwoFactor' in result && result.requiresTwoFactor) {
        // 2FA view will be shown via passwordResetPending state
        return;
      }
      setSubmitted(true);
    } else {
      setError(result.error || (language === 'en' ? 'Failed to send reset email' : 'Kunde inte skicka återställningsmail'));
    }
  };

  const handleVerify2fa = async () => {
    if (otpValue.length !== 6 || !passwordResetPending.tempToken) return;
    setOtpError(false);
    setTwoFaError('');
    setTwoFaLoading(true);

    const result = await validatePasswordReset2faCode(passwordResetPending.tempToken, otpValue);
    setTwoFaLoading(false);
    if (!result.success) {
      setOtpError(true);
      setTwoFaError(result.error || (language === 'en' ? 'Invalid or expired code' : 'Ogiltig eller utgången kod'));
      setOtpValue('');
    }
    // On success, viewModel navigates to /reset-password/:token
  };

  const handleBack2fa = () => {
    cancelPasswordReset2fa();
    setOtpValue('');
    setOtpError(false);
    setTwoFaError('');
  };

  // Auto-submit on 6 digits
  const handleVerify2faRef = useRef(handleVerify2fa);
  handleVerify2faRef.current = handleVerify2fa;
  useEffect(() => {
    if (otpValue.length === 6 && passwordResetPending.tempToken) {
      handleVerify2faRef.current();
    }
  }, [otpValue, passwordResetPending.tempToken]);

  // Render 2FA verification view
  const render2faView = () => (
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
          {language === 'en' ? 'Verify your identity' : 'Verifiera din identitet'}
        </h2>
        <p className="text-sm text-gray-500 dark:text-neutral-400">
          {language === 'en'
            ? 'Enter the 6-digit code from your authenticator app to reset your password.'
            : 'Ange den 6-siffriga koden från din autentiseringsapp för att återställa ditt lösenord.'}
        </p>
      </div>

      <div>
        <OtpInput
          value={otpValue}
          onChange={(val) => {
            setOtpValue(val);
            setOtpError(false);
            setTwoFaError('');
          }}
          error={otpError}
          disabled={twoFaLoading}
          autoFocus
        />
        {twoFaError && (
          <p className="text-red-500 text-xs text-center mt-2">{twoFaError}</p>
        )}
      </div>

      <button
        onClick={handleVerify2fa}
        disabled={otpValue.length !== 6 || twoFaLoading}
        className="w-full px-6 py-3.5 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {twoFaLoading ? (
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : null}
        {language === 'en' ? 'Verify & Continue' : 'Verifiera & Fortsätt'}
      </button>

      <div className="text-center">
        <button
          onClick={handleBack2fa}
          className="text-sm text-gray-400 hover:text-gray-600 dark:text-neutral-500 dark:hover:text-neutral-300 transition-colors font-medium py-2 px-4"
        >
          {language === 'en' ? 'Back' : 'Tillbaka'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-gray-50 dark:bg-surface-950 font-sans">
      {/* Ambient background */}
      <AmbientBackground />

      <div className="relative z-10 w-full max-w-md px-4 py-12">
        {/* Logo / Site Name */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center space-x-3 group">
            {settings?.logoFile || settings?.logoUrl ? (
              <img src={settings.logoFile || settings.logoUrl} alt={siteName} className="h-10 w-auto object-contain transition-transform group-hover:scale-105" />
            ) : null}
            <span className="text-2xl font-bold tracking-tight text-gray-900 group-hover:text-primary-600 dark:text-white dark:group-hover:text-primary-400 transition-colors">{siteName}</span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-light-xl border border-gray-200 dark:bg-surface-850 dark:shadow-dark-xl dark:border-surface-700 p-5 sm:p-8 relative overflow-hidden">
          {/* Decorative element */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/10 rounded-full blur-3xl pointer-events-none opacity-50"></div>

          <div className="relative z-10">
            {passwordResetPending.tempToken ? (
              render2faView()
            ) : !submitted ? (
              <>
                <h2 className="text-2xl font-thin text-gray-800 dark:text-white mb-2">
                  {language === 'en' ? 'Forgot password?' : 'Glömt lösenord?'}
                </h2>
                <p className="text-gray-500 dark:text-neutral-400 text-sm mb-8">
                  {language === 'en'
                    ? 'Enter your email and we\'ll send you a reset link'
                    : 'Ange din e-post så skickar vi dig en återställningslänk'}
                </p>

                {error && (
                  <div className="bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-500/30 rounded-xl p-4 text-red-400 text-sm mb-6">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs text-gray-500 dark:text-neutral-400 uppercase tracking-wider ml-1 font-medium">
                      {language === 'en' ? 'Email address' : 'E-postadress'}
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="form-input"
                      placeholder={language === 'en' ? 'you@example.com' : 'du@example.com'}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full px-8 py-4 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-500 transition-all shadow-light-md hover:shadow-light-lg disabled:bg-gray-300 dark:shadow-dark-md dark:hover:shadow-dark-lg dark:disabled:bg-surface-700 disabled:cursor-not-allowed mt-2"
                  >
                    {isLoading
                      ? (language === 'en' ? 'Sending...' : 'Skickar...')
                      : (language === 'en' ? 'Send reset link' : 'Skicka återställningslänk')}
                  </button>
                </form>

                <p className="text-center text-sm text-gray-500 dark:text-neutral-400 mt-8">
                  {language === 'en' ? 'Remember your password? ' : 'Kom ihåg ditt lösenord? '}
                  <Link to="/login" className="text-primary-600 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-400 font-bold transition-colors">
                    {language === 'en' ? 'Sign in' : 'Logga in'}
                  </Link>
                </p>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                  <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-thin text-gray-800 dark:text-white mb-2">
                  {language === 'en' ? 'Check your email' : 'Kolla din e-post'}
                </h2>
                <p className="text-gray-500 dark:text-neutral-400 text-sm mb-2">
                  {language === 'en'
                    ? 'We have sent a password reset link to:'
                    : 'Vi har skickat en länk för att återställa lösenordet till:'}
                </p>
                <p className="text-gray-900 dark:text-white font-bold mb-6">{email}</p>
                <p className="text-gray-500 dark:text-neutral-400 text-sm mb-8">
                  {language === 'en'
                    ? 'Click the link in the email to reset your password. The link expires in 1 hour.'
                    : 'Klicka på länken i e-postmeddelandet för att återställa ditt lösenord. Länken upphör att gälla om 1 timme.'}
                </p>

                <Link
                  to="/login"
                  className="inline-block w-full px-8 py-4 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-500 transition-all shadow-light-md hover:shadow-light-lg dark:shadow-dark-md dark:hover:shadow-dark-lg text-center"
                >
                  {language === 'en' ? 'Go to login' : 'Gå till inloggning'}
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Back to home link */}
        <div className="text-center mt-8">
          <Link to="/" className="text-sm text-gray-400 hover:text-gray-600 dark:text-neutral-500 dark:hover:text-neutral-300 transition-colors font-medium">
            {language === 'en' ? 'Back to home' : 'Tillbaka till startsidan'}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
