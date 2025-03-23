export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatDateForInput = (date) => {
  return new Date(date).toISOString().split('T')[0];
}; 