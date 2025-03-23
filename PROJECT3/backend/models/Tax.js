const mongoose = require('mongoose');

const taxSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['income', 'sales', 'property', 'self-employment', 'corporate']
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  rate: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  taxAmount: {
    type: Number,
    required: true,
    min: 0
  },
  date: {
    type: Date,
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  year: {
    type: Number,
    required: true
  },
  totalIncome: {
    type: Number,
    default: 0
  },
  taxBrackets: [{
    rate: {
      type: Number,
      required: true
    },
    threshold: {
      type: Number,
      required: true
    },
    amount: {
      type: Number,
      default: 0
    }
  }],
  deductions: [{
    category: {
      type: String,
      required: true,
      enum: ['Business Expenses', 'Home Office', 'Equipment', 'Travel', 'Other']
    },
    description: String,
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    date: Date
  }],
  totalDeductions: {
    type: Number,
    default: 0
  },
  taxableIncome: {
    type: Number,
    default: 0
  },
  totalTax: {
    type: Number,
    default: 0
  },
  estimatedTax: {
    type: Number,
    default: 0
  },
  taxPayments: [{
    amount: {
      type: Number,
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    paymentMethod: {
      type: String,
      enum: ['Bank Transfer', 'Credit Card', 'Check', 'Other']
    },
    reference: String
  }],
  totalPaid: {
    type: Number,
    default: 0
  },
  balance: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed', 'Overdue'],
    default: 'Pending'
  },
  filingStatus: {
    type: String,
    enum: ['Single', 'Married', 'Head of Household', 'Qualifying Widow(er)'],
    default: 'Single'
  },
  state: {
    type: String,
    default: 'NA'
  },
  stateTax: {
    rate: Number,
    amount: Number
  },
  localTax: {
    rate: Number,
    amount: Number
  },
  selfEmploymentTax: {
    rate: Number,
    amount: Number
  }
}, {
  timestamps: true
});

// Index for efficient querying
taxSchema.index({ userId: 1, date: -1 });
taxSchema.index({ userId: 1, year: 1 });

// Pre-save middleware to calculate totals
taxSchema.pre('save', function(next) {
  // Calculate total deductions
  this.totalDeductions = this.deductions.reduce((sum, deduction) => sum + deduction.amount, 0);
  
  // Calculate taxable income
  this.taxableIncome = this.totalIncome - this.totalDeductions;
  
  // Calculate total tax paid
  this.totalPaid = this.taxPayments.reduce((sum, payment) => sum + payment.amount, 0);
  
  // Calculate balance
  this.balance = this.totalTax - this.totalPaid;
  
  next();
});

module.exports = mongoose.model('Tax', taxSchema); 