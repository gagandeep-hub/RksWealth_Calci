import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const PieChart = ({ invested, returns, labels = ['Invested Amount', 'Est. Returns'], totalValueOverride }) => {
  const data = {
    labels: labels,
    datasets: [
      {
        data: [invested, returns],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)', // Emerald 500
          'rgba(59, 130, 246, 0.8)', // Blue 500
        ],
        borderColor: [
          'rgba(16, 185, 129, 1)',
          'rgba(59, 130, 246, 1)',
        ],
        borderWidth: 1,
        hoverOffset: 4,
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
            family: "'Inter', sans-serif",
          },
          color: 'rgba(107, 114, 128, 1)',
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed !== null) {
              label += new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(context.parsed);
            }
            return label;
          }
        }
      }
    },
    cutout: '70%',
    maintainAspectRatio: false,
  };

  const displayTotal = totalValueOverride !== undefined ? totalValueOverride : (invested + returns);

  return (
    <div className="w-full h-64 relative">
      <Doughnut data={data} options={options} />
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
        <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">Total Value</span>
        <span className="text-xl font-bold text-gray-800 dark:text-gray-100">
          ₹{Math.round(displayTotal).toLocaleString('en-IN')}
        </span>
      </div>
    </div>
  );
};

export default PieChart;
