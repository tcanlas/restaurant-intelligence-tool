/**
 * THE VAULT - Operational Intelligence Utilities
 */

export const calculateWalkins = (total, reservations) => {
  const t = parseInt(total) || 0;
  const r = parseInt(reservations) || 0;
  return Math.max(0, t - r);
};

export const calculateSPLH = (sales, laborHours) => {
  const s = parseFloat(sales) || 0;
  const h = parseFloat(laborHours) || 0;
  return h > 0 ? s / h : 0;
};

export const calculateAverageCheck = (sales, totalGuests) => {
  const s = parseFloat(sales) || 0;
  const g = parseInt(totalGuests) || 0;
  return g > 0 ? s / g : 0;
};

export const calculateLaborPercentage = (laborCost, netSales) => {
  const l = parseFloat(laborCost) || 0;
  const s = parseFloat(netSales) || 0;
  return s > 0 ? (l / s) * 100 : 0;
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
};