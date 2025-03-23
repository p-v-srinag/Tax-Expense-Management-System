const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const Invoice = require('../models/Invoice');
const auth = require('../middleware/auth');

// Get all expenses
router.get('/', auth, async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user.id }).sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add new expense
router.post('/', auth, async (req, res) => {
  try {
    const expense = new Expense({
      ...req.body,
      user: req.user.id
    });

    const savedExpense = await expense.save();

    // Create corresponding invoice
    const invoice = new Invoice({
      user: req.user.id,
      type: 'expense',
      clientName: req.body.payee,
      amount: req.body.amount,
      dueDate: req.body.date,
      status: req.body.status,
      description: req.body.description,
      category: req.body.category,
      paymentMethod: req.body.paymentMethod,
      relatedEntry: savedExpense._id
    });

    const savedInvoice = await invoice.save();

    res.status(201).json({
      expense: savedExpense,
      invoice: savedInvoice
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update expense
router.put('/:id', auth, async (req, res) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, user: req.user.id });
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Update expense
    Object.assign(expense, req.body);
    const updatedExpense = await expense.save();

    // Update corresponding invoice
    const invoice = await Invoice.findOne({ 
      relatedEntry: expense._id,
      type: 'expense',
      user: req.user.id 
    });

    if (invoice) {
      Object.assign(invoice, {
        clientName: req.body.payee,
        amount: req.body.amount,
        dueDate: req.body.date,
        status: req.body.status,
        description: req.body.description,
        category: req.body.category,
        paymentMethod: req.body.paymentMethod
      });
      const updatedInvoice = await invoice.save();
      
      res.json({
        expense: updatedExpense,
        invoice: updatedInvoice
      });
    } else {
      res.json({
        expense: updatedExpense
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete expense
router.delete('/:id', auth, async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ 
      _id: req.params.id,
      user: req.user.id 
    });

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Delete corresponding invoice
    await Invoice.deleteOne({ 
      relatedEntry: expense._id,
      type: 'expense',
      user: req.user.id 
    });

    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 