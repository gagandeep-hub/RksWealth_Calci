import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const CalculatorCard = ({ calculator }) => {
  const Icon = calculator.icon;

  return (
    <motion.div
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
    >
      <div className={cn(
        "absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full opacity-10 transition-transform group-hover:scale-125 duration-500",
        calculator.bgColor.replace('/10', '')
      )} />
      
      <div className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-300",
        calculator.bgColor,
        calculator.color
      )}>
        <Icon className="w-6 h-6" />
      </div>

      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
        {calculator.title}
      </h3>
      
      <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6">
        {calculator.description}
      </p>

      <Link
        to={calculator.path}
        className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400 group/link"
      >
        Calculate Now
        <ArrowRight className="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
      </Link>
    </motion.div>
  );
};

export default CalculatorCard;
