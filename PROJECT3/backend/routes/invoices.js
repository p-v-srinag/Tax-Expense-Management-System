const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Invoice = require('../models/Invoice');
const Income = require('../models/Income');
const Expense = require('../models/Expense');

// @desc    Get all invoices for a user
// @route   GET /api/invoices
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const invoices = await Invoice.find({ user: req.user.userId })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    res.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ message: 'Server error while fetching invoices', error: error.message });
  }
});

// @desc    Get a single invoice
// @route   GET /api/invoices/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      user: req.user.userId
    }).lean();

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.json(invoice);
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({ message: 'Server error while fetching invoice', error: error.message });
  }
});

// @desc    Create a new invoice
// @route   POST /api/invoices
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { clientName, amount, dueDate, status, description, type, category, paymentMethod, items, subtotal, tax, total, date, invoiceNumber } = req.body;

    console.log('Received invoice data:', {
      clientName,
      amount,
      dueDate,
      status,
      description,
      type,
      category,
      paymentMethod,
      items,
      subtotal,
      tax,
      total,
      date,
      invoiceNumber
    });

    // Validate required fields
    if (!clientName || !amount || !dueDate || !type || !items || !subtotal || !tax || !total || !date || !invoiceNumber) {
      console.log('Missing required fields:', {
        hasClientName: !!clientName,
        hasAmount: !!amount,
        hasDueDate: !!dueDate,
        hasType: !!type,
        hasItems: !!items,
        hasSubtotal: !!subtotal,
        hasTax: !!tax,
        hasTotal: !!total,
        hasDate: !!date,
        hasInvoiceNumber: !!invoiceNumber
      });
      return res.status(400).json({ 
        message: 'Please provide all required fields',
        details: {
          clientName: !clientName ? 'Client name is required' : null,
          amount: !amount ? 'Amount is required' : null,
          dueDate: !dueDate ? 'Due date is required' : null,
          type: !type ? 'Type is required' : null,
          items: !items ? 'Items are required' : null,
          subtotal: !subtotal ? 'Subtotal is required' : null,
          tax: !tax ? 'Tax is required' : null,
          total: !total ? 'Total is required' : null,
          date: !date ? 'Date is required' : null,
          invoiceNumber: !invoiceNumber ? 'Invoice number is required' : null
        }
      });
    }

    // Validate amount
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount < 0) {
      console.log('Invalid amount:', { amount, parsedAmount });
      return res.status(400).json({ message: 'Amount must be a positive number' });
    }

    // Validate and parse dates
    let parsedDueDate, parsedDate;
    try {
      parsedDueDate = new Date(dueDate);
      parsedDate = new Date(date);
      if (isNaN(parsedDueDate.getTime()) || isNaN(parsedDate.getTime())) {
        throw new Error('Invalid date');
      }
    } catch (error) {
      console.log('Invalid date format:', { dueDate, date, error: error.message });
      return res.status(400).json({ message: 'Invalid date format' });
    }

    // Create invoice with validated data
    const invoice = await Invoice.create({
      user: req.user.userId,
      clientName,
      amount: parsedAmount,
      dueDate: parsedDueDate,
      status: status || 'pending',
      description: description || '',
      type,
      category,
      paymentMethod,
      items,
      subtotal,
      tax,
      total,
      date: parsedDate,
      invoiceNumber
    });

    console.log('Created invoice:', invoice);

    // If invoice is of type income and status is paid, create income entry
    if (type === 'income' && status === 'paid') {
      const income = new Income({
        user: req.user.userId,
        source: clientName,
        amount: amount,
        date: dueDate,
        description: description
      });
      const savedIncome = await income.save();
      
      // Update invoice with income reference
      invoice.relatedEntry = savedIncome._id;
      await invoice.save();
    }
    // If invoice is of type expense and status is paid, create expense entry
    else if (type === 'expense' && status === 'paid') {
      const expense = new Expense({
        user: req.user.userId,
        payee: clientName,
        amount: amount,
        date: dueDate,
        description: description,
        category: category,
        paymentMethod: paymentMethod,
        status: 'paid'
      });
      const savedExpense = await expense.save();
      
      // Update invoice with expense reference
      invoice.relatedEntry = savedExpense._id;
      await invoice.save();
    }

    res.status(201).json(invoice);
  } catch (error) {
    console.error('Error creating invoice:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error',
        details: Object.keys(error.errors).reduce((acc, key) => {
          acc[key] = error.errors[key].message;
          return acc;
        }, {})
      });
    }
    res.status(500).json({ message: 'Server error while creating invoice' });
  }
});

// @desc    Update invoice
// @route   PUT /api/invoices/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Update invoice fields
    Object.assign(invoice, req.body);
    const updatedInvoice = await invoice.save();

    res.json(updatedInvoice);
  } catch (error) {
    console.error('Error updating invoice:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error',
        details: Object.keys(error.errors).reduce((acc, key) => {
          acc[key] = error.errors[key].message;
          return acc;
        }, {})
      });
    }
    res.status(500).json({ message: 'Server error while updating invoice', error: error.message });
  }
});

// @desc    Delete an invoice
// @route   DELETE /api/invoices/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    await invoice.deleteOne();
    res.json({ message: 'Invoice deleted successfully', id: invoice._id });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    res.status(500).json({ message: 'Server error while deleting invoice', error: error.message });
  }
});

module.exports = router; 