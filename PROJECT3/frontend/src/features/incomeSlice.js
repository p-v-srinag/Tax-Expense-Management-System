import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Get all incomes
export const getIncomes = createAsyncThunk(
  'income/getIncomes',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return rejectWithValue({ message: 'No authentication token found' });
      }

      const response = await api.get('/income');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

// Add new income
export const addIncome = createAsyncThunk(
  'income/addIncome',
  async (incomeData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return rejectWithValue({ message: 'No authentication token found' });
      }

      const response = await api.post('/income', incomeData);
      return {
        income: response.data.income || response.data,
        message: 'Income added successfully'
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

// Update income
export const updateIncome = createAsyncThunk(
  'income/updateIncome',
  async ({ id, incomeData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return rejectWithValue({ message: 'No authentication token found' });
      }

      const response = await api.put(`/income/${id}`, incomeData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

// Delete income
export const deleteIncome = createAsyncThunk(
  'income/deleteIncome',
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return rejectWithValue({ message: 'No authentication token found' });
      }

      await api.delete(`/income/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

const incomeSlice = createSlice({
  name: 'income',
  initialState: {
    incomes: [],
    loading: false,
    error: null,
    message: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearMessage: (state) => {
      state.message = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get all incomes
      .addCase(getIncomes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getIncomes.fulfilled, (state, action) => {
        state.loading = false;
        state.incomes = action.payload;
      })
      .addCase(getIncomes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch incomes';
      })
      // Add income
      .addCase(addIncome.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(addIncome.fulfilled, (state, action) => {
        state.loading = false;
        state.incomes.unshift(action.payload.income);
        state.message = action.payload.message;
      })
      .addCase(addIncome.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to add income';
      })
      // Update income
      .addCase(updateIncome.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateIncome.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.incomes.findIndex(income => income._id === action.payload._id);
        if (index !== -1) {
          state.incomes[index] = action.payload;
        }
      })
      .addCase(updateIncome.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update income';
      })
      // Delete income
      .addCase(deleteIncome.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteIncome.fulfilled, (state, action) => {
        state.loading = false;
        state.incomes = state.incomes.filter(income => income._id !== action.payload);
      })
      .addCase(deleteIncome.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to delete income';
      });
  }
});

export const { clearError, clearMessage } = incomeSlice.actions;
export default incomeSlice.reducer; 