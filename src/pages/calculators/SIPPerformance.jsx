import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award, IndianRupee, Calendar, Info, TrendingUp, TrendingDown,
  AlertCircle, Loader2, ChevronDown, X, Search, BarChart2
} from 'lucide-react';
import InputSlider from '../../components/calculator/InputSlider';
import PieChart from '../../components/calculator/PieChart';
import InvestmentChart from '../../components/calculator/InvestmentChart';
import {
  fetchAllSchemes,
  fetchSchemeNavHistory,
  extractAmcList,
  filterSchemesByAmc,
} from '../../utils/mfApiService';
import { calculateSIPPerformance } from '../../utils/sipPerformanceFormula';

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

// ─── Searchable Dropdown ──────────────────────────────────────────────────────

const SearchableDropdown = ({ label, value, onChange, options, placeholder, disabled, icon: Icon }) => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  // Sync display text when external value changes
  useEffect(() => {
    if (!value) setQuery('');
    else setQuery(value);
  }, [value]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
        // If nothing selected, reset query
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

  const handleSelect = (opt) => {
    onChange(opt);
    setQuery(opt);
    setOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
    setQuery('');
    setOpen(false);
  };

  return (
    <div className="mb-6" ref={wrapperRef}>
      <div className="flex items-center gap-2 mb-2">
        {Icon && <Icon className="w-5 h-5 text-cyan-500" />}
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
            className={`w-full pl-9 pr-10 py-3 rounded-xl border text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500
              ${disabled
                ? 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-100 cursor-text hover:border-cyan-400'
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
                        ? 'bg-cyan-50 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 font-semibold'
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

// ─── Scheme Dropdown (object-based) ──────────────────────────────────────────

const SchemeDropdown = ({ value, onChange, options, disabled }) => {
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

  const handleSelect = (opt) => {
    onChange(opt);
    setQuery(opt.schemeName);
    setOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange(null);
    setQuery('');
    setOpen(false);
  };

  return (
    <div className="mb-6" ref={wrapperRef}>
      <div className="flex items-center gap-2 mb-2">
        <BarChart2 className="w-5 h-5 text-cyan-500" />
        <label className="text-gray-600 dark:text-gray-300 font-medium text-sm">Scheme</label>
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
            className={`w-full pl-9 pr-10 py-3 rounded-xl border text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500
              ${disabled
                ? 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-100 cursor-text hover:border-cyan-400'
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
                        ? 'bg-cyan-50 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 font-semibold'
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

// ─── Date Input ───────────────────────────────────────────────────────────────

const DateInput = ({ label, value, onChange, min, max, icon: Icon }) => (
  <div className="mb-6">
    <div className="flex items-center gap-2 mb-2">
      {Icon && <Icon className="w-5 h-5 text-cyan-500" />}
      <label className="text-gray-600 dark:text-gray-300 font-medium text-sm">{label}</label>
    </div>
    <input
      type="date"
      value={value}
      min={min}
      max={max}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-medium text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 hover:border-cyan-400 transition-all"
    />
  </div>
);

// ─── Result Metric Card ───────────────────────────────────────────────────────

const MetricCard = ({ label, value, subValue, colorClass = 'text-gray-900 dark:text-white', bgClass = '' }) => (
  <div className={`bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm ${bgClass}`}>
    <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider mb-2">{label}</p>
    <p className={`text-xl font-black ${colorClass} leading-tight`}>{value}</p>
    {subValue && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{subValue}</p>}
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

const SIPPerformance = () => {
  // State: Scheme Selection
  const [allSchemes, setAllSchemes] = useState([]);
  const [amcList, setAmcList] = useState([]);
  const [selectedAmc, setSelectedAmc] = useState('');
  const [filteredSchemes, setFilteredSchemes] = useState([]);
  const [selectedScheme, setSelectedScheme] = useState(null);

  // State: Inputs
  const [monthlyAmount, setMonthlyAmount] = useState(5000);
  const [sipStartDate, setSipStartDate] = useState('2020-01-01');
  const [sipEndDate, setSipEndDate] = useState('2024-12-01');
  const [valuationDate, setValuationDate] = useState(toDateInputValue(new Date()));

  // State: Fetch / Compute
  const [schemesFetchStatus, setSchemesFetchStatus] = useState('idle'); // idle | loading | done | error
  const [navFetchStatus, setNavFetchStatus] = useState('idle');
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState(null);

  // ── Step 1: Load all schemes on mount ──
  useEffect(() => {
    const load = async () => {
      setSchemesFetchStatus('loading');
      try {
        const schemes = await fetchAllSchemes();
        setAllSchemes(schemes);
        setAmcList(extractAmcList(schemes));
        setSchemesFetchStatus('done');
      } catch (e) {
        setSchemesFetchStatus('error');
        setError('Failed to load fund data. Please check your internet connection and refresh.');
      }
    };
    load();
  }, []);

  // ── Step 2: Filter schemes when AMC changes ──
  useEffect(() => {
    if (selectedAmc && allSchemes.length > 0) {
      setFilteredSchemes(filterSchemesByAmc(allSchemes, selectedAmc));
      setSelectedScheme(null);
      setResults(null);
      setError('');
    } else {
      setFilteredSchemes([]);
    }
  }, [selectedAmc, allSchemes]);

  // ── Step 3: Calculate when scheme and inputs are ready ──
  const handleCalculate = useCallback(async () => {
    if (!selectedScheme) {
      setError('Please select a scheme to calculate.');
      return;
    }
    if (!sipStartDate || !sipEndDate || !valuationDate) {
      setError('Please select all three dates.');
      return;
    }
    if (new Date(sipStartDate) >= new Date(sipEndDate)) {
      setError('SIP Start Date must be before SIP End Date.');
      return;
    }
    if (new Date(valuationDate) < new Date(sipStartDate)) {
      setError('Valuation Date must be on or after the SIP Start Date.');
      return;
    }

    setError('');
    setNavFetchStatus('loading');
    setResults(null);

    try {
      const schemeData = await fetchSchemeNavHistory(selectedScheme.schemeCode);
      setNavFetchStatus('done');
      setCalculating(true);

      const result = calculateSIPPerformance(
        monthlyAmount,
        new Date(sipStartDate),
        new Date(sipEndDate),
        new Date(valuationDate),
        schemeData.data,
      );
      setResults(result);
    } catch (e) {
      setNavFetchStatus('error');
      setError(e.message || 'Calculation failed. Please try again.');
    } finally {
      setCalculating(false);
      setNavFetchStatus('idle');
    }
  }, [selectedScheme, sipStartDate, sipEndDate, valuationDate, monthlyAmount]);

  const isLoading = schemesFetchStatus === 'loading' || navFetchStatus === 'loading' || calculating;
  const isProfitable = results ? results.profitLoss >= 0 : true;

  return (
    <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-10">
        <nav className="flex mb-4 text-sm font-medium text-gray-500 dark:text-gray-400">
          <ol className="flex items-center space-x-2">
            <li><a href="/" className="hover:text-cyan-500">Calculators</a></li>
            <li><span>/</span></li>
            <li className="text-cyan-600 dark:text-cyan-400">SIP Performance Calculator</li>
          </ol>
        </nav>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
          <Award className="w-8 h-8 text-cyan-500" />
          SIP Performance Calculator
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Calculate your actual historical SIP returns using real mutual fund NAV data.
        </p>
      </div>

      {/* Schemes Loading Banner */}
      {schemesFetchStatus === 'loading' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center gap-3 px-5 py-4 bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/30 rounded-2xl text-cyan-700 dark:text-cyan-300 text-sm font-medium"
        >
          <Loader2 className="w-5 h-5 animate-spin flex-shrink-0" />
          Loading mutual fund data (≈45,000 schemes) — this takes a few seconds only once…
        </motion.div>
      )}

      {/* Error Banner */}
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
        {/* ── Inputs Panel ── */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-4 bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm"
        >
          <h2 className="text-gray-700 dark:text-gray-200 font-bold text-lg mb-6 flex items-center gap-2">
            <Info className="w-5 h-5 text-cyan-500" /> Investment Details
          </h2>

          {/* AMC Selector */}
          <SearchableDropdown
            label="Fund House (AMC)"
            value={selectedAmc}
            onChange={setSelectedAmc}
            options={amcList}
            placeholder="Search AMC..."
            disabled={schemesFetchStatus !== 'done'}
            icon={Search}
          />

          {/* Scheme Selector */}
          <SchemeDropdown
            value={selectedScheme}
            onChange={(s) => { setSelectedScheme(s); setResults(null); setError(''); }}
            options={filteredSchemes}
            disabled={!selectedAmc || schemesFetchStatus !== 'done'}
          />

          {/* Monthly SIP Amount */}
          <InputSlider
            label="Monthly SIP Amount"
            value={monthlyAmount}
            onChange={setMonthlyAmount}
            min={500}
            max={500000}
            step={500}
            icon={IndianRupee}
            prefix="₹"
          />

          {/* Date Pickers */}
          <DateInput
            label="SIP Start Date"
            value={sipStartDate}
            onChange={setSipStartDate}
            max={sipEndDate}
            icon={Calendar}
          />
          <DateInput
            label="SIP End Date"
            value={sipEndDate}
            onChange={setSipEndDate}
            min={sipStartDate}
            max={toDateInputValue(new Date())}
            icon={Calendar}
          />
          <DateInput
            label="Valuation As On Date"
            value={valuationDate}
            onChange={setValuationDate}
            min={sipStartDate}
            max={toDateInputValue(new Date())}
            icon={Calendar}
          />

          {/* Calculate Button */}
          <button
            onClick={handleCalculate}
            disabled={!selectedScheme || isLoading}
            className={`w-full mt-4 flex items-center justify-center gap-3 py-4 rounded-2xl font-bold text-base transition-all duration-200
              ${!selectedScheme || isLoading
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-cyan-500 hover:bg-cyan-600 text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-[0.98]'
              }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {navFetchStatus === 'loading' ? 'Fetching NAV data…' : 'Calculating…'}
              </>
            ) : (
              <>
                <Award className="w-5 h-5" />
                Calculate Performance
              </>
            )}
          </button>
        </motion.div>

        {/* ── Results Panel ── */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-8 space-y-8"
        >
          {/* Placeholder when no results */}
          {!results && !isLoading && (
            <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm p-16 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-cyan-50 dark:bg-cyan-500/10 rounded-2xl flex items-center justify-center mb-6">
                <Award className="w-10 h-10 text-cyan-400" />
              </div>
              <h3 className="text-gray-800 dark:text-gray-100 font-bold text-xl mb-3">
                Ready to Analyse Your SIP
              </h3>
              <p className="text-gray-400 dark:text-gray-500 text-sm max-w-sm leading-relaxed">
                Select your Fund House and Scheme, set your SIP details, and click <strong>"Calculate Performance"</strong> to see real historical returns.
              </p>
            </div>
          )}

          {/* Loading Spinner */}
          {isLoading && (
            <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm p-16 flex flex-col items-center justify-center text-center">
              <Loader2 className="w-14 h-14 text-cyan-400 animate-spin mb-6" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                {navFetchStatus === 'loading' ? 'Fetching NAV history from MFAPI…' : 'Running calculations…'}
              </p>
            </div>
          )}

          {/* Results */}
          <AnimatePresence>
            {results && !isLoading && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-8"
              >
                {/* Metric Cards Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <MetricCard
                    label="Amount Invested"
                    value={formatCurrency(results.totalInvested)}
                    subValue={`${results.installmentCount} installments`}
                    colorClass="text-gray-900 dark:text-white"
                  />
                  <MetricCard
                    label="Current Value"
                    value={formatCurrency(results.currentValue)}
                    subValue={`${results.cumulativeUnits.toFixed(4)} units`}
                    colorClass="text-cyan-600 dark:text-cyan-400"
                  />
                  <MetricCard
                    label="Profit / Loss"
                    value={`${isProfitable ? '+' : ''}${formatCurrency(results.profitLoss)}`}
                    subValue={`${results.absoluteReturn.toFixed(2)}% Absolute`}
                    colorClass={isProfitable ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}
                  />
                  <MetricCard
                    label="XIRR"
                    value={results.xirr !== null ? `${results.xirr.toFixed(2)}%` : 'N/A'}
                    subValue="Annualised return"
                    colorClass={
                      results.xirr === null
                        ? 'text-gray-400'
                        : results.xirr >= 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-red-500 dark:text-red-400'
                    }
                  />
                </div>

                {/* Second Metrics Row */}
                <div className="grid grid-cols-3 gap-4">
                  <MetricCard
                    label="Monthly SIP"
                    value={formatCurrency(monthlyAmount)}
                    colorClass="text-gray-900 dark:text-white"
                  />
                  <MetricCard
                    label="Current NAV"
                    value={formatNav(results.currentNav)}
                    subValue={`As on ${results.valuationDate.toLocaleDateString('en-IN')}`}
                    colorClass="text-gray-900 dark:text-white"
                  />
                  <MetricCard
                    label="Absolute Return"
                    value={`${results.absoluteReturn >= 0 ? '+' : ''}${results.absoluteReturn.toFixed(2)}%`}
                    colorClass={isProfitable ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}
                  />
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Doughnut / Pie Chart */}
                  <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col items-center">
                    <h3 className="text-gray-700 dark:text-gray-200 font-bold mb-6 w-full">
                      Investment Distribution
                    </h3>
                    <PieChart
                      invested={results.totalInvested}
                      returns={Math.abs(results.profitLoss)}
                      labels={['Amount Invested', isProfitable ? 'Profit' : 'Loss']}
                      totalValueOverride={results.currentValue}
                    />
                  </div>

                  {/* Summary Stats */}
                  <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-center">
                    <div className="space-y-5">
                      <div className="flex items-center gap-4">
                        <div className="w-3 h-14 bg-cyan-500 rounded-full flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Investment</p>
                          <p className="text-2xl font-black text-gray-800 dark:text-gray-100">
                            {formatCurrency(results.totalInvested)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-14 rounded-full flex-shrink-0 ${isProfitable ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Portfolio Value</p>
                          <p className={`text-2xl font-black ${isProfitable ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                            {formatCurrency(results.currentValue)}
                          </p>
                        </div>
                      </div>
                      <div className="pt-2 flex items-center gap-3">
                        {isProfitable
                          ? <TrendingUp className="w-5 h-5 text-emerald-500" />
                          : <TrendingDown className="w-5 h-5 text-red-500" />
                        }
                        <span className={`font-bold ${isProfitable ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                          {isProfitable ? 'Gain' : 'Loss'} of {formatCurrency(Math.abs(results.profitLoss))}
                          {' '}({results.absoluteReturn >= 0 ? '+' : ''}{results.absoluteReturn.toFixed(2)}%)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Growth Chart */}
                <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
                  <h3 className="text-gray-700 dark:text-gray-200 font-bold mb-8">
                    Year-wise: Invested vs Portfolio Value
                  </h3>
                  <InvestmentChart
                    breakdown={results.chartBreakdown}
                    dataKeys={['invested', 'returns']}
                    dataLabels={['Amount Invested', isProfitable ? 'Returns' : 'Loss']}
                    stacked={true}
                    labelPrefix=""
                  />
                </div>

                {/* Installment Table */}
                <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                  <h3 className="text-gray-700 dark:text-gray-200 font-bold mb-6">
                    Installment Breakdown
                    <span className="ml-2 text-sm font-normal text-gray-400">
                      ({results.installments.length} installments)
                    </span>
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-gray-100 dark:border-gray-700">
                          {['Date', 'Amount', 'NAV', 'Units', 'Cum. Units', 'Cum. Invested', 'Valuation'].map((h) => (
                            <th key={h} className="pb-4 pr-4 font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {results.installments.map((row, idx) => (
                          <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <td className="py-3 pr-4 font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">
                              {row.date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </td>
                            <td className="py-3 pr-4 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                              {formatCurrency(row.amount)}
                            </td>
                            <td className="py-3 pr-4 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                              ₹{row.nav.toFixed(4)}
                            </td>
                            <td className="py-3 pr-4 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                              {row.units.toFixed(4)}
                            </td>
                            <td className="py-3 pr-4 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                              {row.cumulativeUnits.toFixed(4)}
                            </td>
                            <td className="py-3 pr-4 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                              {formatCurrency(row.cumulativeInvested)}
                            </td>
                            <td className={`py-3 font-bold whitespace-nowrap ${row.valuation >= row.cumulativeInvested ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                              {formatCurrency(row.valuation)}
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
    </div>
  );
};

export default SIPPerformance;
