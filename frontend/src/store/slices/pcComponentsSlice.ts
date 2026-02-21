import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { pcComponentApi } from '../../models/api/pcComponentApi';
import {
  PCComponent,
  ComponentType,
  ComponentFilters,
  CreatePCComponentDTO,
  UpdatePCComponentDTO,
} from '../../models/types/pcComponent.types';

/**
 * PC Components Slice - ViewModel Layer
 * Manages PC components state and business logic
 */

interface PCComponentsState {
  components: Record<ComponentType, PCComponent[]>; // Grouped by type for easy access
  allComponents: PCComponent[]; // Flat list for search results
  currentComponent: PCComponent | null;
  manufacturers: string[];
  total: number;
  page: number;
  limit: number;
  filters: ComponentFilters;
  isLoading: boolean;
  error: string | null;
}

const initialState: PCComponentsState = {
  components: {
    cpu: [],
    motherboard: [],
    ram: [],
    gpu: [],
    ssd: [],      // NVMe and SATA SSDs
    hdd: [],      // Hard disk drives
    psu: [],
    case: [],
    cooling: [],
    optical: [],  // DVD/Blu-Ray drives
    fan: [],      // Case fans
    os: [],       // Operating system
  },
  allComponents: [],
  currentComponent: null,
  manufacturers: [],
  total: 0,
  page: 1,
  limit: 50,
  filters: {},
  isLoading: false,
  error: null,
};

// Async Thunks

/**
 * Fetch components by type
 */
export const fetchComponentsByType = createAsyncThunk(
  'pcComponents/fetchByType',
  async ({ componentType, filters }: { componentType: ComponentType; filters?: ComponentFilters }) => {
    const response = await pcComponentApi.getByType(componentType, filters);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch components');
    }
    return { componentType, ...response.data };
  }
);

/**
 * Fetch all components with pagination
 */
export const fetchAllComponents = createAsyncThunk(
  'pcComponents/fetchAll',
  async ({ page = 1, limit = 50, filters }: { page?: number; limit?: number; filters?: ComponentFilters }) => {
    const response = await pcComponentApi.getAll(page, limit, filters);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch components');
    }
    return response.data;
  }
);

/**
 * Fetch a single component by ID
 */
export const fetchComponentById = createAsyncThunk(
  'pcComponents/fetchById',
  async (id: string) => {
    const response = await pcComponentApi.getById(id);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch component');
    }
    return response.data;
  }
);

/**
 * Search components
 */
export const searchComponents = createAsyncThunk(
  'pcComponents/search',
  async ({ query, filters }: { query: string; filters?: ComponentFilters }) => {
    const response = await pcComponentApi.search(query, filters);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to search components');
    }
    return response.data;
  }
);

/**
 * Fetch manufacturers
 */
export const fetchManufacturers = createAsyncThunk(
  'pcComponents/fetchManufacturers',
  async (componentType?: ComponentType) => {
    const response = await pcComponentApi.getManufacturers(componentType);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch manufacturers');
    }
    // Backend returns array directly or { manufacturers: [] }
    const data = response.data;
    return Array.isArray(data) ? data : (data.manufacturers ?? []);
  }
);

// Admin-only thunks

/**
 * Create a new component (admin)
 */
export const createComponent = createAsyncThunk(
  'pcComponents/create',
  async (data: CreatePCComponentDTO) => {
    const response = await pcComponentApi.create(data);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to create component');
    }
    return response.data;
  }
);

/**
 * Update a component (admin)
 */
export const updateComponent = createAsyncThunk(
  'pcComponents/update',
  async ({ id, data }: { id: string; data: UpdatePCComponentDTO }) => {
    const response = await pcComponentApi.update(id, data);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to update component');
    }
    return response.data;
  }
);

/**
 * Delete a component (admin)
 */
export const deleteComponent = createAsyncThunk(
  'pcComponents/delete',
  async (id: string) => {
    const response = await pcComponentApi.delete(id);
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete component');
    }
    return id;
  }
);

/**
 * Update component stock (admin)
 */
export const updateComponentStock = createAsyncThunk(
  'pcComponents/updateStock',
  async ({ id, quantity, operation }: { id: string; quantity: number; operation?: 'set' | 'increment' | 'decrement' }) => {
    const response = await pcComponentApi.updateStock(id, quantity, operation);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to update stock');
    }
    return response.data;
  }
);

/**
 * Toggle component active status (admin)
 */
export const toggleComponentActive = createAsyncThunk(
  'pcComponents/toggleActive',
  async (id: string) => {
    const response = await pcComponentApi.toggleActive(id);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to toggle active status');
    }
    return response.data;
  }
);

