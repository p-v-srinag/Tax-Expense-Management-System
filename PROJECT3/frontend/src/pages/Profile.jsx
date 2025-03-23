import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import { updateProfile, getProfile } from '../features/authSlice';

export default function Profile() {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    businessName: '',
    panNumber: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    }
  });
  const [success, setSuccess] = useState(false);
  const [panError, setPanError] = useState('');

  useEffect(() => {
    dispatch(getProfile());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        businessName: user.businessName || '',
        panNumber: user.panNumber || '',
        address: user.address || {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: ''
        }
      });
    }
  }, [user]);

  const validatePAN = (pan) => {
    if (!pan) return true; // Allow empty PAN
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(pan);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'panNumber' ? value.toUpperCase() : value
      }));

      if (name === 'panNumber') {
        setPanError(
          value && !validatePAN(value.toUpperCase()) ? 'Invalid PAN number format' : ''
        );
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.panNumber && !validatePAN(formData.panNumber)) {
      setPanError('Invalid PAN number format');
      return;
    }

    try {
      // Create a clean version of the form data
      const cleanFormData = {
        ...formData,
        // Remove empty strings from address fields
        address: Object.entries(formData.address).reduce((acc, [key, value]) => {
          if (value && value.trim()) {
            acc[key] = value.trim();
          }
          return acc;
        }, {})
      };

      // Remove empty fields except for required ones
      const finalData = {
        name: cleanFormData.name,
        email: cleanFormData.email,
        ...cleanFormData.phone ? { phone: cleanFormData.phone } : {},
        ...cleanFormData.businessName ? { businessName: cleanFormData.businessName } : {},
        ...cleanFormData.panNumber ? { panNumber: cleanFormData.panNumber } : {},
        ...Object.keys(cleanFormData.address).length > 0 ? { address: cleanFormData.address } : {}
      };

      const result = await dispatch(updateProfile(finalData)).unwrap();
      
      if (result) {
        setSuccess(true);
        setIsEditing(false);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Profile update error:', err);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        businessName: user.businessName || '',
        panNumber: user.panNumber || '',
        address: user.address || {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: ''
        }
      });
    }
    setPanError('');
  };

  const renderViewMode = () => (
    <List>
      <ListItem>
        <ListItemText 
          primary={<Typography variant="subtitle1" fontWeight="bold">Name</Typography>}
          secondary={user?.name} 
        />
      </ListItem>
      <Divider />
      <ListItem>
        <ListItemText 
          primary={<Typography variant="subtitle1" fontWeight="bold">Email</Typography>}
          secondary={user?.email}
        />
      </ListItem>
      <Divider />
      <ListItem>
        <ListItemText 
          primary={<Typography variant="subtitle1" fontWeight="bold">Phone</Typography>}
          secondary={user?.phone}
        />
      </ListItem>
      <Divider />
      <ListItem>
        <ListItemText 
          primary={<Typography variant="subtitle1" fontWeight="bold">Business Name</Typography>}
          secondary={user?.businessName}
        />
      </ListItem>
      <Divider />
      <ListItem>
        <ListItemText 
          primary={<Typography variant="subtitle1" fontWeight="bold">PAN Number</Typography>}
          secondary={user?.panNumber}
        />
      </ListItem>
      <Divider />
      <ListItem>
        <ListItemText 
          primary={<Typography variant="subtitle1" fontWeight="bold">Address</Typography>}
          secondary={
            user?.address ? 
            `${user.address.street || ''}${user.address.city ? `, ${user.address.city}` : ''}${user.address.state ? `, ${user.address.state}` : ''}${user.address.zipCode ? ` ${user.address.zipCode}` : ''}${user.address.country ? `, ${user.address.country}` : ''}`.trim() :
            ''
          }
        />
      </ListItem>
    </List>
  );

  const renderEditMode = () => (
    <Box component="form" onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            helperText={user?.name ? `Current: ${user.name}` : ''}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled
            helperText="Email cannot be changed"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            disabled
            helperText="Phone number cannot be changed"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Business Name"
            name="businessName"
            value={formData.businessName}
            onChange={handleChange}
            helperText={user?.businessName ? `Current: ${user.businessName}` : ''}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="PAN Number"
            name="panNumber"
            value={formData.panNumber}
            onChange={handleChange}
            error={!!panError}
            helperText={
              user?.panNumber 
                ? "PAN number cannot be changed" 
                : panError || "Format: ABCDE1234F"
            }
            inputProps={{ maxLength: 10 }}
            disabled
          />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Address
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Street"
                name="address.street"
                value={formData.address.street}
                onChange={handleChange}
                helperText={user?.address?.street ? `Current: ${user.address.street}` : ''}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="City"
                name="address.city"
                value={formData.address.city}
                onChange={handleChange}
                helperText={user?.address?.city ? `Current: ${user.address.city}` : ''}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="State"
                name="address.state"
                value={formData.address.state}
                onChange={handleChange}
                helperText={user?.address?.state ? `Current: ${user.address.state}` : ''}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="ZIP Code"
                name="address.zipCode"
                value={formData.address.zipCode}
                onChange={handleChange}
                helperText={user?.address?.zipCode ? `Current: ${user.address.zipCode}` : ''}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Country"
                name="address.country"
                value={formData.address.country}
                onChange={handleChange}
                helperText={user?.address?.country ? `Current: ${user.address.country}` : ''}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Profile Settings
        </Typography>

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Profile updated successfully!
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {isEditing ? renderEditMode() : renderViewMode()}

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          {isEditing ? (
            <>
              <Button
                variant="outlined"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                onClick={handleSubmit}
                disabled={loading || !!panError}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          ) : (
            <Button
              variant="contained"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </Button>
          )}
        </Box>
      </Paper>
    </Box>
  );
} 