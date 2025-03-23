import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Typography, Grid, Paper, Box, CircularProgress } from '@mui/material';
import { getProfile } from '../features/authSlice';
import { getIncomes } from '../features/incomeSlice';
import { getInvoices } from '../features/invoiceSlice';

export default function Dashboard() {
  const dispatch = useDispatch();
  const { user, loading: userLoading } = useSelector((state) => state.auth);
  const { incomes, loading: incomesLoading } = useSelector((state) => state.income);
  const { invoices, loading: invoicesLoading } = useSelector((state) => state.invoice);

  useEffect(() => {
    dispatch(getProfile());
    dispatch(getIncomes());
    dispatch(getInvoices());
  }, [dispatch]);

  const stats = useMemo(() => {
    const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
    // Calculate total expenses from invoices
    const totalExpenses = invoices.reduce((sum, invoice) => {
      // Sum up all items in the invoice
      const itemsTotal = invoice.items.reduce((itemSum, item) => 
        itemSum + (item.quantity * item.price), 0);
      // Add tax amount
      return sum + itemsTotal + (invoice.tax || 0);
    }, 0);
    const taxLiability = totalIncome * 0.3; // Example tax calculation (30%)
    const netIncome = totalIncome - taxLiability - totalExpenses;

    return {
      totalIncome: totalIncome.toFixed(2),
      totalExpenses: totalExpenses.toFixed(2),
      taxLiability: taxLiability.toFixed(2),
      netIncome: netIncome.toFixed(2)
    };
  }, [incomes, invoices]);

  if (userLoading || incomesLoading || invoicesLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome, {user?.name}!
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Total Income
            </Typography>
            <Typography variant="h4" sx={{ color: 'success.main' }}>
              ${stats.totalIncome}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {incomes.length} income entries
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Total Expenses
            </Typography>
            <Typography variant="h4" sx={{ color: 'error.main' }}>
              ${stats.totalExpenses}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {invoices.length} invoice entries
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Tax Liability
            </Typography>
            <Typography variant="h4" sx={{ color: 'warning.main' }}>
              ${stats.taxLiability}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Estimated (30%)
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Net Income
            </Typography>
            <Typography variant="h4" sx={{ color: 'info.main' }}>
              ${stats.netIncome}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              After tax and expenses
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
} 