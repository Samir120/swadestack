import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { portfolioApi } from '../../models/api/portfolioApi';
import { PortfolioItem } from '../../models/types/portfolio.types';

interface PortfolioState {
  items: PortfolioItem[];
  featuredItems: PortfolioItem[];
  currentItem: PortfolioItem | null;
  categories: string[];
  total: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: PortfolioState = {
  items: [],
  featuredItems: [],
  currentItem: null,
  categories: [],
  total: 0,
  isLoading: false,
  error: null,
};

export const fetchPortfolio = createAsyncThunk(
  'portfolio/fetchAll',
  async ({ page = 1, limit = 20, category }: any) => {
    const response = await portfolioApi.getAll(page, limit, category);
    if (!response.success || !response.data) throw new Error(response.message);
    return response.data;
  }
);

export const fetchFeaturedPortfolio = createAsyncThunk(
  'portfolio/fetchFeatured',
  async (limit: number | undefined) => {
    const response = await portfolioApi.getFeatured(limit ?? 6);
    if (!response.success || !response.data) throw new Error(response.message);
    return response.data;
  }
);

const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPortfolio.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchPortfolio.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items;
        state.total = action.payload.total;
      })
      .addCase(fetchFeaturedPortfolio.fulfilled, (state, action) => {
        state.featuredItems = action.payload;
      });
  },
});

export default portfolioSlice.reducer;
