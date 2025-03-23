// Predefined tax rates for different tax types
export const TAX_RATES = {
  income: {
    rate: 25,
    description: 'Standard Income Tax Rate',
    brackets: [
      { threshold: 0, rate: 10 },
      { threshold: 10000, rate: 12 },
      { threshold: 40000, rate: 22 },
      { threshold: 85000, rate: 24 },
      { threshold: 165000, rate: 32 },
      { threshold: 210000, rate: 35 },
      { threshold: 510000, rate: 37 }
    ]
  },
  sales: {
    rate: 10,
    description: 'General Sales Tax'
  },
  property: {
    rate: 1.5,
    description: 'Property Tax Rate'
  },
  'self-employment': {
    rate: 15.3,
    description: 'Self Employment Tax Rate'
  },
  corporate: {
    rate: 21,
    description: 'Corporate Tax Rate'
  }
};

// Get default tax rate for a tax type
export const getDefaultTaxRate = (taxType) => {
  return TAX_RATES[taxType]?.rate || 0;
};

// Calculate income tax based on income amount and brackets
export const calculateIncomeTax = (income) => {
  const brackets = TAX_RATES.income.brackets;
  let remainingIncome = income;
  let totalTax = 0;

  for (let i = 0; i < brackets.length; i++) {
    const currentBracket = brackets[i];
    const nextBracket = brackets[i + 1];
    const bracketIncome = nextBracket 
      ? Math.min(remainingIncome, nextBracket.threshold - currentBracket.threshold)
      : remainingIncome;

    if (bracketIncome <= 0) break;

    totalTax += (bracketIncome * currentBracket.rate) / 100;
    remainingIncome -= bracketIncome;
  }

  return {
    taxAmount: totalTax,
    effectiveRate: (totalTax / income) * 100
  };
};

// Get tax bracket information for an income amount
export const getTaxBracketInfo = (income) => {
  const brackets = TAX_RATES.income.brackets;
  for (let i = brackets.length - 1; i >= 0; i--) {
    if (income >= brackets[i].threshold) {
      return {
        rate: brackets[i].rate,
        threshold: brackets[i].threshold
      };
    }
  }
  return brackets[0];
};

// Calculate tax amount based on amount and rate
export const calculateTaxAmount = (amount, rate, type = 'income') => {
  if (type === 'income') {
    return calculateIncomeTax(parseFloat(amount)).taxAmount;
  }
  return (parseFloat(amount) * parseFloat(rate)) / 100;
};

// Format currency value
export const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

// Format date for input field
export const formatDateForInput = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

// Get current tax year
export const getCurrentTaxYear = () => {
  return new Date().getFullYear();
};

// Format percentage
export const formatPercentage = (value) => {
  return `${value.toFixed(2)}%`;
};

// Calculate estimated quarterly tax
export const calculateQuarterlyTax = (annualIncome) => {
  const { taxAmount } = calculateIncomeTax(annualIncome);
  return taxAmount / 4;
}; 