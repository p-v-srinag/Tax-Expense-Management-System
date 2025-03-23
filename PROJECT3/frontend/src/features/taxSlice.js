import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Async thunks
export const getTaxEntries = createAsyncThunk(
  'tax/getTaxEntries',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/tax`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const addTaxEntry = createAsyncThunk(
  'tax/addTaxEntry',
  async (taxData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/tax`, taxData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateTaxEntry = createAsyncThunk(
  'tax/updateTaxEntry',
  async ({ id, taxData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_URL}/tax/${id}`, taxData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteTaxEntry = createAsyncThunk(
  'tax/deleteTaxEntry',
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/tax/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return id;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  taxEntries: [],
  loading: false,
  error: null,
};

const taxSlice = createSlice({
  name: 'tax',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Tax Entries
      .addCase(getTaxEntries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTaxEntries.fulfilled, (state, action) => {
        state.loading = false;
        state.taxEntries = action.payload;
      })
      .addCase(getTaxEntries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch tax entries';
      })
      // Add Tax Entry
      .addCase(addTaxEntry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addTaxEntry.fulfilled, (state, action) => {
        state.loading = false;
        state.taxEntries.push(action.payload);
      })
      .addCase(addTaxEntry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to add tax entry';
      })
      // Update Tax Entry
      .addCase(updateTaxEntry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTaxEntry.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.taxEntries.findIndex(
          (entry) => entry._id === action.payload._id
        );
        if (index !== -1) {
          state.taxEntries[index] = action.payload;
        }
      })
      .addCase(updateTaxEntry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update tax entry';
      })
      // Delete Tax Entry
      .addCase(deleteTaxEntry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTaxEntry.fulfilled, (state, action) => {
        state.loading = false;
        state.taxEntries = state.taxEntries.filter(
          (entry) => entry._id !== action.payload
        );
      })
      .addCase(deleteTaxEntry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to delete tax entry';
      });
  },
});

export const { clearError } = taxSlice.actions;
export default taxSlice.reducer; 