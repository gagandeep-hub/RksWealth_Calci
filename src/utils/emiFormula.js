/**
 * EMI Formula
 * E = P * r * (1 + r)^n / ((1 + r)^n - 1)
 * 
 * @param {number} principal - Loan amount
 * @param {number} annualRate - Annual interest rate in %
 * @param {number} years - Tenure in years
 * @returns {object} { emi, totalInterest, totalPayment }
 */
export const calculateEMI = (principal, annualRate, years) => {
  if (principal <= 0 || annualRate <= 0 || years <= 0) {
    return { emi: 0, totalInterest: 0, totalPayment: 0 };
  }
  const r = annualRate / 12 / 100; // Monthly interest rate
  const n = years * 12; // Total months

  const emi = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const totalPayment = emi * n;
  const totalInterest = totalPayment - principal;

  return {
    emi: Math.round(emi),
    totalInterest: Math.round(totalInterest),
    totalPayment: Math.round(totalPayment)
  };
};

/**
 * Generates year-wise breakdown for EMI
 */
export const getEMIBreakdown = (principal, annualRate, years) => {
  if (principal <= 0 || annualRate <= 0 || years <= 0) return [];
  
  const breakdown = [];
  const r = annualRate / 12 / 100;
  const n = years * 12;
  const emi = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  
  let balance = principal;
  let totalInterestPaid = 0;
  let totalPrincipalPaid = 0;
  
  for (let year = 1; year <= years; year++) {
    let interestForYear = 0;
    let principalForYear = 0;
    
    for (let month = 1; month <= 12; month++) {
      const interest = balance * r;
      const principalPaid = emi - interest;
      interestForYear += interest;
      principalForYear += principalPaid;
      balance -= principalPaid;
    }
    
    totalInterestPaid += interestForYear;
    totalPrincipalPaid += principalForYear;
    
    breakdown.push({
      year,
      principalPaid: Math.round(totalPrincipalPaid),
      interestPaid: Math.round(totalInterestPaid),
      balance: Math.max(0, Math.round(balance))
    });
  }
  
  return breakdown;
};
