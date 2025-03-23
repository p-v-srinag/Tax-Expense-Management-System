import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Alert,
  Tooltip,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { getIncomes, addIncome, deleteIncome, updateIncome } from '../features/incomeSlice';
import { formatCurrency } from '../utils/invoiceUtils';

const Income = () => {
  const dispatch = useDispatch();
  const { incomes, loading, error } = useSelector((state) => state.income);
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedIncomeId, setSelectedIncomeId] = useState(null);
  const [formData, setFormData] = useState({
    source: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Initial load of incomes
  useEffect(() => {
    const loadIncomes = async () => {
      try {
        await dispatch(getIncomes()).unwrap();
      } catch (error) {
        console.error('Error loading incomes:', error);
        // You might want to show an error message to the user here
      }
    };
    loadIncomes();
  }, [dispatch]);

  const handleOpen = (income = null) => {
    if (income) {
      setIsEditing(true);
      setSelectedIncomeId(income._id);
      setFormData({
        source: income.source,
        amount: income.amount.toString(),
        date: new Date(income.date).toISOString().split('T')[0],
        description: income.description || '',
      });
    } else {
      setIsEditing(false);
      setSelectedIncomeId(null);
      setFormData({
        source: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setDeleteDialogOpen(false);
    setDeletingId(null);
    setFormData({
      source: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
    });
  };

  const handleSubmit = async () => {
    try {
      const formattedData = {
        ...formData,
        amount: parseFloat(formData.amount),
      };

      if (isEditing && selectedIncomeId) {
        await dispatch(updateIncome({ id: selectedIncomeId, incomeData: formattedData })).unwrap();
        // You might want to show a success message here
      } else {
        await dispatch(addIncome(formattedData)).unwrap();
        // You might want to show a success message here
      }

      handleClose();
      dispatch(getIncomes());
    } catch (error) {
      console.error('Error processing income:', error);
      // You might want to show an error message to the user here
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await dispatch(deleteIncome(deletingId)).unwrap();
      // You might want to show a success message here
      handleClose();
      dispatch(getIncomes());
    } catch (error) {
      console.error('Error deleting income:', error);
      // You might want to show an error message to the user here
    }
  };

  const calculateTotalIncome = () => {
    return incomes.reduce((total, income) => total + parseFloat(income.amount), 0);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Income Management</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Add Income
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error.message || 'An error occurred'}
        </Alert>
      )}

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
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
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : incomes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No income entries found
                  </TableCell>
                </TableRow>
              ) : (
                incomes.map((income) => (
                  <TableRow key={income._id}>
                    <TableCell>{income.source}</TableCell>
                    <TableCell align="right">{formatCurrency(income.amount)}</TableCell>
                    <TableCell>{new Date(income.date).toLocaleDateString()}</TableCell>
                    <TableCell>{income.description}</TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                        <Tooltip title="Edit Income">
                          <IconButton
                            color="primary"
                            onClick={() => handleOpen(income)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Income">
                          <IconButton
                            color="error"
                            onClick={() => handleDelete(income._id)}
                            disabled={loading}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{isEditing ? 'Edit Income' : 'Add New Income'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Source"
              value={formData.source}
              onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Amount"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
              InputProps={{ inputProps: { min: 0, step: 0.01 } }}
            />
            <TextField
              fullWidth
              label="Date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {isEditing ? 'Save Changes' : 'Add Income'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={handleClose}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this income entry? This will also delete any associated invoice.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Income; 