import React from 'react';
import { motion } from 'framer-motion';

const InputSlider = ({ 
  label, 
  value, 
  onChange, 
  min, 
  max, 
  step = 1, 
  unit = '', 
  icon: Icon,
  prefix = ''
}) => {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-5 h-5 text-emerald-500" />}
          <label className="text-gray-600 dark:text-gray-300 font-medium">{label}</label>
        </div>
        <div className="relative">
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-32 px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-lg text-right font-bold text-emerald-700 dark:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
          />
          {unit && (
            <span className="absolute right-[-40px] top-1/2 -translate-y-1/2 text-sm text-gray-500">
              {unit}
            </span>
          )}
        </div>
      </div>
      
      <div className="relative h-6 flex items-center">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
        />
        <motion.div 
          className="absolute left-0 h-2 bg-emerald-500 rounded-lg pointer-events-none"
          initial={false}
          animate={{ width: `${((value - min) / (max - min)) * 100}%` }}
        />
      </div>
      
      <div className="flex justify-between mt-2 text-xs text-gray-400 font-medium">
        <span>{prefix}{min.toLocaleString()}</span>
        <span>{prefix}{max.toLocaleString()}</span>
      </div>
    </div>
  );
};

export default InputSlider;
