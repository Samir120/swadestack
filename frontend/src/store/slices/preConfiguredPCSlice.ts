import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { preConfiguredPCApi } from '../../models/api/preConfiguredPCApi';
import {
  PCConfiguration,
  PCTier,
  PreConfiguredPCFilters,
  PreConfiguredStats,
} from '../../models/types/pcConfiguration.types';

/**
 * Pre-Configured PC Slice - ViewModel Layer
 * Manages state for pre-configured PCs (admin-created PCs for sale)
 */

interface PreConfiguredPCState {
  // Featured PCs for home page carousel
  featuredPCs: PCConfiguration[];
  isFeaturedLoading: boolean;
  featuredError: string | null;

  // All pre-configured PCs for list page
  allPCs: PCConfiguration[];
  totalPCs: number;
  isAllLoading: boolean;
  allError: string | null;

  // Current PC for detail page
  currentPC: PCConfiguration | null;
  isCurrentLoading: boolean;
  currentError: string | null;

  // Filters and pagination
  filters: PreConfiguredPCFilters;
  currentPage: number;
  pageSize: number;

  // Available tiers
  availableTiers: PCTier[];

  // Admin stats
  stats: PreConfiguredStats | null;
  isStatsLoading: boolean;

  // Ordering state
  isOrdering: boolean;
  orderError: string | null;
}

const initialState: PreConfiguredPCState = {
  featuredPCs: [],
  isFeaturedLoading: false,
  featuredError: null,

  allPCs: [],
  totalPCs: 0,
  isAllLoading: false,
  allError: null,

  currentPC: null,
  isCurrentLoading: false,
  currentError: null,

  filters: {},
  currentPage: 1,
  pageSize: 12,

  availableTiers: ['core', 'pro', 'ultra', 'custom'],

  stats: null,
  isStatsLoading: false,

  isOrdering: false,
  orderError: null,
};

// =====================================================
// ASYNC THUNKS
// =====================================================

/**
 * Fetch featured pre-configured PCs for home page
 */
export const fetchFeaturedPCs = createAsyncThunk(
  'preConfiguredPC/fetchFeatured',
  async (limit: number = 8) => {
    const response = await preConfiguredPCApi.getFeatured(limit);
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch featured PCs');
    }
    return response.data;
  }
);

/**
 * Fetch all pre-configured PCs with optional filters
 */
export const fetchAllPreConfiguredPCs = createAsyncThunk(
  'preConfiguredPC/fetchAll',
  async ({
    filters,
    page,
    pageSize,
  }: {
    filters?: PreConfiguredPCFilters;
    page?: number;
    pageSize?: number;
  }) => {
    const offset = page && pageSize ? (page - 1) * pageSize : undefined;
    const response = await preConfiguredPCApi.getAll(filters, pageSize, offset);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch pre-configured PCs');
    }
    return response.data;
  }
);

/**
 * Fetch single pre-configured PC by ID
 */
export const fetchPreConfiguredPCById = createAsyncThunk(
  'preConfiguredPC/fetchById',
  async (id: string) => {
    const response = await preConfiguredPCApi.getById(id);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch pre-configured PC');
    }
    return response.data;
  }
);

/**
 * Order a pre-configured PC (creates a copy for the user)
 */
export const orderPreConfiguredPC = createAsyncThunk(
  'preConfiguredPC/order',
  async (id: string) => {
    const response = await preConfiguredPCApi.order(id);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to order pre-configured PC');
    }
    return response.data;
  }
);

/**
 * Fetch pre-configured PC stats (admin)
 */
export const fetchPreConfiguredStats = createAsyncThunk(
  'preConfiguredPC/fetchStats',
  async () => {
    const response = await preConfiguredPCApi.getStats();
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch stats');
    }
    return response.data;
  }
);

// =====================================================
// SLICE
// =====================================================

const preConfiguredPCSlice = createSlice({
  name: 'preConfiguredPC',
  initialState,
  reducers: {
    // Set filters
    setFilters: (state, action: PayloadAction<PreConfiguredPCFilters>) => {
      state.filters = action.payload;
      state.currentPage = 1; // Reset to first page when filters change
    },

    // Clear filters
    clearFilters: (state) => {
      state.filters = {};
      state.currentPage = 1;
    },

    // Set current page
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },

    // Set page size
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload;
      state.currentPage = 1;
    },

    // Clear current PC
    clearCurrentPC: (state) => {
      state.currentPC = null;
      state.currentError = null;
    },

    // Clear errors
    clearErrors: (state) => {
      state.featuredError = null;
      state.allError = null;
      state.currentError = null;
      state.orderError = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Featured PCs
    builder
      .addCase(fetchFeaturedPCs.pending, (state) => {
        state.isFeaturedLoading = true;
        state.featuredError = null;
      })
      .addCase(fetchFeaturedPCs.fulfilled, (state, action) => {
        state.isFeaturedLoading = false;
        state.featuredPCs = action.payload || [];
      })
      .addCase(fetchFeaturedPCs.rejected, (state, action) => {
        state.isFeaturedLoading = false;
        state.featuredError = action.error.message || 'Failed to fetch featured PCs';
      });

    // Fetch All Pre-Configured PCs
    builder
      .addCase(fetchAllPreConfiguredPCs.pending, (state) => {
        state.isAllLoading = true;
        state.allError = null;
      })
      .addCase(fetchAllPreConfiguredPCs.fulfilled, (state, action) => {
        state.isAllLoading = false;
        state.allPCs = action.payload.configurations;
        state.totalPCs = action.payload.total;
      })
      .addCase(fetchAllPreConfiguredPCs.rejected, (state, action) => {
        state.isAllLoading = false;
        state.allError = action.error.message || 'Failed to fetch pre-configured PCs';
      });

    // Fetch Single Pre-Configured PC
    builder
      .addCase(fetchPreConfiguredPCById.pending, (state) => {
        state.isCurrentLoading = true;
        state.currentError = null;
      })
      .addCase(fetchPreConfiguredPCById.fulfilled, (state, action) => {
        state.isCurrentLoading = false;
        state.currentPC = action.payload;
      })
      .addCase(fetchPreConfiguredPCById.rejected, (state, action) => {
        state.isCurrentLoading = false;
        state.currentError = action.error.message || 'Failed to fetch pre-configured PC';
      });

    // Order Pre-Configured PC
    builder
      .addCase(orderPreConfiguredPC.pending, (state) => {
        state.isOrdering = true;
        state.orderError = null;
      })
      .addCase(orderPreConfiguredPC.fulfilled, (state) => {
        state.isOrdering = false;
      })
      .addCase(orderPreConfiguredPC.rejected, (state, action) => {
        state.isOrdering = false;
        state.orderError = action.error.message || 'Failed to order pre-configured PC';
      });

    // Fetch Stats
    builder
      .addCase(fetchPreConfiguredStats.pending, (state) => {
        state.isStatsLoading = true;
      })
      .addCase(fetchPreConfiguredStats.fulfilled, (state, action) => {
        state.isStatsLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchPreConfiguredStats.rejected, (state) => {
        state.isStatsLoading = false;
      });
  },
});

// Export actions
export const {
  setFilters,
  clearFilters,
  setCurrentPage,
  setPageSize,
  clearCurrentPC,
  clearErrors,
} = preConfiguredPCSlice.actions;

// Export reducer
export default preConfiguredPCSlice.reducer;
