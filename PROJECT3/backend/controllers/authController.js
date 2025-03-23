const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '24h'
  });
};

// Register new user
exports.register = async (req, res) => {
  try {
    const { name, email, password, businessName, panNumber, address, phone } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      businessName,
      panNumber,
      address,
      phone
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        businessName: user.businessName,
        panNumber: user.panNumber
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    console.log('Raw request body:', req.body);
    const { email, password } = req.body;
    
    // Log the received data
    console.log('Login attempt details:', {
      receivedEmail: email,
      emailType: typeof email,
      hasPassword: Boolean(password),
      passwordType: typeof password,
      rawBody: req.body
    });

    // Validate input
    if (!email || !password) {
      console.log('Missing credentials:', { email: !email, password: !password });
      return res.status(400).json({ 
        message: 'Please provide both email and password',
        debug: { hasEmail: Boolean(email), hasPassword: Boolean(password) }
      });
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Find user
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
      console.log('User not found:', normalizedEmail);
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    console.log('User found:', {
      id: user._id,
      email: user.email,
      hasPassword: Boolean(user.password)
    });

    // Check password
    try {
      const isMatch = await user.comparePassword(password);
      console.log('Password comparison result:', isMatch);
      
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid email or password' });
      }
    } catch (error) {
      console.error('Password comparison error:', error);
      return res.status(500).json({ message: 'Error verifying password' });
    }

    // Generate token
    const token = generateToken(user._id);

    // Remove sensitive data from response
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      businessName: user.businessName,
      panNumber: user.panNumber,
      phone: user.phone,
      address: user.address
    };

    res.json({
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Server error during login',
      error: error.message 
    });
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      businessName: user.businessName,
      panNumber: user.panNumber,
      phone: user.phone,
      address: user.address
    };

    res.json(userResponse);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, businessName, panNumber, address, phone } = req.body;

    // Check if email is being changed and if it's already taken
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: req.user.userId } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    // Update user
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { name, email, businessName, panNumber, address, phone },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      businessName: user.businessName,
      panNumber: user.panNumber,
      phone: user.phone,
      address: user.address
    };

    res.json(userResponse);
  } catch (error) {
    console.error('Profile update error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        error: error.message 
      });
    }
    res.status(500).json({ 
      message: 'Failed to update profile', 
      error: error.message
    });
  }
}; 