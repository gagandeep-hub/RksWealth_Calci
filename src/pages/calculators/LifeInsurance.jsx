import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, IndianRupee, Percent, Calendar, Info, Download, Share2 } from 'lucide-react';
import InputSlider from '../../components/calculator/InputSlider';
import PieChart from '../../components/calculator/PieChart';
import InvestmentChart from '../../components/calculator/InvestmentChart';
import { calculateLifeInsurance, getLifeInsuranceBreakdown } from '../../utils/insuranceFormula';

const LifeInsurance = () => {
  const [loanAmount, setLoanAmount] = useState(100000);
  const [fdRate, setFdRate] = useState(5);
  const [inflationRate, setInflationRate] = useState(5);
  const [protectionDurationYears, setProtectionDurationYears] = useState(5);
  const [monthlyExpenses, setMonthlyExpenses] = useState(10000);

  const [results, setResults] = useState({
    loanRepayment: 0,
    householdExpenses: 0,
    totalCover: 0,
  });

  const [breakdown, setBreakdown] = useState([]);

  useEffect(() => {
    const res = calculateLifeInsurance({
      loanAmount,
      fdRate,
      inflationRate,
      protectionDurationYears,
      monthlyExpenses
    });
    setResults(res);

    setBreakdown(getLifeInsuranceBreakdown({
      fdRate,
      inflationRate,
      protectionDurationYears,
      monthlyExpenses,
      householdExpensesFund: res.householdExpenses
    }));
  }, [loanAmount, fdRate, inflationRate, protectionDurationYears, monthlyExpenses]);

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
            <li><a href="/" className="hover:text-blue-500">Calculators</a></li>
            <li><span>/</span></li>
            <li className="text-blue-600 dark:text-blue-400">Life Insurance Calculator</li>
          </ol>
        </nav>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
          <Shield className="w-8 h-8 text-blue-500" />
          Life Insurance Calculator
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Calculate the ideal life insurance cover required to protect your family's future.
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
            label="Loan Amount / Liabilities"
            value={loanAmount}
            onChange={setLoanAmount}
            min={0}
            max={50000000}
            step={100000}
            icon={IndianRupee}
            prefix="₹"
          />
          <InputSlider
            label="Monthly Expenses"
            value={monthlyExpenses}
            onChange={setMonthlyExpenses}
            min={5000}
            max={500000}
            step={1000}
            icon={IndianRupee}
            prefix="₹"
          />
          <InputSlider
            label="Protection Duration"
            value={protectionDurationYears}
            onChange={setProtectionDurationYears}
            min={1}
            max={40}
            step={1}
            unit="Y"
            icon={Calendar}
          />
          <InputSlider
            label="Current FD Rate (Return Rate p.a)"
            value={fdRate}
            onChange={setFdRate}
            min={1}
            max={15}
            step={0.1}
            unit="%"
            icon={Percent}
          />
          <InputSlider
            label="Expected Inflation Rate (p.a)"
            value={inflationRate}
            onChange={setInflationRate}
            min={1}
            max={15}
            step={0.1}
            unit="%"
            icon={Percent}
          />

          {/* Quick Summary */}
          <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-500/10 rounded-2xl border border-blue-100 dark:border-blue-500/20">
            <h3 className="text-blue-800 dark:text-blue-400 font-bold mb-4 flex items-center gap-2">
              <Info className="w-4 h-4" />
              Coverage Breakdown
            </h3>
            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <span className="text-gray-600 dark:text-gray-400 font-medium text-sm">Loan Repayment</span>
                <span className="text-gray-900 dark:text-white font-black text-xl">{formatCurrency(results.loanRepayment)}</span>
              </div>
              <div className="h-px bg-blue-200 dark:bg-blue-500/20" />
              <div className="flex flex-col gap-1">
                <span className="text-gray-600 dark:text-gray-400 font-medium text-sm">Household Expenses Fund</span>
                <span className="text-gray-900 dark:text-white font-black text-xl">{formatCurrency(results.householdExpenses)}</span>
              </div>
              <div className="h-px bg-blue-200 dark:bg-blue-500/20" />
              <div className="flex flex-col gap-1">
                <span className="text-blue-800 dark:text-blue-200 font-bold">Total Insurance Cover Required</span>
                <span className="text-blue-600 dark:text-blue-400 text-2xl font-black">{formatCurrency(results.totalCover)}</span>
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
          {/* Highlight Card */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-3xl text-white shadow-md">
            <p className="text-blue-100 font-medium mb-1 flex items-center gap-2">
              <Shield className="w-5 h-5" /> Recommended Life Cover
            </p>
            <p className="text-5xl font-black mt-2">{formatCrore(results.totalCover)}</p>
            <p className="text-sm text-blue-200 mt-4">
              Clear a debt of {formatCrore(results.loanRepayment)} and maintain ₹{monthlyExpenses.toLocaleString('en-IN')}/mo for {protectionDurationYears} yrs at {inflationRate}% inflation.
            </p>
          </div>

          {/* Pie Chart + Summary Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col items-center">
              <h3 className="text-gray-700 dark:text-gray-200 font-bold mb-6 w-full">Coverage Distribution</h3>
              <PieChart
                invested={results.loanRepayment}
                returns={results.householdExpenses}
                labels={['Loan Repayment', 'Household Expenses']}
              />
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-center">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-3 h-12 bg-blue-500 rounded-full" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Loan Repayment</p>
                    <p className="text-2xl font-black text-gray-800 dark:text-gray-100">{formatCrore(results.loanRepayment)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-3 h-12 bg-indigo-500 rounded-full" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Household Expenses</p>
                    <p className="text-2xl font-black text-gray-800 dark:text-gray-100">{formatCrore(results.householdExpenses)}</p>
                  </div>
                </div>
                <button className="w-full mt-4 flex items-center justify-center gap-2 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-bold hover:scale-[1.02] transition-transform">
                  <Download className="w-5 h-5" />
                  Download Assessment
                </button>
              </div>
            </div>
          </div>

          {/* Life Insurance Depletion Chart */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-gray-700 dark:text-gray-200 font-bold">Fund Depletion Over Time</h3>
              <button className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:text-blue-500 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Remaining corpus stacked with annual expenses paid each year — shows how the fund is utilized over {protectionDurationYears} years.
            </p>
            <InvestmentChart
              breakdown={breakdown}
              dataKeys={['remainingCorpus', 'annualWithdrawal']}
              dataLabels={['Current Value', 'Insurance Cover Used']}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LifeInsurance;
