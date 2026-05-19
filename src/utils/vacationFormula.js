/**
 * Vacation Planning Formula
 * 
 * @param {number} currentExpense - Current estimated cost of the vacation
 * @param {number} years - Years until planning to take the vacation
 * @param {number} returnRate - Expected return rate on investments in %
 * @param {number} inflationRate - Expected inflation rate in %
 * @returns {object} { futureExpense, lumpsumRequired, sipRequired }
 */
export const calculateVacationPlanning = (currentExpense, years, returnRate, inflationRate) => {
  if (years <= 0 || currentExpense <= 0) {
    return {
      futureExpense: currentExpense > 0 ? currentExpense : 0,
      lumpsumRequired: currentExpense > 0 ? currentExpense : 0,
      sipRequired: 0
    };
  }

  // Future value of current expense adjusted for inflation
  const futureExpense = currentExpense * Math.pow(1 + inflationRate / 100, years);

  // Lumpsum required to reach future expense
  const lumpsumRequired = futureExpense / Math.pow(1 + returnRate / 100, years);

  // SIP required to reach future expense
  const r = returnRate / 100 / 12;
  const n = years * 12;
  const sipRequired = futureExpense / (((Math.pow(1 + r, n) - 1) / r) * (1 + r));

  return {
    futureExpense: Math.round(futureExpense),
    lumpsumRequired: Math.round(lumpsumRequired),
    sipRequired: Math.round(sipRequired)
  };
};

/**
 * Generates year-wise breakdown for Vacation Planning
 */
export const getVacationPlanningBreakdown = (currentExpense, years, returnRate, inflationRate) => {
  if (years <= 0 || currentExpense <= 0) return [];

  const breakdown = [];
  const { sipRequired } = calculateVacationPlanning(currentExpense, years, returnRate, inflationRate);
  
  const r = returnRate / 100 / 12;
  const inf = inflationRate / 100;
  
  for (let year = 1; year <= years; year++) {
    const n = year * 12;
    // Corpus built by SIP
    const corpusBuilt = sipRequired * (((Math.pow(1 + r, n) - 1) / r) * (1 + r));
    const totalInvested = sipRequired * n;
    
    // Projected expense adjusted for inflation up to this year
    const projectedExpense = currentExpense * Math.pow(1 + inf, year);
    
    breakdown.push({
      year,
      currentCost: Math.round(currentExpense),
      invested: Math.round(totalInvested),
      returns: Math.round(corpusBuilt - totalInvested),
      value: Math.round(corpusBuilt),
      projectedCost: Math.round(projectedExpense)
    });
  }
  
  return breakdown;
};
