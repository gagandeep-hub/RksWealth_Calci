import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from '../pages/Home';

// Calculator Pages
import SIP from '../pages/calculators/SIP';
import Lumpsum from '../pages/calculators/Lumpsum';
import STP from '../pages/calculators/STP';
import SWP from '../pages/calculators/SWP';
import Retirement from '../pages/calculators/Retirement';
import DelayPlanning from '../pages/calculators/DelayPlanning';
import LifeInsurance from '../pages/calculators/LifeInsurance';
import EMI from '../pages/calculators/EMI';
import Tax from '../pages/calculators/Tax';
import Marriage from '../pages/calculators/Marriage';
import Education from '../pages/calculators/Education';
import HomeLoan from '../pages/calculators/HomeLoan';
import CarPlanning from '../pages/calculators/CarPlanning';
import Vacation from '../pages/calculators/Vacation';
import SIPPerformance from '../pages/calculators/SIPPerformance';
import STPPerformance from '../pages/calculators/STPPerformance';
import SWPPerformance from '../pages/calculators/SWPPerformance';
import LAMF from '../pages/calculators/LAMF';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      
      {/* Calculator Routes */}
      <Route path="/calculators/sip" element={<SIP />} />
      <Route path="/calculators/lumpsum" element={<Lumpsum />} />
      <Route path="/calculators/stp" element={<STP />} />
      <Route path="/calculators/swp" element={<SWP />} />
      <Route path="/calculators/retirement" element={<Retirement />} />
      <Route path="/calculators/delay" element={<DelayPlanning />} />
      <Route path="/calculators/insurance" element={<LifeInsurance />} />
      <Route path="/calculators/emi" element={<EMI />} />
      <Route path="/calculators/tax" element={<Tax />} />
      <Route path="/calculators/marriage" element={<Marriage />} />
      <Route path="/calculators/education" element={<Education />} />
      <Route path="/calculators/home-loan" element={<HomeLoan />} />
      <Route path="/calculators/car-planning" element={<CarPlanning />} />
      <Route path="/calculators/vacation" element={<Vacation />} />
      <Route path="/calculators/sip-performance" element={<SIPPerformance />} />
      <Route path="/calculators/stp-performance" element={<STPPerformance />} />
      <Route path="/calculators/swp-performance" element={<SWPPerformance />} />
      <Route path="/calculators/lamf" element={<LAMF />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
