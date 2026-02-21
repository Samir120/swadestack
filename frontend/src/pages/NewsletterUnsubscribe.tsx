import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { newsletterApi } from '../models/api/newsletterApi';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Lottie from 'lottie-react';
import authDecorationAnimation from '../assets/animations/auth-decoration.json';
import successCheckmarkAnimation from '../assets/animations/success-checkmark.json';
import errorCrossAnimation from '../assets/animations/error-cross.json';

const NewsletterUnsubscribe: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const language = useAppSelector((state) => state.ui.language);
  const { settings } = useAppSelector((state) => state.siteSettings);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  const siteName = settings
    ? (language === 'en' ? settings.siteName_en : settings.siteName_sv)
    : 'Portfolio';

  useEffect(() => {
    const unsubscribe = async () => {
      if (!token) {
        setStatus('error');
        setErrorMessage(language === 'en' ? 'Invalid unsubscribe link' : 'Ogiltig avprenumerationsl\u00e4nk');
        return;
      }

      try {
        await newsletterApi.unsubscribeByToken(token);
        setStatus('success');
      } catch (error: any) {
        const msg = error?.response?.data?.error || error?.message || '';
        if (msg.toLowerCase().includes('already')) {
          setStatus('success');
        } else {
          setStatus('error');
          setErrorMessage(msg || (language === 'en' ? 'Unsubscribe failed' : 'Avprenumerationen misslyckades'));
        }
      }
    };

    unsubscribe();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-gray-50 dark:bg-surface-950 font-sans">
      <div className="fixed inset-0 z-0 pointer-events-none hidden dark:block">
        <div className="absolute top-0 left-0 w-full h-[800px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-surface-900 via-surface-850 to-surface-950"></div>
        <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-primary-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] left-[-10%] w-[600px] h-[600px] bg-blue-900/20 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 brightness-100 mix-blend-multiply"></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-4 py-12">
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center group">
            {settings?.logoFile || settings?.logoUrl ? (
              <img src={settings.logoFile || settings.logoUrl} alt={siteName} className="h-10 w-auto object-contain transition-transform group-hover:scale-105" />
            ) : null}
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-light-xl border border-gray-200 dark:bg-surface-850 dark:shadow-dark-xl dark:border-surface-700 p-8 relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-48 h-48 pointer-events-none opacity-60">
            <Lottie animationData={authDecorationAnimation} loop />
          </div>

          <div className="relative z-10">
            {status === 'loading' && (
              <div className="text-center py-8">
                <LoadingSpinner className="mb-4" />
                <h2 className="text-xl font-thin text-gray-800 dark:text-white mb-2">
                  {language === 'en' ? 'Processing your request...' : 'Behandlar din f\u00f6rfr\u00e5gan...'}
                </h2>
                <p className="text-gray-500 dark:text-neutral-400 text-sm">
                  {language === 'en' ? 'Please wait a moment' : 'V\u00e4nta ett \u00f6gonblick'}
                </p>
              </div>
            )}

            {status === 'success' && (
              <div className="text-center py-8">
                <div className="w-20 h-20 mx-auto mb-4">
                  <Lottie animationData={successCheckmarkAnimation} loop={false} />
                </div>
                <h2 className="text-xl font-thin text-gray-800 dark:text-white mb-2">
                  {language === 'en' ? 'Unsubscribed successfully' : 'Avprenumererad'}
                </h2>
                <p className="text-gray-500 dark:text-neutral-400 text-sm mb-6">
                  {language === 'en'
                    ? 'You have been removed from our newsletter. You can resubscribe anytime from our website.'
                    : 'Du har tagits bort fr\u00e5n v\u00e5rt nyhetsbrev. Du kan prenumerera igen n\u00e4r som helst fr\u00e5n v\u00e5r webbplats.'}
                </p>
                <Link
                  to="/"
                  className="inline-block w-full px-8 py-4 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-500 transition-all shadow-light-md hover:shadow-light-lg dark:shadow-dark-md dark:hover:shadow-dark-lg text-center"
                >
                  {language === 'en' ? 'Go to homepage' : 'G\u00e5 till startsidan'}
                </Link>
              </div>
            )}

            {status === 'error' && (
              <div className="text-center py-8">
                <div className="w-20 h-20 mx-auto mb-4">
                  <Lottie animationData={errorCrossAnimation} loop={false} />
                </div>
                <h2 className="text-xl font-thin text-gray-800 dark:text-white mb-2">
                  {language === 'en' ? 'Something went wrong' : 'N\u00e5got gick fel'}
                </h2>
                <p className="text-gray-500 dark:text-neutral-400 text-sm mb-6">
                  {errorMessage}
                </p>
                <Link
                  to="/"
                  className="inline-block w-full px-8 py-4 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-500 transition-all shadow-light-md hover:shadow-light-lg dark:shadow-dark-md dark:hover:shadow-dark-lg text-center"
                >
                  {language === 'en' ? 'Go to homepage' : 'G\u00e5 till startsidan'}
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="text-center mt-8">
          <Link to="/" className="text-sm text-gray-400 hover:text-gray-600 dark:text-neutral-500 dark:hover:text-neutral-300 transition-colors font-medium">
            {language === 'en' ? 'Back to home' : 'Tillbaka till startsidan'}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NewsletterUnsubscribe;
