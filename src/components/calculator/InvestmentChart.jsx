import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const InvestmentChart = ({ breakdown, dataKeys = ['invested', 'returns'], dataLabels = ['Invested Amount', 'Est. Returns'], stacked = true, labelPrefix = 'Year ' }) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          font: {
            size: 11,
          },
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      x: {
        stacked: stacked,
        grid: {
          display: false,
        },
      },
      y: {
        stacked: stacked,
        grid: {
          color: 'rgba(107, 114, 128, 0.1)',
        },
        ticks: {
          callback: (value) => {
            if (value >= 10000000) return '₹' + (value / 10000000).toFixed(1) + 'Cr';
            if (value >= 100000) return '₹' + (value / 100000).toFixed(1) + 'L';
            if (value >= 1000) return '₹' + (value / 1000).toFixed(0) + 'k';
            return '₹' + value;
          },
        },
      },
    },
  };

  const labels = breakdown.map(item => `${labelPrefix}${item.year}`);

  const data = {
    labels,
    datasets: [
      {
        label: dataLabels[0],
        data: breakdown.map(item => item[dataKeys[0]]),
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
        borderRadius: 4,
      },
      {
        label: dataLabels[1],
        data: breakdown.map(item => item[dataKeys[1]]),
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
        borderRadius: 4,
      },
    ],
  };

  return (
    <div className="w-full h-[400px]">
      <Bar options={options} data={data} />
    </div>
  );
};

export default InvestmentChart;
