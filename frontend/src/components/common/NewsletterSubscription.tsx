import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNewsletterViewModel } from '../../viewmodels/newsletterViewModel';

const Spinner: React.FC = () => (
  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

const Checkmark: React.FC = () => (
  <svg
    className="h-4 w-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const buttonStyles: Record<string, string> = {
  default: 'bg-primary-600 hover:bg-primary-700',
  loading: 'bg-primary-600 opacity-75',
  subscribed: 'bg-red-600 hover:bg-red-700',
  success: 'bg-green-600',
};

const NewsletterSubscription: React.FC = () => {
  const { t } = useTranslation();
  const { state, actions, computed } = useNewsletterViewModel();

  const renderButtonContent = () => {
    switch (computed.buttonState) {
      case 'loading':
        return (
          <span className="flex items-center gap-1.5">
            <Spinner />
            {t('newsletter.checking')}
          </span>
        );
      case 'subscribed':
        return <span>{t('newsletter.unsubscribe')}</span>;
      case 'success':
        return (
          <span className="flex items-center gap-1.5">
            <Checkmark />
            {t('newsletter.subscribed')}
          </span>
        );
      default:
        return <span>{t('newsletter.subscribe')}</span>;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!computed.canSubmit) return;
    if (computed.buttonState === 'subscribed') {
      actions.handleUnsubscribe();
    } else {
      actions.handleSubscribe();
    }
  };

  const showInvalidHint =
    state.hasTouched && state.email.length > 0 && !computed.isValidEmail;

  return (
    <div className="mt-5">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">
        {t('newsletter.title')}
      </h4>
      <form onSubmit={handleSubmit} className="flex gap-2 items-center">
        <input
          type="email"
          value={state.email}
          onChange={(e) => actions.handleEmailChange(e.target.value)}
          placeholder={t('newsletter.placeholder')}
          className="flex-1 min-w-0 h-10 px-3 text-sm bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500/50 transition-all duration-200"
        />
        <button
          type="submit"
          disabled={!computed.canSubmit}
          className={`h-10 px-4 text-sm font-medium text-white rounded-lg whitespace-nowrap transition-all duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed ${buttonStyles[computed.buttonState]}`}
        >
          {renderButtonContent()}
        </button>
      </form>
      {showInvalidHint && (
        <p className="mt-1.5 text-xs text-red-400">
          {t('newsletter.invalidEmail')}
        </p>
      )}
      {computed.buttonState === 'subscribed' && (
        <p className="mt-1.5 text-xs text-slate-400">
          {t('newsletter.alreadySubscribed')}
        </p>
      )}
      {state.error && (
        <p className="mt-1.5 text-xs text-red-400">
          {t(`newsletter.${state.error}`, state.error)}
        </p>
      )}
    </div>
  );
};

export default NewsletterSubscription;
