const express = require('express');
const router = express.Router();
const Income = require('../models/Income');
const { protect } = require('../middleware/authMiddleware');

// Create income
router.post('/', protect, async (req, res) => {
  try {
    const income = await Income.create({
      ...req.body,
      userId: req.user.userId
    });

    res.status(201).json({
      income,
      message: 'Income created successfully'
    });
  } catch (error) {
    console.error('Error creating income:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error',
        error: error.message 
      });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all incomes
router.get('/', protect, async (req, res) => {
  try {
    const incomes = await Income.find({ userId: req.user.userId })
      .sort({ date: -1 });
    res.json(incomes);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get income by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const income = await Income.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!income) {
      return res.status(404).json({ message: 'Income not found' });
    }

    res.json(income);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update income
router.put('/:id', protect, async (req, res) => {
  try {
    const income = await Income.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      req.body,
      { new: true }
    );

    if (!income) {
      return res.status(404).json({ message: 'Income not found' });
    }

    res.json(income);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete income
router.delete('/:id', protect, async (req, res) => {
  try {
    const income = await Income.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!income) {
      return res.status(404).json({ message: 'Income not found' });
    }

    res.json({ message: 'Income deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get income statistics
router.get('/stats/summary', protect, async (req, res) => {
  try {
    const stats = await Income.aggregate([
      {
        $match: {
          userId: req.user.userId,
          date: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 12))
          }
        }
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router; 