import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Landmark,
  IndianRupee,
  Percent,
  Calendar,
  TrendingUp,
  Info,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  ArrowRight,
  Banknote,
  ReceiptText,
  Scale,
} from 'lucide-react';
import {
  formatINR,
  computeProcessingFee,
  computeCapitalGains,
  computeLTCGTax,
  calcLoanPortfolio,
} from '../../utils/lamfFormula';

// ---------------------------------------------------------------------------
// Sub-component: Slider + number-input combined row
// ---------------------------------------------------------------------------
const SliderInput = ({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  prefix = '',
  suffix = '',
  helperText = '',
  locked = false,
  disabled = false,
  icon: Icon,
  formatDisplay,
}) => {
  const pct = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  const handleNumberChange = (e) => {
    const raw = e.target.value.replace(/[^0-9.]/g, '');
    if (raw === '') return;
    onChange(parseFloat(raw));
  };

  return (
    <div className="mb-7">
      <div className="flex items-start justify-between mb-2 gap-3">
        <div className="flex items-center gap-2 min-w-0">
          {Icon && <Icon className="w-4 h-4 text-emerald-500 flex-shrink-0" />}
          <div className="min-w-0">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 leading-tight block">
              {label}
            </span>
            {helperText && (
              <span className="text-xs text-gray-400 dark:text-gray-500 leading-tight block mt-0.5">
                {helperText}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {prefix && (
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{prefix}</span>
          )}
          <input
            type="number"
            value={value}
            onChange={handleNumberChange}
            disabled={locked || disabled}
            min={min}
            max={max}
            step={step}
            className={`w-28 px-3 py-1.5 text-sm font-bold text-right rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500
              ${locked || disabled
                ? 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                : 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 hover:border-emerald-400'
              }`}
          />
          {suffix && (
            <span className="text-sm font-bold text-gray-500 dark:text-gray-400 ml-0.5">{suffix}</span>
          )}
          {locked && (
            <span title="Auto-synced" className="ml-1 text-amber-500">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </span>
          )}
        </div>
      </div>

      {/* Slider */}
      <div className="relative h-5 flex items-center mt-1">
        <div className="absolute inset-y-0 flex items-center w-full">
          {/* Track background */}
          <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${locked || disabled ? 'bg-gray-400' : 'bg-gradient-to-r from-emerald-400 to-emerald-600'}`}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.15 }}
            />
          </div>
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          disabled={locked || disabled}
          className="relative w-full h-1.5 opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
        />
      </div>

      {/* Min/Max labels */}
      <div className="flex justify-between mt-1 text-[10px] text-gray-400 font-medium px-0.5">
        <span>{prefix}{min.toLocaleString('en-IN')}{suffix}</span>
        <span>{prefix}{max.toLocaleString('en-IN')}{suffix}</span>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Sub-component: Section accordion
// ---------------------------------------------------------------------------
const Section = ({ title, subtitle, icon: Icon, color = 'emerald', children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  const colorMap = {
    emerald: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800',
    blue: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800',
    amber: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800',
    violet: 'text-violet-500 bg-violet-50 dark:bg-violet-900/20 border-violet-100 dark:border-violet-800',
  };

  return (
    <div className="mb-4 rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden shadow-sm">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className={`inline-flex p-2 rounded-xl ${colorMap[color]} border`}>
            <Icon className={`w-4 h-4 ${colorMap[color].split(' ')[0]}`} />
          </span>
          <div>
            <p className="font-bold text-gray-800 dark:text-gray-100 text-sm">{title}</p>
            {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500">{subtitle}</p>}
          </div>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-1">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Sub-component: Result row inside a card
// ---------------------------------------------------------------------------
const ResultRow = ({ label, value, type = 'normal', note = '' }) => {
  const typeStyles = {
    normal: 'text-gray-600 dark:text-gray-400',
    deduct: 'text-red-500 dark:text-red-400',
    highlight: 'text-emerald-600 dark:text-emerald-400 text-xl font-black',
    divider: '',
  };

  if (type === 'divider') {
    return <div className="h-px bg-gray-100 dark:bg-gray-700 my-3" />;
  }

  return (
    <div className="flex items-center justify-between py-1.5">
      <span className={`text-sm ${type === 'highlight' ? 'font-bold text-gray-800 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}`}>
        {label}
        {note && <span className="ml-1 text-xs text-gray-400 dark:text-gray-500">({note})</span>}
      </span>
      <span className={`font-bold text-sm ${typeStyles[type]}`}>{value}</span>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
const LAMF = () => {
  // ── Primary inputs ─────────────────────────────────────────────────────
  const [portfolioAmount, setPortfolioAmount] = useState(2000000);
  const [expectedCAGR, setExpectedCAGR] = useState(12);
  const [amountNeeded, setAmountNeeded] = useState(500000);
  const [durationYears, setDurationYears] = useState(2);

  // ── Section 3: Redemption (editable overrides) ─────────────────────────
  // capitalGainsOverride allows manual editing.
  // Formula default: portfolioAmount × (CAGR/100)
  // Auto-resets (clears override) when portfolioAmount or expectedCAGR change.
  const [capitalGainsOverride, setCapitalGainsOverride] = useState(null);
  const [stcgTax, setStcgTax] = useState(0);

  // Reset override to null when the formula inputs change
  useEffect(() => {
    setCapitalGainsOverride(null);
  }, [portfolioAmount, expectedCAGR]);

  // ── Section 4: Loan details ────────────────────────────────────────────
  const [loanInterestRate, setLoanInterestRate] = useState(10);
  const [processingFee, setProcessingFee] = useState(
    () => computeProcessingFee(500000)
  );
  // Sync processing fee when loan amount (= amountNeeded) changes
  useEffect(() => {
    setProcessingFee(computeProcessingFee(amountNeeded));
  }, [amountNeeded]);

  // ── Derived redemption values (all useMemo — fully reactive) ───────────
  const capitalGainsAmount = useMemo(
    () => (capitalGainsOverride !== null && capitalGainsOverride !== '' ? capitalGainsOverride : portfolioAmount * (expectedCAGR / 100)),
    [portfolioAmount, expectedCAGR, capitalGainsOverride]
  );

  const ltcgTax = useMemo(
    () => 0.125 * capitalGainsAmount,
    [capitalGainsAmount]
  );

  const redemptionAmount = useMemo(
    () => amountNeeded + ltcgTax + stcgTax,
    [amountNeeded, ltcgTax, stcgTax]
  );

  // Remaining portfolio = what's left after the grossed-up redemption leaves
  const remainingAfterRedemption = useMemo(
    () => portfolioAmount - redemptionAmount,
    [portfolioAmount, redemptionAmount]
  );

  // finalRedemptionPortfolio: the remaining balance grows at CAGR
  const finalRedemptionPortfolio = useMemo(
    () => remainingAfterRedemption * Math.pow(1 + expectedCAGR / 100, durationYears),
    [remainingAfterRedemption, expectedCAGR, durationYears]
  );

  // ── Derived loan values (all useMemo) ─────────────────────────────────
  const loanInterest = useMemo(
    () => amountNeeded * (loanInterestRate / 100) * durationYears,
    [amountNeeded, loanInterestRate, durationYears]
  );
  const totalTax = useMemo(() => ltcgTax + stcgTax, [ltcgTax, stcgTax]);
  const totalLoanCost = useMemo(
    () => loanInterest + processingFee,
    [loanInterest, processingFee]
  );
  const grownFullPortfolio = useMemo(
    () => portfolioAmount * Math.pow(1 + expectedCAGR / 100, durationYears),
    [portfolioAmount, expectedCAGR, durationYears]
  );
  const finalLoanPortfolio = useMemo(
    () => grownFullPortfolio - amountNeeded - totalLoanCost,
    [grownFullPortfolio, amountNeeded, totalLoanCost]
  );

  // ── Verdict ────────────────────────────────────────────────────────────
  const loanIsBetter = finalLoanPortfolio > finalRedemptionPortfolio;
  const difference = Math.abs(finalLoanPortfolio - finalRedemptionPortfolio);

  return (
    <div className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <nav className="flex mb-3 text-xs font-medium text-gray-400 dark:text-gray-500">
          <ol className="flex items-center gap-1.5">
            <li><a href="/" className="hover:text-emerald-500 transition-colors">Calculators</a></li>
            <li>/</li>
            <li className="text-emerald-600 dark:text-emerald-400">LAMF vs Redemption</li>
          </ol>
        </nav>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white flex items-center gap-3">
              <span className="inline-flex p-2.5 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30">
                <Scale className="w-7 h-7 text-white" />
              </span>
              Loan vs Redemption
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-xl text-sm leading-relaxed">
              Should you redeem your Mutual Fund units or take a Loan Against Mutual Funds (LAMF) when you need cash?
              Compare both paths — see which leaves your portfolio better off.
            </p>
          </div>
          <div className="flex-shrink-0 hidden lg:flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-xs font-medium max-w-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>Assumes constant CAGR &amp; flat simple interest. Illustrative only.</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* ----------------------------------------------------------------
            LEFT COLUMN — Inputs
        ----------------------------------------------------------------- */}
        <div className="xl:col-span-5 space-y-2">

          {/* Section 1 — Portfolio */}
          <Section title="Current Portfolio" subtitle="Your existing MF investment" icon={TrendingUp} color="emerald">
            <SliderInput
              label="Portfolio Value"
              value={portfolioAmount}
              onChange={setPortfolioAmount}
              min={100000}
              max={10000000}
              step={50000}
              prefix="₹"
              icon={IndianRupee}
            />
            <SliderInput
              label="Expected CAGR"
              value={expectedCAGR}
              onChange={setExpectedCAGR}
              min={4}
              max={30}
              step={0.5}
              suffix="%"
              icon={Percent}
              helperText="Annual growth rate of your MF portfolio"
            />
          </Section>

          {/* Section 2 — Money Required */}
          <Section title="Money Required" subtitle="How much cash you need &amp; for how long" icon={Banknote} color="blue">
            <SliderInput
              label="Amount Needed"
              value={amountNeeded}
              onChange={setAmountNeeded}
              min={10000}
              max={5000000}
              step={10000}
              prefix="₹"
              icon={IndianRupee}
            />
            <SliderInput
              label="Duration"
              value={durationYears}
              onChange={setDurationYears}
              min={1}
              max={10}
              step={1}
              suffix=" yr"
              icon={Calendar}
              helperText="Period for which you need the funds"
            />
          </Section>

          {/* Section 3 — Redemption Details */}
          <Section title="Redemption Details" subtitle="Tax implications of selling your units" icon={ReceiptText} color="amber">

            {/* Row 1: Redemption Amount — READ-ONLY derived field */}
            <div className="mb-6">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 block">
                    Redemption Amount (₹)
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 block mt-0.5 leading-snug">
                    You will need to redeem this amount to get {formatINR(amountNeeded)}
                    {' '}(= Amount Needed + Total Tax)
                  </span>
                </div>
                {/* Read-only grey box matching reference UI */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <span className="text-sm font-bold text-gray-400 dark:text-gray-500">₹</span>
                  <div className="w-28 px-3 py-1.5 text-sm font-bold text-right rounded-lg border bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 select-all">
                    {Math.round(redemptionAmount).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2: Profit / Capital Gains Amount — editable, auto-defaulted from formula */}
            <div className="mb-6">
              <div className="flex items-start justify-between gap-3 mb-1">
                <div className="min-w-0">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 block">
                    Profit / Capital Gains Amount (₹)
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 block mt-0.5 leading-snug">
                    Estimated as Portfolio Value × CAGR. Override with your
                    actual unrealised gain from your MF statement.
                  </span>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">₹</span>
                  <input
                    type="number"
                    value={capitalGainsAmount}
                    onChange={(e) => setCapitalGainsOverride(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))}
                    min={0}
                    className="w-28 px-3 py-1.5 text-sm font-bold text-right rounded-lg border bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>
              </div>
              <p className="text-[11px] text-gray-400 dark:text-gray-500">
                Formula default:{' '}
                <span className="font-semibold text-gray-500 dark:text-gray-400">
                  {formatINR(portfolioAmount)} × {expectedCAGR}%
                  {' '}= {formatINR(computeCapitalGains(portfolioAmount, expectedCAGR))}
                </span>
              </p>
            </div>

            {/* Row 3: LTCG Tax — derived from capitalGainsAmount, displayed read-only-styled */}
            <div className="mb-6">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 block">
                    LTCG Tax (₹)
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 block mt-0.5 leading-snug">
                    LTCG is usually 12.5% of the Capital Gains amount
                  </span>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <span className="text-sm font-bold text-amber-600 dark:text-amber-400">₹</span>
                  <div className="w-28 px-3 py-1.5 text-sm font-bold text-right rounded-lg border bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-300 select-all">
                    {Math.round(ltcgTax).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            </div>

            {/* Row 4: STCG Tax — manual, defaults 0 */}
            <div className="mb-2">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 block">
                    STCG Tax (₹)
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 block mt-0.5 leading-snug">
                    STCG is usually 20% of short-term gains; leave 0 if your holding is long-term.
                  </span>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">₹</span>
                  <input
                    type="number"
                    value={stcgTax}
                    onChange={(e) => setStcgTax(Math.max(0, Number(e.target.value)))}
                    min={0}
                    className="w-28 px-3 py-1.5 text-sm font-bold text-right rounded-lg border bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Total Tax summary badge */}
            <div className="flex items-center justify-between p-3 mt-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800 text-sm">
              <span className="text-red-600 dark:text-red-400 font-semibold">Total Tax Paid</span>
              <span className="font-black text-red-600 dark:text-red-400">{formatINR(totalTax)}</span>
            </div>
          </Section>

          {/* Section 4 — Loan Details */}
          <Section title="Loan Against MFs (LAMF)" subtitle="Cost of borrowing instead of selling" icon={Landmark} color="violet">
            {/* Loan amount — locked to amountNeeded */}
            <div className="flex items-center justify-between mb-5 p-3 bg-violet-50 dark:bg-violet-900/20 rounded-xl border border-violet-100 dark:border-violet-800 text-sm">
              <div>
                <span className="font-semibold text-violet-700 dark:text-violet-400">Loan Amount</span>
                <p className="text-xs text-violet-500 dark:text-violet-500 mt-0.5">
                  Loan amount is same as the amount of money you need
                </p>
              </div>
              <span className="font-black text-violet-700 dark:text-violet-400 text-base">{formatINR(amountNeeded)}</span>
            </div>

            <SliderInput
              label="Interest Rate (p.a.)"
              value={loanInterestRate}
              onChange={setLoanInterestRate}
              min={7}
              max={20}
              step={0.25}
              suffix="%"
              icon={Percent}
              helperText="Annual simple interest rate charged by the lender"
            />

            {/* Tenure — locked to durationYears */}
            <div className="flex items-center justify-between mb-5 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl text-sm">
              <div>
                <span className="font-semibold text-gray-700 dark:text-gray-200">Loan Tenure</span>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  Loan tenure is same as the duration for which you need the money
                </p>
              </div>
              <span className="font-black text-gray-700 dark:text-gray-200">{durationYears} yr</span>
            </div>

            {/* Processing Fee — auto-computed but editable */}
            <div className="mb-2">
              <div className="flex items-center justify-between mb-1.5">
                <div>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Processing Fee</span>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    1% of loan, capped ₹1,250–₹4,999. Edit if your lender quotes differently.
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">₹</span>
                  <input
                    type="number"
                    value={processingFee}
                    onChange={(e) => setProcessingFee(Math.max(0, Number(e.target.value)))}
                    min={0}
                    className="w-24 px-3 py-1.5 text-sm font-bold text-right rounded-lg border bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>
              </div>
            </div>
          </Section>
        </div>

        {/* ----------------------------------------------------------------
            RIGHT COLUMN — Results (all values are live memos, no null check)
        ----------------------------------------------------------------- */}
        <div className="xl:col-span-7 space-y-5">

          {/* Verdict Banner */}
          <motion.div
            key={loanIsBetter ? 'loan' : 'redeem'}
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.35 }}
            className={`rounded-3xl p-6 border shadow-lg flex flex-col sm:flex-row items-center gap-4 justify-between
              ${loanIsBetter
                ? 'bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/20 border-emerald-200 dark:border-emerald-700 shadow-emerald-100 dark:shadow-none'
                : 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700 shadow-blue-100 dark:shadow-none'
              }`}
          >
            <div>
              <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${loanIsBetter ? 'text-emerald-500' : 'text-blue-500'}`}>
                Recommendation
              </p>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                {loanIsBetter ? '🏆 Loan Against MFs is Better' : '🏆 Redemption is Better'}
              </h2>
              <p className={`text-sm mt-1 font-medium ${loanIsBetter ? 'text-emerald-700 dark:text-emerald-300' : 'text-blue-700 dark:text-blue-300'}`}>
                by <span className="font-black text-base">{formatINR(difference)}</span> in final portfolio value
              </p>
            </div>
            <div className={`flex-shrink-0 rounded-2xl px-5 py-3 font-black text-white text-lg shadow-md
              ${loanIsBetter
                ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/30'
                : 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/30'
              }`}>
              {formatINR(difference)}
            </div>
          </motion.div>

          {/* Two comparison cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Card 1 — Redemption */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className={`rounded-3xl border p-6 shadow-sm flex flex-col transition-all
                ${!loanIsBetter
                  ? 'border-blue-300 dark:border-blue-600 bg-gradient-to-b from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-800 ring-2 ring-blue-200 dark:ring-blue-700'
                  : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800'
                }`}
            >
              <div className="flex items-center gap-2 mb-5">
                <span className={`inline-flex p-2 rounded-xl ${!loanIsBetter ? 'bg-blue-100 dark:bg-blue-900/40' : 'bg-gray-100 dark:bg-gray-700'}`}>
                  <ArrowRight className={`w-4 h-4 ${!loanIsBetter ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'}`} />
                </span>
                <div>
                  <h3 className="font-black text-gray-800 dark:text-gray-100 text-sm">With Redemption</h3>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Sell your MF units now</p>
                </div>
                {!loanIsBetter && (
                  <span className="ml-auto text-[10px] font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full">
                    BETTER
                  </span>
                )}
              </div>

              <div className="space-y-0.5 flex-1">
                <ResultRow label="Current Portfolio" value={formatINR(portfolioAmount)} />
                <ResultRow label="Redeemed (grossed-up)" value={`−${formatINR(redemptionAmount)}`} type="deduct" note="incl. tax" />
                <ResultRow type="divider" />
                <ResultRow label="Remaining Balance" value={formatINR(remainingAfterRedemption)} />
                <ResultRow label={`Growth @ ${expectedCAGR}% for ${durationYears}yr`} value="" />
                <ResultRow type="divider" />
                <ResultRow label="LTCG Tax" value={`${formatINR(ltcgTax)}`} />
                <ResultRow label="STCG Tax" value={`${formatINR(stcgTax)}`} />
                <ResultRow type="divider" />
                <div className="pt-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-800 dark:text-gray-100">Final Portfolio</span>
                    <span className={`text-2xl font-black ${!loanIsBetter ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-200'}`}>
                      {formatINR(finalRedemptionPortfolio)}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Card 2 — Loan */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className={`rounded-3xl border p-6 shadow-sm flex flex-col transition-all
                ${loanIsBetter
                  ? 'border-emerald-300 dark:border-emerald-600 bg-gradient-to-b from-emerald-50 to-white dark:from-emerald-900/20 dark:to-gray-800 ring-2 ring-emerald-200 dark:ring-emerald-700'
                  : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800'
                }`}
            >
              <div className="flex items-center gap-2 mb-5">
                <span className={`inline-flex p-2 rounded-xl ${loanIsBetter ? 'bg-emerald-100 dark:bg-emerald-900/40' : 'bg-gray-100 dark:bg-gray-700'}`}>
                  <Landmark className={`w-4 h-4 ${loanIsBetter ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500'}`} />
                </span>
                <div>
                  <h3 className="font-black text-gray-800 dark:text-gray-100 text-sm">With Loan (LAMF)</h3>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Keep MFs, borrow against them</p>
                </div>
                {loanIsBetter && (
                  <span className="ml-auto text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded-full">
                    BETTER
                  </span>
                )}
              </div>

              <div className="space-y-0.5 flex-1">
                <ResultRow label="Current Portfolio" value={formatINR(portfolioAmount)} />
                <ResultRow label={`Growth @ ${expectedCAGR}% for ${durationYears}yr`} value={formatINR(grownFullPortfolio)} />
                <ResultRow type="divider" />
                <ResultRow label="Loan Principal Repaid" value={`−${formatINR(amountNeeded)}`} type="deduct" />
                <ResultRow
                  label="Interest Paid"
                  value={`−${formatINR(loanInterest)}`}
                  type="deduct"
                  note={`${formatINR(amountNeeded)} × ${loanInterestRate}% × ${durationYears}yr`}
                />
                <ResultRow label="Processing Fee" value={`−${formatINR(processingFee)}`} type="deduct" />
                <ResultRow type="divider" />
                <div className="pt-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-800 dark:text-gray-100">Final Portfolio</span>
                    <span className={`text-2xl font-black ${loanIsBetter ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-700 dark:text-gray-200'}`}>
                      {formatINR(finalLoanPortfolio)}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Key Numbers panel */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-6 shadow-sm"
          >
            <h3 className="font-bold text-gray-700 dark:text-gray-200 text-sm mb-4 flex items-center gap-2">
              <Info className="w-4 h-4 text-gray-400" />
              Key Numbers at a Glance
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { label: 'Capital Gains', value: formatINR(capitalGainsAmount), color: 'text-orange-500' },
                { label: 'LTCG Tax', value: formatINR(ltcgTax), color: 'text-red-500' },
                { label: 'Total Tax', value: formatINR(totalTax), color: 'text-red-600' },
                { label: 'Loan Interest', value: formatINR(loanInterest), color: 'text-violet-500' },
                { label: 'Processing Fee', value: formatINR(processingFee), color: 'text-violet-400' },
                { label: 'Total Loan Cost', value: formatINR(totalLoanCost), color: 'text-violet-600' },
              ].map((item) => (
                <div key={item.label} className="text-center p-3 rounded-2xl bg-gray-50 dark:bg-gray-700/50">
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">{item.label}</p>
                  <p className={`text-sm font-bold ${item.color}`}>{item.value}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Disclaimer */}
          <div className="rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 p-5 text-xs text-gray-400 dark:text-gray-500 leading-relaxed flex gap-3">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-300 dark:text-gray-600" />
            <div>
              <p className="font-semibold text-gray-500 dark:text-gray-400 mb-1">Disclaimer &amp; Model Assumptions</p>
              <p>
                For illustrative purposes only. Assumes constant CAGR and constant loan interest rate throughout the tenure.
                Loan interest is calculated as <strong>flat simple interest</strong> (not reducing-balance/EMI).
                Loan principal is assumed to be repaid from the portfolio itself — in reality, if repaid from external cash flow,
                LAMF would look even more favorable than shown here. Capital gains estimate uses a simple-growth
                model (Portfolio Value × CAGR) and does not reflect your actual purchase NAV or cost basis.
                Not financial advice — consult a financial advisor before borrowing against or redeeming your mutual fund units.
              </p>
              <p className="mt-1.5 text-gray-300 dark:text-gray-600">
                LTCG = 12.5% of estimated gains. STCG = 20% (if applicable, enter manually).
                Processing fee: 1% of loan, floored ₹1,250, capped ₹4,999.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LAMF;
