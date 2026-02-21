import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { newsletterApi } from '../../models/api/newsletterApi';
import { NewsletterSubscribeData } from '../../models/types/newsletter.types';

interface NewsletterState {
  email: string;
  isSubscribed: boolean | null;
  isCheckingStatus: boolean;
  isSubmitting: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: NewsletterState = {
  email: '',
  isSubscribed: null,
  isCheckingStatus: false,
  isSubmitting: false,
  error: null,
  successMessage: null,
};

export const checkNewsletterStatus = createAsyncThunk(
  'newsletter/checkStatus',
  async (email: string) => {
    const response = await newsletterApi.checkStatus(email);
    return response;
  }
);

export const subscribeNewsletter = createAsyncThunk(
  'newsletter/subscribe',
  async (data: NewsletterSubscribeData) => {
    const response = await newsletterApi.subscribe(data);
    return response;
  }
);

export const unsubscribeNewsletter = createAsyncThunk(
  'newsletter/unsubscribe',
  async (email: string) => {
    const response = await newsletterApi.unsubscribeByEmail(email);
    return response;
  }
);

const newsletterSlice = createSlice({
  name: 'newsletter',
  initialState,
  reducers: {
    setEmail: (state, action: PayloadAction<string>) => {
      state.email = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    resetNewsletter: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Check status
      .addCase(checkNewsletterStatus.pending, (state) => {
        state.isCheckingStatus = true;
        state.error = null;
      })
      .addCase(checkNewsletterStatus.fulfilled, (state, action) => {
        state.isCheckingStatus = false;
        state.isSubscribed = action.payload.isSubscribed;
      })
      .addCase(checkNewsletterStatus.rejected, (state) => {
        state.isCheckingStatus = false;
        state.isSubscribed = null;
      })

      // Subscribe
      .addCase(subscribeNewsletter.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(subscribeNewsletter.fulfilled, (state) => {
        state.isSubmitting = false;
        state.isSubscribed = true;
        state.successMessage = 'subscribeSuccess';
      })
      .addCase(subscribeNewsletter.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.error.message || 'subscribeFailed';
      })

      // Unsubscribe
      .addCase(unsubscribeNewsletter.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(unsubscribeNewsletter.fulfilled, (state) => {
        state.isSubmitting = false;
        state.isSubscribed = false;
        state.successMessage = 'unsubscribeSuccess';
      })
      .addCase(unsubscribeNewsletter.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.error.message || 'unsubscribeFailed';
      });
  },
});

export const { setEmail, clearError, clearSuccessMessage, resetNewsletter } =
  newsletterSlice.actions;

export default newsletterSlice.reducer;
