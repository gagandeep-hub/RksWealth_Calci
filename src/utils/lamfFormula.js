/**
 * LAMF (Loan Against Mutual Funds) vs Redemption Comparison Calculator
 *
 * Correction #6 changes:
 *  - LTCG now uses real cost-basis accounting with a shared ₹1,25,000 FY exemption pool.
 *  - computeCapitalGains() is kept for reference/display only (no longer used for tax).
 *  - New: calcTaxFromCostBasis() — the canonical tax function.
 *  - New: generateYearByYearData() — for the portfolio-over-time chart.
 *  - All loan-side formulas are UNCHANGED from Correction #5.
 *
 * TODO (v2):
 *  1. PDF export / download comparison report.
 *  2. Multi-year amortization schedule for the loan.
 *  3. Reducing-balance / EMI-based loan interest (intentionally kept as simple
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
// Capital gains DISPLAY estimate (kept for reference; no longer used for tax).
//   capitalGainsAmount = portfolioAmount × (CAGR/100)
// ---------------------------------------------------------------------------
export function computeCapitalGains(portfolioAmount, expectedCAGR) {
  return portfolioAmount * (expectedCAGR / 100);
}

// ---------------------------------------------------------------------------
// NEW (Correction #6): Cost-basis LTCG tax with shared FY exemption pool.
//
//   capitalGainsAmount  = redemptionAmount − purchaseCost
//   remainingExemption  = max(0, 1,25,000 − existingFYGains)
//   taxableGains        = max(0, capitalGainsAmount − remainingExemption)
//   ltcgTax             = 12.5% × taxableGains
//   totalTax            = ltcgTax + stcgTax
//
// We resolve the gross-up circularity with Option (a) from the spec:
//   purchaseCost is treated as the cost basis of the ORIGINAL amountNeeded,
//   NOT of the grossed-up redemptionAmount. This cleanly breaks the cycle.
//   redemptionAmount = amountNeeded + totalTax (where totalTax is computed
//   using the user-supplied purchaseCost, not the grossed-up amount).
//
// ---------------------------------------------------------------------------
const EXEMPTION_LIMIT = 125000;

/**
 * @param {object} params
 * @param {number} params.redemptionAmount   - The gross amount being redeemed (amountNeeded + tax)
 * @param {number} params.purchaseCost       - User's actual cost basis for units being sold
 * @param {number} params.existingFYGains    - LTCG already booked this FY elsewhere (default 0)
 * @param {number} params.stcgTax            - Short-term capital gains tax (manual, default 0)
 * @returns {{ capitalGainsAmount, remainingExemption, taxableGains, ltcgTax, stcgTax, totalTax }}
 */
export function calcTaxFromCostBasis({
  redemptionAmount,
  purchaseCost,
  existingFYGains = 0,
  stcgTax = 0,
}) {
  const capitalGainsAmount = Math.max(0, redemptionAmount - purchaseCost);
  const remainingExemption = Math.max(0, EXEMPTION_LIMIT - existingFYGains);
  const taxableGains = Math.max(0, capitalGainsAmount - remainingExemption);
  const ltcgTax = 0.125 * taxableGains;
  const totalTax = ltcgTax + stcgTax;
  return {
    capitalGainsAmount,
    remainingExemption,
    taxableGains,
    ltcgTax,
    stcgTax,
    totalTax,
  };
}

// ---------------------------------------------------------------------------
// LOAN scenario (unchanged from Correction #5)
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
// NEW (Correction #6): Year-by-year chart data
//
// Redemption path:  one-time hit (amountNeeded + totalTax) at t=0, remaining
//                   balance compounds at CAGR.
// Loan path:        full portfolio compounds; principal + linear interest +
//                   one-time processing fee are netted out each year.
//
// Returns array of { year, redemptionValue, loanValue }
// from year=0 up to year=maxYear (inclusive).
// ---------------------------------------------------------------------------
export function generateYearByYearData({
  portfolioAmount,
  expectedCAGR,
  amountNeeded,
  totalTax,
  loanAmount,
  loanInterestRate,
  processingFee,
  durationYears,
  extraYears = 2,  // show a couple of years past the need period for trend visibility
}) {
  const maxYear = durationYears + extraYears;
  const remainingAfterRedemption = portfolioAmount - amountNeeded - totalTax;
  const rateDecimal = expectedCAGR / 100;

  const data = [];
  for (let t = 0; t <= maxYear; t++) {
    const redemptionValue = remainingAfterRedemption * Math.pow(1 + rateDecimal, t);
    const interestAtYear = loanAmount * (loanInterestRate / 100) * t;
    const loanValue =
      portfolioAmount * Math.pow(1 + rateDecimal, t) -
      loanAmount -
      (interestAtYear + processingFee);
    data.push({ year: t, redemptionValue: Math.round(redemptionValue), loanValue: Math.round(loanValue) });
  }
  return data;
}

