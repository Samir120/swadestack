import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { pcBuildServiceApi } from '../../models/api/pcBuildServiceApi';
import {
  PCBuildServiceOption,
  CreateBuildServiceOptionDTO,
  UpdateBuildServiceOptionDTO,
} from '../../models/types/pcConfiguration.types';

/**
 * PC Build Services Slice - ViewModel Layer
 * Manages build service options and pricing
 */

interface PCBuildServicesState {
  options: PCBuildServiceOption[];
  selectedOption: PCBuildServiceOption | null;
  defaultOption: PCBuildServiceOption | null;
  calculatedCharge: number | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: PCBuildServicesState = {
  options: [],
  selectedOption: null,
  defaultOption: null,
  calculatedCharge: null,
  isLoading: false,
  error: null,
};

// Async Thunks

/**
 * Fetch active build service options
 */
export const fetchBuildServiceOptions = createAsyncThunk(
  'pcBuildServices/fetchActive',
  async () => {
    const response = await pcBuildServiceApi.getActiveOptions();
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch build service options');
    }
    return response.data.options;
  }
);

/**
 * Fetch all build service options (admin - includes inactive)
 */
export const fetchAllBuildServiceOptions = createAsyncThunk(
  'pcBuildServices/fetchAll',
  async () => {
    const response = await pcBuildServiceApi.getAllOptions();
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch all build service options');
    }
    return response.data.options;
  }
);

/**
 * Fetch default build service option
 */
export const fetchDefaultOption = createAsyncThunk(
  'pcBuildServices/fetchDefault',
  async () => {
    const response = await pcBuildServiceApi.getDefaultOption();
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch default option');
    }
    return response.data;
  }
);

/**
 * Fetch a single build service option by ID
 */
export const fetchBuildServiceById = createAsyncThunk(
  'pcBuildServices/fetchById',
  async (id: string) => {
    const response = await pcBuildServiceApi.getById(id);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch build service option');
    }
    return response.data;
  }
);

/**
 * Calculate service charge for given total price and option
 */
export const calculateServiceCharge = createAsyncThunk(
  'pcBuildServices/calculateCharge',
  async ({ totalPrice, optionId }: { totalPrice: number; optionId: string }) => {
    const response = await pcBuildServiceApi.calculateCharge(totalPrice, optionId);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to calculate service charge');
    }
    return response.data;
  }
);

// Admin-only thunks

/**
 * Create a new build service option (admin)
 */
export const createBuildServiceOption = createAsyncThunk(
  'pcBuildServices/create',
  async (data: CreateBuildServiceOptionDTO) => {
    const response = await pcBuildServiceApi.create(data);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to create build service option');
    }
    return response.data;
  }
);

/**
 * Update a build service option (admin)
 */
export const updateBuildServiceOption = createAsyncThunk(
  'pcBuildServices/update',
  async ({ id, data }: { id: string; data: UpdateBuildServiceOptionDTO }) => {
    const response = await pcBuildServiceApi.update(id, data);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to update build service option');
    }
    return response.data;
  }
);

/**
 * Delete a build service option (admin)
 */
export const deleteBuildServiceOption = createAsyncThunk(
  'pcBuildServices/delete',
  async (id: string) => {
    const response = await pcBuildServiceApi.delete(id);
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete build service option');
    }
    return id;
  }
);

/**
 * Set an option as default (admin)
 */
export const setDefaultBuildServiceOption = createAsyncThunk(
  'pcBuildServices/setDefault',
  async (id: string) => {
    const response = await pcBuildServiceApi.setDefault(id);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to set default option');
    }
    return response.data;
  }
);

/**
 * Toggle option active status (admin)
 */
export const toggleBuildServiceActive = createAsyncThunk(
  'pcBuildServices/toggleActive',
  async (id: string) => {
    const response = await pcBuildServiceApi.toggleActive(id);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to toggle active status');
    }
    return response.data;
  }
);

