import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Sparkles } from 'lucide-react';
import { CALCULATORS } from '../constants/calculators';
import CalculatorCard from '../components/calculator/CalculatorCard';

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCalculators = CALCULATORS.filter(calc => 
    calc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    calc.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Hero Section */}
      <section className="text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm font-bold mb-6"
        >
          <Sparkles className="w-4 h-4" />
          Production-Level Fintech Platform
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 dark:text-white mb-6 tracking-tight"
        >
          Smart Financial <span className="text-emerald-500">Planning</span> <br className="hidden sm:block" /> Made Simple.
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Explore our suite of 14+ professional-grade financial calculators designed to help you make informed investment decisions and reach your goals faster.
        </motion.p>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="relative max-w-xl mx-auto"
        >
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search for SIP, Lumpsum, EMI, Tax..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-lg shadow-gray-200/50 dark:shadow-none transition-all"
          />
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
            <button className="p-2 text-gray-400 hover:text-emerald-500 transition-colors">
              <Filter className="h-5 w-5" />
            </button>
          </div>
        </motion.div>
      </section>

      {/* Calculators Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {filteredCalculators.map((calc, index) => (
          <CalculatorCard key={calc.id} calculator={calc} />
        ))}
      </section>
      
      {filteredCalculators.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-500 dark:text-gray-400 text-lg">No calculators found matching your search.</p>
        </div>
      )}
    </div>
  );
};

export default Home;
