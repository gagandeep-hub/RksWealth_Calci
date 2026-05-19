import { 
  TrendingUp, 
  Wallet, 
  ArrowRightLeft, 
  Download, 
  Palmtree, 
  Timer, 
  ShieldCheck, 
  CreditCard, 
  Receipt, 
  Heart, 
  GraduationCap, 
  Home, 
  Car, 
  Plane 
} from 'lucide-react';

export const CALCULATORS = [
  {
    id: 'sip',
    title: 'SIP Calculator',
    description: 'Calculate how much wealth you can create by investing small amounts regularly.',
    icon: TrendingUp,
    path: '/calculators/sip',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10'
  },
  {
    id: 'lumpsum',
    title: 'Lumpsum Calculator',
    description: 'Calculate the future value of your one-time investments.',
    icon: Wallet,
    path: '/calculators/lumpsum',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10'
  },
  {
    id: 'stp',
    title: 'STP Calculator',
    description: 'Systematic Transfer Plan calculator for moving funds between schemes.',
    icon: ArrowRightLeft,
    path: '/calculators/stp',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10'
  },
  {
    id: 'swp',
    title: 'SWP Calculator',
    description: 'Systematic Withdrawal Plan for regular monthly income from investments.',
    icon: Download,
    path: '/calculators/swp',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10'
  },
  {
    id: 'retirement',
    title: 'Retirement Calculator',
    description: 'Plan your retirement corpus and monthly savings needed.',
    icon: Palmtree,
    path: '/calculators/retirement',
    color: 'text-amber-600',
    bgColor: 'bg-amber-600/10'
  },
  {
    id: 'delay',
    title: 'Delay Planning',
    description: 'See how much you lose by delaying your investments.',
    icon: Timer,
    path: '/calculators/delay',
    color: 'text-red-500',
    bgColor: 'bg-red-500/10'
  },
  {
    id: 'insurance',
    title: 'Life Insurance',
    description: 'Calculate the life cover you need to protect your family.',
    icon: ShieldCheck,
    path: '/calculators/insurance',
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-500/10'
  },
  {
    id: 'emi',
    title: 'EMI Calculator',
    description: 'Calculate monthly installments for any kind of loan.',
    icon: CreditCard,
    path: '/calculators/emi',
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-600/10'
  },
  {
    id: 'tax',
    title: 'Tax Calculator',
    description: 'Estimate your income tax for the current financial year.',
    icon: Receipt,
    path: '/calculators/tax',
    color: 'text-rose-500',
    bgColor: 'bg-rose-500/10'
  },
  {
    id: 'marriage',
    title: 'Marriage Planning',
    description: 'Plan and save for your or your children\'s dream wedding.',
    icon: Heart,
    path: '/calculators/marriage',
    color: 'text-pink-500',
    bgColor: 'bg-pink-500/10'
  },
  {
    id: 'education',
    title: 'Education Planning',
    description: 'Plan for the rising cost of higher education.',
    icon: GraduationCap,
    path: '/calculators/education',
    color: 'text-violet-600',
    bgColor: 'bg-violet-600/10'
  },
  {
    id: 'homeloan',
    title: 'Home Loan',
    description: 'Plan your dream home with detailed loan breakdown.',
    icon: Home,
    path: '/calculators/home-loan',
    color: 'text-sky-600',
    bgColor: 'bg-sky-600/10'
  },
  {
    id: 'car',
    title: 'Car Planning',
    description: 'Calculate savings and EMI for your new car.',
    icon: Car,
    path: '/calculators/car-planning',
    color: 'text-slate-600',
    bgColor: 'bg-slate-600/10'
  },
  {
    id: 'vacation',
    title: 'Vacation Planning',
    description: 'Save for your next big international or domestic trip.',
    icon: Plane,
    path: '/calculators/vacation',
    color: 'text-teal-600',
    bgColor: 'bg-teal-600/10'
  }
];
