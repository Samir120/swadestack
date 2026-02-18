import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { teamApi } from '@/models/api/teamApi';
import { TeamMember } from '@/models/types/teamTypes';

interface TeamState {
  members: TeamMember[];
  total: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: TeamState = {
  members: [],
  total: 0,
  isLoading: false,
  error: null,
};

export const fetchTeamMembers = createAsyncThunk(
  'team/fetchAll',
  async ({ page = 1, limit = 50 }: { page?: number; limit?: number }) => {
    const response = await teamApi.getAll(page, limit);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch team members');
    }
    return response.data;
  }
);

const teamSlice = createSlice({
  name: 'team',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeamMembers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTeamMembers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.members = action.payload.members;
        state.total = action.payload.total;
      })
      .addCase(fetchTeamMembers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to load team members';
      });
  },
});

export const { clearError } = teamSlice.actions;
export default teamSlice.reducer;
