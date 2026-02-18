import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { footerApi } from '../../models/api/footerApi';
import {
  FooterStructure,
  FooterCategoryTitle,
  FooterMainPage,
  CreateFooterCategoryTitle,
  UpdateFooterCategoryTitle,
  CreateFooterMainPage,
  UpdateFooterMainPage,
} from '../../models/types/footer.types';

interface FooterState {
  // Public footer structure
  footerStructure: FooterStructure | null;

  // Admin: all categories and pages
  categories: FooterCategoryTitle[];
  pages: FooterMainPage[];

  // Current selection for editing
  currentCategory: FooterCategoryTitle | null;
  currentPage: FooterMainPage | null;

  // Loading and error states
  isLoading: boolean;
  isCategoriesLoading: boolean;
  isPagesLoading: boolean;
  error: string | null;
}

const initialState: FooterState = {
  footerStructure: null,
  categories: [],
  pages: [],
  currentCategory: null,
  currentPage: null,
  isLoading: false,
  isCategoriesLoading: false,
  isPagesLoading: false,
  error: null,
};

// ===============================
// Public Thunks
// ===============================

export const fetchFooterStructure = createAsyncThunk(
  'footer/fetchStructure',
  async () => {
    const response = await footerApi.getFooterStructure();
    if (!response.success || !response.data) throw new Error(response.message);
    return response.data;
  }
);

export const fetchActivePages = createAsyncThunk(
  'footer/fetchActivePages',
  async () => {
    const response = await footerApi.getActivePages();
    if (!response.success || !response.data) throw new Error(response.message);
    return response.data;
  }
);

// ===============================
// Category Thunks (Admin)
// ===============================

export const fetchAllCategories = createAsyncThunk(
  'footer/fetchAllCategories',
  async () => {
    const response = await footerApi.getAllCategories();
    if (!response.success || !response.data) throw new Error(response.message);
    return response.data;
  }
);

export const fetchCategoryById = createAsyncThunk(
  'footer/fetchCategoryById',
  async (id: string) => {
    const response = await footerApi.getCategoryById(id);
    if (!response.success || !response.data) throw new Error(response.message);
    return response.data;
  }
);

export const createCategory = createAsyncThunk(
  'footer/createCategory',
  async (data: CreateFooterCategoryTitle) => {
    const response = await footerApi.createCategory(data);
    if (!response.success || !response.data) throw new Error(response.message);
    return response.data;
  }
);

export const updateCategory = createAsyncThunk(
  'footer/updateCategory',
  async ({ id, data }: { id: string; data: UpdateFooterCategoryTitle }) => {
    const response = await footerApi.updateCategory(id, data);
    if (!response.success || !response.data) throw new Error(response.message);
    return response.data;
  }
);

export const deleteCategory = createAsyncThunk(
  'footer/deleteCategory',
  async (id: string) => {
    const response = await footerApi.deleteCategory(id);
    if (!response.success) throw new Error(response.message);
    return id;
  }
);

export const toggleCategoryActive = createAsyncThunk(
  'footer/toggleCategoryActive',
  async (id: string) => {
    const response = await footerApi.toggleCategoryActive(id);
    if (!response.success || !response.data) throw new Error(response.message);
    return response.data;
  }
);

export const updateCategoryOrder = createAsyncThunk(
  'footer/updateCategoryOrder',
  async ({ id, displayOrder }: { id: string; displayOrder: number }) => {
    const response = await footerApi.updateCategoryOrder(id, displayOrder);
    if (!response.success) throw new Error(response.message);
    return { id, displayOrder };
  }
);

// ===============================
// Page Thunks (Admin)
// ===============================

export const fetchPagesByCategoryId = createAsyncThunk(
  'footer/fetchPagesByCategoryId',
  async (categoryId: string) => {
    const response = await footerApi.getPagesByCategoryId(categoryId);
    if (!response.success || !response.data) throw new Error(response.message);
    return response.data;
  }
);

export const fetchPageById = createAsyncThunk(
  'footer/fetchPageById',
  async (id: string) => {
    const response = await footerApi.getPageById(id);
    if (!response.success || !response.data) throw new Error(response.message);
    return response.data;
  }
);

export const createPage = createAsyncThunk(
  'footer/createPage',
  async (data: CreateFooterMainPage) => {
    const response = await footerApi.createPage(data);
    if (!response.success || !response.data) throw new Error(response.message);
    return response.data;
  }
);

