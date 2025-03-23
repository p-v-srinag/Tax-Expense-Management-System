const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  clientName: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  dueDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'paid', 'cancelled', 'overdue'],
    default: 'pending'
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['income', 'expense']
  },
  category: {
    type: String,
    enum: ['utilities', 'rent', 'salary', 'supplies', 'maintenance', 'marketing', 'other']
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'bank', 'credit', 'other']
  },
  items: [{
    description: String,
    quantity: Number,
    price: Number
  }],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  tax: {
    type: Number,
    required: true,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  date: {
    type: Date,
    required: true
  },
  invoiceNumber: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
invoiceSchema.index({ user: 1, status: 1 });
invoiceSchema.index({ user: 1, type: 1 });
invoiceSchema.index({ user: 1, date: 1 });

// Pre-save middleware to check for overdue status
invoiceSchema.pre('save', function(next) {
  if (this.isModified('dueDate') || this.isModified('status')) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (this.dueDate < today && this.status === 'pending') {
      this.status = 'overdue';
    }
  }
  next();
});

module.exports = mongoose.model('Invoice', invoiceSchema); 