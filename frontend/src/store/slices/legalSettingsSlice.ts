import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { legalSettingsApi } from '../../models/api/legalSettingsApi';
import { CompanyLegalSettings } from '../../models/types/legalSettings.types';

interface LegalSettingsState {
  settings: CompanyLegalSettings | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: LegalSettingsState = {
  settings: null,
  isLoading: false,
  error: null,
};

// Async thunk to fetch public legal settings
export const fetchLegalSettings = createAsyncThunk(
  'legalSettings/fetchPublic',
  async () => {
    const response = await legalSettingsApi.getPublic();
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch legal settings');
    }
    return response.data as CompanyLegalSettings;
  }
);

const legalSettingsSlice = createSlice({
  name: 'legalSettings',
  initialState,
  reducers: {
    updateLegalSettings: (state, action: PayloadAction<CompanyLegalSettings>) => {
      state.settings = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLegalSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLegalSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.settings = action.payload;
      })
      .addCase(fetchLegalSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to load legal settings';
      });
  },
});

export const { updateLegalSettings, clearError } = legalSettingsSlice.actions;
export default legalSettingsSlice.reducer;
