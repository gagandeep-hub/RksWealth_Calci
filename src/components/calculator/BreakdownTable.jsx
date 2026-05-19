import React from 'react';

const BreakdownTable = ({ data, formatCurrency }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
      <h3 className="text-gray-700 dark:text-gray-200 font-bold mb-6">Yearly Breakdown</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-700">
              <th className="pb-4 font-semibold text-gray-500 dark:text-gray-400">Year</th>
              <th className="pb-4 font-semibold text-gray-500 dark:text-gray-400">Invested Amount</th>
              <th className="pb-4 font-semibold text-gray-500 dark:text-gray-400">Est. Returns</th>
              <th className="pb-4 font-semibold text-gray-500 dark:text-gray-400">Total Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {data.filter((_, i) => i === 0 || (i + 1) % 5 === 0 || i === data.length - 1).map((row) => (
              <tr key={row.year} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td className="py-4 font-medium text-gray-900 dark:text-gray-100">Year {row.year}</td>
                <td className="py-4 text-gray-600 dark:text-gray-400">{formatCurrency(row.invested)}</td>
                <td className="py-4 text-emerald-600 dark:text-emerald-400 font-medium">+{formatCurrency(row.returns)}</td>
                <td className="py-4 font-bold text-gray-900 dark:text-gray-100">{formatCurrency(row.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BreakdownTable;
