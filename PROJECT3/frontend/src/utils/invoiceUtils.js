export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
};

export const formatDateForInput = (date) => {
  return new Date(date).toISOString().split('T')[0];
}; 