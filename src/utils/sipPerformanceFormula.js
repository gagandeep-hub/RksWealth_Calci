/**
 * SIP Performance Formula Utilities
 * Business logic for calculating actual historical SIP performance
 * using real NAV data from MFAPI.
 */

// ─── Date Utilities ──────────────────────────────────────────────────────────

/**
 * Parse a date string "DD-Mon-YYYY" from MFAPI into a JavaScript Date.
 * e.g. "22-May-2024" → Date object
 * @param {string} dateStr - MFAPI date string
 * @returns {Date}
 */
export const parseMfapiDate = (dateStr) => {
  // MFAPI returns dates as "22-May-2024"
  const [day, mon, year] = dateStr.split('-');
  return new Date(`${mon} ${day}, ${year}`);
};

/**
 * Format a Date object to "YYYY-MM-DD" for comparison.
 * @param {Date} date
 * @returns {string}
 */
export const formatDateKey = (date) => {
  return date.toISOString().split('T')[0];
};

/**
 * Format a Date to a readable "MMM YYYY" label for charts.
 * @param {Date} date
 * @returns {string}
 */
export const formatMonthLabel = (date) => {
  return date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
};

// ─── SIP Date Generation ─────────────────────────────────────────────────────

/**
 * Generate monthly SIP investment dates from startDate to endDate.
 * Handles month-end overflows (e.g. Jan 31 → Feb 28/29).
 *
 * @param {Date} startDate
 * @param {Date} endDate
 * @returns {Date[]} Array of monthly investment dates
 */
export const generateSIPDates = (startDate, endDate) => {
  const dates = [];
  const sipDay = startDate.getDate();

  let current = new Date(startDate);

  while (current <= endDate) {
    dates.push(new Date(current));

    // Advance to next month, preserving the SIP day
    const nextMonth = current.getMonth() + 1;
    const nextYear = current.getFullYear() + (nextMonth > 11 ? 1 : 0);
    const adjustedMonth = nextMonth % 12;

    // Handle month-end overflow: if sipDay > last day of next month
    const daysInNextMonth = new Date(nextYear, adjustedMonth + 1, 0).getDate();
    const nextDay = Math.min(sipDay, daysInNextMonth);

    current = new Date(nextYear, adjustedMonth, nextDay);
  }

  return dates;
};

// ─── NAV Lookup Utilities ────────────────────────────────────────────────────

/**
 * Build a sorted lookup structure from MFAPI NAV history.
 * MFAPI returns newest first, so we reverse to get chronological order.
 *
 * @param {Array} navData - Array of { date: "DD-Mon-YYYY", nav: "123.456" }
 * @returns {Array} Array of { date: Date, nav: number } sorted oldest → newest
 */
export const buildSortedNavHistory = (navData) => {
  return navData
    .map((entry) => ({
      date: parseMfapiDate(entry.date),
      nav: parseFloat(entry.nav),
    }))
    .sort((a, b) => a.date - b.date);
};

/**
 * Find the nearest NAV on or AFTER a given date.
 * Used for SIP investment dates — if market was closed, take next available day.
 *
 * @param {Date} targetDate
 * @param {Array} sortedHistory - Sorted oldest → newest array of {date, nav}
 * @returns {{ date: Date, nav: number } | null}
 */
export const findNearestNavOnOrAfter = (targetDate, sortedHistory) => {
  const targetMs = targetDate.getTime();
  for (let i = 0; i < sortedHistory.length; i++) {
    if (sortedHistory[i].date.getTime() >= targetMs) {
      return sortedHistory[i];
    }
  }
  return null; // No NAV available after this date (date is in the future)
};

/**
 * Find the nearest NAV on or BEFORE a given date.
 * Used for valuation date — always take the last known NAV.
 *
 * @param {Date} targetDate
 * @param {Array} sortedHistory - Sorted oldest → newest array of {date, nav}
 * @returns {{ date: Date, nav: number } | null}
 */
export const findNearestNavOnOrBefore = (targetDate, sortedHistory) => {
  const targetMs = targetDate.getTime();
  let result = null;
  for (let i = 0; i < sortedHistory.length; i++) {
    if (sortedHistory[i].date.getTime() <= targetMs) {
      result = sortedHistory[i];
    } else {
      break;
    }
  }
  return result;
};

// ─── XIRR Calculation ────────────────────────────────────────────────────────

/**
 * Calculate XIRR (Extended Internal Rate of Return) for irregular cash flows.
 * Uses Newton-Raphson iteration with bisection fallback.
 *
 * @param {Array} cashFlows - Array of { amount: number, date: Date }
 *   Negative values = outflows (investments), Positive = inflows (redemption)
 * @param {number} [guess=0.1] - Initial guess for the rate
 * @returns {number | null} Annual XIRR rate as a decimal, or null if it fails to converge
 */
