export const calculateSWP = (investment, withdrawal, rate, years) => {
  const months = years * 12;
  const monthlyRate = rate / 12 / 100;
  
  let balance = investment;
  let totalWithdrawn = 0;
  
  for (let i = 1; i <= months; i++) {
    if (balance >= withdrawal) {
      balance -= withdrawal;
      totalWithdrawn += withdrawal;
    } else {
      break;
    }

    let interest = balance * monthlyRate;
    balance += interest;
  }

  return {
    totalInvestment: Math.round(investment),
    totalWithdrawal: Math.round(totalWithdrawn),
    totalGrowth: Math.round(balance + totalWithdrawn - investment),
    currentValue: Math.round(balance)
  };
};

export const getSwpBreakdown = (investment, withdrawal, rate, years) => {
  const months = years * 12;
  const monthlyRate = rate / 12 / 100;
  
  let balance = investment;
  let totalWithdrawn = 0;
  const breakdown = [];
  
  for (let i = 1; i <= months; i++) {
    if (balance >= withdrawal) {
      balance -= withdrawal;
      totalWithdrawn += withdrawal;
    } else {
      break;
    }

    let interest = balance * monthlyRate;
    balance += interest;

    if (i % 12 === 0) {
      breakdown.push({
        year: i / 12,
        invested: investment,
        withdrawn: Math.round(totalWithdrawn),
        value: Math.round(balance),
        returns: Math.round(balance + totalWithdrawn - investment)
      });
    }
  }

  return breakdown;
};
