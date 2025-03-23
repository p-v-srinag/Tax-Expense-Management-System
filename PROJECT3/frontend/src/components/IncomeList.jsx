import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getIncomes } from '../features/incomeSlice';
import { printInvoice } from '../features/invoiceSlice';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
  Box,
  IconButton,
  Tooltip,
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import { styled } from '@mui/material/styles';

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  marginTop: theme.spacing(3),
  maxHeight: 'calc(100vh - 200px)',
  '& .MuiTableCell-head': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    fontWeight: 'bold',
  },
}));

const IncomeList = () => {
  const dispatch = useDispatch();
  const { incomes, loading, error } = useSelector((state) => state.income);
  const { printStatus } = useSelector((state) => state.invoice);

  useEffect(() => {
    dispatch(getIncomes());
  }, [dispatch]);

  const handlePrintInvoice = (income) => {
    // Create invoice data from income
    const invoiceData = {
      _id: income._id,
      clientName: income.source,
      amount: income.amount,
      dueDate: income.date,
      status: 'paid',
      description: income.description || `Income from ${income.source}`,
    };
    dispatch(printInvoice(invoiceData));
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Income List
      </Typography>
      <StyledTableContainer component={Paper}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Source</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {incomes.map((income) => (
              <TableRow key={income._id} hover>
                <TableCell>{income.source}</TableCell>
                <TableCell align="right">
                  ${parseFloat(income.amount).toFixed(2)}
                </TableCell>
                <TableCell>
                  {new Date(income.date).toLocaleDateString()}
                </TableCell>
                <TableCell>{income.description || '-'}</TableCell>
                <TableCell align="center">
                  <Tooltip title="Print Invoice">
                    <IconButton
                      onClick={() => handlePrintInvoice(income)}
                      color="primary"
                      size="small"
                    >
                      <PrintIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {incomes.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No income entries found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </StyledTableContainer>
    </Box>
  );
};

export default IncomeList; 