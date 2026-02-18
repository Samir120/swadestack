import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { vatSettingsApi } from '../../models/api/vatSettingsApi';
import { VatSettings } from '../../models/types/vatSettings.types';

interface VatSettingsState {
  settings: VatSettings | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: VatSettingsState = {
  settings: null,
  isLoading: false,
  error: null,
};

// Async thunk to fetch public VAT settings
export const fetchVatSettings = createAsyncThunk(
  'vatSettings/fetchPublic',
  async () => {
    const response = await vatSettingsApi.getPublic();
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch VAT settings');
    }
    return response.data as VatSettings;
  }
);

const vatSettingsSlice = createSlice({
  name: 'vatSettings',
  initialState,
  reducers: {
    updateVatSettings: (state, action: PayloadAction<VatSettings>) => {
      state.settings = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVatSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchVatSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.settings = action.payload;
      })
      .addCase(fetchVatSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to load VAT settings';
      });
  },
});

export const { updateVatSettings, clearError } = vatSettingsSlice.actions;
export default vatSettingsSlice.reducer;
