import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { useAuthViewModel } from '../viewmodels/authViewModel';
import { PasswordInput } from '../components/common/PasswordInput';
import AmbientBackground from '../components/common/AmbientBackground';

const ResetPassword: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const language = useAppSelector((state) => state.ui.language);
  const { settings } = useAppSelector((state) => state.siteSettings);
  const { resetUserPassword, isLoading, isValidPassword } = useAuthViewModel();
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);

  const siteName = settings
    ? (language === 'en' ? settings.siteName_en : settings.siteName_sv)
    : 'Golden Portfolio';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors: string[] = [];

    const passwordValidation = isValidPassword(formData.password);
    if (!passwordValidation.isValid) {
      validationErrors.push(...passwordValidation.errors);
    }

    if (formData.password !== formData.confirmPassword) {
      validationErrors.push(language === 'en' ? 'Passwords do not match' : 'Lösenorden matchar inte');
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (!token) {
      setErrors([language === 'en' ? 'Invalid reset link' : 'Ogiltig återställningslänk']);
      return;
    }

    setErrors([]);
    const result = await resetUserPassword(token, formData.password);
    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } else {
      setErrors([result.error || (language === 'en' ? 'Failed to reset password' : 'Kunde inte återställa lösenord')]);
    }
  };

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
        <div className="bg-white rounded-2xl shadow-light-xl border border-gray-200 dark:bg-surface-850 dark:shadow-dark-xl dark:border-surface-700 p-8 relative overflow-hidden">
          {/* Decorative element */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/10 rounded-full blur-3xl pointer-events-none opacity-50"></div>

          <div className="relative z-10">
            {!success ? (
              <>
                <h2 className="text-2xl font-thin text-gray-800 dark:text-white mb-2">
                  {language === 'en' ? 'Reset password' : 'Återställ lösenord'}
                </h2>
                <p className="text-gray-500 dark:text-neutral-400 text-sm mb-8">
                  {language === 'en'
                    ? 'Enter your new password below'
                    : 'Ange ditt nya lösenord nedan'}
                </p>

                {errors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-500/30 rounded-xl p-4 mb-6">
                    {errors.map((error, i) => (
                      <p key={i} className="text-red-400 text-sm">{error}</p>
                    ))}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs text-gray-500 dark:text-neutral-400 uppercase tracking-wider ml-1 font-medium">
                      {language === 'en' ? 'New Password' : 'Nytt lösenord'}
                    </label>
                    <PasswordInput
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-gray-500 dark:text-neutral-400 uppercase tracking-wider ml-1 font-medium">
                      {language === 'en' ? 'Confirm Password' : 'Bekräfta lösenord'}
                    </label>
                    <input
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full px-8 py-4 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-500 transition-all shadow-light-md hover:shadow-light-lg disabled:bg-gray-300 dark:shadow-dark-md dark:hover:shadow-dark-lg dark:disabled:bg-surface-700 disabled:cursor-not-allowed mt-2"
                  >
                    {isLoading
                      ? (language === 'en' ? 'Resetting...' : 'Återställer...')
                      : (language === 'en' ? 'Reset password' : 'Återställ lösenord')}
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
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                  <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-xl font-thin text-gray-800 dark:text-white mb-2">
                  {language === 'en' ? 'Password reset successful!' : 'Lösenordet har återställts!'}
                </h2>
                <p className="text-gray-500 dark:text-neutral-400 text-sm mb-6">
                  {language === 'en'
                    ? 'Your password has been reset successfully. You can now log in with your new password.'
                    : 'Ditt lösenord har återställts. Du kan nu logga in med ditt nya lösenord.'}
                </p>
                <p className="text-gray-400 dark:text-neutral-500 text-xs">
                  {language === 'en' ? 'Redirecting to login...' : 'Omdirigerar till inloggning...'}
                </p>
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

export default ResetPassword;
