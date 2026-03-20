import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ValidationResult, ValidationError } from '../../models/types/validation.types';
import Lottie from 'lottie-react';
import successCheckmarkAnimation from '../../assets/animations/success-checkmark.json';
import errorCrossAnimation from '../../assets/animations/error-cross.json';
import warningTriangleAnimation from '../../assets/animations/warning-triangle.json';
interface CompatibilityStatusProps {
  validationResult: ValidationResult;
  language: string;
  className?: string;
}

const CompatibilityStatus: React.FC<CompatibilityStatusProps> = ({
  validationResult,
  language,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const { errors, warnings, isValid } = validationResult;
  const hasIssues = errors.length > 0 || warnings.length > 0;

  if (!hasIssues && isValid) {
    // All compatible - show success
    return (
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-500/20 border-l-4 border-l-green-500 rounded-lg p-3.5 ${className}`}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 flex-shrink-0">
            <Lottie animationData={successCheckmarkAnimation} loop={false} />
          </div>
          <span className="text-sm font-medium text-green-700 dark:text-green-400">
            {language === 'en'
              ? 'All components are compatible'
              : 'Alla komponenter är kompatibla'}
          </span>
        </div>
      </motion.div>
    );
  }

  // Determine overall status color
  const hasErrors = errors.length > 0;
  const bgColor = hasErrors ? 'bg-red-50 dark:bg-red-900/10' : 'bg-yellow-50 dark:bg-yellow-900/10';
  const borderColor = hasErrors ? 'border border-red-200 dark:border-red-500/20 border-l-4 border-l-red-500' : 'border border-yellow-200 dark:border-yellow-500/20 border-l-4 border-l-yellow-500';
  const textColor = hasErrors ? 'text-red-700 dark:text-red-400' : 'text-yellow-700 dark:text-yellow-400';

  // Get message for validation error
  const getMessage = (error: ValidationError) =>
    language === 'en' ? error.message_en : error.message_sv;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`${bgColor} ${borderColor} rounded-lg ${className}`}
    >
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3.5 flex items-center justify-between"
      >
        <div className="flex items-center gap-2.5">
          {hasErrors ? (
            <div className="w-5 h-5 flex-shrink-0">
              <Lottie animationData={errorCrossAnimation} loop={false} />
            </div>
          ) : (
            <div className="w-5 h-5 flex-shrink-0">
              <Lottie animationData={warningTriangleAnimation} loop={false} />
            </div>
          )}
          <span className={`text-sm font-medium ${textColor}`}>
            {hasErrors
              ? language === 'en'
                ? `${errors.length} compatibility error${errors.length > 1 ? 's' : ''}`
                : `${errors.length} kompatibilitetsfel`
              : language === 'en'
              ? `${warnings.length} warning${warnings.length > 1 ? 's' : ''}`
              : `${warnings.length} varning${warnings.length > 1 ? 'ar' : ''}`}
          </span>
        </div>

        <svg
          className={`w-4 h-4 ${textColor} transform transition-transform duration-200 ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Expandable Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3.5 pb-3.5 space-y-2">
              {/* Errors */}
              {errors.map((error, index) => (
                <div
                  key={`error-${index}`}
                  className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-500/20 rounded-lg p-2.5"
                >
                  <div className="flex items-start gap-2">
                    <svg
                      className="w-4 h-4 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm text-red-700 dark:text-red-400">{getMessage(error)}</p>
                      <p className="text-xs text-red-400/70 dark:text-red-500/60 mt-1 capitalize">
                        {error.type.replace('_', ' → ')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Warnings */}
              {warnings.map((warning, index) => (
                <div
                  key={`warning-${index}`}
                  className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-500/20 rounded-lg p-2.5"
                >
                  <div className="flex items-start gap-2">
                    <svg
                      className="w-4 h-4 text-yellow-500 dark:text-yellow-400 flex-shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm text-yellow-700 dark:text-yellow-400">{getMessage(warning)}</p>
                      <p className="text-xs text-yellow-400/70 dark:text-yellow-500/60 mt-1 capitalize">
                        {warning.type.replace('_', ' → ')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Help text */}
              <p className="text-xs text-gray-400 dark:text-neutral-500 pt-2">
                {hasErrors
                  ? language === 'en'
                    ? 'Errors must be resolved before you can proceed to checkout.'
                    : 'Fel måste åtgärdas innan du kan gå till kassan.'
                  : language === 'en'
                  ? 'Warnings are informational and won\'t prevent checkout.'
                  : 'Varningar är informativa och förhindrar inte kassan.'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CompatibilityStatus;
