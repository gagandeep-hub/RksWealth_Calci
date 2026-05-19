import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sunset, User, Calendar, IndianRupee, Percent, TrendingUp, Download, Share2, Info } from 'lucide-react';
import InputSlider from '../../components/calculator/InputSlider';
import PieChart from '../../components/calculator/PieChart';
import InvestmentChart from '../../components/calculator/InvestmentChart';
import { calculateRetirement, getRetirementBreakdown } from '../../utils/retirementFormula';

const Retirement = () => {
  const [currentAge, setCurrentAge] = useState(30);
  const [retirementAge, setRetirementAge] = useState(60);
  const [lifeExpectancy, setLifeExpectancy] = useState(85);
  const [currentMonthlyExpenses, setCurrentMonthlyExpenses] = useState(40000);
  const [inflationRate, setInflationRate] = useState(7);
  const [preRetirementReturn, setPreRetirementReturn] = useState(14);
  const [postRetirementReturn, setPostRetirementReturn] = useState(7);

  const [results, setResults] = useState({
    monthlyExpensesAtRetirement: 0,
    corpusNeeded: 0,
    monthlySIP: 0,
    lumpsum: 0,
    totalInvested: 0,
    wealthGained: 0,
    yearsToRetirement: 0,
    postRetirementYears: 0,
  });
  const [breakdown, setBreakdown] = useState([]);

  const params = {
    currentAge, retirementAge, lifeExpectancy,
    currentMonthlyExpenses, inflationRate,
    preRetirementReturn, postRetirementReturn,
  };

  useEffect(() => {
    if (retirementAge <= currentAge || lifeExpectancy <= retirementAge) return;
    setResults(calculateRetirement(params));
    setBreakdown(getRetirementBreakdown(params));
  }, [currentAge, retirementAge, lifeExpectancy, currentMonthlyExpenses, inflationRate, preRetirementReturn, postRetirementReturn]);

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

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
            <li><a href="/" className="hover:text-emerald-500">Calculators</a></li>
            <li><span>/</span></li>
            <li className="text-blue-600 dark:text-blue-400">Retirement Calculator</li>
          </ol>
        </nav>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
          <Sunset className="w-8 h-8 text-orange-500" />
          Retirement Calculator
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Plan your retirement corpus and find out how much you need to invest monthly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Inputs */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-5 bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm"
        >
          <InputSlider label="Current Age" value={currentAge} onChange={setCurrentAge} min={18} max={70} step={1} unit="Y" icon={User} />
          <InputSlider label="Retirement Age" value={retirementAge} onChange={setRetirementAge} min={40} max={80} step={1} unit="Y" icon={Calendar} />
          <InputSlider label="Life Expectancy" value={lifeExpectancy} onChange={setLifeExpectancy} min={50} max={100} step={1} unit="Y" icon={Calendar} />
          <InputSlider label="Current Monthly Expenses" value={currentMonthlyExpenses} onChange={setCurrentMonthlyExpenses} min={5000} max={500000} step={1000} icon={IndianRupee} prefix="₹" />
          <InputSlider label="Inflation Rate" value={inflationRate} onChange={setInflationRate} min={1} max={15} step={0.1} unit="%" icon={Percent} />
          <InputSlider label="Expected Return Pre-Retirement" value={preRetirementReturn} onChange={setPreRetirementReturn} min={1} max={30} step={0.1} unit="%" icon={TrendingUp} />
          <InputSlider label="Expected Return Post-Retirement" value={postRetirementReturn} onChange={setPostRetirementReturn} min={1} max={20} step={0.1} unit="%" icon={TrendingUp} />

          {/* Quick Summary */}
          <div className="mt-10 p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <span className="text-gray-600 dark:text-gray-400 font-medium text-sm">Future Monthly Expenses</span>
                <span className="text-gray-900 dark:text-white font-black text-xl">{formatCurrency(results.monthlyExpensesAtRetirement)}</span>
              </div>
              <div className="h-px bg-gray-100 dark:bg-gray-700" />
              <div className="flex flex-col gap-1">
                <span className="text-gray-600 dark:text-gray-400 font-medium text-sm">Required Corpus At Retirement</span>
                <span className="text-orange-600 dark:text-orange-400 font-black text-2xl">{formatCurrency(results.corpusNeeded)}</span>
              </div>
              <div className="h-px bg-gray-100 dark:bg-gray-700" />
              <div className="flex flex-col gap-1">
                <span className="text-gray-600 dark:text-gray-400 font-medium text-sm">Planning Through SIP</span>
                <span className="text-blue-600 dark:text-blue-400 font-black text-xl">{formatCurrency(results.monthlySIP)}</span>
              </div>
              <div className="h-px bg-gray-100 dark:bg-gray-700" />
              <div className="flex flex-col gap-1">
                <span className="text-gray-600 dark:text-gray-400 font-medium text-sm">Planning Through Lump Sum</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-black text-xl">{formatCurrency(results.lumpsum)}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Visuals */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-7 space-y-8"
        >
          {/* Planning Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-8 rounded-3xl text-white shadow-md">
              <p className="text-blue-100 font-medium mb-1">Planning Through SIP</p>
              <p className="text-4xl font-black">{formatCurrency(results.monthlySIP)}</p>
              <p className="text-xs text-blue-200 mt-2">Monthly investment for {results.yearsToRetirement} years</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-8 rounded-3xl text-white shadow-md">
              <p className="text-emerald-100 font-medium mb-1">Planning Through Lump Sum</p>
              <p className="text-4xl font-black">{formatCurrency(results.lumpsum)}</p>
              <p className="text-xs text-emerald-200 mt-2">One-time investment today</p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col items-center">
              <h3 className="text-gray-700 dark:text-gray-200 font-bold mb-6 w-full">Corpus Breakdown</h3>
              <PieChart
                invested={results.totalInvested}
                returns={results.wealthGained}
                labels={['Total Invested', 'Wealth Gained']}
              />
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-center">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-3 h-12 bg-emerald-500 rounded-full" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Invested</p>
                    <p className="text-2xl font-black text-gray-800 dark:text-gray-100">{formatCrore(results.totalInvested)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-3 h-12 bg-orange-500 rounded-full" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Wealth Gained</p>
                    <p className="text-2xl font-black text-gray-800 dark:text-gray-100">{formatCrore(results.wealthGained)}</p>
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
              <h3 className="text-gray-700 dark:text-gray-200 font-bold">Corpus Growth Projection</h3>
              <button className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:text-blue-500 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
            <InvestmentChart breakdown={breakdown} />
          </div>

          {/* Breakdown Table */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
            <h3 className="text-gray-700 dark:text-gray-200 font-bold mb-6">Yearly Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    <th className="pb-4 font-semibold text-gray-500 dark:text-gray-400">Age</th>
                    <th className="pb-4 font-semibold text-gray-500 dark:text-gray-400">Invested</th>
                    <th className="pb-4 font-semibold text-gray-500 dark:text-gray-400">Returns</th>
                    <th className="pb-4 font-semibold text-gray-500 dark:text-gray-400">Corpus Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {breakdown
                    .filter((_, i) => i === 0 || (i + 1) % 5 === 0 || i === breakdown.length - 1)
                    .map((row) => (
                      <tr key={row.year} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="py-4 font-medium text-gray-900 dark:text-gray-100">{row.year} yrs</td>
                        <td className="py-4 text-gray-600 dark:text-gray-400">{formatCrore(row.invested)}</td>
                        <td className="py-4 text-emerald-600 dark:text-emerald-400 font-medium">+{formatCrore(row.returns)}</td>
                        <td className="py-4 font-bold text-gray-900 dark:text-gray-100">{formatCrore(row.value)}</td>
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

export default Retirement;
