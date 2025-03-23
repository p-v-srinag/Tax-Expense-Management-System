const Tax = require('../models/Tax');
const Income = require('../models/Income');

// Calculate tax liability
exports.calculateTax = async (req, res) => {
  try {
    const { year } = req.body;
    const userId = req.user.userId;

    // Get all income for the specified year
    const incomes = await Income.find({
      userId,
      date: {
        $gte: new Date(year, 0, 1),
        $lt: new Date(year + 1, 0, 1)
      }
    });

    // Calculate total income
    const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);

    // Calculate tax based on tax brackets
    let taxAmount = 0;
    if (totalIncome <= 50000) {
      taxAmount = totalIncome * 0.15;
    } else if (totalIncome <= 100000) {
      taxAmount = 7500 + (totalIncome - 50000) * 0.25;
    } else if (totalIncome <= 200000) {
      taxAmount = 20000 + (totalIncome - 100000) * 0.35;
    } else {
      taxAmount = 55000 + (totalIncome - 200000) * 0.45;
    }

    // Create or update tax record
    const tax = await Tax.findOneAndUpdate(
      { userId, year },
      {
        totalIncome,
        taxAmount,
        status: 'pending'
      },
      { new: true, upsert: true }
    );

    res.json(tax);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get tax history
exports.getTaxHistory = async (req, res) => {
  try {
    const taxes = await Tax.find({ userId: req.user.userId })
      .sort({ year: -1 });
    res.json(taxes);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get tax by year
exports.getTaxByYear = async (req, res) => {
  try {
    const tax = await Tax.findOne({
      userId: req.user.userId,
      year: req.params.year
    });

    if (!tax) {
      return res.status(404).json({ message: 'Tax record not found' });
    }

    res.json(tax);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update tax status
exports.updateTaxStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const tax = await Tax.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { status },
      { new: true }
    );

    if (!tax) {
      return res.status(404).json({ message: 'Tax record not found' });
    }

    res.json(tax);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get tax statistics
exports.getTaxStats = async (req, res) => {
  try {
    const stats = await Tax.aggregate([
      {
        $match: {
          userId: req.user.userId,
          year: { $gte: new Date().getFullYear() - 5 }
        }
      },
      {
        $group: {
          _id: '$year',
          totalTax: { $sum: '$taxAmount' },
          totalIncome: { $sum: '$totalIncome' },
          averageRate: { $avg: { $divide: ['$taxAmount', '$totalIncome'] } }
        }
      },
      {
        $sort: { _id: -1 }
      }
    ]);

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 