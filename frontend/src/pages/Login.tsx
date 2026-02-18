import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { useAuthViewModel } from '../viewmodels/authViewModel';
import { useToast } from '../components/common/Toast';
import { PasswordInput } from '../components/common/PasswordInput';
import Lottie from 'lottie-react';
import authDecorationAnimation from '../assets/animations/auth-decoration.json';

const Login: React.FC = () => {
  const language = useAppSelector((state) => state.ui.language);
  const { settings } = useAppSelector((state) => state.siteSettings);
  const { loginUser, isLoading, resendVerificationEmail } = useAuthViewModel();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showResend, setShowResend] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendMessage, setResendMessage] = useState('');

  useEffect(() => {
    if (searchParams.get('reason') === 'idle') {
      toast.warning(
        language === 'en'
          ? 'You were logged out due to inactivity'
          : 'Du loggades ut på grund av inaktivitet'
      );
      searchParams.delete('reason');
      setSearchParams(searchParams, { replace: true });
    }
  }, []);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const siteName = settings
    ? (language === 'en' ? settings.siteName_en : settings.siteName_sv)
    : 'Golden Portfolio';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setShowResend(false);
    setResendMessage('');
    const result = await loginUser(formData);
    if (!result.success) {
      const errorMsg = result.error || 'Login failed';
      setError(errorMsg);
      // Show resend option if the error is about email verification
      if (errorMsg.toLowerCase().includes('verify your email')) {
        setShowResend(true);
      }
    }
  };

  const handleResendVerification = async () => {
    if (resendCooldown > 0 || !formData.email) return;
    const result = await resendVerificationEmail(formData.email);
    if (result.success) {
      setResendCooldown(60);
      setResendMessage(
        language === 'en'
          ? 'Verification email sent! Check your inbox.'
          : 'Verifieringsmail skickat! Kontrollera din inkorg.'
      );
    } else {
      setResendMessage(result.error || (language === 'en' ? 'Failed to resend' : 'Kunde inte skicka igen'));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-gray-50 dark:bg-surface-950 font-sans">
      {/* Ambient background */}
      <div className="fixed inset-0 z-0 pointer-events-none hidden dark:block">
        <div className="absolute top-0 left-0 w-full h-[800px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-surface-900 via-surface-850 to-surface-950"></div>
        <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-primary-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] left-[-10%] w-[600px] h-[600px] bg-blue-900/20 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 brightness-100 mix-blend-multiply"></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-4 py-12">
        {/* Logo / Site Name */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center group">
            {settings?.logoFile || settings?.logoUrl ? (
              <img src={settings.logoFile || settings.logoUrl} alt={siteName} className="h-10 w-auto object-contain transition-transform group-hover:scale-105" />
            ) : null}
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-light-xl border border-gray-200 dark:bg-surface-850 dark:shadow-dark-xl dark:border-surface-700 p-8 relative overflow-hidden">
          {/* Decorative element */}
          <div className="absolute -top-8 -right-8 w-48 h-48 pointer-events-none opacity-60">
            <Lottie animationData={authDecorationAnimation} loop />
          </div>

          <div className="relative z-10">
            <h2 className="text-2xl font-thin text-gray-800 dark:text-white mb-2">
              {language === 'en' ? 'Welcome back' : 'Välkommen tillbaka'}
            </h2>
            <p className="text-gray-500 dark:text-neutral-400 text-sm mb-8">
              {language === 'en' ? 'Sign in to your account to continue' : 'Logga in på ditt konto för att fortsätta'}
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-500/30 rounded-xl p-4 mb-6">
                <p className="text-red-400 text-sm">{error}</p>
                {showResend && (
                  <div className="mt-3 pt-3 border-t border-red-500/30">
                    <button
                      onClick={handleResendVerification}
                      disabled={resendCooldown > 0}
                      className="text-primary-600 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-400 font-bold text-sm transition-colors disabled:text-gray-400 dark:disabled:text-neutral-400 disabled:cursor-not-allowed"
                    >
                      {resendCooldown > 0
                        ? (language === 'en' ? `Resend in ${resendCooldown}s` : `Skicka igen om ${resendCooldown}s`)
                        : (language === 'en' ? 'Resend verification email' : 'Skicka verifieringsmail igen')}
                    </button>
                    {resendMessage && (
                      <p className="text-green-400 text-xs mt-2">{resendMessage}</p>
                    )}
                  </div>
                )}
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
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="form-input"
                  placeholder={language === 'en' ? 'you@example.com' : 'du@example.com'}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-gray-500 dark:text-neutral-400 uppercase tracking-wider ml-1 font-medium">
                  {language === 'en' ? 'Password' : 'Lösenord'}
                </label>
                <PasswordInput
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="form-input"
                />
                <div className="text-right">
                  <Link to="/forgot-password" className="text-xs text-primary-600 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-400 font-medium transition-colors">
                    {language === 'en' ? 'Forgot password?' : 'Glömt lösenord?'}
                  </Link>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-8 py-4 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-500 transition-all shadow-light-md hover:shadow-light-lg disabled:bg-gray-300 dark:shadow-dark-md dark:hover:shadow-dark-lg dark:disabled:bg-surface-700 disabled:cursor-not-allowed mt-2"
              >
                {isLoading
                  ? (language === 'en' ? 'Signing in...' : 'Loggar in...')
                  : (language === 'en' ? 'Sign in' : 'Logga in')}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 dark:text-neutral-400 mt-8">
              {language === 'en' ? "Don't have an account? " : 'Har du inget konto? '}
              <Link to="/register" className="text-primary-600 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-400 font-bold transition-colors">
                {language === 'en' ? 'Sign up' : 'Registrera dig'}
              </Link>
            </p>
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

export default Login;
