/**
 * Retirement Calculator Formula
 *
 * Step 1: Adjust current monthly expenses for inflation at retirement age.
 * Step 2: Calculate the total corpus needed at retirement to sustain that
 *         inflation-adjusted expense for the remaining life (post-retirement years),
 *         assuming post-retirement returns partially offset inflation drawdown.
 * Step 3: Calculate the monthly SIP needed to build that corpus
 *         during the pre-retirement years.
 */
export const calculateRetirement = ({
  currentAge,
  retirementAge,
  lifeExpectancy,
  currentMonthlyExpenses,
  inflationRate,
  preRetirementReturn,
  postRetirementReturn,
}) => {
  const yearsToRetirement = retirementAge - currentAge;
  const postRetirementYears = lifeExpectancy - retirementAge;

  const preReturnMonthly = preRetirementReturn / 12 / 100;
  const postReturnMonthly = postRetirementReturn / 12 / 100;
  const inflationMonthly = inflationRate / 12 / 100;

  // Step 1: Future Monthly Expenses (annual compounding for inflation)
  const monthlyExpensesAtRetirement =
    currentMonthlyExpenses * Math.pow(1 + inflationRate / 100, yearsToRetirement);

  // Step 2: Required Corpus At Retirement (annuity due using real post-retirement return rate)
  const realPostReturnMonthly =
    (1 + postReturnMonthly) / (1 + inflationMonthly) - 1;
  const n = postRetirementYears * 12;

  let corpusNeeded;
  if (Math.abs(realPostReturnMonthly) < 1e-9) {
    corpusNeeded = monthlyExpensesAtRetirement * n;
  } else {
    corpusNeeded =
      monthlyExpensesAtRetirement *
      ((1 - Math.pow(1 + realPostReturnMonthly, -n)) / realPostReturnMonthly) *
      (1 + realPostReturnMonthly);
  }

  // Step 3: Planning Through SIP (beginning of month annuity due)
  const sipMonths = yearsToRetirement * 12;
  let monthlySIP;
  if (preReturnMonthly === 0) {
    monthlySIP = corpusNeeded / sipMonths;
  } else {
    monthlySIP =
      (corpusNeeded * preReturnMonthly) /
      ((Math.pow(1 + preReturnMonthly, sipMonths) - 1) * (1 + preReturnMonthly));
  }

  // Step 4: Planning Through Lump Sum (annual compounding)
  const lumpsum = corpusNeeded / Math.pow(1 + preRetirementReturn / 100, yearsToRetirement);

  const totalInvested = monthlySIP * sipMonths;
  const wealthGained = corpusNeeded - totalInvested;

  return {
    monthlyExpensesAtRetirement: Math.round(monthlyExpensesAtRetirement),
    corpusNeeded: Math.round(corpusNeeded),
    lumpsum: Math.round(lumpsum),
    monthlySIP: Math.round(monthlySIP),
    totalInvested: Math.round(totalInvested),
    wealthGained: Math.round(wealthGained),
    yearsToRetirement,
    postRetirementYears,
  };
};

export const getRetirementBreakdown = (params) => {
  const { currentAge, retirementAge, preRetirementReturn } = params;
  const { monthlySIP } = calculateRetirement(params);

  const yearsToRetirement = retirementAge - currentAge;
  const preReturnMonthly = preRetirementReturn / 12 / 100;

  const breakdown = [];
  let balance = 0;
  let totalInvested = 0;

  for (let y = 1; y <= yearsToRetirement; y++) {
    for (let m = 1; m <= 12; m++) {
      balance += monthlySIP;
      balance *= (1 + preReturnMonthly);
      totalInvested += monthlySIP;
    }
    breakdown.push({
      year: currentAge + y,
      invested: Math.round(totalInvested),
      returns: Math.round(balance - totalInvested),
      value: Math.round(balance),
    });
  }

  return breakdown;
};
