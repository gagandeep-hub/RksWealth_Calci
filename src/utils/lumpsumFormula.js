/**
 * Lumpsum Formula (Compound Interest)
 * FV = P * (1 + r/n)^(nt)
 * For annual compounding: FV = P * (1 + r)^t
 * 
 * @param {number} amount - One-time investment amount
 * @param {number} annualRate - Expected annual return rate in %
 * @param {number} years - Time period in years
 * @returns {object} { totalValue, totalInvested, totalReturns }
 */
export const calculateLumpsum = (amount, annualRate, years) => {
  const r = annualRate / 100;
  const totalValue = amount * Math.pow(1 + r, years);
  const totalInvested = amount;
  const totalReturns = totalValue - totalInvested;

  return {
    totalValue: Math.round(totalValue),
    totalInvested: Math.round(totalInvested),
    totalReturns: Math.round(totalReturns)
  };
};

/**
 * Generates year-wise breakdown for Lumpsum
 */
export const getLumpsumBreakdown = (amount, annualRate, years) => {
  const breakdown = [];
  const r = annualRate / 100;
  
  for (let year = 1; year <= years; year++) {
    const totalValue = amount * Math.pow(1 + r, year);
    
    breakdown.push({
      year,
      invested: Math.round(amount),
      value: Math.round(totalValue),
      returns: Math.round(totalValue - amount)
    });
  }
  
  return breakdown;
};
