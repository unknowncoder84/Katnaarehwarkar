import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { IndianRupee, TrendingUp, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import PaymentModeBadge from '../components/PaymentModeBadge';
import { useData } from '../contexts/DataContext';
import { useTheme } from '../contexts/ThemeContext';
import { formatIndianDate } from '../utils/dateFormat';

const FinancePage: React.FC = () => {
  const navigate = useNavigate();
  const { transactions, cases } = useData();
  const { theme } = useTheme();

  const totalReceived = useMemo(() => {
    return transactions
      .filter((t) => t.status === 'received')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);
  
  // Calculate total fees quoted from all cases
  const totalFeesQuoted = useMemo(() => {
    return cases.reduce((sum, c) => sum + (c.feesQuoted || 0), 0);
  }, [cases]);
  
  // Calculate pending amount (fees quoted - received)
  const pendingAmount = useMemo(() => {
    return totalFeesQuoted - totalReceived;
  }, [totalFeesQuoted, totalReceived]);

  return (
    <MainLayout>
      <h1 className={`text-4xl font-bold font-cyber mb-8 ${theme === 'light' ? 'text-gray-900' : 'holographic-text'}`}>Finance & Payments</h1>



      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`${theme === 'light' ? 'bg-white/80 backdrop-blur-xl border border-gray-200/50' : 'glass-dark'} p-6 rounded-xl`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`${theme === 'light' ? 'text-gray-600' : 'text-gray-400'} text-sm`}>Total Fees Quoted</p>
              <p className={`text-2xl font-bold mt-2 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>₹{totalFeesQuoted.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl">
              <Briefcase size={28} className="text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className={`${theme === 'light' ? 'bg-white/80 backdrop-blur-xl border border-gray-200/50' : 'glass-dark'} p-6 rounded-xl`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`${theme === 'light' ? 'text-gray-600' : 'text-gray-400'} text-sm`}>Total Received</p>
              <p className={`text-2xl font-bold mt-2 ${theme === 'light' ? 'text-gray-900' : 'text-emerald-400'}`}>₹{totalReceived.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl">
              <TrendingUp size={28} className="text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`${theme === 'light' ? 'bg-white/80 backdrop-blur-xl border border-gray-200/50' : 'glass-dark'} p-6 rounded-xl`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`${theme === 'light' ? 'text-gray-600' : 'text-gray-400'} text-sm`}>Pending Amount</p>
              <p className={`text-2xl font-bold mt-2 ${theme === 'light' ? 'text-gray-900' : 'text-amber-400'}`}>₹{pendingAmount.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl">
              <IndianRupee size={28} className="text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className={`${theme === 'light' ? 'bg-white/80 backdrop-blur-xl border border-gray-200/50' : 'glass-dark'} p-6 rounded-xl`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`${theme === 'light' ? 'text-gray-600' : 'text-gray-400'} text-sm`}>Total Transactions</p>
              <p className={`text-2xl font-bold mt-2 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>{transactions.length}</p>
            </div>
            <div className="p-3 bg-gradient-cyber rounded-xl border border-cyber-blue/30">
              <IndianRupee size={28} className="text-white" />
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Case Fees Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={`${theme === 'light' ? 'bg-white/80 backdrop-blur-xl border border-gray-200/50' : 'glass-dark'} rounded-xl overflow-hidden mb-8`}
      >
        <div className={`p-4 border-b ${theme === 'light' ? 'border-gray-200 bg-gray-50' : 'border-white/10 bg-white/5'}`}>
          <h2 className={`text-lg font-semibold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>Case Fees Summary</h2>
          <p className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>Fees quoted for each case</p>
        </div>
        <div className="overflow-x-auto max-h-64 overflow-y-auto">
          <table className="w-full">
            <thead className={`sticky top-0 ${theme === 'light' ? 'bg-gray-50' : 'bg-[#1a1a2e]'}`}>
              <tr className={`border-b ${theme === 'light' ? 'border-gray-200' : 'border-white/10'}`}>
                <th className={`text-left py-3 px-4 font-semibold text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>Client Name</th>
                <th className={`text-left py-3 px-4 font-semibold text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>File No</th>
                <th className={`text-left py-3 px-4 font-semibold text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>Case Type</th>
                <th className={`text-left py-3 px-4 font-semibold text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>Fees Quoted</th>
                <th className={`text-left py-3 px-4 font-semibold text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>Date Added</th>
                <th className={`text-left py-3 px-4 font-semibold text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>Action</th>
              </tr>
            </thead>
            <tbody>
              {cases.filter(c => c.feesQuoted > 0).map((c) => (
                <tr key={c.id} className={`border-b ${theme === 'light' ? 'border-gray-100 hover:bg-orange-50/50' : 'border-white/10 hover:bg-white/5'} transition-colors`}>
                  <td className={`py-3 px-4 font-medium ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>{c.clientName}</td>
                  <td className={`py-3 px-4 ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>{c.fileNo}</td>
                  <td className={`py-3 px-4 ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>{c.caseType}</td>
                  <td className={`py-3 px-4 font-semibold ${theme === 'light' ? 'text-emerald-600' : 'text-emerald-400'}`}>₹{c.feesQuoted.toLocaleString()}</td>
                  <td className={`py-3 px-4 ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>{formatIndianDate(c.createdAt)}</td>
                  <td className="py-3 px-4">
                    <button 
                      onClick={() => navigate(`/cases/${c.id}`)}
                      className="px-3 py-1.5 bg-gradient-cyber text-white rounded-lg text-sm font-medium font-cyber hover:shadow-cyber transition-all border border-cyber-blue/30"
                    >
                      VIEW
                    </button>
                  </td>
                </tr>
              ))}
              {cases.filter(c => c.feesQuoted > 0).length === 0 && (
                <tr>
                  <td colSpan={6} className={`py-8 text-center ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                    No cases with fees quoted yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Transactions Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={`${theme === 'light' ? 'bg-white/80 backdrop-blur-xl border border-gray-200/50' : 'glass-dark'} rounded-xl overflow-hidden`}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${theme === 'light' ? 'border-gray-200 bg-gray-50' : 'border-white/10 bg-white/5'}`}>
                <th className={`text-left py-4 px-6 font-semibold text-sm uppercase tracking-wider ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>Amount</th>
                <th className={`text-left py-4 px-6 font-semibold text-sm uppercase tracking-wider ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>Payment Mode</th>
                <th className={`text-left py-4 px-6 font-semibold text-sm uppercase tracking-wider ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>Status</th>
                <th className={`text-left py-4 px-6 font-semibold text-sm uppercase tracking-wider ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>Received By</th>
                <th className={`text-left py-4 px-6 font-semibold text-sm uppercase tracking-wider ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>Confirmed By</th>
                <th className={`text-left py-4 px-6 font-semibold text-sm uppercase tracking-wider ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>Case</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => {
                const caseData = cases.find((c) => c.id === t.caseId);
                return (
                  <tr key={t.id} className={`border-b ${theme === 'light' ? 'border-gray-100 hover:bg-orange-50/50' : 'border-white/10 hover:bg-white/5'} transition-colors`}>
                    <td className={`py-4 px-6 font-semibold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>₹{t.amount.toLocaleString()}</td>
                    <td className="py-4 px-6">
                      <PaymentModeBadge mode={t.paymentMode} size="md" />
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          t.status === 'received'
                            ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                        }`}
                      >
                        {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                      </span>
                    </td>
                    <td className={`py-4 px-6 ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>{t.receivedBy}</td>
                    <td className={`py-4 px-6 ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>{t.confirmedBy}</td>
                    <td className="py-4 px-6">
                      <button 
                        onClick={() => caseData && navigate(`/cases/${caseData.id}`)}
                        className="px-4 py-2 bg-gradient-cyber text-white rounded-lg text-sm font-medium font-cyber hover:shadow-cyber transition-all border border-cyber-blue/30"
                      >
                        VIEW CASE
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </MainLayout>
  );
};

export default FinancePage;
