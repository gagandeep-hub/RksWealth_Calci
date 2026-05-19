import React from 'react';
import { motion } from 'framer-motion';

const ResultCard = ({ label, value, colorClass = "text-emerald-600" }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">{label}</p>
      <p className={`text-2xl font-black ${colorClass}`}>{value}</p>
    </div>
  );
};

export default ResultCard;
