import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/authSlice';
import incomeReducer from '../features/incomeSlice';
import invoiceReducer from '../features/invoiceSlice';
import taxReducer from '../features/taxSlice';
import expenseReducer from '../features/expenseSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    income: incomeReducer,
    invoice: invoiceReducer,
    tax: taxReducer,
    expense: expenseReducer,
  },
}); 