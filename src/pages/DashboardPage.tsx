import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Briefcase,
  Clock,
  ThumbsUp,
  ThumbsDown,
  FileText,
  CheckCircle,
  TrendingUp,
  Scale,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import MainLayout from '../components/MainLayout';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useTheme } from '../contexts/ThemeContext';
import Calendar from '../components/Calendar';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cases } = useData();
  const { theme } = useTheme();

  // Calculate statistics
  const stats = useMemo(() => {
    const myCases = cases.length;
    const pendingTasks = cases.filter((c) => c.status === 'pending').length;
    const irFavor = cases.filter((c) => c.interimRelief === 'favor').length;
    const irAgainst = cases.filter((c) => c.interimRelief === 'against').length;
    const nonCirculated = cases.filter((c) => c.circulationStatus === 'non-circulated').length;
    const circulated = cases.filter((c) => c.circulationStatus === 'circulated').length;

    return { myCases, pendingTasks, irFavor, irAgainst, nonCirculated, circulated };
  }, [cases]);

  const statCards = [
    { title: 'My Cases', count: stats.myCases, gradient: 'from-cyber-blue to-neon-blue', icon: Briefcase, glow: 'shadow-cyber' },
    { title: 'Pending Tasks', count: stats.pendingTasks, gradient: 'from-cyber-pink to-cyber-purple', icon: Clock, glow: 'shadow-cyber-pink' },
    { title: 'IR Favor', count: stats.irFavor, gradient: 'from-cyber-green to-emerald-500', icon: ThumbsUp, glow: 'shadow-neon-sm' },
    { title: 'IR Against', count: stats.irAgainst, gradient: 'from-neon-pink to-cyber-pink', icon: ThumbsDown, glow: 'shadow-cyber-pink' },
    { title: 'Non Circulated', count: stats.nonCirculated, gradient: 'from-cyber-yellow to-cyber-orange', icon: FileText, glow: 'shadow-court' },
    { title: 'Circulated', count: stats.circulated, gradient: 'from-cyber-blue to-cyber-pink', icon: CheckCircle, glow: 'shadow-justice' },
  ];

  const cardBg = theme === 'light' ? 'bg-white/95 backdrop-blur-2xl border-gray-200 shadow-md' : 'glass-dark border-cyber-blue/20';
  const textPrimary = theme === 'light' ? 'text-gray-900' : 'text-cyber-blue';
  const textSecondary = theme === 'light' ? 'text-gray-700' : 'text-cyber-blue/60';

  return (
    <MainLayout>
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 md:mb-8"
      >
        <div className="flex items-center gap-2 md:gap-3 mb-2 flex-wrap">
          <Scale className="text-cyber-blue animate-scale-balance" size={24} />
          <h1 className={`text-2xl sm:text-3xl md:text-4xl font-bold font-cyber ${textPrimary}`}>
            Welcome back, <span className="holographic-text">{user?.name || 'User'}</span>
          </h1>
        </div>
        <p className={`${textSecondary} text-base md:text-lg font-court`}>Here's what's happening with your cases today</p>
      </motion.div>

      {/* Statistics Cards Grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 mb-6 md:mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          // Light mode uses white cards with colored accents, dark mode uses gradient backgrounds
          const cardClass = theme === 'light'
            ? 'bg-white/95 backdrop-blur-xl border-gray-200 hover:border-purple-400 hover:shadow-xl shadow-md'
            : `bg-gradient-to-br ${stat.gradient} border-cyber-blue/30 hover:border-cyber-blue/60`;
          const subtextColorClass = theme === 'light' ? 'text-gray-800 font-bold' : 'text-white/80';
          const countColorClass = theme === 'light' ? 'text-gray-900' : 'text-white';
          const iconBgClass = theme === 'light' 
            ? `bg-gradient-to-br ${stat.gradient}` 
            : 'bg-white/20 border border-white/30';
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.02, y: -4 }}
              onClick={() => navigate('/cases')}
              className={`relative overflow-hidden p-4 md:p-6 rounded-xl md:rounded-2xl shadow-xl cursor-pointer group border ${cardClass}`}
            >
              {/* Background Pattern - only show in dark mode */}
              {theme === 'dark' && (
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/20" />
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-white/10" />
                </div>
              )}
              
              <div className="relative flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className={`text-xs md:text-sm font-cyber font-medium uppercase tracking-wider ${subtextColorClass} truncate`}>{stat.title}</p>
                  <p className={`text-2xl sm:text-3xl md:text-5xl font-bold font-cyber mt-1 md:mt-2 ${countColorClass} ${theme === 'dark' ? 'text-glow' : ''}`}>{stat.count}</p>
                  <div className={`hidden sm:flex items-center gap-1 mt-2 text-sm font-court ${subtextColorClass}`}>
                    <TrendingUp size={14} />
                    <span>View details</span>
                  </div>
                </div>
                <div className={`p-2 md:p-3 rounded-xl group-hover:scale-110 transition-transform ${iconBgClass}`}>
                  <Icon size={20} className="text-white md:w-7 md:h-7" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Statistics Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className={`lg:col-span-2 ${cardBg} rounded-2xl p-6 border shadow-card`}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg">
              <FileText size={20} className="text-white" />
            </div>
            <h2 className={`text-xl font-bold ${textPrimary}`}>Case Statistics</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <tbody className="divide-y divide-gray-200/10">
                {[
                  { label: 'Consultation', value: cases.filter((c) => c.status === 'pending').length },
                  { label: 'Drafting', value: cases.filter((c) => c.status === 'active').length },
                  { label: 'Filing', value: cases.filter((c) => c.status === 'closed').length },
                  { label: 'Circulation', value: cases.filter((c) => c.circulationStatus === 'circulated').length },
                  { label: 'Notice', value: 11 },
                  { label: 'Pre Admission', value: 229 },
                  { label: 'Admitted', value: 62 },
                  { label: 'Final Hearing', value: 82 },
                  { label: 'Reserved For Judgement', value: 0 },
                  { label: 'Disposed', value: 25 },
                ].map((row, idx) => (
                  <tr key={idx} className={`${theme === 'light' ? 'hover:bg-purple-50/80' : 'hover:bg-white/5'} transition-colors`}>
                    <td className={`py-3 px-4 uppercase text-sm font-semibold tracking-wide ${theme === 'light' ? 'text-gray-700' : 'text-cyber-blue/60'}`}>{row.label}</td>
                    <td className={`py-3 px-4 text-right font-bold text-lg ${theme === 'light' ? 'text-gray-900' : 'text-cyber-blue'}`}>{row.value}</td>
                  </tr>
                ))}
                <tr className={`${theme === 'light' ? 'bg-purple-100/50' : 'bg-purple-500/10'}`}>
                  <td className={`py-4 px-4 uppercase text-sm font-bold tracking-wide ${theme === 'light' ? 'text-purple-700' : 'text-purple-400'}`}>Total Cases</td>
                  <td className={`py-4 px-4 text-right font-bold text-xl ${theme === 'light' ? 'text-purple-700' : 'text-purple-400'}`}>541</td>
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Calendar Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="space-y-4"
        >
          <button 
            onClick={() => navigate(`/events/${format(new Date(), 'yyyy-MM-dd')}`)}
            className="w-full bg-gradient-cyber text-white font-bold font-cyber py-4 rounded-2xl hover:shadow-cyber transition-all duration-300 border border-cyber-blue/30"
          >
            View Today's Events
          </button>
          <Calendar />
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default DashboardPage;