export const calculateXIRR = (cashFlows, guess = 0.1) => {
  if (!cashFlows || cashFlows.length < 2) return null;

  const DAYS_IN_YEAR = 365;
  const MAX_ITERATIONS = 100;
  const PRECISION = 1e-7;

  // Reference date: first cash flow date
  const t0 = cashFlows[0].date.getTime();

  /**
   * Compute NPV of cash flows at a given rate
   * NPV = Σ Ci / (1 + r)^(ti / 365)
   */
  const npv = (rate) => {
    return cashFlows.reduce((sum, cf) => {
      const t = (cf.date.getTime() - t0) / (1000 * 60 * 60 * 24 * DAYS_IN_YEAR);
      return sum + cf.amount / Math.pow(1 + rate, t);
    }, 0);
  };

  /**
   * Derivative of NPV w.r.t. rate for Newton-Raphson
   */
  const dnpv = (rate) => {
    return cashFlows.reduce((sum, cf) => {
      const t = (cf.date.getTime() - t0) / (1000 * 60 * 60 * 24 * DAYS_IN_YEAR);
      return sum - (t * cf.amount) / Math.pow(1 + rate, t + 1);
    }, 0);
  };

  // Newton-Raphson
  let rate = guess;
  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const f = npv(rate);
    const df = dnpv(rate);
    if (Math.abs(df) < 1e-10) break;
    const newRate = rate - f / df;
    if (Math.abs(newRate - rate) < PRECISION) {
      return newRate;
    }
    rate = newRate;
    // Guard against divergence
    if (rate < -0.999 || rate > 100) break;
  }

  // Bisection fallback between -50% and +300%
  let lo = -0.5;
  let hi = 3.0;
  const npvLo = npv(lo);
  const npvHi = npv(hi);

  if (npvLo * npvHi > 0) return null; // No root in range

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const mid = (lo + hi) / 2;
    const f = npv(mid);
    if (Math.abs(f) < PRECISION || (hi - lo) / 2 < PRECISION) {
      return mid;
    }
    if (f * npv(lo) < 0) {
      hi = mid;
    } else {
      lo = mid;
    }
  }

  return null;
};

// ─── Core SIP Performance Calculator ─────────────────────────────────────────

/**
 * Calculate complete SIP performance using actual historical NAV data.
 *
 * @param {number} monthlyAmount - Monthly SIP amount in INR
 * @param {Date} startDate - SIP start date
 * @param {Date} endDate - SIP end date (last installment on or before this date)
 * @param {Date} valuationDate - Date to value the portfolio
 * @param {Array} navHistory - Raw MFAPI nav history [{ date, nav }]
 * @returns {Object} Full performance result
 */
export const calculateSIPPerformance = (monthlyAmount, startDate, endDate, valuationDate, navHistory) => {
  // Build sorted lookup
  const sorted = buildSortedNavHistory(navHistory);
  if (sorted.length === 0) {
    throw new Error('NAV history is empty or invalid.');
  }

  // Generate investment dates
  const sipDates = generateSIPDates(startDate, endDate);

  // Find valuation NAV
  const valuationNavEntry = findNearestNavOnOrBefore(valuationDate, sorted);
  if (!valuationNavEntry) {
    throw new Error('No NAV data available on or before the valuation date.');
  }
  const valuationNav = valuationNavEntry.nav;

  // Process each SIP installment
  const installments = [];
  let cumulativeUnits = 0;
  let cumulativeInvested = 0;

  // Cash flows for XIRR: each SIP is a negative outflow
  const cashFlows = [];

  for (const sipDate of sipDates) {
    // Use NAV on or before the SIP date (previous trading day if it falls on a weekend/holiday)
    const navEntry = findNearestNavOnOrBefore(sipDate, sorted);
    if (!navEntry) continue; // No NAV available before this SIP date (too early in history)

    const units = monthlyAmount / navEntry.nav;
    cumulativeUnits += units;
    cumulativeInvested += monthlyAmount;
    const valuation = cumulativeUnits * valuationNav;

    installments.push({
      date: navEntry.date,
      amount: monthlyAmount,
      nav: navEntry.nav,
      units,
      cumulativeUnits,
      cumulativeInvested,
      valuation,
    });

    cashFlows.push({
      amount: -monthlyAmount, // Negative = outflow
      date: navEntry.date,
    });
  }

  if (installments.length === 0) {
    throw new Error('No SIP installments could be matched with NAV data. Please check the date range.');
  }

  // Final portfolio value at valuation date
  const totalInvested = cumulativeInvested;
  const currentValue = cumulativeUnits * valuationNav;
  const profitLoss = currentValue - totalInvested;
  const absoluteReturn = totalInvested > 0 ? ((profitLoss / totalInvested) * 100) : 0;

  // XIRR: add final redemption as a positive inflow on valuation date
  const xirrFlows = [
    ...cashFlows,
    { amount: currentValue, date: valuationDate },
  ];
  const xirrDecimal = calculateXIRR(xirrFlows);
  const xirr = xirrDecimal !== null ? xirrDecimal * 100 : null;

  // Build chart data: monthly cumulative invested vs portfolio value
  // Group by year for the bar chart
  const chartDataMap = new Map();
  for (const inst of installments) {
    const year = inst.date.getFullYear();
    chartDataMap.set(year, {
      year,
      invested: inst.cumulativeInvested,
      returns: Math.max(0, inst.valuation - inst.cumulativeInvested),
      value: inst.valuation,
    });
  }
  const chartBreakdown = Array.from(chartDataMap.values());

  return {
    totalInvested,
    currentValue,
    profitLoss,
    absoluteReturn,
    xirr,
    currentNav: valuationNav,
    valuationDate: valuationNavEntry.date,
    installmentCount: installments.length,
    cumulativeUnits,
    installments,
    chartBreakdown,
  };
};
