import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { formatCurrency } from '../utils/invoiceUtils';

const Invoice = React.forwardRef(({ invoice }, ref) => {
  return (
    <Box ref={ref} sx={{ p: 4, bgcolor: 'white' }}>
      <Typography variant="h4" gutterBottom align="center">
        Invoice
      </Typography>
      
      <Divider sx={{ my: 3 }} />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6}>
          <Typography variant="subtitle2" color="textSecondary">
            Invoice Number
          </Typography>
          <Typography variant="body1">
            {invoice.invoiceNumber}
          </Typography>
        </Grid>
        <Grid item xs={6} align="right">
          <Typography variant="subtitle2" color="textSecondary">
            Date
          </Typography>
          <Typography variant="body1">
            {new Date(invoice.date).toLocaleDateString()}
          </Typography>
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6}>
          <Typography variant="subtitle2" color="textSecondary">
            Due Date
          </Typography>
          <Typography variant="body1">
            {new Date(invoice.dueDate).toLocaleDateString()}
          </Typography>
        </Grid>
      </Grid>

      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Description</TableCell>
              <TableCell align="right">Quantity</TableCell>
              <TableCell align="right">Price</TableCell>
              <TableCell align="right">Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoice.items.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.description}</TableCell>
                <TableCell align="right">{item.quantity}</TableCell>
                <TableCell align="right">{formatCurrency(item.price)}</TableCell>
                <TableCell align="right">
                  {formatCurrency(item.quantity * item.price)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Box sx={{ width: 300 }}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography>Subtotal:</Typography>
            </Grid>
            <Grid item xs={6} align="right">
              <Typography>{formatCurrency(invoice.subtotal)}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography>Tax (10%):</Typography>
            </Grid>
            <Grid item xs={6} align="right">
              <Typography>{formatCurrency(invoice.tax)}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="h6">Total:</Typography>
            </Grid>
            <Grid item xs={6} align="right">
              <Typography variant="h6">{formatCurrency(invoice.total)}</Typography>
            </Grid>
          </Grid>
        </Box>
      </Box>

      {invoice.notes && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
            Notes:
          </Typography>
          <Typography variant="body2">{invoice.notes}</Typography>
        </Box>
      )}

      <Box sx={{ mt: 4 }}>
        <Typography variant="body2" color="textSecondary" align="center">
          This is a computer-generated document. No signature is required.
        </Typography>
      </Box>
    </Box>
  );
});

Invoice.displayName = 'Invoice';

export default Invoice; 