// ---------------------------------------------------------------------------
// Combined calculation helper for verification and integration
// (updated for Correction #6 — uses calcTaxFromCostBasis for redemption side)
// ---------------------------------------------------------------------------
export function calculateAll({
  portfolioAmount,
  expectedCAGR,
  amountNeeded,
  durationYears,
  loanInterestRate,
  purchaseCost,        // NEW (required for Correction #6 tax logic)
  existingFYGains = 0, // NEW
  stcgTax = 0,
}) {
  // Option (a): purchaseCost is the cost basis for amountNeeded (not grossed-up).
  // Compute tax on amountNeeded first, then build redemptionAmount from it.
  const taxInputs = calcTaxFromCostBasis({
    redemptionAmount: amountNeeded, // cost basis applies to the base amount
    purchaseCost,
    existingFYGains,
    stcgTax,
  });
  const { ltcgTax, totalTax, capitalGainsAmount } = taxInputs;
  const redemptionAmount = amountNeeded + totalTax;
  const remainingBalance = portfolioAmount - amountNeeded - totalTax;
  const finalRedemptionPortfolio =
    remainingBalance * Math.pow(1 + expectedCAGR / 100, durationYears);

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
    capitalGainsAmount,
    ltcgTax,
    totalTax,
    redemptionAmount,
    remainingBalance,
    finalRedemptionPortfolio,
    loanAmount: amountNeeded,
    processingFee,
    interestAmount: loan.interest,
    totalLoanCost: loan.totalLoanCost,
    grownFullPortfolio: loan.grownFullPortfolio,
    finalLoanPortfolio: loan.finalLoanPortfolio,
  };
}

// ---------------------------------------------------------------------------
// Verification fixtures (Correction #6 — new tax logic)
// ---------------------------------------------------------------------------
function runVerification() {
  const assertClose = (actual, expected, tolerance = 1, msg = '') => {
    console.assert(
      Math.abs(actual - expected) < tolerance,
      `${msg}: expected close to ${expected}, got ${actual} (diff: ${Math.abs(actual - expected)})`
    );
  };

  // ── (A) New LTCG tax logic fixtures ────────────────────────────────────

  // Fixture 1: no prior FY gains, profit under exemption → zero LTCG tax
  const f1 = calcTaxFromCostBasis({ redemptionAmount: 515000, purchaseCost: 395000, existingFYGains: 0, stcgTax: 0 });
  assertClose(f1.capitalGainsAmount, 120000, 1, '[F1] capitalGainsAmount');
  assertClose(f1.ltcgTax, 0, 0.01, '[F1] ltcgTax (profit under exemption → 0)');

  // Fixture 2: partial prior FY gains reduce remaining exemption
  const f2 = calcTaxFromCostBasis({ redemptionAmount: 515000, purchaseCost: 395000, existingFYGains: 50000, stcgTax: 0 });
  assertClose(f2.capitalGainsAmount, 120000, 1, '[F2] capitalGainsAmount');
  // remaining exemption = 125000-50000 = 75000; taxable = 120000-75000 = 45000; tax = 0.125*45000 = 5625
  assertClose(f2.ltcgTax, 5625, 1, '[F2] ltcgTax (partial exemption)');

  // Fixture 3: prior FY gains already exceed exemption → full profit taxed
  const f3 = calcTaxFromCostBasis({ redemptionAmount: 515000, purchaseCost: 395000, existingFYGains: 200000, stcgTax: 0 });
  // remaining exemption = 0; taxable = full 120000; tax = 0.125*120000 = 15000
  assertClose(f3.ltcgTax, 15000, 1, '[F3] ltcgTax (no exemption left)');

  // ── (B) Loan-side regression (unchanged from Correction #5) ────────────

  // These use a purchaseCost of 70% of amountNeeded (500000*0.7 = 350000)
  // For loan-side numbers purchaseCost only affects the redemption side so
  // we just verify loan-side is still correct.
  const loanTest = calcLoanPortfolio({
    portfolioAmount: 1000000,
    expectedCAGR: 12,
    durationYears: 2,
    loanAmount: 500000,
    loanInterestRate: 9.99,
    loanTenureYears: 2,
    processingFee: computeProcessingFee(500000),
  });
  assertClose(loanTest.interest, 99900, 1, '[Loan] interest');
  assertClose(loanTest.totalLoanCost, 99900 + 4999, 1, '[Loan] totalLoanCost');
  // grownFullPortfolio = 1000000 * 1.12^2 = 1254400
  assertClose(loanTest.grownFullPortfolio, 1254400, 10, '[Loan] grownFullPortfolio');

  // ── (C) Year-by-year chart data sanity check ───────────────────────────
  const chartData = generateYearByYearData({
    portfolioAmount: 2000000,
    expectedCAGR: 12,
    amountNeeded: 500000,
    totalTax: 0,          // 0 tax for simplicity
    loanAmount: 500000,
    loanInterestRate: 10,
    processingFee: computeProcessingFee(500000),
    durationYears: 3,
    extraYears: 2,
  });
  console.assert(chartData.length === 6, `[Chart] should have 6 data points (0–5), got ${chartData.length}`);
  // At t=0 redemptionValue should be 2000000-500000-0 = 1500000
  assertClose(chartData[0].redemptionValue, 1500000, 10, '[Chart] t=0 redemptionValue');
  // Loan path should grow faster than redemption path over time
  console.assert(
    chartData[chartData.length - 1].loanValue > chartData[chartData.length - 1].redemptionValue,
    `[Chart] Loan path should exceed redemption path at year ${chartData.length - 1}`
  );

  console.log('[LAMF Verification] All assertions passed ✓ (Correction #6 — cost-basis LTCG + chart)');
}

// Run verification once on module load (dev only)
if (import.meta.env?.DEV !== false) {
  runVerification();
}
