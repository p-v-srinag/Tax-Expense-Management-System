import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
} from '@mui/material';
import { formatCurrency, formatPercentage } from '../utils/taxUtils';

const TaxInvoice = React.forwardRef(({ entry }, ref) => {
  if (!entry) return null;

  return (
    <Box ref={ref} sx={{ p: 4, bgcolor: 'white', minWidth: '600px' }}>
      <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>
        Tax Invoice
      </Typography>
      
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6}>
          <Typography variant="subtitle2" color="textSecondary">
            Date
          </Typography>
          <Typography variant="body1">
            {new Date(entry.date).toLocaleDateString()}
          </Typography>
        </Grid>
        <Grid item xs={6} align="right">
          <Typography variant="subtitle2" color="textSecondary">
            Invoice ID
          </Typography>
          <Typography variant="body1">
            {entry._id}
          </Typography>
        </Grid>
      </Grid>

      <Paper elevation={0} sx={{ p: 2, border: '1px solid #ddd', mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Tax Details
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="subtitle2" color="textSecondary">
              Type
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {entry.type.charAt(0).toUpperCase() + entry.type.slice(1)} Tax
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle2" color="textSecondary">
              Description
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {entry.description || 'N/A'}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={0} sx={{ p: 2, border: '1px solid #ddd', mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Calculation Summary
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Base Amount:</Typography>
              <Typography>{formatCurrency(entry.amount)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Tax Rate:</Typography>
              <Typography>{formatPercentage(entry.rate)}</Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6">Total Tax Amount:</Typography>
              <Typography variant="h6">{formatCurrency(entry.taxAmount)}</Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ mt: 4 }}>
        <Typography variant="body2" color="textSecondary" align="center">
          This is a computer-generated document. No signature is required.
        </Typography>
        <Typography variant="body2" color="textSecondary" align="center" sx={{ mt: 1 }}>
          Generated on: {new Date().toLocaleString()}
        </Typography>
      </Box>
    </Box>
  );
});

TaxInvoice.displayName = 'TaxInvoice';

export default TaxInvoice; 