import React from 'react';
import { useState, useEffect } from 'react';
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
  CircularProgress,
  Snackbar,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { getIncomes, addIncome, deleteIncome, updateIncome } from '../features/incomeSlice';
import { getInvoices } from '../features/invoiceSlice';

const Income = () => {
  const dispatch = useDispatch();
  const { incomes, loading, error } = useSelector((state) => state.income);
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedIncomeId, setSelectedIncomeId] = useState(null);
  const [formData, setFormData] = useState({
    source: '',
    amount: '',
    date: '',
    description: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Initial load of incomes
  useEffect(() => {
    const loadIncomes = async () => {
      try {
        await dispatch(getIncomes()).unwrap();
      } catch (error) {
        setSnackbar({
          open: true,
          message: error.message || 'Failed to load incomes',
          severity: 'error'
        });
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
        date: '',
        description: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setIsEditing(false);
    setSelectedIncomeId(null);
    setFormData({
      source: '',
      amount: '',
      date: '',
      description: '',
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
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
        setSnackbar({
          open: true,
          message: 'Income updated successfully',
          severity: 'success'
        });
      } else {
        await dispatch(addIncome(formattedData)).unwrap();
        setSnackbar({
          open: true,
          message: 'Income added successfully',
          severity: 'success'
        });
      }
      
      handleClose();
      
      // Refresh the lists after successful operation
      await Promise.all([
        dispatch(getIncomes()),
        dispatch(getInvoices())
      ]);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to process income',
        severity: 'error'
      });
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await dispatch(deleteIncome(deletingId)).unwrap();
      setSnackbar({
        open: true,
        message: 'Income deleted successfully',
        severity: 'success'
      });
      setDeleteDialogOpen(false);
      setDeletingId(null);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to delete income',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const calculateTotalIncome = () => {
    return incomes.reduce((total, income) => total + parseFloat(income.amount), 0).toFixed(2);
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Income Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
          disabled={loading}
        >
          Add Income
        </Button>
      </Box>

      {snackbar.open && (
        <Alert severity={snackbar.severity} sx={{ mb: 2 }}>
          {snackbar.message}
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Total Income: ${calculateTotalIncome()}
        </Typography>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Source</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <CircularProgress size={24} />
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
                  <TableCell>${income.amount.toFixed(2)}</TableCell>
                  <TableCell>{new Date(income.date).toLocaleDateString()}</TableCell>
                  <TableCell>{income.description}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      color="primary"
                      onClick={() => handleOpen(income)}
                      disabled={loading}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(income._id)}
                      disabled={loading}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog 
        open={open} 
        onClose={handleClose}
      >
        <DialogTitle>
          {isEditing ? 'Edit Income' : 'Add New Income'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Source"
              name="source"
              value={formData.source}
              onChange={handleChange}
              disabled={loading}
              inputProps={{ maxLength: 100 }}
              helperText="Maximum 100 characters, letters, numbers, spaces, hyphens, and underscores only"
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Amount"
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleChange}
              disabled={loading}
              inputProps={{ 
                min: 0.01,
                max: 999999999.99,
                step: "0.01"
              }}
              helperText="Amount must be between 0.01 and 999,999,999.99"
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              disabled={loading}
              InputLabelProps={{ shrink: true }}
              inputProps={{
                max: today
              }}
            />
            <TextField
              margin="normal"
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={loading}
              multiline
              rows={3}
              inputProps={{ maxLength: 500 }}
              helperText="Optional, maximum 500 characters"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>Cancel</Button>
          <Button 
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              isEditing ? 'Save Changes' : 'Add Income'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this income entry? This will also delete any associated invoice.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={loading}>Cancel</Button>
          <Button 
            onClick={confirmDelete} 
            color="error" 
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Income; 