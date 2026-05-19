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

const ComparisonChart = ({ data, dataKeys, dataLabels, colors }) => {
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
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(context.parsed.y);
            }
            return label;
          }
        }
      },
    },
    scales: {
      x: {
        stacked: false, // Grouped side-by-side
        grid: {
          display: false,
        },
      },
      y: {
        stacked: false, // Grouped side-by-side
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

  const labels = data.map(item => `Year ${item.year}`);

  const datasets = dataKeys.map((key, index) => ({
    label: dataLabels[index],
    data: data.map(item => item[key]),
    backgroundColor: colors[index] || 'rgba(16, 185, 129, 0.7)',
    borderRadius: 4,
  }));

  const chartData = {
    labels,
    datasets,
  };

  return (
    <div className="w-full h-[400px]">
      <Bar options={options} data={chartData} />
    </div>
  );
};

export default ComparisonChart;
