import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRightLeft, IndianRupee, Calendar, Info,
  AlertCircle, Loader2, ChevronDown, X, Search, BarChart2,
  TrendingUp, TrendingDown,
} from 'lucide-react';
import InputSlider from '../../components/calculator/InputSlider';
import InvestmentChart from '../../components/calculator/InvestmentChart';
import {
  fetchAllSchemes,
  fetchSchemeNavHistory,
  extractAmcList,
  filterSchemesByAmc,
} from '../../utils/mfApiService';
import { calculateSTPPerformance } from '../../utils/stpPerformanceFormula';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatCurrency = (val) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val);

const formatNav = (val) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  }).format(val);

const toDateInputValue = (date) => date.toISOString().split('T')[0];

// ─── Searchable Dropdown (AMC list — string options) ─────────────────────────

const SearchableDropdown = ({ label, value, onChange, options, placeholder, disabled, icon: Icon }) => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!value) setQuery('');
    else setQuery(value);
  }, [value]);

  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
        if (!value) setQuery('');
        else setQuery(value);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [value]);

  const filtered = useMemo(() => {
    if (!query) return options.slice(0, 100);
    return options
      .filter((o) => o.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 100);
  }, [query, options]);

  const handleSelect = (opt) => { onChange(opt); setQuery(opt); setOpen(false); };
  const handleClear = (e) => { e.stopPropagation(); onChange(''); setQuery(''); setOpen(false); };

  return (
    <div className="mb-5" ref={wrapperRef}>
      <div className="flex items-center gap-2 mb-2">
        {Icon && <Icon className="w-4 h-4 text-purple-500" />}
        <label className="text-gray-600 dark:text-gray-300 font-medium text-sm">{label}</label>
      </div>
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            disabled={disabled}
            placeholder={disabled ? 'Loading...' : placeholder}
            onFocus={() => setOpen(true)}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
              if (!e.target.value) onChange('');
            }}
            className={`w-full pl-9 pr-10 py-3 rounded-xl border text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-purple-500
              ${disabled
                ? 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-100 cursor-text hover:border-purple-400'
              }`}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {value && (
              <button onClick={handleClear} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X className="w-4 h-4" />
              </button>
            )}
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
          </div>
        </div>
        <AnimatePresence>
          {open && !disabled && (
            <motion.ul
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-2xl max-h-60 overflow-y-auto"
            >
              {filtered.length === 0 ? (
                <li className="px-4 py-3 text-sm text-gray-400">No results found</li>
              ) : (
                filtered.map((opt) => (
                  <li
                    key={opt}
                    onClick={() => handleSelect(opt)}
                    className={`px-4 py-2.5 text-sm cursor-pointer transition-colors
                      ${opt === value
                        ? 'bg-purple-50 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 font-semibold'
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                  >
                    {opt}
                  </li>
                ))
              )}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// ─── Scheme Dropdown (object-based) ───────────────────────────────────────────

const SchemeDropdown = ({ label, value, onChange, options, disabled }) => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!value) setQuery('');
    else setQuery(value.schemeName || '');
  }, [value]);

  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
        if (!value) setQuery('');
        else setQuery(value.schemeName || '');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [value]);

  const filtered = useMemo(() => {
    if (!query) return options.slice(0, 100);
    return options
      .filter((o) => o.schemeName.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 100);
  }, [query, options]);

  const handleSelect = (opt) => { onChange(opt); setQuery(opt.schemeName); setOpen(false); };
  const handleClear = (e) => { e.stopPropagation(); onChange(null); setQuery(''); setOpen(false); };

  return (
    <div className="mb-5" ref={wrapperRef}>
      <div className="flex items-center gap-2 mb-2">
        <BarChart2 className="w-4 h-4 text-purple-500" />
        <label className="text-gray-600 dark:text-gray-300 font-medium text-sm">{label}</label>
      </div>
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            disabled={disabled}
            placeholder={disabled ? 'Select AMC first' : 'Search scheme...'}
            onFocus={() => setOpen(true)}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
              if (!e.target.value) onChange(null);
            }}
            className={`w-full pl-9 pr-10 py-3 rounded-xl border text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-purple-500
              ${disabled
                ? 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-100 cursor-text hover:border-purple-400'
              }`}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {value && (
              <button onClick={handleClear} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X className="w-4 h-4" />
              </button>
            )}
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
          </div>
        </div>
        <AnimatePresence>
          {open && !disabled && (
            <motion.ul
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-2xl max-h-60 overflow-y-auto"
            >
              {filtered.length === 0 ? (
                <li className="px-4 py-3 text-sm text-gray-400">No schemes found</li>
              ) : (
                filtered.map((opt) => (
                  <li
                    key={opt.schemeCode}
                    onClick={() => handleSelect(opt)}
                    className={`px-4 py-2.5 text-sm cursor-pointer transition-colors
                      ${value && value.schemeCode === opt.schemeCode
                        ? 'bg-purple-50 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 font-semibold'
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                  >
                    {opt.schemeName}
                  </li>
                ))
              )}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// ─── Date Input ────────────────────────────────────────────────────────────────

const DateInput = ({ label, value, onChange, min, max, icon: Icon }) => (
  <div className="mb-5">
    <div className="flex items-center gap-2 mb-2">
      {Icon && <Icon className="w-4 h-4 text-purple-500" />}
      <label className="text-gray-600 dark:text-gray-300 font-medium text-sm">{label}</label>
    </div>
    <input
      type="date"
      value={value}
      min={min}
      max={max}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-medium text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 hover:border-purple-400 transition-all"
    />
  </div>
);

// ─── Metric Card ──────────────────────────────────────────────────────────────

const MetricCard = ({ label, value, subValue, colorClass = 'text-gray-900 dark:text-white' }) => (
  <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
    <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider mb-2">{label}</p>
    <p className={`text-xl font-black ${colorClass} leading-tight`}>{value}</p>
    {subValue && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{subValue}</p>}
  </div>
);

// ─── Section Header ───────────────────────────────────────────────────────────

const SectionHeader = ({ children, accent }) => (
  <div className={`flex items-center gap-2 mb-4 pb-3 border-b ${accent} border-opacity-30`}>
    <h3 className="text-gray-700 dark:text-gray-200 font-bold text-base">{children}</h3>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

const STPPerformance = () => {
  // ── Shared scheme master ──
  const [allSchemes, setAllSchemes]               = useState([]);
  const [amcList, setAmcList]                     = useState([]);
  const [schemesFetchStatus, setSchemesFetchStatus] = useState('idle');

  // ── Source Fund ──
  const [sourceAmc, setSourceAmc]                 = useState('');
  const [sourceSchemes, setSourceSchemes]         = useState([]);
  const [sourceScheme, setSourceScheme]           = useState(null);

  // ── Destination Fund ──
  const [destScheme, setDestScheme]               = useState(null);

  // ── Inputs ──
  const today = useMemo(() => toDateInputValue(new Date()), []);
  const [initialAmount, setInitialAmount]         = useState(100000);
  const [transferAmount, setTransferAmount]       = useState(10000);
  const [investmentDate, setInvestmentDate]       = useState('2020-01-01');
  const [stpStartDate, setStpStartDate]           = useState('2020-02-01');
  const [stpEndDate, setStpEndDate]               = useState(today);

  // ── Fetch / Compute state ──
  const [navFetchStatus, setNavFetchStatus]       = useState('idle');
  const [calculating, setCalculating]             = useState(false);
  const [error, setError]                         = useState('');
  const [results, setResults]                     = useState(null);

  // ── Load all schemes on mount (shared cache — same as SIP Performance) ──
  useEffect(() => {
    const load = async () => {
      setSchemesFetchStatus('loading');
      try {
        const schemes = await fetchAllSchemes();
        setAllSchemes(schemes);
        setAmcList(extractAmcList(schemes));
        setSchemesFetchStatus('done');
      } catch {
        setSchemesFetchStatus('error');
        setError('Failed to load fund data. Please check your internet connection and refresh.');
      }
    };
    load();
  }, []);

  // ── Filter source schemes when source AMC changes ──
  useEffect(() => {
    if (sourceAmc && allSchemes.length > 0) {
      setSourceSchemes(filterSchemesByAmc(allSchemes, sourceAmc));
      setSourceScheme(null);
      setDestScheme(null);
      setResults(null);
      setError('');
    } else {
      setSourceSchemes([]);
    }
  }, [sourceAmc, allSchemes]);

  // ── Calculate ──────────────────────────────────────────────────────────────
  const handleCalculate = useCallback(async () => {
    // Validate
    if (!sourceScheme) { setError('Please select a Source Scheme.'); return; }
    if (!destScheme)   { setError('Please select a Destination Scheme.'); return; }
    if (sourceScheme.schemeCode === destScheme.schemeCode) {
      setError('Source and Destination schemes cannot be the same.'); return;
    }
    if (!investmentDate || !stpStartDate || !stpEndDate) {
      setError('Please fill in all dates.'); return;
    }
    if (new Date(stpStartDate) <= new Date(investmentDate)) {
      setError('STP Start Date must be after the Investment Date.'); return;
    }
    if (new Date(stpEndDate) < new Date(stpStartDate)) {
      setError('STP End Date must be on or after the STP Start Date.'); return;
    }
    if (initialAmount <= 0) { setError('Initial Amount must be greater than 0.'); return; }
    if (transferAmount <= 0) { setError('Monthly Transfer Amount must be greater than 0.'); return; }

    setError('');
    setResults(null);
    setNavFetchStatus('loading');

    try {
      // Fetch both NAV histories in parallel (both are cached individually)
      const [sourceData, destData] = await Promise.all([
        fetchSchemeNavHistory(sourceScheme.schemeCode),
        fetchSchemeNavHistory(destScheme.schemeCode),
      ]);
      setNavFetchStatus('done');
      setCalculating(true);

      const result = calculateSTPPerformance(
        initialAmount,
        transferAmount,
        new Date(investmentDate),
        new Date(stpStartDate),
        new Date(stpEndDate),
        sourceData.data,
        destData.data,
      );
      setResults(result);
    } catch (e) {
      setNavFetchStatus('error');
      setError(e.message || 'Calculation failed. Please try again.');
    } finally {
      setCalculating(false);
      setNavFetchStatus('idle');
    }
  }, [
    sourceScheme, destScheme,
    initialAmount, transferAmount,
    investmentDate, stpStartDate, stpEndDate,
  ]);

  const isLoading    = schemesFetchStatus === 'loading' || navFetchStatus === 'loading' || calculating;
  const canCalculate = !isLoading && !!sourceScheme && !!destScheme;

  // ── Derived display helpers ────────────────────────────────────────────────
  const sourceGain = results
    ? results.sourceCurrentValue - results.initialAmount
    : 0;
  const destGain = results
    ? results.destCurrentValue - results.totalTransferred
    : 0;

  return (
    <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

      {/* ── Page Header ── */}
      <div className="mb-10">
        <nav className="flex mb-4 text-sm font-medium text-gray-500 dark:text-gray-400">
          <ol className="flex items-center space-x-2">
            <li><a href="/" className="hover:text-purple-500">Calculators</a></li>
            <li><span>/</span></li>
            <li className="text-purple-600 dark:text-purple-400">STP Performance Calculator</li>
          </ol>
        </nav>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
          <ArrowRightLeft className="w-8 h-8 text-purple-500" />
          STP Performance Calculator
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Analyse actual historical STP returns using real mutual fund NAV data for both source and destination funds.
        </p>
      </div>

      {/* ── Schemes Loading Banner ── */}
      {schemesFetchStatus === 'loading' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center gap-3 px-5 py-4 bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/30 rounded-2xl text-purple-700 dark:text-purple-300 text-sm font-medium"
        >
          <Loader2 className="w-5 h-5 animate-spin flex-shrink-0" />
          Loading mutual fund data — this takes a few seconds only once…
        </motion.div>
      )}

      {/* ── Error Banner ── */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 flex items-center gap-3 px-5 py-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-2xl text-red-700 dark:text-red-300 text-sm font-medium"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* ════════════════════════════════════════════════════════════
            Inputs Panel
        ════════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-4 bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-2"
        >
          <h2 className="text-gray-700 dark:text-gray-200 font-bold text-lg mb-6 flex items-center gap-2">
            <Info className="w-5 h-5 text-purple-500" /> STP Details
          </h2>

          {/* Source Fund */}
          <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/20 mb-2">
            <p className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <TrendingDown className="w-3.5 h-3.5" /> Transfer From (Source Fund)
            </p>
            <SearchableDropdown
              label="Fund House (AMC)"
              value={sourceAmc}
              onChange={setSourceAmc}
              options={amcList}
              placeholder="Search AMC..."
              disabled={schemesFetchStatus !== 'done'}
              icon={Search}
            />
            <SchemeDropdown
              label="Source Scheme"
              value={sourceScheme}
              onChange={(s) => { setSourceScheme(s); setResults(null); setError(''); }}
              options={sourceSchemes}
              disabled={!sourceAmc || schemesFetchStatus !== 'done'}
            />
          </div>

          {/* Destination Fund */}
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 mb-2">
            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" /> Transfer To (Destination Fund)
            </p>
            <SchemeDropdown
              label="Destination Scheme (Same AMC)"
              value={destScheme}
              onChange={(s) => { setDestScheme(s); setResults(null); setError(''); }}
              options={sourceSchemes}
              disabled={!sourceAmc || schemesFetchStatus !== 'done'}
            />
          </div>

          {/* Amount Inputs */}
          <InputSlider
            label="Initial Investment (Source Fund)"
            value={initialAmount}
            onChange={setInitialAmount}
            min={1000}
            max={10000000}
            step={1000}
            icon={IndianRupee}
            prefix="₹"
          />
          <InputSlider
            label="Monthly Transfer Amount"
            value={transferAmount}
            onChange={setTransferAmount}
            min={500}
            max={500000}
            step={500}
            icon={IndianRupee}
            prefix="₹"
          />

          {/* Dates */}
          <DateInput
            label="Investment Date"
            value={investmentDate}
            onChange={setInvestmentDate}
            max={stpStartDate}
            icon={Calendar}
          />
          <DateInput
            label="STP Start Date"
            value={stpStartDate}
            onChange={setStpStartDate}
            min={investmentDate}
            max={stpEndDate}
            icon={Calendar}
          />
          <DateInput
            label="STP End Date"
            value={stpEndDate}
            onChange={setStpEndDate}
            min={stpStartDate}
            max={today}
            icon={Calendar}
          />

          {/* Calculate Button */}
          <button
            id="stp-calculate-btn"
            onClick={handleCalculate}
            disabled={!canCalculate}
            className={`w-full mt-4 flex items-center justify-center gap-3 py-4 rounded-2xl font-bold text-base transition-all duration-200
              ${!canCalculate
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-purple-500 hover:bg-purple-600 text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98]'
              }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {navFetchStatus === 'loading' ? 'Fetching NAV data…' : 'Calculating…'}
              </>
            ) : (
              <>
                <ArrowRightLeft className="w-5 h-5" />
                Calculate STP Performance
              </>
            )}
          </button>
        </motion.div>

        {/* ════════════════════════════════════════════════════════════
            Results Panel
        ════════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-8 space-y-8"
        >
          {/* Empty state */}
          {!results && !isLoading && (
            <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm p-16 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-purple-50 dark:bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6">
                <ArrowRightLeft className="w-10 h-10 text-purple-400" />
              </div>
              <h3 className="text-gray-800 dark:text-gray-100 font-bold text-xl mb-3">
                Ready to Analyse Your STP
              </h3>
              <p className="text-gray-400 dark:text-gray-500 text-sm max-w-sm leading-relaxed">
                Select your Source and Destination schemes, configure your STP details, and click{' '}
                <strong>"Calculate STP Performance"</strong> to see real historical returns.
              </p>
            </div>
          )}

          {/* Loading state */}
          {isLoading && (
            <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm p-16 flex flex-col items-center justify-center text-center">
              <Loader2 className="w-14 h-14 text-purple-400 animate-spin mb-6" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                {navFetchStatus === 'loading'
                  ? 'Fetching NAV history for both funds from MFAPI…'
                  : 'Running STP calculations…'}
              </p>
            </div>
          )}

          {/* Results */}
          <AnimatePresence>
            {results && !isLoading && (
              <motion.div
                key="stp-results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-8"
              >
                {/* ── Source Fund Cards ── */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
                  <SectionHeader accent="border-purple-300 dark:border-purple-600">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />
                      Source Fund — {sourceScheme?.schemeName}
                    </span>
                  </SectionHeader>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <MetricCard
                      label="Amount Invested"
                      value={formatCurrency(results.initialAmount)}
                      subValue={`Initial lump-sum`}
                    />
                    <MetricCard
                      label="Monthly Transfer"
                      value={formatCurrency(results.transferAmount)}
                      colorClass="text-purple-600 dark:text-purple-400"
                    />
                    <MetricCard
                      label="Total Transferred"
                      value={formatCurrency(results.totalTransferred)}
                      subValue={`${results.transferCount} transfers`}
                      colorClass="text-purple-600 dark:text-purple-400"
                    />
                    <MetricCard
                      label="Source Fund Balance"
                      value={formatCurrency(results.sourceCurrentValue)}
                      subValue={`${results.remainingSourceUnits.toFixed(4)} units × ${formatNav(results.sourceValuationNAV)}`}
                      colorClass="text-gray-900 dark:text-white"
                    />
                    <MetricCard
                      label="Transferred + Balance"
                      value={formatCurrency(results.totalTransferred + results.sourceCurrentValue)}
                      subValue="Total source outflow value"
                      colorClass={sourceGain >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}
                    />
                    <MetricCard
                      label="Source XIRR"
                      value={results.sourceXirr !== null ? `${results.sourceXirr.toFixed(2)}%` : 'N/A'}
                      subValue="Annualised return"
                      colorClass={
                        results.sourceXirr === null
                          ? 'text-gray-400'
                          : results.sourceXirr >= 0
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-red-500 dark:text-red-400'
                      }
                    />
                  </div>
                </div>

                {/* ── Destination Fund Cards ── */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
                  <SectionHeader accent="border-emerald-300 dark:border-emerald-600">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                      Destination Fund — {destScheme?.schemeName}
                    </span>
                  </SectionHeader>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <MetricCard
                      label="Installment Amount"
                      value={formatCurrency(results.transferAmount)}
                      subValue="Per transfer"
                    />
                    <MetricCard
                      label="Amount Transferred"
                      value={formatCurrency(results.totalTransferred)}
                      subValue={`${results.transferCount} months`}
                      colorClass="text-emerald-600 dark:text-emerald-400"
                    />
                    <MetricCard
                      label="Amount Invested"
                      value={formatCurrency(results.totalTransferred)}
                      subValue="Cost basis"
                      colorClass="text-gray-900 dark:text-white"
                    />
                    <MetricCard
                      label="Valuation On Maturity"
                      value={formatCurrency(results.destCurrentValue)}
                      subValue={`${results.destinationUnits.toFixed(4)} units × ${formatNav(results.destValuationNAV)}`}
                      colorClass="text-emerald-600 dark:text-emerald-400"
                    />
                    <MetricCard
                      label="Absolute Return"
                      value={`${results.destAbsoluteReturn >= 0 ? '+' : ''}${results.destAbsoluteReturn.toFixed(2)}%`}
                      subValue="On transferred amount"
                      colorClass={destGain >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}
                    />
                    <MetricCard
                      label="Destination XIRR"
                      value={results.destXirr !== null ? `${results.destXirr.toFixed(2)}%` : 'N/A'}
                      subValue="Annualised return"
                      colorClass={
                        results.destXirr === null
                          ? 'text-gray-400'
                          : results.destXirr >= 0
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-red-500 dark:text-red-400'
                      }
                    />
                  </div>
                </div>

                {/* ── Portfolio Summary ── */}
                <div className="bg-gradient-to-br from-purple-500/10 to-emerald-500/10 dark:from-purple-500/20 dark:to-emerald-500/20 p-6 rounded-3xl border border-purple-100 dark:border-purple-700/40 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider mb-1">Total Portfolio Value</p>
                      <p className="text-4xl font-black text-gray-900 dark:text-white">{formatCurrency(results.totalPortfolioValue)}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Source Balance + Destination Value</p>
                    </div>
                    <div className="flex gap-6">
                      <div className="text-center">
                        <p className="text-xs text-purple-500 font-semibold uppercase tracking-wider mb-1">Source Balance</p>
                        <p className="text-xl font-bold text-gray-800 dark:text-gray-100">{formatCurrency(results.sourceCurrentValue)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-emerald-500 font-semibold uppercase tracking-wider mb-1">Dest. Value</p>
                        <p className="text-xl font-bold text-gray-800 dark:text-gray-100">{formatCurrency(results.destCurrentValue)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Growth Chart ── */}
                <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
                  <h3 className="text-gray-700 dark:text-gray-200 font-bold mb-2">
                    Monthly Fund Values
                  </h3>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-6">Source Fund Value vs Destination Fund Value over each STP period</p>
                  <InvestmentChart
                    breakdown={results.chartData}
                    dataKeys={['sourceValue', 'destValue']}
                    dataLabels={['Source Fund Value', 'Destination Fund Value']}
                    stacked={false}
                    labelPrefix=""
                  />
                </div>

                {/* ── Transaction Table ── */}
                <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                  <h3 className="text-gray-700 dark:text-gray-200 font-bold mb-2">
                    Monthly STP Transaction Breakdown
                    <span className="ml-2 text-sm font-normal text-gray-400">
                      ({results.rows.length} transfers)
                    </span>
                  </h3>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-6">All values computed using actual historical NAV data.</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-gray-100 dark:border-gray-700">
                          {[
                            'Date',
                            'Transfer Amt',
                            'Source NAV',
                            'Redeemed Units',
                            'Rem. Source Units',
                            'Dest NAV',
                            'Purchased Units',
                            'Cum. Dest Units',
                            'Source Value',
                            'Dest Value',
                          ].map((h) => (
                            <th key={h} className="pb-3 pr-4 font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {results.rows.map((row, idx) => (
                          <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <td className="py-2.5 pr-4 font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">
                              {row.date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </td>
                            <td className="py-2.5 pr-4 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                              {formatCurrency(row.transferAmount)}
                            </td>
                            <td className="py-2.5 pr-4 text-purple-600 dark:text-purple-400 whitespace-nowrap">
                              ₹{row.sourceNAV.toFixed(4)}
                            </td>
                            <td className="py-2.5 pr-4 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                              {row.redeemedUnits.toFixed(4)}
                            </td>
                            <td className="py-2.5 pr-4 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                              {row.remainingSourceUnits.toFixed(4)}
                            </td>
                            <td className="py-2.5 pr-4 text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                              ₹{row.destinationNAV.toFixed(4)}
                            </td>
                            <td className="py-2.5 pr-4 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                              {row.purchasedUnits.toFixed(4)}
                            </td>
                            <td className="py-2.5 pr-4 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                              {row.cumulativeDestUnits.toFixed(4)}
                            </td>
                            <td className="py-2.5 pr-4 font-semibold text-purple-600 dark:text-purple-400 whitespace-nowrap">
                              {formatCurrency(row.sourceFundValue)}
                            </td>
                            <td className="py-2.5 font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                              {formatCurrency(row.destinationFundValue)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* ── Disclaimer ── */}
      <div className="mt-10 flex items-start gap-3 px-5 py-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-2xl">
        <Info className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
          <span className="font-semibold">Disclaimer:</span>{' '}
          This calculator is for informational and illustrative purposes only and does not constitute investment advice.
          Scheme performance shown is based on historical NAV data, and past performance may or may not be sustained in the future.
          Actual returns may vary depending on market conditions.
        </p>
      </div>
    </div>
  );
};

export default STPPerformance;
