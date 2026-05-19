export const calculateLifeInsurance = ({
  loanAmount,
  fdRate,
  inflationRate,
  protectionDurationYears,
  monthlyExpenses,
}) => {
  const months = protectionDurationYears * 12;

  // Annual return and inflation
  const rAnnual = fdRate / 100;
  const iAnnual = inflationRate / 100;

  // Effective real rate (annual)
  let realAnnualRate = (1 + rAnnual) / (1 + iAnnual) - 1;

  // Real monthly rate
  const realMonthlyRate = Math.pow(1 + realAnnualRate, 1 / 12) - 1;

  let householdExpenses = 0;

  // Present Value of growing annuity (expenses grow with inflation, corpus grows with FD rate)
  if (Math.abs(realMonthlyRate) < 0.00001) {
    // If real rate is effectively 0, corpus needed is just total nominal expenses
    householdExpenses = monthlyExpenses * months;
  } else {
    // Annuity formula for present value
    householdExpenses =
      monthlyExpenses *
      ((1 - Math.pow(1 + realMonthlyRate, -months)) / realMonthlyRate) *
      (1 + realMonthlyRate);
  }

  const loanRepayment = loanAmount;
  const totalCover = loanRepayment + householdExpenses;

  return {
    loanRepayment: Math.round(loanRepayment),
    householdExpenses: Math.round(householdExpenses),
    totalCover: Math.round(totalCover),
  };
};

export const getLifeInsuranceBreakdown = ({
  fdRate,
  inflationRate,
  protectionDurationYears,
  monthlyExpenses,
  householdExpensesFund,
}) => {
  const breakdown = [];
  let currentCorpus = householdExpensesFund;
  let currentMonthlyExpense = monthlyExpenses;

  const rMonthly = fdRate / 100 / 12;
  const iAnnual = inflationRate / 100;

  for (let year = 1; year <= protectionDurationYears; year++) {
    let yearWithdrawal = 0;

    for (let month = 1; month <= 12; month++) {
      // Withdraw at start of month
      currentCorpus -= currentMonthlyExpense;
      yearWithdrawal += currentMonthlyExpense;
      // Grow remaining corpus
      if (currentCorpus > 0) {
        currentCorpus += currentCorpus * rMonthly;
      } else {
        currentCorpus = 0;
      }
    }

    breakdown.push({
      year,
      remainingCorpus: Math.max(0, Math.round(currentCorpus)),
      annualWithdrawal: Math.round(yearWithdrawal),
    });

    // Inflate expenses for next year
    currentMonthlyExpense = currentMonthlyExpense * (1 + iAnnual);
  }

  return breakdown;
};
