const Income = require('../models/Income');
const Invoice = require('../models/Invoice');

// Add new income
exports.addIncome = async (req, res) => {
  // Start a session for transaction
  const session = await Income.startSession();
  session.startTransaction();

  try {
    const incomeData = {
      ...req.body,
      userId: req.user.userId
    };

    // Create the income entry within the transaction
    const income = await Income.create([incomeData], { session });
    
    // Prepare invoice data
    const invoiceData = {
      clientName: incomeData.source,
      source: incomeData.source,
      amount: incomeData.amount,
      dueDate: incomeData.date,
      status: 'paid',
      description: incomeData.description || `Income entry from ${incomeData.source}`,
      user: req.user.userId,
      income: income[0]._id // Link to the income entry
    };

    // Create the invoice within the same transaction
    const invoice = await Invoice.create([invoiceData], { session });

    // Commit the transaction
    await session.commitTransaction();
    
    // Return both the income and invoice data
    res.status(201).json({
      income: income[0],
      invoice: invoice[0],
      message: 'Income and invoice created successfully'
    });
  } catch (error) {
    // If anything fails, abort the transaction
    await session.abortTransaction();
    console.error('Error in addIncome:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  } finally {
    session.endSession();
  }
};

// Get all income entries
exports.getIncomes = async (req, res) => {
  try {
    const incomes = await Income.find({ userId: req.user.userId })
      .sort({ date: -1 });
    res.json(incomes);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get income by ID
exports.getIncomeById = async (req, res) => {
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
};

// Update income
exports.updateIncome = async (req, res) => {
  // Start a session for transaction
  const session = await Income.startSession();
  session.startTransaction();

  try {
    // First find the existing income to get its details
    const existingIncome = await Income.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!existingIncome) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Income not found' });
    }

    // Update the income
    const updatedIncome = await Income.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      req.body,
      { new: true, runValidators: true, session }
    );

    // Find and update related invoice if it exists
    const relatedInvoice = await Invoice.findOneAndUpdate(
      {
        user: req.user.userId,
        $or: [
          { income: req.params.id },
          { 
            clientName: existingIncome.source,
            source: existingIncome.source,
            amount: existingIncome.amount
          }
        ]
      },
      {
        clientName: req.body.source || existingIncome.source,
        source: req.body.source || existingIncome.source,
        amount: req.body.amount || existingIncome.amount,
        description: req.body.description || existingIncome.description,
        income: updatedIncome._id
      },
      { new: true, session }
    );

    // If no existing invoice was found and updated, create a new one
    if (!relatedInvoice && (req.body.source || req.body.amount)) {
      await Invoice.create([{
        user: req.user.userId,
        income: updatedIncome._id,
        clientName: req.body.source || existingIncome.source,
        source: req.body.source || existingIncome.source,
        amount: req.body.amount || existingIncome.amount,
        dueDate: req.body.date || existingIncome.date,
        status: 'paid',
        description: req.body.description || `Income entry from ${req.body.source || existingIncome.source}`
      }], { session });
    }

    // Commit the transaction
    await session.commitTransaction();
    
    res.json({
      income: updatedIncome,
      message: relatedInvoice 
        ? 'Income and related invoice updated successfully'
        : 'Income updated successfully'
    });
  } catch (error) {
    // If anything fails, abort the transaction
    await session.abortTransaction();
    console.error('Error in updateIncome:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  } finally {
    session.endSession();
  }
};

// Delete income
exports.deleteIncome = async (req, res) => {
  try {
    // First find the income to get its details
    const income = await Income.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!income) {
      return res.status(404).json({ message: 'Income not found' });
    }

    // Start a session for transaction
    const session = await Income.startSession();
    session.startTransaction();

    try {
      // Delete the income
      await Income.findByIdAndDelete(income._id).session(session);

      // Find and delete related invoice if it exists
      const deletedInvoice = await Invoice.findOneAndDelete({
        user: req.user.userId,
        $or: [
          { clientName: income.source },
          { source: income.source }
        ],
        amount: income.amount
      }).session(session);

      // Commit the transaction
      await session.commitTransaction();
      
      res.json({ 
        message: deletedInvoice 
          ? 'Income and related invoice removed' 
          : 'Income removed',
        _id: req.params.id,
        source: income.source,
        amount: income.amount,
        date: income.date,
        invoiceId: deletedInvoice?._id
      });
    } catch (error) {
      // If anything fails, abort the transaction
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.error('Error in deleteIncome:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get income summary
exports.getIncomeSummary = async (req, res) => {
  try {
    const summary = await Income.aggregate([
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
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': -1, '_id.month': -1 }
      }
    ]);

    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get income by category
exports.getIncomeByCategory = async (req, res) => {
  try {
    const categorySummary = await Income.aggregate([
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
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json(categorySummary);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 