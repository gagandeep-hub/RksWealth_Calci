/**
 * STP Performance Formula Utilities
 * Business logic for calculating actual historical STP (Systematic Transfer Plan)
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

// ─── Core STP Performance Calculator ──────────────────────────────────────────

/**
 * Calculate complete STP performance using actual historical NAV data for both
 * the source (Transfer From) and destination (Transfer To) funds.
 *
 * @param {number}  initialAmount     - Initial lump-sum invested in source fund (INR)
 * @param {number}  transferAmount    - Monthly STP transfer amount (INR)
 * @param {Date}    investmentDate    - Date of initial lump-sum investment in source fund
 * @param {Date}    stpStartDate      - Date of first STP transfer
 * @param {Date}    valuationDate     - Portfolio valuation date
 * @param {Array}   sourceNavHistory  - Raw MFAPI nav history for source fund
 * @param {Array}   destNavHistory    - Raw MFAPI nav history for destination fund
 * @returns {Object} Full STP performance result
 */
export const calculateSTPPerformance = (
  initialAmount,
  transferAmount,
  investmentDate,
  stpStartDate,
  valuationDate,
  sourceNavHistory,
  destNavHistory,
) => {
  // ── Step 1: Build sorted NAV lookups ──────────────────────────────────────
  const sourceSorted = buildSortedNavHistory(sourceNavHistory);
  const destSorted   = buildSortedNavHistory(destNavHistory);

  if (sourceSorted.length === 0) throw new Error('Source fund NAV history is empty or invalid.');
  if (destSorted.length === 0)   throw new Error('Destination fund NAV history is empty or invalid.');

  // ── Step 2: Source fund initial purchase on Investment Date ───────────────
  const initialNavEntry = findNearestNavOnOrBefore(investmentDate, sourceSorted);
  if (!initialNavEntry) throw new Error('No NAV found for the source fund on or before the Investment Date.');

  const initialSourceNAV = initialNavEntry.nav;
  let sourceUnits = initialAmount / initialSourceNAV;

  // ── Step 3: Generate monthly STP dates ────────────────────────────────────
  const stpDates = generateSIPDates(stpStartDate, valuationDate);

  // ── Step 4: Find valuation NAVs ───────────────────────────────────────────
  const sourceValNAVEntry = findNearestNavOnOrBefore(valuationDate, sourceSorted);
  const destValNAVEntry   = findNearestNavOnOrBefore(valuationDate, destSorted);

  if (!sourceValNAVEntry) throw new Error('No NAV found for source fund on or before the Valuation Date.');
  if (!destValNAVEntry)   throw new Error('No NAV found for destination fund on or before the Valuation Date.');

  const sourceValuationNAV = sourceValNAVEntry.nav;
  const destValuationNAV   = destValNAVEntry.nav;

  // ── Step 5: Iterate over STP dates ────────────────────────────────────────
  const rows = [];
  let destinationUnits = 0;
  let transferCount    = 0;

  // Cash-flows for Source Fund XIRR:
  //   Outflow  → -initialAmount on investmentDate
  //   Inflows  → +transferAmount each month (redemption proceeds going out of source)
  //   Final    → +sourceCurrentValue on valuationDate
  const sourceCashFlows = [
    { amount: -initialAmount, date: investmentDate },
  ];

  // Cash-flows for Destination Fund XIRR:
  //   Outflow  → -transferAmount each month
  //   Final    → +destinationCurrentValue on valuationDate
  const destCashFlows = [];

  for (const stpDate of stpDates) {
    // Skip future STP dates beyond valuation
    if (stpDate > valuationDate) break;

    const sourceNavEntry = findNearestNavOnOrBefore(stpDate, sourceSorted);
    const destNavEntry   = findNearestNavOnOrBefore(stpDate, destSorted);

    if (!sourceNavEntry || !destNavEntry) continue; // NAV not yet available — skip

    const sourceNAV = sourceNavEntry.nav;
    const destNAV   = destNavEntry.nav;

    // Current source fund value available
const availableValue = sourceUnits * sourceNAV;

// Fund exhausted
if (availableValue <= 0) {
  break;
}

// Last transfer can be partial
const actualTransfer = Math.min(
  transferAmount,
  availableValue
);

// Redeem units from source
const redeemedUnits = actualTransfer / sourceNAV;

sourceUnits -= redeemedUnits;

// Prevent negative units due to floating point precision
if (sourceUnits < 0) {
  sourceUnits = 0;
}

// Purchase units in destination
const purchasedUnits = actualTransfer / destNAV;

destinationUnits += purchasedUnits;

transferCount++;
    // Running values at this STP date
    const sourceFundValue = sourceUnits * sourceNAV;
    const destFundValue   = destinationUnits * destNAV;

    rows.push({
      date:                    stpDate,
      navDate:                 sourceNavEntry.date,
      transferAmount:          actualTransfer,
      sourceNAV,
      redeemedUnits,
      remainingSourceUnits:    sourceUnits,
      destinationNAV:          destNAV,
      purchasedUnits,
      cumulativeDestUnits:     destinationUnits,
      sourceFundValue,
      destinationFundValue:    destFundValue,
    });

    // Record cash-flows for XIRR
    sourceCashFlows.push({ amount: actualTransfer, date: sourceNavEntry.date }); // outflow from source = inflow back to investor
    destCashFlows.push({ amount: -actualTransfer, date: destNavEntry.date });
  }

  if (rows.length === 0) {
    throw new Error('No STP transfers could be matched with NAV data. Check your date range.');
  }
if (sourceUnits < 0) {
  sourceUnits = 0;
}
  // ── Step 5: Final valuations ──────────────────────────────────────────────
  const sourceCurrentValue = sourceUnits * sourceValuationNAV;
  const destCurrentValue   = destinationUnits * destValuationNAV;

  // ── Step 6: Totals ────────────────────────────────────────────────────────
  const totalTransferred    = rows.reduce((s, r) => s + r.transferAmount, 0);
  const totalPortfolioValue = sourceCurrentValue + destCurrentValue;

  // ── Step 7 & 8: XIRR calculations ────────────────────────────────────────
  // Source XIRR — final value of remaining source units as inflow
  const sourceXirrFlows = [
    ...sourceCashFlows,
    { amount: sourceCurrentValue, date: valuationDate },
  ];
  const sourceXirrDecimal = calculateXIRR(sourceXirrFlows);
  const sourceXirr = sourceXirrDecimal !== null ? sourceXirrDecimal * 100 : null;

  // Destination XIRR — final valuation as inflow
  const destXirrFlows = [
    ...destCashFlows,
    { amount: destCurrentValue, date: valuationDate },
  ];
  const destXirrDecimal = calculateXIRR(destXirrFlows);
  const destXirr = destXirrDecimal !== null ? destXirrDecimal * 100 : null;

  // ── Step 9: Destination absolute return ──────────────────────────────────
  const destAbsoluteReturn =
    totalTransferred > 0 ? ((destCurrentValue - totalTransferred) / totalTransferred) * 100 : 0;

  // ── Chart data: monthly source & destination values ───────────────────────
  // Group by month label for the chart (month ticks)
  const chartData = rows.map((r) => ({
    year: r.date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
    sourceValue: r.sourceFundValue,
    destValue:   r.destinationFundValue,
  }));

  return {
    // Source fund summary
    initialAmount,
    initialSourceNAV,
    transferAmount,
    totalTransferred,
    transferCount,
    remainingSourceUnits: sourceUnits,
    sourceCurrentValue,
    sourceValuationNAV,
    sourceXirr,

    // Destination fund summary
    destCurrentValue,
    destValuationNAV,
    destinationUnits,
    destAbsoluteReturn,
    destXirr,

    // Portfolio
    totalPortfolioValue,

    // Valuation dates used
    sourceValuationDate: sourceValNAVEntry.date,
    destValuationDate:   destValNAVEntry.date,

    // Table rows
    rows,

    // Chart data
    chartData,
  };
};
