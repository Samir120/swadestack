import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { contactApi } from '../../models/api/contactApi';
import {
  ContactFormData,
  ContactMessage,
  ContactMessageStatistics,
  ReplyData,
  UpdateStatusData,
  AddNotesData,
} from '../../models/types/contact.types';

/**
 * Contact Slice - ViewModel Layer
 * Manages contact messages state and business logic
 */

interface ContactState {
  messages: ContactMessage[];
  currentMessage: ContactMessage | null;
  statistics: ContactMessageStatistics | null;
  total: number;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  submitSuccess: boolean;
}

const initialState: ContactState = {
  messages: [],
  currentMessage: null,
  statistics: null,
  total: 0,
  isLoading: false,
  isSubmitting: false,
  error: null,
  submitSuccess: false,
};

// Async Thunks - Public
export const submitContactForm = createAsyncThunk(
  'contact/submitForm',
  async (data: ContactFormData) => {
    const response = await contactApi.sendMessage(data);
    return response;
  }
);

// Async Thunks - Admin
export const fetchContactMessages = createAsyncThunk(
  'contact/fetchMessages',
  async (params?: {
    limit?: number;
    offset?: number;
    status?: 'new' | 'read' | 'replied' | 'archived';
    isRead?: boolean;
  }) => {
    console.log('fetchContactMessages - params:', params);
    const response = await contactApi.getAllMessages(params);
    console.log('fetchContactMessages - response:', response);
    return response;
  }
);

export const fetchMessageById = createAsyncThunk(
  'contact/fetchById',
  async (id: string) => {
    const response = await contactApi.getMessageById(id);
    return response;
  }
);

export const markMessageAsRead = createAsyncThunk(
  'contact/markAsRead',
  async (id: string) => {
    const response = await contactApi.markAsRead(id);
    return response;
  }
);

export const updateMessageStatus = createAsyncThunk(
  'contact/updateStatus',
  async ({ id, data }: { id: string; data: UpdateStatusData }) => {
    const response = await contactApi.updateStatus(id, data);
    return response;
  }
);

export const addMessageNotes = createAsyncThunk(
  'contact/addNotes',
  async ({ id, data }: { id: string; data: AddNotesData }) => {
    const response = await contactApi.addNotes(id, data);
    return response;
  }
);

export const replyToContactMessage = createAsyncThunk(
  'contact/reply',
  async ({ id, data }: { id: string; data: ReplyData }) => {
    await contactApi.replyToMessage(id, data);
    // Fetch the updated message after reply
    const updatedMessage = await contactApi.getMessageById(id);
    return updatedMessage;
  }
);

export const fetchStatistics = createAsyncThunk(
  'contact/fetchStatistics',
  async () => {
    const response = await contactApi.getStatistics();
    return response;
  }
);

export const searchContactMessages = createAsyncThunk(
  'contact/search',
  async (keyword: string) => {
    const response = await contactApi.searchMessages(keyword);
    return response;
  }
);

export const deleteContactMessage = createAsyncThunk(
  'contact/delete',
  async (id: string) => {
    await contactApi.deleteMessage(id);
    return id;
  }
);

// Slice
const contactSlice = createSlice({
  name: 'contact',
  initialState,
  reducers: {
    clearCurrentMessage: (state) => {
      state.currentMessage = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSubmitSuccess: (state) => {
      state.submitSuccess = false;
    },
    setCurrentMessage: (state, action: PayloadAction<ContactMessage>) => {
      state.currentMessage = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Submit contact form
      .addCase(submitContactForm.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
        state.submitSuccess = false;
      })
      .addCase(submitContactForm.fulfilled, (state) => {
        state.isSubmitting = false;
        state.submitSuccess = true;
      })
      .addCase(submitContactForm.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.error.message || 'Failed to submit contact form';
      })

      // Fetch contact messages
      .addCase(fetchContactMessages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchContactMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.messages = action.payload.messages;
          state.total = action.payload.total;
        }
      })
      .addCase(fetchContactMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to load messages';
      })

      // Fetch message by ID
      .addCase(fetchMessageById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMessageById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentMessage = action.payload;
      })
      .addCase(fetchMessageById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to load message';
      })

      // Mark as read
      .addCase(markMessageAsRead.fulfilled, (state, action) => {
        const index = state.messages.findIndex((m) => m.id === action.payload.id);
        if (index !== -1) {
          state.messages[index] = action.payload;
        }
        if (state.currentMessage?.id === action.payload.id) {
          state.currentMessage = action.payload;
        }
      })

      // Update status
      .addCase(updateMessageStatus.fulfilled, (state, action) => {
        const index = state.messages.findIndex((m) => m.id === action.payload.id);
        if (index !== -1) {
          state.messages[index] = action.payload;
        }
        if (state.currentMessage?.id === action.payload.id) {
          state.currentMessage = action.payload;
        }
      })

      // Add notes
      .addCase(addMessageNotes.fulfilled, (state, action) => {
        const index = state.messages.findIndex((m) => m.id === action.payload.id);
        if (index !== -1) {
          state.messages[index] = action.payload;
        }
        if (state.currentMessage?.id === action.payload.id) {
          state.currentMessage = action.payload;
        }
      })

      // Reply to message
      .addCase(replyToContactMessage.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(replyToContactMessage.fulfilled, (state, action) => {
        state.isSubmitting = false;
        const index = state.messages.findIndex((m) => m.id === action.payload.id);
        if (index !== -1) {
          state.messages[index] = action.payload;
        }
        if (state.currentMessage?.id === action.payload.id) {
          state.currentMessage = action.payload;
        }
      })
      .addCase(replyToContactMessage.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.error.message || 'Failed to send reply';
      })

      // Fetch statistics
      .addCase(fetchStatistics.fulfilled, (state, action) => {
        state.statistics = action.payload;
      })

      // Search messages
      .addCase(searchContactMessages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchContactMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messages = action.payload;
        state.total = action.payload.length;
      })
      .addCase(searchContactMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Search failed';
      })

      // Delete message
      .addCase(deleteContactMessage.fulfilled, (state, action) => {
        state.messages = state.messages.filter((m) => m.id !== action.payload);
        state.total -= 1;
        if (state.currentMessage?.id === action.payload) {
          state.currentMessage = null;
        }
      });
  },
});

export const { clearCurrentMessage, clearError, clearSubmitSuccess, setCurrentMessage } =
  contactSlice.actions;

export default contactSlice.reducer;