// Slice
const pcBuildServicesSlice = createSlice({
  name: 'pcBuildServices',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedOption: (state, action: PayloadAction<PCBuildServiceOption | null>) => {
      state.selectedOption = action.payload;
    },
    clearSelectedOption: (state) => {
      state.selectedOption = null;
    },
    clearCalculatedCharge: (state) => {
      state.calculatedCharge = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch active build service options
      .addCase(fetchBuildServiceOptions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBuildServiceOptions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.options = action.payload;

        // Auto-select default if available
        const defaultOption = action.payload.find((opt) => opt.isDefault);
        if (defaultOption && !state.selectedOption) {
          state.defaultOption = defaultOption;
          state.selectedOption = defaultOption;
        }
      })
      .addCase(fetchBuildServiceOptions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch build service options';
      })

      // Fetch all build service options (admin)
      .addCase(fetchAllBuildServiceOptions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllBuildServiceOptions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.options = action.payload;
      })
      .addCase(fetchAllBuildServiceOptions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch all build service options';
      })

      // Fetch default option
      .addCase(fetchDefaultOption.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDefaultOption.fulfilled, (state, action) => {
        state.isLoading = false;
        state.defaultOption = action.payload;
        if (!state.selectedOption) {
          state.selectedOption = action.payload;
        }
      })
      .addCase(fetchDefaultOption.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch default option';
      })

      // Fetch by ID
      .addCase(fetchBuildServiceById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBuildServiceById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedOption = action.payload;
      })
      .addCase(fetchBuildServiceById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch build service option';
      })

      // Calculate service charge
      .addCase(calculateServiceCharge.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(calculateServiceCharge.fulfilled, (state, action) => {
        state.isLoading = false;
        state.calculatedCharge = action.payload.serviceCharge;
        state.selectedOption = action.payload.option;
      })
      .addCase(calculateServiceCharge.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to calculate service charge';
      })

      // Create build service option (admin)
      .addCase(createBuildServiceOption.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createBuildServiceOption.fulfilled, (state, action) => {
        state.isLoading = false;
        state.options.push(action.payload);
      })
      .addCase(createBuildServiceOption.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to create build service option';
      })

      // Update build service option (admin)
      .addCase(updateBuildServiceOption.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateBuildServiceOption.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedOption = action.payload;
        const index = state.options.findIndex((opt) => opt.id === updatedOption.id);
        if (index !== -1) {
          state.options[index] = updatedOption;
        }

        // Update selected/default if they match
        if (state.selectedOption?.id === updatedOption.id) {
          state.selectedOption = updatedOption;
        }
        if (state.defaultOption?.id === updatedOption.id) {
          state.defaultOption = updatedOption;
        }
      })
      .addCase(updateBuildServiceOption.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to update build service option';
      })

      // Delete build service option (admin)
      .addCase(deleteBuildServiceOption.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteBuildServiceOption.fulfilled, (state, action) => {
        state.isLoading = false;
        const deletedId = action.payload;
        state.options = state.options.filter((opt) => opt.id !== deletedId);

        // Clear selected/default if they match
        if (state.selectedOption?.id === deletedId) {
          state.selectedOption = null;
        }
        if (state.defaultOption?.id === deletedId) {
          state.defaultOption = null;
        }
      })
      .addCase(deleteBuildServiceOption.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to delete build service option';
      })

      // Set default option (admin)
      .addCase(setDefaultBuildServiceOption.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(setDefaultBuildServiceOption.fulfilled, (state, action) => {
        state.isLoading = false;
        const newDefault = action.payload;

        // Update all options to reflect new default
        state.options = state.options.map((opt) => ({
          ...opt,
          isDefault: opt.id === newDefault.id,
        }));

        state.defaultOption = newDefault;
      })
      .addCase(setDefaultBuildServiceOption.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to set default option';
      })

      // Toggle active status (admin)
      .addCase(toggleBuildServiceActive.fulfilled, (state, action) => {
        const updatedOption = action.payload;
        const index = state.options.findIndex((opt) => opt.id === updatedOption.id);
        if (index !== -1) {
          state.options[index] = updatedOption;
        }
      });
  },
});

export const {
  clearError,
  setSelectedOption,
  clearSelectedOption,
  clearCalculatedCharge,
} = pcBuildServicesSlice.actions;

export default pcBuildServicesSlice.reducer;
