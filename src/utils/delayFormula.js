export const calculateDelayPlanning = ({
  monthlySIP,
  timePeriodYears,
  expectedReturn,
  delayMonths,
}) => {
  const r = expectedReturn / 12 / 100;
  const nWithoutDelay = timePeriodYears * 12;
  const nWithDelay = nWithoutDelay - delayMonths;

  let fvWithoutDelay = 0;
  let fvWithDelay = 0;

  if (r === 0) {
    fvWithoutDelay = monthlySIP * nWithoutDelay;
    fvWithDelay = monthlySIP * Math.max(0, nWithDelay);
  } else {
    fvWithoutDelay =
      monthlySIP * ((Math.pow(1 + r, nWithoutDelay) - 1) / r) * (1 + r);
    
    if (nWithDelay > 0) {
      fvWithDelay =
        monthlySIP * ((Math.pow(1 + r, nWithDelay) - 1) / r) * (1 + r);
    } else {
      fvWithDelay = 0;
    }
  }

  const costOfDelay = fvWithoutDelay - fvWithDelay;
  const totalInvestedWithoutDelay = monthlySIP * nWithoutDelay;
  const totalInvestedWithDelay = monthlySIP * Math.max(0, nWithDelay);

  return {
    fvWithoutDelay: Math.round(fvWithoutDelay),
    fvWithDelay: Math.round(fvWithDelay),
    costOfDelay: Math.round(costOfDelay),
    totalInvestedWithoutDelay: Math.round(totalInvestedWithoutDelay),
    totalInvestedWithDelay: Math.round(totalInvestedWithDelay),
  };
};

export const getDelayBreakdown = (params) => {
  const { monthlySIP, timePeriodYears, expectedReturn, delayMonths } = params;
  const r = expectedReturn / 12 / 100;
  const breakdown = [];

  let balanceWithoutDelay = 0;
  let investedWithoutDelay = 0;
  
  let balanceWithDelay = 0;
  let investedWithDelay = 0;

  for (let y = 1; y <= timePeriodYears; y++) {
    for (let m = 1; m <= 12; m++) {
      const currentMonth = (y - 1) * 12 + m;
      
      // Without delay
      balanceWithoutDelay += monthlySIP;
      balanceWithoutDelay *= (1 + r);
      investedWithoutDelay += monthlySIP;
      
      // With delay
      if (currentMonth > delayMonths) {
        balanceWithDelay += monthlySIP;
        balanceWithDelay *= (1 + r);
        investedWithDelay += monthlySIP;
      } else {
        balanceWithDelay *= (1 + r); // Just compounding any existing balance, though it's 0 initially
      }
    }
    
    breakdown.push({
      year: y,
      investedWithoutDelay: Math.round(investedWithoutDelay),
      valueWithoutDelay: Math.round(balanceWithoutDelay),
      investedWithDelay: Math.round(investedWithDelay),
      valueWithDelay: Math.round(balanceWithDelay),
      costOfDelay: Math.round(balanceWithoutDelay - balanceWithDelay)
    });
  }

  return breakdown;
};
