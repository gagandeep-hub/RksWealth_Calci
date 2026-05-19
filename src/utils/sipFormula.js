/**
 * SIP Formula (Future Value of an Annuity)
 * FV = P * [((1 + i)^n - 1) / i] * (1 + i)
 * 
 * @param {number} monthlyInvestment - Amount invested every month
 * @param {number} annualRate - Expected annual return rate in %
 * @param {number} years - Time period in years
 * @returns {object} { totalValue, totalInvested, totalReturns }
 */
export const calculateSIP = (monthlyInvestment, annualRate, years) => {
  const i = annualRate / 100 / 12; // Monthly interest rate
  const n = years * 12; // Total number of months

  // FV = P * [((1 + i)^n - 1) / i] * (1 + i)
  // The (1 + i) at the end is because investments are usually made at the beginning of the month
  const totalValue = monthlyInvestment * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
  const totalInvested = monthlyInvestment * n;
  const totalReturns = totalValue - totalInvested;

  return {
    totalValue: Math.round(totalValue),
    totalInvested: Math.round(totalInvested),
    totalReturns: Math.round(totalReturns)
  };
};

/**
 * Generates year-wise breakdown for SIP
 */
export const getSIPBreakdown = (monthlyInvestment, annualRate, years) => {
  const breakdown = [];
  const i = annualRate / 100 / 12;
  
  for (let year = 1; year <= years; year++) {
    const n = year * 12;
    const totalValue = monthlyInvestment * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
    const totalInvested = monthlyInvestment * n;
    
    breakdown.push({
      year,
      invested: Math.round(totalInvested),
      value: Math.round(totalValue),
      returns: Math.round(totalValue - totalInvested)
    });
  }
  
  return breakdown;
};
