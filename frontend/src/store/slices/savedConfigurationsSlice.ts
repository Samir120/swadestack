import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { pcConfigurationApi } from '../../models/api/pcConfigurationApi';
import { PCConfiguration, ConfigurationStatus } from '../../models/types/pcConfiguration.types';

/**
 * Saved Configurations Slice - ViewModel Layer
 * Manages saved PC configurations for user dashboard
 */

interface SavedConfigurationsState {
  configurations: PCConfiguration[];
  total: number;
  isLoading: boolean;
  error: string | null;
  filterStatus?: ConfigurationStatus;
}

const initialState: SavedConfigurationsState = {
  configurations: [],
  total: 0,
  isLoading: false,
  error: null,
  filterStatus: undefined,
};

// Async Thunks

/**
 * Fetch all configurations for the authenticated user
 */
export const fetchUserConfigurations = createAsyncThunk(
  'savedConfigurations/fetchAll',
  async (status?: ConfigurationStatus) => {
    const response = await pcConfigurationApi.getAll(status);
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch configurations');
    }
    // Backend returns data as array of configurations directly
    const configurations = Array.isArray(response.data) ? response.data : [];
    return {
      configurations,
      total: configurations.length,
      filterStatus: status
    };
  }
);

/**
 * Delete a configuration
 */
export const deleteConfiguration = createAsyncThunk(
  'savedConfigurations/delete',
  async (configId: string) => {
    const response = await pcConfigurationApi.delete(configId);
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete configuration');
    }
    return configId;
  }
);

/**
 * Duplicate a configuration
 */
export const duplicateConfiguration = createAsyncThunk(
  'savedConfigurations/duplicate',
  async (configId: string) => {
    const response = await pcConfigurationApi.duplicate(configId);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to duplicate configuration');
    }
    return response.data;
  }
);

// Slice
const savedConfigurationsSlice = createSlice({
  name: 'savedConfigurations',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilterStatus: (state, action: PayloadAction<ConfigurationStatus | undefined>) => {
      state.filterStatus = action.payload;
    },
    clearConfigurations: (state) => {
      state.configurations = [];
      state.total = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch user configurations
      .addCase(fetchUserConfigurations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserConfigurations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.configurations = action.payload.configurations || [];
        state.total = action.payload.total || 0;
        state.filterStatus = action.payload.filterStatus;
      })
      .addCase(fetchUserConfigurations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch configurations';
      })

      // Delete configuration
      .addCase(deleteConfiguration.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteConfiguration.fulfilled, (state, action) => {
        state.isLoading = false;
        const deletedId = action.payload;
        state.configurations = state.configurations.filter((c) => c.id !== deletedId);
        state.total -= 1;
      })
      .addCase(deleteConfiguration.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to delete configuration';
      })

      // Duplicate configuration
      .addCase(duplicateConfiguration.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(duplicateConfiguration.fulfilled, (state, action) => {
        state.isLoading = false;
        const newConfiguration = action.payload;
        state.configurations.unshift(newConfiguration); // Add to beginning
        state.total += 1;
      })
      .addCase(duplicateConfiguration.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to duplicate configuration';
      });
  },
});

export const { clearError, setFilterStatus, clearConfigurations } = savedConfigurationsSlice.actions;

export default savedConfigurationsSlice.reducer;
