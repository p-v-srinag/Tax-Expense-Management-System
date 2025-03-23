import React, { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
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
  Grid,
  Tooltip,
  Alert,
  Divider,
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon, Print as PrintIcon } from "@mui/icons-material";
import { useReactToPrint } from "react-to-print";
import Invoice from "../components/Invoice";
import { getInvoices, addInvoice, updateInvoice, deleteInvoice } from "../features/invoiceSlice";
import { formatCurrency, formatDateForInput } from "../utils/invoiceUtils";

const PrintableInvoice = React.forwardRef((props, ref) => {
  const { invoice } = props;
  
  if (!invoice) {
    return null;
  }

  return (
    <div ref={ref} style={{ padding: '20px' }}>
      <Box sx={{ p: 4, backgroundColor: 'white', minHeight: '100vh' }}>
        <Box sx={{ mb: 4, textAlign: 'center', borderBottom: '2px solid #000', pb: 2 }}>
          <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
            Expenses & Tax Management
          </Typography>
          <Typography variant="h5" gutterBottom>
            Tax Code: {invoice.taxRate || 0}
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Invoice #{invoice.invoiceNumber}
          </Typography>
        </Box>

        <Grid container spacing={4} sx={{ mb: 4 }}>
          <Grid item xs={6}>
            <Box sx={{ border: '1px solid #ccc', p: 2, borderRadius: 1 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                From:
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Expenses & Tax Management</Typography>
              <Typography>123 Business Street</Typography>
              <Typography>Business District</Typography>
              <Typography>City, State 12345</Typography>
              <Typography sx={{ mt: 1 }}>Phone: (123) 456-7890</Typography>
              <Typography>Email: contact@taxinvoice.com</Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ border: '1px solid #ccc', p: 2, borderRadius: 1 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                Bill To:
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{invoice.clientName}</Typography>
              <Typography>Client Address</Typography>
              <Typography>Client City, State ZIP</Typography>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ border: '1px solid #ccc', p: 2, borderRadius: 1, flex: 1, mr: 2 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
              Invoice Details:
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography>Invoice Date:</Typography>
                <Typography>Due Date:</Typography>
                <Typography>Status:</Typography>
                <Typography>Tax Code:</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography>{new Date(invoice.date).toLocaleDateString()}</Typography>
                <Typography>{new Date(invoice.dueDate).toLocaleDateString()}</Typography>
                <Typography sx={{ textTransform: 'capitalize' }}>{invoice.status}</Typography>
                <Typography sx={{ fontWeight: 'bold' }}>{invoice.taxRate || 0}</Typography>
              </Grid>
            </Grid>
          </Box>
        </Box>

        <TableContainer component={Paper} sx={{ mb: 4, border: '1px solid #ccc' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Quantity</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Price</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoice.items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.description}</TableCell>
                  <TableCell align="right">{item.quantity}</TableCell>
                  <TableCell align="right">{formatCurrency(item.price)}</TableCell>
                  <TableCell align="right">{formatCurrency(item.quantity * item.price)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 4 }}>
          <Box sx={{ width: '300px', border: '1px solid #ccc', p: 2, borderRadius: 1 }}>
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <Typography sx={{ fontWeight: 'bold' }}>Subtotal:</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography align="right">{formatCurrency(invoice.subtotal)}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography sx={{ fontWeight: 'bold' }}>Tax Code:</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography align="right">{invoice.taxRate || 0}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography sx={{ fontWeight: 'bold' }}>Tax Amount:</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography align="right">{formatCurrency(invoice.tax)}</Typography>
              </Grid>
              <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>
              <Grid item xs={6}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Total:</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="h6" align="right" sx={{ fontWeight: 'bold' }}>
                  {formatCurrency(invoice.total)}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Box>

        {invoice.notes && (
          <Box sx={{ mt: 4, border: '1px solid #ccc', p: 2, borderRadius: 1 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
              Notes:
            </Typography>
            <Typography>{invoice.notes}</Typography>
          </Box>
        )}

        <Box sx={{ mt: 6, textAlign: 'center', borderTop: '2px solid #000', pt: 2 }}>
          <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
            Thank you for your business!
          </Typography>
          <Typography variant="body2" color="text.secondary">
            For any questions concerning this invoice, please contact
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Expenses & Tax Management | Phone: (123) 456-7890 | Email: contact@taxinvoice.com
          </Typography>
        </Box>
      </Box>
    </div>
  );
});

PrintableInvoice.displayName = 'PrintableInvoice';

const Invoices = () => {
  const dispatch = useDispatch();
  const { invoices = [], loading, error } = useSelector((state) => state.invoice);
  const [open, setOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showPrintView, setShowPrintView] = useState(false);
  const componentRef = useRef(null);
  const [printReady, setPrintReady] = useState(false);
  const [formData, setFormData] = useState({
    invoiceNumber: "",
    clientName: "",
    date: formatDateForInput(new Date()),
    dueDate: formatDateForInput(new Date()),
    items: [{ description: "", quantity: 1, price: 0 }],
    notes: "",
    taxRate: 0
  });
  const [formErrors, setFormErrors] = useState({});

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Check if Ctrl+P is pressed
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault(); // Prevent default browser print
        
        // If we're in print view and have a selected invoice
        if (showPrintView && selectedInvoice && componentRef.current) {
          handlePrint();
        }
      }
    };

    // Add event listener
    document.addEventListener('keydown', handleKeyPress);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [showPrintView, selectedInvoice]);

  const handlePrint = useCallback(() => {
    if (!componentRef.current || !selectedInvoice) {
      console.error('Print component not ready');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      console.error('Popup blocked');
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice #${selectedInvoice.invoiceNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; }
            .print-content { padding: 20px; }
            @media print {
              body { margin: 0; padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="no-print" style="padding: 10px; background: #f0f0f0; margin-bottom: 20px;">
            <button onclick="window.print()">Print (Ctrl+P)</button>
            <button onclick="window.close()">Close</button>
          </div>
          <div class="print-content">
            ${componentRef.current.innerHTML}
          </div>
          <script>
            document.addEventListener('keydown', function(e) {
              if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
                e.preventDefault();
                window.print();
              }
            });

            // Listen for print completion
            window.addEventListener('afterprint', function() {
              // Close the print window
              window.close();
              // Notify the parent window to redirect back
              window.opener.postMessage('printComplete', '*');
            });
          </script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
  }, [selectedInvoice]);

  // Listen for print completion message
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data === 'printComplete') {
        setShowPrintView(false);
        setSelectedInvoice(null);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const printInvoice = useCallback((invoice) => {
    setSelectedInvoice(invoice);
    setShowPrintView(true);
    // Small delay to ensure content is ready
    setTimeout(() => {
      if (componentRef.current) {
        handlePrint();
      }
    }, 100);
  }, [handlePrint]);

  useEffect(() => {
    dispatch(getInvoices());
  }, [dispatch]);

  const handleOpen = () => {
    setOpen(true);
    setSelectedInvoice(null);
    setFormData({
      invoiceNumber: "",
      clientName: "",
      date: formatDateForInput(new Date()),
      dueDate: formatDateForInput(new Date()),
      items: [{ description: "", quantity: 1, price: 0 }],
      notes: "",
      taxRate: 0
    });
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedInvoice(null);
    setFormData({
      invoiceNumber: "",
      clientName: "",
      date: formatDateForInput(new Date()),
      dueDate: formatDateForInput(new Date()),
      items: [{ description: "", quantity: 1, price: 0 }],
      notes: "",
      taxRate: 0
    });
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.invoiceNumber.trim()) {
      errors.invoiceNumber = "Invoice number is required";
    }
    if (!formData.clientName.trim()) {
      errors.clientName = "Client name is required";
    }
    if (!formData.date) {
      errors.date = "Date is required";
    }
    if (!formData.dueDate) {
      errors.dueDate = "Due date is required";
    }
    if (formData.items.some((item) => !item.description.trim())) {
      errors.items = "All items must have a description";
    }
    if (formData.items.some((item) => item.quantity <= 0)) {
      errors.items = "All items must have a quantity greater than 0";
    }
    if (formData.items.some((item) => item.price < 0)) {
      errors.items = "All items must have a price greater than or equal to 0";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      // Calculate totals
      const subtotal = calculateSubtotal();
      const tax = calculateTax();
      const total = calculateTotal();

      // Format the invoice data
      const invoiceData = {
        clientName: formData.clientName,
        amount: total,
        dueDate: new Date(formData.dueDate).toISOString(),
        status: 'pending',
        description: formData.notes,
        items: formData.items,
        subtotal,
        tax: tax,
        total,
        date: new Date(formData.date).toISOString(),
        invoiceNumber: formData.invoiceNumber,
        type: 'income',
        taxRate: formData.taxRate
      };

      // Log the data being sent
      console.log('Submitting invoice data:', invoiceData);

      if (selectedInvoice) {
        await dispatch(updateInvoice({ id: selectedInvoice._id, data: invoiceData })).unwrap();
      } else {
        await dispatch(addInvoice(invoiceData)).unwrap();
      }
      handleClose();
    } catch (error) {
      console.error("Failed to save invoice:", error);
      // Show error to user
      setFormErrors(prev => ({
        ...prev,
        submit: error.message || 'Failed to save invoice'
      }));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      try {
        await dispatch(deleteInvoice(id)).unwrap();
      } catch (error) {
        console.error("Failed to delete invoice:", error);
      }
    }
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: "", quantity: 1, price: 0 }],
    });
  };

  const removeItem = (index) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const calculateSubtotal = () => {
    return formData.items.reduce(
      (total, item) => total + item.quantity * item.price,
      0
    );
  };

  const calculateTax = () => {
    return formData.taxRate || 0;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  if (showPrintView && selectedInvoice) {
    return (
      <Box sx={{ p: 2 }}>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => {
              setShowPrintView(false);
              setSelectedInvoice(null);
            }}
          >
            Back to Invoices
          </Button>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Press Ctrl+P to print
            </Typography>
            <Button
              variant="contained"
              onClick={handlePrint}
            >
              Print Invoice
            </Button>
          </Box>
        </Box>

        <Box 
          ref={componentRef}
          sx={{
            '@media print': {
              padding: 0,
              margin: 0
            }
          }}
        >
          <PrintableInvoice invoice={selectedInvoice} />
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">Expenses</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpen}
          disabled={loading}
        >
          Add Expense
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
              <TableCell>Invoice #</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Subtotal</TableCell>
              <TableCell>Tax</TableCell>
              <TableCell>Total</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice._id}>
                <TableCell>{invoice.invoiceNumber}</TableCell>
                <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                <TableCell>{formatCurrency(invoice.subtotal)}</TableCell>
                <TableCell>{formatCurrency(invoice.tax)}</TableCell>
                <TableCell>{formatCurrency(invoice.total)}</TableCell>
                <TableCell align="center">
                  <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
                    <Tooltip title="Print Invoice">
                      <IconButton
                        color="primary"
                        onClick={() => printInvoice(invoice)}
                      >
                        <PrintIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Invoice">
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(invoice._id)}
                        disabled={loading}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedInvoice ? "Edit Expense" : "Add Expense"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Invoice Number"
                name="invoiceNumber"
                value={formData.invoiceNumber}
                onChange={(e) =>
                  setFormData({ ...formData, invoiceNumber: e.target.value })
                }
                error={!!formErrors.invoiceNumber}
                helperText={formErrors.invoiceNumber}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Client Name"
                name="clientName"
                value={formData.clientName}
                onChange={(e) =>
                  setFormData({ ...formData, clientName: e.target.value })
                }
                error={!!formErrors.clientName}
                helperText={formErrors.clientName}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Date"
                name="date"
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
                error={!!formErrors.date}
                helperText={formErrors.date}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Due Date"
                name="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData({ ...formData, dueDate: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
                error={!!formErrors.dueDate}
                helperText={formErrors.dueDate}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Items
              </Typography>
              {formData.items.map((item, index) => (
                <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                  <Grid item xs={12} md={5}>
                    <TextField
                      fullWidth
                      label="Description"
                      value={item.description}
                      onChange={(e) =>
                        updateItem(index, "description", e.target.value)
                      }
                      error={!!formErrors.items?.[index]?.description}
                      helperText={formErrors.items?.[index]?.description}
                    />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <TextField
                      fullWidth
                      label="Quantity"
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(index, "quantity", Number(e.target.value))
                      }
                      error={!!formErrors.items?.[index]?.quantity}
                      helperText={formErrors.items?.[index]?.quantity}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Price"
                      type="number"
                      value={item.price}
                      onChange={(e) =>
                        updateItem(index, "price", Number(e.target.value))
                      }
                      error={!!formErrors.items?.[index]?.price}
                      helperText={formErrors.items?.[index]?.price}
                    />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <IconButton 
                      onClick={() => removeItem(index)}
                      color="error"
                      sx={{ mt: 1 }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              ))}
              <Button
                startIcon={<AddIcon />}
                onClick={addItem}
                sx={{ mt: 1 }}
              >
                Add Item
              </Button>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                name="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                multiline
                rows={3}
                error={!!formErrors.notes}
                helperText={formErrors.notes}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tax Rate"
                name="taxRate"
                type="number"
                value={formData.taxRate}
                onChange={(e) =>
                  setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0 })
                }
                error={!!formErrors.taxRate}
                helperText={formErrors.taxRate}
                InputProps={{ inputProps: { min: 0, step: 0.01 } }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {selectedInvoice ? "Update Expense" : "Add Expense"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Invoices; 