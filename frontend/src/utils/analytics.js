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

export const calculatePercentageChange = (current, previous) => {
  if (!previous || previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

export const calculateBaselinesFromRaw = (historicalData) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const result = {};

  days.forEach(dayName => {
    const resAverages = Array(24).fill(0);
    const walkInAverages = Array(24).fill(0);
    
    for (let h = 0; h < 24; h++) {
      const entries = historicalData.filter(d => d.day === dayName && d.hour === h);
      if (entries.length > 0) {
        resAverages[h] = entries.reduce((acc, curr) => acc + (curr.res_covers || 0), 0) / entries.length;
        walkInAverages[h] = entries.reduce((acc, curr) => acc + (curr.walk_in_covers || 0), 0) / entries.length;
      }
    }
    result[dayName] = { res: resAverages, walkIn: walkInAverages };
  });

  return result;
};