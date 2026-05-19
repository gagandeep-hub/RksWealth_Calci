/**
 * Car Planning Formula
 * 
 * @param {number} currentCost - Current estimated cost of the car
 * @param {number} years - Years until planning to buy the car
 * @param {number} returnRate - Expected return rate on investments in %
 * @param {number} inflationRate - Expected inflation rate for cars in %
 * @returns {object} { futureCost, lumpsumRequired, sipRequired }
 */
export const calculateCarPlanning = (currentCost, years, returnRate, inflationRate) => {
  if (years <= 0 || currentCost <= 0) {
    return {
      futureCost: currentCost > 0 ? currentCost : 0,
      lumpsumRequired: currentCost > 0 ? currentCost : 0,
      sipRequired: 0
    };
  }

  // Future value of current cost adjusted for inflation
  const futureCost = currentCost * Math.pow(1 + inflationRate / 100, years);

  // Lumpsum required to reach future cost
  const lumpsumRequired = futureCost / Math.pow(1 + returnRate / 100, years);

  // SIP required to reach future cost
  const r = returnRate / 100 / 12;
  const n = years * 12;
  const sipRequired = futureCost / (((Math.pow(1 + r, n) - 1) / r) * (1 + r));

  return {
    futureCost: Math.round(futureCost),
    lumpsumRequired: Math.round(lumpsumRequired),
    sipRequired: Math.round(sipRequired)
  };
};

/**
 * Generates year-wise breakdown for Car Planning
 */
export const getCarPlanningBreakdown = (currentCost, years, returnRate, inflationRate) => {
  if (years <= 0 || currentCost <= 0) return [];

  const breakdown = [];
  const { sipRequired } = calculateCarPlanning(currentCost, years, returnRate, inflationRate);
  
  const r = returnRate / 100 / 12;
  const inf = inflationRate / 100;
  
  for (let year = 1; year <= years; year++) {
    const n = year * 12;
    // Corpus built by SIP
    const corpusBuilt = sipRequired * (((Math.pow(1 + r, n) - 1) / r) * (1 + r));
    const totalInvested = sipRequired * n;
    
    // Projected cost adjusted for inflation up to this year
    const projectedCost = currentCost * Math.pow(1 + inf, year);
    
    breakdown.push({
      year,
      currentCost: Math.round(currentCost),
      invested: Math.round(totalInvested),
      returns: Math.round(corpusBuilt - totalInvested),
      value: Math.round(corpusBuilt),
      projectedCost: Math.round(projectedCost)
    });
  }
  
  return breakdown;
};
