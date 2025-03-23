import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';

// Get all expenses
export const getExpenses = createAsyncThunk(
  'expenses/getExpenses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/expenses');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Create expense
export const createExpense = createAsyncThunk(
  'expenses/createExpense',
  async (expenseData, { rejectWithValue, getState }) => {
    try {
      const { auth: { user } } = getState();
      
      // Add debug logging
      console.log('Creating expense:', {
        receivedData: expenseData,
        userFromState: user,
        hasUserId: Boolean(user?._id)
      });

      if (!user || !user._id) {
        console.error('User not found in state:', { auth: getState().auth });
        return rejectWithValue({ message: 'User not authenticated' });
      }

      // Validate required fields
      if (!expenseData.payeeName?.trim()) {
        return rejectWithValue({ message: 'Payee name is required' });
      }
      if (!expenseData.date) {
        return rejectWithValue({ message: 'Date is required' });
      }

      // Ensure user ID is included in the expense data
      const expenseWithUser = {
        ...expenseData,
        payeeName: expenseData.payeeName.trim(),
        amount: Number(expenseData.amount),
        date: new Date(expenseData.date).toISOString(),
        status: expenseData.status || 'pending',
        description: expenseData.description?.trim() || '',
        user: user._id
      };

      console.log('Sending expense data to API:', expenseWithUser);

      const response = await api.post('/expenses', expenseWithUser);
      return response.data;
    } catch (error) {
      console.error('Create expense error:', {
        error,
        response: error.response?.data,
        status: error.response?.status
      });
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

// Update expense
export const updateExpense = createAsyncThunk(
  'expenses/updateExpense',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/expenses/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Delete expense
export const deleteExpense = createAsyncThunk(
  'expenses/deleteExpense',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/expenses/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  expenses: [],
  loading: false,
  error: null
};

const expenseSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get expenses
      .addCase(getExpenses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getExpenses.fulfilled, (state, action) => {
        state.loading = false;
        state.expenses = action.payload;
      })
      .addCase(getExpenses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch expenses';
      })
      // Create expense
      .addCase(createExpense.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createExpense.fulfilled, (state, action) => {
        state.loading = false;
        state.expenses.unshift(action.payload);
      })
      .addCase(createExpense.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to create expense';
      })
      // Update expense
      .addCase(updateExpense.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateExpense.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.expenses.findIndex(expense => expense._id === action.payload._id);
        if (index !== -1) {
          state.expenses[index] = action.payload;
        }
      })
      .addCase(updateExpense.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update expense';
      })
      // Delete expense
      .addCase(deleteExpense.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteExpense.fulfilled, (state, action) => {
        state.loading = false;
        state.expenses = state.expenses.filter(expense => expense._id !== action.payload);
      })
      .addCase(deleteExpense.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to delete expense';
      });
  }
});

export const { clearError } = expenseSlice.actions;
export default expenseSlice.reducer; 