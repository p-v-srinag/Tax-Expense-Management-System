const express = require('express');
const router = express.Router();
const {
  calculateTax,
  getTaxHistory,
  getTaxByYear,
  updateTaxStatus,
  getTaxStats
} = require('../controllers/taxController');
const { protect } = require('../middleware/authMiddleware');
const Tax = require('../models/Tax');

// All routes are protected
router.use(protect);

// Get all tax entries
router.get('/', async (req, res) => {
  try {
    const taxes = await Tax.find({ userId: req.user.userId }).sort({ date: -1 });
    res.json(taxes);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add new tax entry
router.post('/', async (req, res) => {
  try {
    const { type, amount, rate, date, description, taxAmount } = req.body;
    
    const tax = new Tax({
      userId: req.user.userId,
      type,
      amount,
      rate,
      date,
      description,
      taxAmount,
      year: new Date(date).getFullYear()
    });

    const savedTax = await tax.save();
    res.status(201).json(savedTax);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error', error: error.message });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete tax entry
router.delete('/:id', async (req, res) => {
  try {
    const tax = await Tax.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!tax) {
      return res.status(404).json({ message: 'Tax entry not found' });
    }

    res.json({ message: 'Tax entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Calculate tax
router.route('/calculate')
  .post(calculateTax);

// Get tax history
router.route('/history')
  .get(getTaxHistory);

// Get tax by year
router.route('/:year')
  .get(getTaxByYear);

// Update tax status
router.route('/:id/status')
  .put(updateTaxStatus);

// Get tax statistics
router.route('/stats')
  .get(getTaxStats);

module.exports = router; 