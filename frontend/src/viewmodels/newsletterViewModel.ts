import { useCallback, useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  setEmail,
  clearError,
  clearSuccessMessage,
  resetNewsletter,
  checkNewsletterStatus,
  subscribeNewsletter,
  unsubscribeNewsletter,
} from '../store/slices/newsletterSlice';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const useNewsletterViewModel = () => {
  const dispatch = useAppDispatch();
  const language = useAppSelector((state) => state.ui.language);
  const {
    email,
    isSubscribed,
    isCheckingStatus,
    isSubmitting,
    error,
    successMessage,
  } = useAppSelector((state) => state.newsletter);

  const [hasTouched, setHasTouched] = useState(false);
  const [showSuccessState, setShowSuccessState] = useState(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Subscribe success: show green state for 3s, then reset form
  useEffect(() => {
    if (successMessage === 'subscribeSuccess') {
      setShowSuccessState(true);
      const timer = setTimeout(() => {
        setShowSuccessState(false);
        setHasTouched(false);
        dispatch(resetNewsletter());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, dispatch]);

  // Unsubscribe success: reset form immediately
  useEffect(() => {
    if (successMessage === 'unsubscribeSuccess') {
      setHasTouched(false);
      dispatch(resetNewsletter());
    }
  }, [successMessage, dispatch]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleEmailChange = useCallback(
    (value: string) => {
      setHasTouched((prev) => (!prev && value.length > 0) ? true : prev);
      setShowSuccessState(false);
      dispatch(setEmail(value));
      dispatch(clearError());
      dispatch(clearSuccessMessage());

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      if (EMAIL_REGEX.test(value)) {
        debounceTimerRef.current = setTimeout(() => {
          dispatch(checkNewsletterStatus(value));
        }, 600);
      }
    },
    [dispatch]
  );

  const handleSubscribe = useCallback(async () => {
    if (!EMAIL_REGEX.test(email)) return;
    await dispatch(subscribeNewsletter({
      email,
      language: language as 'en' | 'sv',
    }));
  }, [dispatch, email, language]);

  const handleUnsubscribe = useCallback(async () => {
    if (!EMAIL_REGEX.test(email)) return;
    await dispatch(unsubscribeNewsletter(email));
  }, [dispatch, email]);

  const isValidEmail = EMAIL_REGEX.test(email);

  let buttonState: 'default' | 'loading' | 'subscribed' | 'success';
  if (showSuccessState) {
    buttonState = 'success';
  } else if (isSubmitting || isCheckingStatus) {
    buttonState = 'loading';
  } else if (isSubscribed === true) {
    buttonState = 'subscribed';
  } else {
    buttonState = 'default';
  }

  const canSubmit =
    isValidEmail && !isSubmitting && !isCheckingStatus && !showSuccessState;

  return {
    state: {
      email,
      isSubscribed,
      error,
      hasTouched,
    },
    actions: {
      handleEmailChange,
      handleSubscribe,
      handleUnsubscribe,
    },
    computed: {
      isValidEmail,
      canSubmit,
      buttonState,
    },
  };
};
