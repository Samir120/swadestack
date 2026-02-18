import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { featuresApi } from '@/models/api/featuresApi';
import { Feature } from '@/models/types/feature.types';

interface FeaturesState {
  features: Feature[];
  isLoading: boolean;
  error: string | null;
}

const initialState: FeaturesState = {
  features: [],
  isLoading: false,
  error: null,
};

export const fetchFeatures = createAsyncThunk(
  'features/fetchActive',
  async () => {
    const response = await featuresApi.getActive();
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch features');
    }
    return response.data;
  }
);

const featuresSlice = createSlice({
  name: 'features',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeatures.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFeatures.fulfilled, (state, action) => {
        state.isLoading = false;
        state.features = action.payload;
      })
      .addCase(fetchFeatures.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to load features';
      });
  },
});

export const { clearError } = featuresSlice.actions;
export default featuresSlice.reducer;