export const updatePage = createAsyncThunk(
  'footer/updatePage',
  async ({ id, data }: { id: string; data: UpdateFooterMainPage }) => {
    const response = await footerApi.updatePage(id, data);
    if (!response.success || !response.data) throw new Error(response.message);
    return response.data;
  }
);

export const deletePage = createAsyncThunk(
  'footer/deletePage',
  async (id: string) => {
    const response = await footerApi.deletePage(id);
    if (!response.success) throw new Error(response.message);
    return id;
  }
);

export const togglePageActive = createAsyncThunk(
  'footer/togglePageActive',
  async (id: string) => {
    const response = await footerApi.togglePageActive(id);
    if (!response.success || !response.data) throw new Error(response.message);
    return response.data;
  }
);

export const updatePageOrder = createAsyncThunk(
  'footer/updatePageOrder',
  async ({ id, displayOrder }: { id: string; displayOrder: number }) => {
    const response = await footerApi.updatePageOrder(id, displayOrder);
    if (!response.success) throw new Error(response.message);
    return { id, displayOrder };
  }
);

// ===============================
// Slice
// ===============================

const footerSlice = createSlice({
  name: 'footer',
  initialState,
  reducers: {
    clearCurrentCategory: (state) => {
      state.currentCategory = null;
    },
    clearCurrentPage: (state) => {
      state.currentPage = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch footer structure
      .addCase(fetchFooterStructure.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFooterStructure.fulfilled, (state, action) => {
        state.isLoading = false;
        state.footerStructure = action.payload;
      })
      .addCase(fetchFooterStructure.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch footer structure';
      })

      // Fetch all categories
      .addCase(fetchAllCategories.pending, (state) => {
        state.isCategoriesLoading = true;
        state.error = null;
      })
      .addCase(fetchAllCategories.fulfilled, (state, action) => {
        state.isCategoriesLoading = false;
        state.categories = action.payload;
      })
      .addCase(fetchAllCategories.rejected, (state, action) => {
        state.isCategoriesLoading = false;
        state.error = action.error.message || 'Failed to fetch categories';
      })

      // Fetch category by ID
      .addCase(fetchCategoryById.fulfilled, (state, action) => {
        state.currentCategory = action.payload;
      })

      // Create category
      .addCase(createCategory.fulfilled, (state, action) => {
        state.categories.push(action.payload);
      })

      // Update category
      .addCase(updateCategory.fulfilled, (state, action) => {
        const index = state.categories.findIndex((cat) => cat.id === action.payload.id);
        if (index !== -1) {
          state.categories[index] = action.payload;
        }
        if (state.currentCategory?.id === action.payload.id) {
          state.currentCategory = action.payload;
        }
      })

      // Delete category
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.categories = state.categories.filter((cat) => cat.id !== action.payload);
      })

      // Toggle category active
      .addCase(toggleCategoryActive.fulfilled, (state, action) => {
        const index = state.categories.findIndex((cat) => cat.id === action.payload.id);
        if (index !== -1) {
          state.categories[index] = action.payload;
        }
      })

      // Fetch pages by category ID
      .addCase(fetchPagesByCategoryId.pending, (state) => {
        state.isPagesLoading = true;
        state.error = null;
      })
      .addCase(fetchPagesByCategoryId.fulfilled, (state, action) => {
        state.isPagesLoading = false;
        state.pages = action.payload;
      })
      .addCase(fetchPagesByCategoryId.rejected, (state, action) => {
        state.isPagesLoading = false;
        state.error = action.error.message || 'Failed to fetch pages';
      })

      // Fetch page by ID
      .addCase(fetchPageById.fulfilled, (state, action) => {
        state.currentPage = action.payload;
      })

      // Create page
      .addCase(createPage.fulfilled, (state, action) => {
        state.pages.push(action.payload);
      })

      // Update page
      .addCase(updatePage.fulfilled, (state, action) => {
        const index = state.pages.findIndex((page) => page.id === action.payload.id);
        if (index !== -1) {
          state.pages[index] = action.payload;
        }
        if (state.currentPage?.id === action.payload.id) {
          state.currentPage = action.payload;
        }
      })

      // Delete page
      .addCase(deletePage.fulfilled, (state, action) => {
        state.pages = state.pages.filter((page) => page.id !== action.payload);
      })

      // Toggle page active
      .addCase(togglePageActive.fulfilled, (state, action) => {
        const index = state.pages.findIndex((page) => page.id === action.payload.id);
        if (index !== -1) {
          state.pages[index] = action.payload;
        }
      });
  },
});

export const { clearCurrentCategory, clearCurrentPage, clearError } = footerSlice.actions;

export default footerSlice.reducer;
