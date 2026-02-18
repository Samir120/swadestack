import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { servicesApi } from '../../models/api/servicesApi';
import { Service } from '../../models/types/service.types';

/**
 * Services Slice - ViewModel Layer
 * Manages services state and business logic
 */

interface ServicesState {
  services: Service[];
  currentService: Service | null;
  total: number;
  page: number;
  limit: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: ServicesState = {
  services: [],
  currentService: null,
  total: 0,
  page: 1,
  limit: 20,
  isLoading: false,
  error: null,
};

// Async Thunks
export const fetchServices = createAsyncThunk(
  'services/fetchAll',
  async ({ page = 1, limit = 20, category }: { page?: number; limit?: number; category?: string }) => {
    const response = await servicesApi.getAll(page, limit, category);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch services');
    }
    return response.data;
  }
);

export const fetchServiceById = createAsyncThunk(
  'services/fetchById',
  async (id: string) => {
    const response = await servicesApi.getById(id);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch service');
    }
    return response.data;
  }
);

// Slice
const servicesSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {
    clearCurrentService: (state) => {
      state.currentService = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all services
      .addCase(fetchServices.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.isLoading = false;
        state.services = action.payload.items;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to load services';
      })
      // Fetch single service
      .addCase(fetchServiceById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchServiceById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentService = action.payload;
      })
      .addCase(fetchServiceById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to load service';
      });
  },
});

export const { clearCurrentService, clearError } = servicesSlice.actions;
export default servicesSlice.reducer;
