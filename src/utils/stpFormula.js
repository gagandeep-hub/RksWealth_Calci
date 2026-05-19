export const calculateSTP = (sourceInvestment, transferAmount, sourceRate, destRate, years) => {
  const months = years * 12;
  const sourceMonthlyRate = sourceRate / 12 / 100;
  const destMonthlyRate = destRate / 12 / 100;

  let sourceBalance = sourceInvestment;
  let destBalance = 0;
  let totalInvested = sourceInvestment;
  let totalTransferred = 0;

  for (let i = 1; i <= months; i++) {
    let currentTransfer = Math.min(transferAmount, sourceBalance);
    sourceBalance -= currentTransfer;
    destBalance += currentTransfer;
    totalTransferred += currentTransfer;
    
    sourceBalance += sourceBalance * sourceMonthlyRate;
    destBalance += destBalance * destMonthlyRate;
  }

  const totalValue = sourceBalance + destBalance;
  const estReturns = totalValue - totalInvested;

  return {
    totalInvested: Math.round(totalInvested),
    totalReturns: Math.round(estReturns),
    totalValue: Math.round(totalValue),
    finalSourceBalance: Math.round(sourceBalance),
    finalDestBalance: Math.round(destBalance),
    totalTransferred: Math.round(totalTransferred)
  };
};

export const getStpBreakdown = (sourceInvestment, transferAmount, sourceRate, destRate, years) => {
  const months = years * 12;
  const sourceMonthlyRate = sourceRate / 12 / 100;
  const destMonthlyRate = destRate / 12 / 100;

  let sourceBalance = sourceInvestment;
  let destBalance = 0;
  const breakdown = [];

  for (let i = 1; i <= months; i++) {
    let currentTransfer = Math.min(transferAmount, sourceBalance);
    sourceBalance -= currentTransfer;
    destBalance += currentTransfer;
    
    sourceBalance += sourceBalance * sourceMonthlyRate;
    destBalance += destBalance * destMonthlyRate;

    if (i % 12 === 0) {
      breakdown.push({
        year: i / 12,
        invested: sourceInvestment,
        returns: Math.round(sourceBalance + destBalance) - sourceInvestment,
        value: Math.round(sourceBalance + destBalance),
        sourceBalance: Math.round(sourceBalance),
        destBalance: Math.round(destBalance)
      });
    }
  }

  return breakdown;
};
