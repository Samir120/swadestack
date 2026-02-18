import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { useAuthViewModel } from '../viewmodels/authViewModel';

const ForgotPassword: React.FC = () => {
  const language = useAppSelector((state) => state.ui.language);
  const { settings } = useAppSelector((state) => state.siteSettings);
  const { requestPasswordReset, isLoading } = useAuthViewModel();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

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
      setSubmitted(true);
    } else {
      setError(result.error || (language === 'en' ? 'Failed to send reset email' : 'Kunde inte skicka återställningsmail'));
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
          <Link to="/" className="inline-flex items-center space-x-3 group">
            {settings?.logoFile || settings?.logoUrl ? (
              <img src={settings.logoFile || settings.logoUrl} alt={siteName} className="h-10 w-auto object-contain transition-transform group-hover:scale-105" />
            ) : null}
            <span className="text-2xl font-bold tracking-tight text-gray-900 group-hover:text-primary-600 dark:text-white dark:group-hover:text-primary-400 transition-colors">{siteName}</span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-light-xl border border-gray-200 dark:bg-surface-850 dark:shadow-dark-xl dark:border-surface-700 p-8 relative overflow-hidden">
          {/* Decorative element */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/10 rounded-full blur-3xl pointer-events-none opacity-50"></div>

          <div className="relative z-10">
            {!submitted ? (
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
