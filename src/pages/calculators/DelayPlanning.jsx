import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, IndianRupee, Percent, Calendar, Share2, Info, Download } from 'lucide-react';
import InputSlider from '../../components/calculator/InputSlider';
import PieChart from '../../components/calculator/PieChart';
import InvestmentChart from '../../components/calculator/InvestmentChart';
import BreakdownTable from '../../components/calculator/BreakdownTable';
import { calculateDelayPlanning, getDelayBreakdown } from '../../utils/delayFormula';

const DelayPlanning = () => {
  const [monthlySIP, setMonthlySIP] = useState(5000);
  const [timePeriodYears, setTimePeriodYears] = useState(10);
  const [expectedReturn, setExpectedReturn] = useState(7);
  const [delayMonths, setDelayMonths] = useState(6);

  const [results, setResults] = useState({
    fvWithoutDelay: 0,
    fvWithDelay: 0,
    costOfDelay: 0,
    totalInvestedWithoutDelay: 0,
    totalInvestedWithDelay: 0,
  });
  const [breakdown, setBreakdown] = useState([]);

  useEffect(() => {
    const params = { monthlySIP, timePeriodYears, expectedReturn, delayMonths };
    setResults(calculateDelayPlanning(params));
    setBreakdown(getDelayBreakdown(params));
  }, [monthlySIP, timePeriodYears, expectedReturn, delayMonths]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const formatCrore = (val) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return formatCurrency(val);
  };

  return (
    <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-10">
        <nav className="flex mb-4 text-sm font-medium text-gray-500 dark:text-gray-400">
          <ol className="flex items-center space-x-2">
            <li><a href="/" className="hover:text-red-500">Calculators</a></li>
            <li><span>/</span></li>
            <li className="text-red-600 dark:text-red-400">Delay Planning Calculator</li>
          </ol>
        </nav>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
          <Clock className="w-8 h-8 text-red-500" />
          SIP Delay Calculator
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Calculate how much it costs you to delay your SIP investments.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Inputs Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-5 bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm"
        >
          <InputSlider
            label="Monthly SIP"
            value={monthlySIP}
            onChange={setMonthlySIP}
            min={500}
            max={1000000}
            step={500}
            icon={IndianRupee}
            prefix="₹"
          />
          <InputSlider
            label="Time Period"
            value={timePeriodYears}
            onChange={setTimePeriodYears}
            min={1}
            max={40}
            step={1}
            unit="Y"
            icon={Calendar}
          />
          <InputSlider
            label="Expected Return Rate (p.a)"
            value={expectedReturn}
            onChange={setExpectedReturn}
            min={1}
            max={30}
            step={0.1}
            unit="%"
            icon={Percent}
          />
          <InputSlider
            label="Delay in Starting SIP (Months)"
            value={delayMonths}
            onChange={setDelayMonths}
            min={1}
            max={120}
            step={1}
            unit="M"
            icon={Clock}
          />

          {/* Quick Summary */}
          <div className="mt-12 p-6 bg-red-50 dark:bg-red-500/10 rounded-2xl border border-red-100 dark:border-red-500/20">
            <h3 className="text-red-800 dark:text-red-400 font-bold mb-4 flex items-center gap-2">
              <Info className="w-4 h-4" />
              Impact of Delay
            </h3>
            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <span className="text-gray-600 dark:text-gray-400 font-medium text-sm">Total Invested Without Delay</span>
                <span className="text-gray-900 dark:text-white font-black text-xl">{formatCurrency(results.totalInvestedWithoutDelay)}</span>
              </div>
              <div className="h-px bg-red-200 dark:bg-red-500/20" />
              <div className="flex flex-col gap-1">
                <span className="text-gray-600 dark:text-gray-400 font-medium text-sm">Future Value without Delay</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-black text-xl">{formatCurrency(results.fvWithoutDelay)}</span>
              </div>
              <div className="h-px bg-red-200 dark:bg-red-500/20" />
              <div className="flex flex-col gap-1">
                <span className="text-gray-600 dark:text-gray-400 font-medium text-sm">Future Value after Delay</span>
                <span className="text-orange-600 dark:text-orange-400 font-black text-xl">{formatCurrency(results.fvWithDelay)}</span>
              </div>
              <div className="h-px bg-red-200 dark:bg-red-500/20" />
              <div className="flex flex-col gap-1">
                <span className="text-red-800 dark:text-red-200 font-bold">Cost of Delay in Future Value</span>
                <span className="text-red-600 dark:text-red-400 text-2xl font-black">{formatCurrency(results.costOfDelay)}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Visuals Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-7 space-y-8"
        >
          {/* Highlight Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-8 rounded-3xl text-white shadow-md">
              <p className="text-emerald-100 font-medium mb-1">Total Value (Without Delay)</p>
              <p className="text-4xl font-black">{formatCurrency(results.fvWithoutDelay)}</p>
              <p className="text-xs text-emerald-200 mt-2">If you start today</p>
            </div>

            <div className="bg-gradient-to-br from-red-500 to-orange-600 p-8 rounded-3xl text-white shadow-md">
              <p className="text-red-100 font-medium mb-1">Cost of Delay</p>
              <p className="text-4xl font-black">{formatCurrency(results.costOfDelay)}</p>
              <p className="text-xs text-red-200 mt-2">Loss due to waiting {delayMonths} months</p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col items-center">
              <h3 className="text-gray-700 dark:text-gray-200 font-bold mb-6 w-full">Impact of Delay</h3>
              <PieChart
                invested={results.fvWithDelay}
                returns={results.costOfDelay}
                labels={['FV With Delay', 'Cost of Delay']}
              />
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-center">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-3 h-12 bg-emerald-500 rounded-full" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">FV without Delay</p>
                    <p className="text-2xl font-black text-gray-800 dark:text-gray-100">{formatCrore(results.fvWithoutDelay)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-3 h-12 bg-red-500 rounded-full" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Cost of Delay</p>
                    <p className="text-2xl font-black text-gray-800 dark:text-gray-100">{formatCrore(results.costOfDelay)}</p>
                  </div>
                </div>
                <button className="w-full mt-4 flex items-center justify-center gap-2 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-bold hover:scale-[1.02] transition-transform">
                  <Download className="w-5 h-5" />
                  Download Report
                </button>
              </div>
            </div>
          </div>

          {/* Growth Chart */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-gray-700 dark:text-gray-200 font-bold">Growth Comparison</h3>
              <div className="flex gap-2">
                <button className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:text-red-500 transition-colors"><Share2 className="w-5 h-5" /></button>
              </div>
            </div>
            <InvestmentChart breakdown={breakdown.map(b => ({
              year: b.year,
              value: b.valueWithoutDelay,
              invested: b.investedWithoutDelay,
              returns: b.valueWithoutDelay - b.investedWithoutDelay
            }))} />
          </div>

          {/* Breakdown Table */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
            <h3 className="text-gray-700 dark:text-gray-200 font-bold mb-6">Yearly Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    <th className="pb-4 font-semibold text-gray-500 dark:text-gray-400">Year</th>
                    <th className="pb-4 font-semibold text-gray-500 dark:text-gray-400">FV Without Delay</th>
                    <th className="pb-4 font-semibold text-gray-500 dark:text-gray-400">FV With Delay</th>
                    <th className="pb-4 font-semibold text-gray-500 dark:text-gray-400">Difference (Loss)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {breakdown
                    .filter((_, i) => i === 0 || (i + 1) % 5 === 0 || i === breakdown.length - 1)
                    .map((row) => (
                      <tr key={row.year} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="py-4 font-medium text-gray-900 dark:text-gray-100">{row.year}</td>
                        <td className="py-4 text-emerald-600 dark:text-emerald-400">{formatCrore(row.valueWithoutDelay)}</td>
                        <td className="py-4 text-orange-600 dark:text-orange-400">{formatCrore(row.valueWithDelay)}</td>
                        <td className="py-4 font-bold text-red-600 dark:text-red-400">{formatCrore(row.costOfDelay)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DelayPlanning;
