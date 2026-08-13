import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { useAuthViewModel } from '../viewmodels/authViewModel';
import { PasswordInput } from '../components/common/PasswordInput';
import Lottie from 'lottie-react';
import authDecorationAnimation from '../assets/animations/auth-decoration.json';
import emailSentAnimation from '../assets/animations/email-sent.json';
import AmbientBackground from '../components/common/AmbientBackground';

const Register: React.FC = () => {
  const language = useAppSelector((state) => state.ui.language);
  const { settings } = useAppSelector((state) => state.siteSettings);
  const {
    registerUser,
    isLoading,
    isValidEmail,
    isValidPassword,
    registrationSuccess,
    registrationEmail,
    resendVerificationEmail,
    clearRegistration,
  } = useAuthViewModel();
  const [userType, setUserType] = useState<'personal' | 'company'>('personal');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    company: '',
    organizationNumber: '',
    vatNumber: '',
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Clear registration state on unmount
  useEffect(() => {
    return () => {
      clearRegistration();
    };
  }, []);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleResendVerification = async () => {
    if (!registrationEmail || resendCooldown > 0) return;
    const result = await resendVerificationEmail(registrationEmail);
    if (result.success) {
      setResendCooldown(60);
    }
  };

  const siteName = settings
    ? (language === 'en' ? settings.siteName_en : settings.siteName_sv)
    : 'Golden Portfolio';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors: string[] = [];

    if (!isValidEmail(formData.email)) {
      validationErrors.push('Invalid email address');
    }

    const passwordValidation = isValidPassword(formData.password);
    if (!passwordValidation.isValid) {
      validationErrors.push(...passwordValidation.errors);
    }

    if (formData.password !== formData.confirmPassword) {
      validationErrors.push('Passwords do not match');
    }

    // Validate company-specific fields if userType is company
    if (userType === 'company') {
      if (!formData.company.trim()) {
        validationErrors.push('Company name is required');
      }
      if (!formData.organizationNumber.trim()) {
        validationErrors.push('Organization number is required');
      }
      if (!formData.vatNumber.trim()) {
        validationErrors.push('VAT number is required');
      }
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors([]);
    const result = await registerUser({
      email: formData.email,
      password: formData.password,
      firstName: formData.firstName,
      lastName: formData.lastName,
      userType,
      ...(userType === 'company' && {
        company: formData.company,
        organizationNumber: formData.organizationNumber,
        vatNumber: formData.vatNumber,
      }),
    });

    if (!result.success) {
      setErrors([result.error || 'Registration failed']);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-gray-50 dark:bg-surface-950 font-sans">
      {/* Ambient background */}
      <AmbientBackground />

      <div className="relative z-10 w-full max-w-lg px-4 py-12">
        {/* Logo / Site Name */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center group">
            {settings?.logoFile || settings?.logoUrl ? (
              <img src={settings.logoFile || settings.logoUrl} alt={siteName} className="h-10 w-auto object-contain transition-transform group-hover:scale-105" />
            ) : null}
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-light-xl border border-gray-200 dark:bg-surface-850 dark:shadow-dark-xl dark:border-surface-700 p-5 sm:p-8 relative overflow-hidden">
          {/* Decorative element */}
          <div className="absolute -top-8 -right-8 w-48 h-48 pointer-events-none opacity-60">
            <Lottie animationData={authDecorationAnimation} loop />
          </div>

          <div className="relative z-10">
            {registrationSuccess ? (
              /* Email verification success state */
              <div className="text-center py-4">
                <div className="w-20 h-20 mx-auto mb-4">
                  <Lottie animationData={emailSentAnimation} loop={false} />
                </div>
                <h2 className="text-2xl font-thin text-gray-800 dark:text-white mb-2">
                  {language === 'en' ? 'Check your email' : 'Kolla din e-post'}
                </h2>
                <p className="text-gray-500 dark:text-neutral-400 text-sm mb-2">
                  {language === 'en'
                    ? 'We have sent a verification link to:'
                    : 'Vi har skickat en verifieringslänk till:'}
                </p>
                <p className="text-gray-900 dark:text-white font-bold mb-6">{registrationEmail}</p>
                <p className="text-gray-500 dark:text-neutral-400 text-sm mb-8">
                  {language === 'en'
                    ? 'Click the link in the email to verify your account. The link expires in 24 hours.'
                    : 'Klicka på länken i e-postmeddelandet för att verifiera ditt konto. Länken upphör att gälla om 24 timmar.'}
                </p>

                <button
                  onClick={handleResendVerification}
                  disabled={resendCooldown > 0}
                  className="text-primary-600 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-400 font-bold transition-colors text-sm disabled:text-gray-400 dark:disabled:text-neutral-400 disabled:cursor-not-allowed"
                >
                  {resendCooldown > 0
                    ? (language === 'en' ? `Resend in ${resendCooldown}s` : `Skicka igen om ${resendCooldown}s`)
                    : (language === 'en' ? 'Resend verification email' : 'Skicka verifieringsmail igen')}
                </button>

                <div className="mt-8">
                  <Link
                    to="/login"
                    className="inline-block w-full px-8 py-4 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-500 transition-all shadow-light-md hover:shadow-light-lg dark:shadow-dark-md dark:hover:shadow-dark-lg text-center"
                  >
                    {language === 'en' ? 'Go to login' : 'Gå till inloggning'}
                  </Link>
                </div>
              </div>
            ) : (
              /* Registration form */
              <>
                <h2 className="text-2xl font-thin text-gray-800 dark:text-white mb-2">
                  {language === 'en' ? 'Create your account' : 'Skapa ditt konto'}
                </h2>
                <p className="text-gray-500 dark:text-neutral-400 text-sm mb-8">
                  {language === 'en' ? 'Get started with your new account' : 'Kom igång med ditt nya konto'}
                </p>

                {errors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-500/30 rounded-xl p-4 mb-6">
                    {errors.map((error, i) => (
                      <p key={i} className="text-red-400 text-sm">{error}</p>
                    ))}
                  </div>
                )}

                <form className="space-y-5" onSubmit={handleSubmit}>
                  {/* User Type Toggle */}
                  <div className="bg-gray-100 rounded-xl p-4 border border-gray-200 dark:bg-surface-800 dark:border-surface-700">
                    <label className="text-xs text-gray-500 dark:text-neutral-400 uppercase tracking-wider ml-1 font-medium mb-3 block">
                      {language === 'en' ? 'Account Type' : 'Kontotyp'}
                    </label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setUserType('personal')}
                        className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                          userType === 'personal'
                            ? 'bg-primary-600 text-white shadow-light-md dark:shadow-dark-md shadow-primary-600/20'
                            : 'bg-gray-200 text-gray-700 border border-gray-300 dark:bg-surface-700 dark:text-neutral-300 dark:border-surface-600 hover:bg-gray-200 dark:hover:bg-surface-700'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span>{language === 'en' ? 'Personal' : 'Privat'}</span>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setUserType('company')}
                        className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                          userType === 'company'
                            ? 'bg-primary-600 text-white shadow-light-md dark:shadow-dark-md shadow-primary-600/20'
                            : 'bg-gray-200 text-gray-700 border border-gray-300 dark:bg-surface-700 dark:text-neutral-300 dark:border-surface-600 hover:bg-gray-200 dark:hover:bg-surface-700'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <span>{language === 'en' ? 'Company' : 'Företag'}</span>
                        </div>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs text-gray-500 dark:text-neutral-400 uppercase tracking-wider ml-1 font-medium">
                        {language === 'en' ? 'First Name' : 'Förnamn'}
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="form-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-gray-500 dark:text-neutral-400 uppercase tracking-wider ml-1 font-medium">
                        {language === 'en' ? 'Last Name' : 'Efternamn'}
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="form-input"
                      />
                    </div>
                  </div>

                  {/* Company-specific fields */}
                  {userType === 'company' && (
                    <div className="space-y-4 bg-primary-600/10 border border-primary-500/30 rounded-xl p-5">
                      <h3 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2 text-sm">
                        <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        {language === 'en' ? 'Company Information' : 'Företagsinformation'}
                      </h3>

                      <div className="space-y-2">
                        <label className="text-xs text-gray-500 dark:text-neutral-400 uppercase tracking-wider ml-1 font-medium">
                          {language === 'en' ? 'Company Name' : 'Företagsnamn'}
                        </label>
                        <input
                          type="text"
                          required={userType === 'company'}
                          value={formData.company}
                          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                          className="form-input"
                          placeholder={language === 'en' ? 'Enter company name' : 'Ange företagsnamn'}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs text-gray-500 dark:text-neutral-400 uppercase tracking-wider ml-1 font-medium">
                            {language === 'en' ? 'Org. Number' : 'Org.nummer'}
                          </label>
                          <input
                            type="text"
                            required={userType === 'company'}
                            value={formData.organizationNumber}
                            onChange={(e) => setFormData({ ...formData, organizationNumber: e.target.value })}
                            className="form-input"
                            placeholder={language === 'en' ? 'e.g. 556000-0000' : 't.ex. 556000-0000'}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs text-gray-500 dark:text-neutral-400 uppercase tracking-wider ml-1 font-medium">
                            {language === 'en' ? 'VAT Number' : 'Momsnummer'}
                          </label>
                          <input
                            type="text"
                            required={userType === 'company'}
                            value={formData.vatNumber}
                            onChange={(e) => setFormData({ ...formData, vatNumber: e.target.value })}
                            className="form-input"
                            placeholder={language === 'en' ? 'e.g. SE556000000001' : 't.ex. SE556000000001'}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-xs text-gray-500 dark:text-neutral-400 uppercase tracking-wider ml-1 font-medium">Email</label>
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
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-gray-500 dark:text-neutral-400 uppercase tracking-wider ml-1 font-medium">
                      {language === 'en' ? 'Confirm Password' : 'Bekräfta Lösenord'}
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
                      ? (language === 'en' ? 'Creating...' : 'Skapar...')
                      : (language === 'en' ? 'Create account' : 'Skapa konto')}
                  </button>
                </form>

                <p className="text-center text-sm text-gray-500 dark:text-neutral-400 mt-8">
                  {language === 'en' ? 'Already have an account? ' : 'Har du redan ett konto? '}
                  <Link to="/login" className="text-primary-600 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-400 font-bold transition-colors">
                    {language === 'en' ? 'Sign in' : 'Logga in'}
                  </Link>
                </p>
              </>
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

export default Register;
