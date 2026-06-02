/**
 * SWP Performance Formula Utilities
 * Business logic for calculating actual historical SWP (Systematic Withdrawal Plan)
 * performance using real NAV data from MFAPI.
 *
 * Reuses helpers from sipPerformanceFormula.js — no duplication.
 */

import {
  generateSIPDates,
  buildSortedNavHistory,
  findNearestNavOnOrBefore,
  calculateXIRR,
} from './sipPerformanceFormula';

// ─── Core SWP Performance Calculator ──────────────────────────────────────────

/**
 * Calculate complete SWP performance using actual historical NAV data.
 *
 * @param {number} initialAmount        - Initial lump-sum invested (INR)
 * @param {number} monthlyWithdrawal    - Monthly SWP withdrawal amount (INR)
 * @param {Date}   investmentDate       - Date of initial lump-sum investment
 * @param {Date}   swpStartDate         - Date of first SWP withdrawal
 * @param {Date}   valuationDate        - Portfolio valuation / end date
 * @param {Array}  navHistory           - Raw MFAPI nav history [{ date, nav }]
 * @returns {Object} Full SWP performance result
 */
export const calculateSWPPerformance = (
  initialAmount,
  monthlyWithdrawal,
  investmentDate,
  swpStartDate,
  valuationDate,
  navHistory,
) => {
  // ── Step 1: Build sorted NAV lookup ──────────────────────────────────────
  const sorted = buildSortedNavHistory(navHistory);
  if (sorted.length === 0) throw new Error('NAV history is empty or invalid.');

  // ── Step 2: Determine investment NAV and initial units ───────────────────
  const investmentNavEntry = findNearestNavOnOrBefore(investmentDate, sorted);
  if (!investmentNavEntry) {
    throw new Error('No NAV found on or before the Investment Date.');
  }
  const investmentNAV = investmentNavEntry.nav;
  let remainingUnits = initialAmount / investmentNAV;

  // ── Step 3: Generate monthly SWP dates ──────────────────────────────────
  const swpDates = generateSIPDates(swpStartDate, valuationDate);

  // ── Step 4: Find valuation NAV ──────────────────────────────────────────
  const valuationNavEntry = findNearestNavOnOrBefore(valuationDate, sorted);
  if (!valuationNavEntry) {
    throw new Error('No NAV found on or before the Valuation Date.');
  }
  const valuationNAV = valuationNavEntry.nav;

  // ── Step 5: Iterate over SWP withdrawal dates ───────────────────────────
  const rows = [];
  let cumulativeWithdrawals = 0;
  let totalInstallments = 0;

  // Cash-flows for XIRR:
  //   Outflow  → -initialAmount on investmentDate
  //   Inflows  → +monthlyWithdrawal each withdrawal date
  //   Final    → +remainingFundValue on valuationDate
  const cashFlows = [
    { amount: -initialAmount, date: investmentDate },
  ];

  for (const swpDate of swpDates) {
    // Stop processing dates beyond valuation
    if (swpDate > valuationDate) break;

    const navEntry = findNearestNavOnOrBefore(swpDate, sorted);
    if (!navEntry) continue; // NAV not yet available — skip

    const nav = navEntry.nav;

    // Prevent negative units: actual withdrawal can't exceed remaining fund value
    const currentFundValue = remainingUnits * nav;
    if (currentFundValue <= 0) break; // Fund exhausted

    const actualWithdrawal = Math.min(monthlyWithdrawal, currentFundValue);
    if (actualWithdrawal <= 0) break;

    // Redeem units
    const redeemedUnits = actualWithdrawal / nav;
    remainingUnits = Math.max(0, remainingUnits - redeemedUnits);
    cumulativeWithdrawals += actualWithdrawal;
    totalInstallments++;

    const fundBalance = remainingUnits * nav;
    const portfolioValue = fundBalance + cumulativeWithdrawals;

    rows.push({
      date: swpDate,
      navDate: navEntry.date,
      withdrawalAmount: actualWithdrawal,
      nav,
      redeemedUnits,
      remainingUnits,
      fundBalance,
      cumulativeWithdrawals,
      portfolioValue,
    });

    cashFlows.push({ amount: actualWithdrawal, date: navEntry.date });
  }

  if (rows.length === 0) {
    throw new Error(
      'No SWP withdrawals could be matched with NAV data. Check your date range.',
    );
  }

  // ── Step 6: Final remaining fund value at valuation date ─────────────────
  const remainingFundValue = remainingUnits * valuationNAV;

  // ── Step 7: Summary metrics ──────────────────────────────────────────────
  const totalWithdrawal = cumulativeWithdrawals;
  const totalPortfolioValue = totalWithdrawal + remainingFundValue;

  // ── Step 8: XIRR ─────────────────────────────────────────────────────────
  const xirrFlows = [
    ...cashFlows,
    { amount: remainingFundValue, date: valuationDate },
  ];
  const xirrDecimal = calculateXIRR(xirrFlows);
  const xirr = xirrDecimal !== null ? xirrDecimal * 100 : null;

  // ── Step 9: Absolute return ───────────────────────────────────────────────
  const absoluteReturn =
    initialAmount > 0
      ? ((totalPortfolioValue - initialAmount) / initialAmount) * 100
      : 0;

  // ── Step 10: Chart data ───────────────────────────────────────────────────
  // Two series: Fund Balance and Portfolio Value (fundBalance + cumulativeWithdrawals)
  const chartData = rows.map((r) => ({
    year: r.date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
    fundBalance: r.fundBalance,
    portfolioValue: r.portfolioValue,
  }));

  return {
    // Inputs echoed back
    initialAmount,
    monthlyWithdrawal,
    investmentNAV,
    valuationNAV,
    valuationDate: valuationNavEntry.date,

    // Summary
    totalInstallments,
    totalWithdrawal,
    remainingUnits,
    remainingFundValue,
    totalPortfolioValue,
    absoluteReturn,
    xirr,

    // Detail rows
    rows,

    // Chart data
    chartData,
  };
};
