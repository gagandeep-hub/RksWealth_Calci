import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HandCoins, IndianRupee, Percent, Calendar, Download, Share2, Info } from 'lucide-react';
import InputSlider from '../../components/calculator/InputSlider';
import PieChart from '../../components/calculator/PieChart';
import InvestmentChart from '../../components/calculator/InvestmentChart';
import { calculateSWP, getSwpBreakdown } from '../../utils/swpFormula';

const SWP = () => {
  const [investment, setInvestment] = useState(10000);
  const [withdrawal, setWithdrawal] = useState(500);
  const [years, setYears] = useState(5);
  const [rate, setRate] = useState(5);

  const [results, setResults] = useState({ totalInvestment: 0, totalWithdrawal: 0, totalGrowth: 0, currentValue: 0 });
  const [breakdown, setBreakdown] = useState([]);

  useEffect(() => {
    const res = calculateSWP(investment, withdrawal, rate, years);
    setResults(res);
    setBreakdown(getSwpBreakdown(investment, withdrawal, rate, years));
  }, [investment, withdrawal, rate, years]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-10">
        <nav className="flex mb-4 text-sm font-medium text-gray-500 dark:text-gray-400">
          <ol className="flex items-center space-x-2">
            <li><a href="/" className="hover:text-emerald-500">Calculators</a></li>
            <li><span>/</span></li>
            <li className="text-blue-600 dark:text-blue-400">SWP Calculator</li>
          </ol>
        </nav>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
          <HandCoins className="w-8 h-8 text-blue-500" />
          SWP Calculator
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Calculate your monthly withdrawals and see how long your investment will last.
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
            label="Lumpsum Invested Amount"
            value={investment}
            onChange={setInvestment}
            min={1000}
            max={10000000}
            step={1000}
            icon={IndianRupee}
            prefix="₹"
          />
          <InputSlider
            label="SWP Withdrawal Amount"
            value={withdrawal}
            onChange={setWithdrawal}
            min={500}
            max={1000000}
            step={500}
            icon={IndianRupee}
            prefix="₹"
          />
          <InputSlider
            label="For a period of"
            value={years}
            onChange={setYears}
            min={1}
            max={40}
            step={1}
            unit="Years"
            icon={Calendar}
          />
          <InputSlider
            label="Expected Rate of Return"
            value={rate}
            onChange={setRate}
            min={1}
            max={30}
            step={0.1}
            unit="%"
            icon={Percent}
          />

          <div className="mt-12 p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <span className="text-gray-900 dark:text-gray-100 font-medium">Total Investment</span>
                <span className="text-gray-900 dark:text-white font-black text-xl">{formatCurrency(results.totalInvestment)}</span>
              </div>
              <div className="h-px bg-gray-100 dark:bg-gray-700" />
              <div className="flex flex-col gap-1">
                <span className="text-gray-900 dark:text-gray-100 font-medium">Total Withdrawal</span>
                <span className="text-gray-900 dark:text-white font-black text-xl">{formatCurrency(results.totalWithdrawal)}</span>
              </div>
              <div className="h-px bg-gray-100 dark:bg-gray-700" />
              <div className="flex flex-col gap-1">
                <span className="text-gray-900 dark:text-gray-100 font-medium">Total Growth</span>
                <span className="text-gray-900 dark:text-white font-black text-xl">{formatCurrency(results.totalGrowth)}</span>
              </div>
              <div className="h-px bg-gray-100 dark:bg-gray-700" />
              <div className="flex flex-col gap-1">
                <span className="text-gray-900 dark:text-gray-100 font-medium">Current Value</span>
                <span className="text-gray-900 dark:text-white font-black text-xl">{formatCurrency(results.currentValue)}</span>
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
          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col items-center">
              <h3 className="text-gray-700 dark:text-gray-200 font-bold mb-6 w-full">Investment Distribution</h3>
              <PieChart 
                invested={results.currentValue} 
                returns={results.totalWithdrawal} 
                labels={['Current Value', 'Total Withdrawn']}
              />
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-center">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-3 h-12 bg-emerald-500 rounded-full" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Current Value</p>
                    <p className="text-2xl font-black text-gray-800 dark:text-gray-100">{formatCurrency(results.currentValue)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-3 h-12 bg-blue-500 rounded-full" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Withdrawn</p>
                    <p className="text-2xl font-black text-gray-800 dark:text-gray-100">{formatCurrency(results.totalWithdrawal)}</p>
                  </div>
                </div>
                <button className="w-full mt-4 flex items-center justify-center gap-2 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-bold hover:scale-[1.02] transition-transform">
                  <Download className="w-5 h-5" />
                  Download Detailed Report
                </button>
              </div>
            </div>
          </div>

          {/* Growth Chart */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-gray-700 dark:text-gray-200 font-bold">Withdrawal Projections</h3>
              <div className="flex gap-2">
                <button className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:text-blue-500 transition-colors"><Share2 className="w-5 h-5" /></button>
              </div>
            </div>
            <InvestmentChart 
              breakdown={breakdown} 
              dataKeys={['value', 'withdrawn']}
              dataLabels={['Remaining Balance', 'Total Withdrawn']}
            />
          </div>

          {/* Breakdown Table */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
            <h3 className="text-gray-700 dark:text-gray-200 font-bold mb-6">Yearly Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    <th className="pb-4 font-semibold text-gray-500 dark:text-gray-400">Year</th>
                    <th className="pb-4 font-semibold text-gray-500 dark:text-gray-400">Total Withdrawn</th>
                    <th className="pb-4 font-semibold text-gray-500 dark:text-gray-400">Total Growth</th>
                    <th className="pb-4 font-semibold text-gray-500 dark:text-gray-400">Remaining Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {breakdown.filter((_, i) => i === 0 || (i + 1) % 5 === 0 || i === breakdown.length - 1).map((row) => (
                    <tr key={row.year} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="py-4 font-medium text-gray-900 dark:text-gray-100">Year {row.year}</td>
                      <td className="py-4 text-gray-600 dark:text-gray-400">{formatCurrency(row.withdrawn)}</td>
                      <td className="py-4 text-emerald-600 dark:text-emerald-400 font-medium">+{formatCurrency(row.returns)}</td>
                      <td className="py-4 font-bold text-gray-900 dark:text-gray-100">{formatCurrency(row.value)}</td>
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

export default SWP;
