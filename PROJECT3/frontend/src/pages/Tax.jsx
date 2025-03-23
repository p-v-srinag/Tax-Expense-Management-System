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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Grid,
  Tooltip,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Info as InfoIcon, Print as PrintIcon } from '@mui/icons-material';
import { getTaxEntries, addTaxEntry, updateTaxEntry, deleteTaxEntry } from '../features/taxSlice';
import { 
  TAX_RATES, 
  getDefaultTaxRate, 
  calculateTaxAmount, 
  formatCurrency, 
  formatDateForInput, 
  getCurrentTaxYear,
  calculateIncomeTax,
  getTaxBracketInfo,
  formatPercentage,
  calculateQuarterlyTax
} from '../utils/taxUtils';

export default function Tax() {
  const dispatch = useDispatch();
  const { taxEntries = [], loading, error } = useSelector((state) => state.tax);
  const { incomeEntries = [] } = useSelector((state) => state.income || {});
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: 'income',
    amount: '',
    rate: getDefaultTaxRate('income'),
    date: formatDateForInput(new Date()),
    description: '',
    year: getCurrentTaxYear(),
    filingStatus: 'Single',
    state: 'NA'
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    dispatch(getTaxEntries());
  }, [dispatch]);

  const taxTypes = Object.entries(TAX_RATES).map(([value, data]) => ({
    value,
    label: data.description
  }));

  const handleOpen = () => setOpen(true);
  
  const handleClose = () => {
    setOpen(false);
    setFormData({
      type: 'income',
      amount: '',
      rate: getDefaultTaxRate('income'),
      date: formatDateForInput(new Date()),
      description: '',
      year: getCurrentTaxYear(),
      filingStatus: 'Single',
      state: 'NA'
    });
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.amount || isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      errors.amount = 'Please enter a valid amount greater than 0';
    }
    if (!formData.rate || isNaN(formData.rate) || parseFloat(formData.rate) < 0 || parseFloat(formData.rate) > 100) {
      errors.rate = 'Please enter a valid tax rate between 0 and 100';
    }
    if (!formData.date) {
      errors.date = 'Please select a date';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'type') {
      setFormData({
        ...formData,
        type: value,
        rate: getDefaultTaxRate(value)
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    try {
      const taxData = {
        ...formData,
        amount: parseFloat(formData.amount),
        rate: parseFloat(formData.rate),
        taxAmount: calculateTaxAmount(formData.amount, formData.rate),
        year: parseInt(formData.year),
        date: new Date(formData.date).toISOString()
      };
      
      await dispatch(addTaxEntry(taxData)).unwrap();
      handleClose();
    } catch (error) {
      console.error('Failed to add tax entry:', error);
      setFormErrors({
        submit: error.message || 'Failed to add tax entry'
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteTaxEntry(id)).unwrap();
    } catch (error) {
      console.error('Failed to delete tax entry:', error);
    }
  };

  const calculateTotalIncome = () => {
    if (!Array.isArray(incomeEntries)) return 0;
    return incomeEntries.reduce((total, entry) => total + (Number(entry?.amount) || 0), 0);
  };

  const calculateTotalTaxLiability = () => {
    const totalIncome = calculateTotalIncome();
    const { taxAmount, effectiveRate } = calculateIncomeTax(totalIncome);
    return { taxAmount, effectiveRate };
  };

  const getTaxBracketSummary = () => {
    const totalIncome = calculateTotalIncome();
    const currentBracket = getTaxBracketInfo(totalIncome);
    return {
      currentRate: currentBracket.rate,
      threshold: currentBracket.threshold,
      nextBracket: TAX_RATES.income.brackets.find(b => b.threshold > currentBracket.threshold)
    };
  };

  // New function to combine tax entries with income entries
  const getCombinedEntries = () => {
    // Convert income entries to tax entries format
    const incomeTaxEntries = incomeEntries.map(income => ({
      _id: `income_${income._id}`,
      type: 'income',
      amount: Number(income.amount) || 0,
      rate: getDefaultTaxRate('income'),
      taxAmount: calculateTaxAmount(income.amount, getDefaultTaxRate('income')),
      date: income.date || new Date().toISOString(),
      description: `Income: ${income.description || 'Regular Income'}`,
      source: 'income_entry'
    }));

    // Combine with existing tax entries, excluding any previously auto-generated entries
    const manualTaxEntries = taxEntries.filter(entry => !entry.source || entry.source !== 'income_entry');
    return [...incomeTaxEntries, ...manualTaxEntries];
  };

  const printInvoice = (entry) => {
    if (!entry) {
      console.error('No entry selected for printing');
      return;
    }

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print');
      return;
    }

    // Format the date
    const formattedDate = new Date(entry.date).toLocaleDateString();
    
    // Create simple HTML content
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Tax Entry - ${entry.type}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 20px;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .section {
            margin-bottom: 20px;
            padding: 15px;
            border: 1px solid #ddd;
          }
          .row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 0.9em;
            color: #666;
          }
          @media print {
            body {
              margin: 0;
              padding: 20px;
            }
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Tax Entry Details</h1>
          <p>Generated on: ${new Date().toLocaleString()}</p>
        </div>

        <div class="section">
          <div class="row">
            <strong>Type:</strong>
            <span>${entry.type}</span>
          </div>
          <div class="row">
            <strong>Date:</strong>
            <span>${formattedDate}</span>
          </div>
          <div class="row">
            <strong>Amount:</strong>
            <span>${formatCurrency(entry.amount)}</span>
          </div>
          <div class="row">
            <strong>Tax Rate:</strong>
            <span>${formatPercentage(entry.rate)}</span>
          </div>
          <div class="row">
            <strong>Tax Amount:</strong>
            <span>${formatCurrency(entry.taxAmount)}</span>
          </div>
          ${entry.description ? `
          <div class="row">
            <strong>Description:</strong>
            <span>${entry.description}</span>
          </div>
          ` : ''}
        </div>

        <div class="footer">
          <p>This is a computer-generated document.</p>
        </div>

        <div class="no-print" style="text-align: center; margin-top: 20px;">
          <button onclick="window.print();window.close()">Print</button>
        </div>
      </body>
      </html>
    `;

    // Write the content to the new window and trigger print
    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  return (
    <Box>
      <Box sx={{ mb: 4, textAlign: 'center', borderBottom: '2px solid #000', pb: 2 }}>
        <Typography variant="h4">Tax Management</Typography>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Tax Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpen}
          disabled={loading}
        >
          Add Tax Entry
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Type</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Rate (%)</TableCell>
              <TableCell>Tax Amount</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {getCombinedEntries().map((entry) => (
              <TableRow 
                key={entry._id}
                sx={{ 
                  backgroundColor: entry.source === 'income_entry' ? 'rgba(0, 0, 0, 0.04)' : 'inherit'
                }}
              >
                <TableCell>{entry.type}</TableCell>
                <TableCell>{formatCurrency(entry.amount)}</TableCell>
                <TableCell>{formatPercentage(entry.rate)}</TableCell>
                <TableCell>{formatCurrency(entry.taxAmount)}</TableCell>
                <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                <TableCell>{entry.description}</TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                    <Tooltip title="Print Invoice">
                      <IconButton
                        color="primary"
                        onClick={() => printInvoice(entry)}
                      >
                        <PrintIcon />
                      </IconButton>
                    </Tooltip>
                    {!entry.source && (
                      <Tooltip title="Delete Entry">
                        <IconButton
                          color="error"
                          onClick={() => handleDelete(entry._id)}
                          disabled={loading}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add Tax Entry</DialogTitle>
        <DialogContent>
          {formErrors.submit && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {formErrors.submit}
            </Alert>
          )}
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <FormControl fullWidth margin="normal" required>
              <InputLabel id="tax-type-label">Tax Type</InputLabel>
              <Select
                labelId="tax-type-label"
                id="tax-type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                label="Tax Type"
                disabled={loading}
              >
                {taxTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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
              error={Boolean(formErrors.amount)}
              helperText={formErrors.amount}
              inputProps={{
                min: 0,
                step: "0.01"
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Tax Rate (%)"
              name="rate"
              type="number"
              value={formData.rate}
              onChange={handleChange}
              disabled={loading}
              error={Boolean(formErrors.rate)}
              helperText={formErrors.rate}
              inputProps={{
                min: 0,
                max: 100,
                step: "0.01"
              }}
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
              error={Boolean(formErrors.date)}
              helperText={formErrors.date}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              margin="normal"
              fullWidth
              label="Description"
              name="description"
              multiline
              rows={4}
              value={formData.description}
              onChange={handleChange}
              disabled={loading}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading} variant="contained">
            {loading ? 'Adding...' : 'Add Tax Entry'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 