// Slice
const pcComponentsSlice = createSlice({
  name: 'pcComponents',
  initialState,
  reducers: {
    clearCurrentComponent: (state) => {
      state.currentComponent = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action: PayloadAction<ComponentFilters>) => {
      state.filters = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    clearComponents: (state) => {
      state.allComponents = [];
      state.total = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch components by type
      .addCase(fetchComponentsByType.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchComponentsByType.fulfilled, (state, action) => {
        state.isLoading = false;
        state.components[action.payload.componentType] = action.payload.components;
        state.allComponents = action.payload.components;
        state.total = action.payload.total;
      })
      .addCase(fetchComponentsByType.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch components';
      })

      // Fetch all components
      .addCase(fetchAllComponents.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllComponents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.allComponents = action.payload.components;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
      })
      .addCase(fetchAllComponents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch components';
      })

      // Fetch component by ID
      .addCase(fetchComponentById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchComponentById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentComponent = action.payload;
      })
      .addCase(fetchComponentById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch component';
      })

      // Search components
      .addCase(searchComponents.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchComponents.fulfilled, (state, action) => {
        state.isLoading = false;
        // Backend returns array directly or { components, total }
        const data = action.payload;
        if (Array.isArray(data)) {
          state.allComponents = data;
          state.total = data.length;
        } else {
          state.allComponents = data.components ?? [];
          state.total = data.total ?? 0;
        }
      })
      .addCase(searchComponents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to search components';
      })

      // Fetch manufacturers
      .addCase(fetchManufacturers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchManufacturers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.manufacturers = action.payload;
      })
      .addCase(fetchManufacturers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch manufacturers';
      })

      // Create component (admin)
      .addCase(createComponent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createComponent.fulfilled, (state, action) => {
        state.isLoading = false;
        const newComponent = action.payload;
        state.components[newComponent.componentType].push(newComponent);
        state.allComponents.push(newComponent);
        state.total += 1;
      })
      .addCase(createComponent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to create component';
      })

      // Update component (admin)
      .addCase(updateComponent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateComponent.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedComponent = action.payload;

        // Update in grouped components
        const typeArray = state.components[updatedComponent.componentType];
        const typeIndex = typeArray.findIndex(c => c.id === updatedComponent.id);
        if (typeIndex !== -1) {
          typeArray[typeIndex] = updatedComponent;
        }

        // Update in allComponents
        const allIndex = state.allComponents.findIndex(c => c.id === updatedComponent.id);
        if (allIndex !== -1) {
          state.allComponents[allIndex] = updatedComponent;
        }

        // Update current component if it's the one being updated
        if (state.currentComponent?.id === updatedComponent.id) {
          state.currentComponent = updatedComponent;
        }
      })
      .addCase(updateComponent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to update component';
      })

      // Delete component (admin)
      .addCase(deleteComponent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteComponent.fulfilled, (state, action) => {
        state.isLoading = false;
        const deletedId = action.payload;

        // Remove from all component type arrays
        Object.keys(state.components).forEach((type) => {
          state.components[type as ComponentType] = state.components[type as ComponentType].filter(
            (c) => c.id !== deletedId
          );
        });

        // Remove from allComponents
        state.allComponents = state.allComponents.filter((c) => c.id !== deletedId);
        state.total -= 1;

        // Clear current component if it was deleted
        if (state.currentComponent?.id === deletedId) {
          state.currentComponent = null;
        }
      })
      .addCase(deleteComponent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to delete component';
      })

      // Update stock (admin)
      .addCase(updateComponentStock.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateComponentStock.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedComponent = action.payload;

        // Update in grouped components
        const typeArray = state.components[updatedComponent.componentType];
        const typeIndex = typeArray.findIndex(c => c.id === updatedComponent.id);
        if (typeIndex !== -1) {
          typeArray[typeIndex] = updatedComponent;
        }

        // Update in allComponents
        const allIndex = state.allComponents.findIndex(c => c.id === updatedComponent.id);
        if (allIndex !== -1) {
          state.allComponents[allIndex] = updatedComponent;
        }
      })
      .addCase(updateComponentStock.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to update stock';
      })

      // Toggle active status (admin)
      .addCase(toggleComponentActive.fulfilled, (state, action) => {
        const updatedComponent = action.payload;

        // Update in grouped components
        const typeArray = state.components[updatedComponent.componentType];
        const typeIndex = typeArray.findIndex(c => c.id === updatedComponent.id);
        if (typeIndex !== -1) {
          typeArray[typeIndex] = updatedComponent;
        }

        // Update in allComponents
        const allIndex = state.allComponents.findIndex(c => c.id === updatedComponent.id);
        if (allIndex !== -1) {
          state.allComponents[allIndex] = updatedComponent;
        }
      });
  },
});

export const {
  clearCurrentComponent,
  clearError,
  setFilters,
  clearFilters,
  setPage,
  clearComponents,
} = pcComponentsSlice.actions;

export default pcComponentsSlice.reducer;
