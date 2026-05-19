import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, IndianRupee, Percent, Calendar, Download, Share2, Info } from 'lucide-react';
import InputSlider from '../../components/calculator/InputSlider';
import PieChart from '../../components/calculator/PieChart';
import InvestmentChart from '../../components/calculator/InvestmentChart';
import BreakdownTable from '../../components/calculator/BreakdownTable';
import { calculateSIP, getSIPBreakdown } from '../../utils/sipFormula';

const SIP = () => {
  const [monthlyInvestment, setMonthlyInvestment] = useState(25000);
  const [annualRate, setAnnualRate] = useState(12);
  const [years, setYears] = useState(10);
  const [results, setResults] = useState({ totalValue: 0, totalInvested: 0, totalReturns: 0 });
  const [breakdown, setBreakdown] = useState([]);

  useEffect(() => {
    const res = calculateSIP(monthlyInvestment, annualRate, years);
    setResults(res);
    setBreakdown(getSIPBreakdown(monthlyInvestment, annualRate, years));
  }, [monthlyInvestment, annualRate, years]);

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
            <li className="text-emerald-600 dark:text-emerald-400">SIP Calculator</li>
          </ol>
        </nav>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-emerald-500" />
          SIP Calculator
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Calculate the wealth you can accumulate through a Systematic Investment Plan.
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
            label="Monthly Investment"
            value={monthlyInvestment}
            onChange={setMonthlyInvestment}
            min={500}
            max={1000000}
            step={500}
            icon={IndianRupee}
            prefix="₹"
          />
          <InputSlider
            label="Expected Return Rate (p.a)"
            value={annualRate}
            onChange={setAnnualRate}
            min={1}
            max={30}
            step={0.1}
            unit="%"
            icon={Percent}
          />
          <InputSlider
            label="Time Period"
            value={years}
            onChange={setYears}
            min={1}
            max={40}
            step={1}
            unit="Y"
            icon={Calendar}
          />

          <div className="mt-12 p-6 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl border border-emerald-100 dark:border-emerald-500/20">
            <h3 className="text-emerald-800 dark:text-emerald-400 font-bold mb-4 flex items-center gap-2">
              <Info className="w-4 h-4" />
              Quick Summary
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Invested Amount</span>
                <span className="text-gray-900 dark:text-gray-100 font-bold">{formatCurrency(results.totalInvested)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Est. Returns</span>
                <span className="text-gray-900 dark:text-gray-100 font-bold">{formatCurrency(results.totalReturns)}</span>
              </div>
              <div className="h-px bg-emerald-200 dark:bg-emerald-500/20" />
              <div className="flex justify-between items-center">
                <span className="text-gray-800 dark:text-gray-200 font-bold">Total Value</span>
                <span className="text-emerald-600 dark:text-emerald-400 text-xl font-black">{formatCurrency(results.totalValue)}</span>
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
              <PieChart invested={results.totalInvested} returns={results.totalReturns} />
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-center">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-3 h-12 bg-emerald-500 rounded-full" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Invested Amount</p>
                    <p className="text-2xl font-black text-gray-800 dark:text-gray-100">{formatCurrency(results.totalInvested)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-3 h-12 bg-blue-500 rounded-full" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Est. Returns</p>
                    <p className="text-2xl font-black text-gray-800 dark:text-gray-100">{formatCurrency(results.totalReturns)}</p>
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
              <h3 className="text-gray-700 dark:text-gray-200 font-bold">Growth Projections</h3>
              <div className="flex gap-2">
                <button className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:text-emerald-500 transition-colors"><Share2 className="w-5 h-5" /></button>
              </div>
            </div>
            <InvestmentChart breakdown={breakdown} />
          </div>

          {/* Breakdown Table */}
          <BreakdownTable data={breakdown} formatCurrency={formatCurrency} />
        </motion.div>
      </div>
    </div>
  );
};

export default SIP;
