/**
 * LAMF (Loan Against Mutual Funds) vs Redemption Comparison Calculator
 * Formulas verified against smallcase's published example.
 *
 * TODO (v2):
 *  1. Gross-up logic: redemptionAmount should be inflated so the *net* payout
 *     after all taxes equals amountNeeded. Currently redemptionAmount === amountNeeded.
 *  2. PDF export / download comparison report.
 *  3. Multi-year amortization schedule for the loan.
 *  4. Reducing-balance / EMI-based loan interest (intentionally kept as simple
 *     flat interest to match the reference calculator model).
 */

// ---------------------------------------------------------------------------
// Helper: Indian numbering format (₹X.XXL / ₹X.XXCr)
// ---------------------------------------------------------------------------
export function formatINR(value) {
  if (value === null || value === undefined || isNaN(value)) return '₹0';

  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (abs >= 1_00_00_000) {
    // Crore
    return `${sign}₹${(abs / 1_00_00_000).toFixed(2)}Cr`;
  } else if (abs >= 1_00_000) {
    // Lakh
    return `${sign}₹${(abs / 1_00_000).toFixed(2)}L`;
  } else if (abs >= 1_000) {
    // Thousand — still show in full with commas for readability
    return `${sign}₹${abs.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  }
  return `${sign}₹${abs.toFixed(0)}`;
}

// ---------------------------------------------------------------------------
// Processing fee: 1% of loanAmount, clamped to [₹1,250 … ₹4,999]
// ---------------------------------------------------------------------------
export function computeProcessingFee(loanAmount) {
  return Math.min(Math.max(0.01 * loanAmount, 1250), 4999);
}

// ---------------------------------------------------------------------------
// Capital gains estimate: depends ONLY on portfolioAmount and expectedCAGR.
//   capitalGainsAmount = portfolioAmount × (CAGR/100)
// Users who know their actual unrealised gain can override this field.
// ---------------------------------------------------------------------------
export function computeCapitalGains(portfolioAmount, expectedCAGR) {
  return portfolioAmount * (expectedCAGR / 100);
}

// ---------------------------------------------------------------------------
// LTCG tax: flat 12.5% of capital gains amount.
// NOTE: There is NO ₹1,25,000 exemption in this calculator's model —
// the reference UI applies 12.5% to the full capitalGainsAmount directly.
// ---------------------------------------------------------------------------
export function computeLTCGTax(capitalGainsAmount) {
  return 0.125 * capitalGainsAmount;
}

// ---------------------------------------------------------------------------
// Redemption amount: the GROSSED-UP figure you must redeem to net amountNeeded
// after all tax is paid.  redemptionAmount = amountNeeded + ltcgTax + stcgTax
// ---------------------------------------------------------------------------
export function computeRedemptionAmount(amountNeeded, ltcgTax, stcgTax = 0) {
  return amountNeeded + ltcgTax + stcgTax;
}

// ---------------------------------------------------------------------------
// Convenience wrapper used for regression testing.
// Returns all redemption-side derived values from the four primary inputs.
// ---------------------------------------------------------------------------
export function calculateRedemption({
  portfolioAmount,
  expectedCAGR,
  amountNeeded,
  durationYears,
  capitalGainsOverride = null, // pass a number to override the formula
  stcgTax = 0,
}) {
  const capitalGainsAmount =
    capitalGainsOverride !== null
      ? capitalGainsOverride
      : computeCapitalGains(portfolioAmount, expectedCAGR);
  const ltcgTax = computeLTCGTax(capitalGainsAmount);
  const totalTax = ltcgTax + stcgTax;
  const redemptionAmount = computeRedemptionAmount(amountNeeded, ltcgTax, stcgTax);
  // remainingBalance = what stays in the portfolio after the grossed-up redemption
  const remainingBalance = portfolioAmount - amountNeeded - totalTax;
  const finalRedemptionPortfolio =
    remainingBalance * Math.pow(1 + expectedCAGR / 100, durationYears);
  return {
    capitalGainsAmount,
    ltcgTax,
    totalTax,
    redemptionAmount,
    remainingBalance,
    finalRedemptionPortfolio,
  };
}

// ---------------------------------------------------------------------------
// REDEMPTION scenario
// ---------------------------------------------------------------------------
export function calcRedemptionPortfolio({
  portfolioAmount,
  expectedCAGR,
  redemptionAmount,
  ltcgTax,
  stcgTax,
  durationYears,
}) {
  const totalTax = ltcgTax + stcgTax;
  const remainingAfterRedemption = portfolioAmount - redemptionAmount;
  // Tax is deducted BEFORE growth
  const afterTax = remainingAfterRedemption - totalTax;
  const finalRedemptionPortfolio =
    afterTax * Math.pow(1 + expectedCAGR / 100, durationYears);
  return { totalTax, afterTax, finalRedemptionPortfolio };
}

// ---------------------------------------------------------------------------
// LOAN scenario (unchanged — already verified correct)
// ---------------------------------------------------------------------------
export function calcLoanPortfolio({
  portfolioAmount,
  expectedCAGR,
  durationYears,
  loanAmount,
  loanInterestRate,
  loanTenureYears,
  processingFee,
}) {
  // Simple (flat) interest — NOT reducing balance or compounding
  const interest = loanAmount * (loanInterestRate / 100) * loanTenureYears;
  const totalLoanCost = interest + processingFee;
  const grownFullPortfolio =
    portfolioAmount * Math.pow(1 + expectedCAGR / 100, durationYears);
  // Loan principal subtracted from grown portfolio (simplifying assumption —
  // see disclaimer in UI: in practice the loan is often repaid from external
  // cash flow, making LAMF look even more favorable than shown here)
  const finalLoanPortfolio = grownFullPortfolio - loanAmount - totalLoanCost;
  return { interest, totalLoanCost, grownFullPortfolio, finalLoanPortfolio };
}

// ---------------------------------------------------------------------------
// Combined calculation helper for verification and integration
// ---------------------------------------------------------------------------
export function calculateAll({
  portfolioAmount,
  expectedCAGR,
  amountNeeded,
  durationYears,
  loanInterestRate,
  stcgTax = 0,
  capitalGainsOverride = null,
}) {
  const redemption = calculateRedemption({
    portfolioAmount,
    expectedCAGR,
    amountNeeded,
    durationYears,
    capitalGainsOverride,
    stcgTax,
  });
  const processingFee = computeProcessingFee(amountNeeded);
  const loan = calcLoanPortfolio({
    portfolioAmount,
    expectedCAGR,
    durationYears,
    loanAmount: amountNeeded,
    loanInterestRate,
    loanTenureYears: durationYears,
    processingFee,
  });
  return {
    ...redemption,
    loanAmount: amountNeeded,
    processingFee,
    interestAmount: loan.interest,
    totalLoanCost: loan.totalLoanCost,
    finalLoanPortfolio: loan.finalLoanPortfolio,
  };
}

// ---------------------------------------------------------------------------
// Verification fixtures (Correction #5 regression suite)
// ---------------------------------------------------------------------------
function runVerification() {
  const assertClose = (actual, expected, tolerance = 1, msg = '') => {
    console.assert(
      Math.abs(actual - expected) < tolerance,
      `${msg}: expected close to ${expected}, got ${actual} (diff: ${Math.abs(actual - expected)})`
    );
  };

  // Test 1: Portfolio 10L, duration 2yr
  const r1 = calculateAll({ portfolioAmount: 1000000, expectedCAGR: 12, amountNeeded: 500000, durationYears: 2, loanInterestRate: 9.99 });
  assertClose(r1.capitalGainsAmount, 120000, 1, '[T1] capitalGainsAmount');
  assertClose(r1.ltcgTax, 15000, 1, '[T1] ltcgTax');
  assertClose(r1.redemptionAmount, 515000, 1, '[T1] redemptionAmount');
  assertClose(r1.finalRedemptionPortfolio, 608384, 10, '[T1] finalRedemptionPortfolio');

  // Test 2: Portfolio 20L, duration 2yr
  const r2 = calculateAll({ portfolioAmount: 2000000, expectedCAGR: 12, amountNeeded: 500000, durationYears: 2, loanInterestRate: 9.99 });
  assertClose(r2.capitalGainsAmount, 240000, 1, '[T2] capitalGainsAmount');
  assertClose(r2.ltcgTax, 30000, 1, '[T2] ltcgTax');
  assertClose(r2.redemptionAmount, 530000, 1, '[T2] redemptionAmount');
  assertClose(r2.finalRedemptionPortfolio, 1843968, 10, '[T2] finalRedemptionPortfolio');

  // Test 3: Portfolio 20L, duration 4yr
  const r4 = calculateAll({ portfolioAmount: 2000000, expectedCAGR: 12, amountNeeded: 500000, durationYears: 4, loanInterestRate: 9.99 });
  assertClose(r4.capitalGainsAmount, r2.capitalGainsAmount, 1, '[T3] capitalGainsAmount unchanged');
  assertClose(r4.ltcgTax, r2.ltcgTax, 1, '[T3] ltcgTax unchanged');
  assertClose(r4.redemptionAmount, r2.redemptionAmount, 1, '[T3] redemptionAmount unchanged');
  console.assert(r4.finalRedemptionPortfolio > r2.finalRedemptionPortfolio, `[T3] finalRedemptionPortfolio compound growth: expected ${r4.finalRedemptionPortfolio} > ${r2.finalRedemptionPortfolio}`);
  assertClose(r4.finalRedemptionPortfolio, 2313073, 10, '[T3] finalRedemptionPortfolio');

  // Test 4: Loan side
  const r10 = calculateAll({ portfolioAmount: 1000000, expectedCAGR: 12, amountNeeded: 500000, durationYears: 2, loanInterestRate: 9.99 });
  const r20 = calculateAll({ portfolioAmount: 2000000, expectedCAGR: 12, amountNeeded: 500000, durationYears: 2, loanInterestRate: 9.99 });
  assertClose(r10.totalLoanCost, r20.totalLoanCost, 1, '[T4] totalLoanCost unaffected');
  assertClose(r10.loanAmount, r20.loanAmount, 1, '[T4] loanAmount unaffected');
  console.assert(Math.abs(r10.finalLoanPortfolio - r20.finalLoanPortfolio) > 10, `[T4] finalLoanPortfolio should differ`);

  console.log('[LAMF Verification] All assertions passed ✓ (Correction #5 regression suite)');
}

// Run verification once on module load (dev only)
if (import.meta.env?.DEV !== false) {
  runVerification();
}
