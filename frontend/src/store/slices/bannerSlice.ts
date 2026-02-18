import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { bannersApi } from '@/models/api/bannerssApi';
import { Banner } from '@/models/types/bannerTypes';

/**
 * Services Slice - ViewModel Layer
 * Manages services state and business logic
 */

interface BannerState {
  banners: Banner[];
  currentBanner: Banner | null;
  total: number;
  page: number;
  limit: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: BannerState = {
  banners: [],
  currentBanner: null,
  total: 0,
  page: 1,
  limit: 20,
  isLoading: false,
  error: null,
};

// Async Thunks
export const fetchBanners = createAsyncThunk(
  'banners/fetchAll',
  async ({ page = 1, limit = 20 }: { page?: number; limit?: number; }) => {
    const response = await bannersApi.getAll(page, limit);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch banners');
    }
    return response.data;
  }
);

export const fetchBannerById = createAsyncThunk(
  'banners/fetchById',
  async (id: string) => {
    const response = await bannersApi.getById(id);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch banner');
    }
    return response.data;
  }
);

// Slice
const bannersSlice = createSlice({
  name: 'banners',
  initialState,
  reducers: {
    clearCurrentBanner: (state) => {
      state.currentBanner = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all services
      .addCase(fetchBanners.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBanners.fulfilled, (state, action) => {
        state.isLoading = false;
        state.banners = action.payload.items;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
      })
      .addCase(fetchBanners.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to load services';
      })
      // Fetch single service
      .addCase(fetchBannerById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBannerById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentBanner = action.payload;
      })
      .addCase(fetchBannerById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to load service';
      });
  },
});

export const { clearCurrentBanner, clearError } = bannersSlice.actions;
export default bannersSlice.reducer;
