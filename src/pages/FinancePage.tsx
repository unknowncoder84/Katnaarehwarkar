import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { IndianRupee, TrendingUp, Calendar } from 'lucide-react';
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

  // Generate month options (current month and past 12 months)
  const monthOptions = useMemo(() => {
    const options = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
      options.push({ value, label });
    }
    return options;
  }, []);

  // Selected month state (default to current month)
  const [selectedMonth, setSelectedMonth] = useState(monthOptions[0]?.value || '');

  // Filter transactions by selected month
  const filteredTransactions = useMemo(() => {
    if (!selectedMonth) return transactions;
    
    const [year, month] = selectedMonth.split('-').map(Number);
    return transactions.filter((t) => {
      const txDate = new Date(t.createdAt);
      return txDate.getFullYear() === year && txDate.getMonth() + 1 === month;
    });
  }, [transactions, selectedMonth]);

  // Calculate totals for selected month
  const monthlyTotalReceived = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.status === 'received')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  const monthlyTransactionCount = useMemo(() => {
    return filteredTransactions.length;
  }, [filteredTransactions]);

  // Get selected month label for display
  const selectedMonthLabel = useMemo(() => {
    const option = monthOptions.find(o => o.value === selectedMonth);
    return option?.label || 'Select Month';
  }, [selectedMonth, monthOptions]);

  return (
    <MainLayout>
      <h1 className={`text-4xl font-bold font-cyber mb-8 ${theme === 'light' ? 'text-gray-900' : 'holographic-text'}`}>Finance & Payments</h1>

      {/* Month Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center gap-4">
          <label className={`font-semibold ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
            Select Month:
          </label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className={`px-4 py-2 rounded-lg border font-medium ${
              theme === 'light'
                ? 'bg-white border-gray-300 text-gray-900'
                : 'bg-white/10 border-orange-500/30 text-white'
            } focus:outline-none focus:ring-2 focus:ring-orange-500`}
          >
            {monthOptions.map((option) => (
              <option key={option.value} value={option.value} className="bg-gray-900 text-white">
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Stats - Only Total Received and Total Transactions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Month Display Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`${theme === 'light' ? 'bg-white/80 backdrop-blur-xl border border-gray-200/50' : 'glass-dark'} p-6 rounded-xl`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`${theme === 'light' ? 'text-gray-600' : 'text-gray-400'} text-sm`}>Selected Month</p>
              <p className={`text-xl font-bold mt-2 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>{selectedMonthLabel}</p>
            </div>
            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl">
              <Calendar size={28} className="text-white" />
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
              <p className={`text-2xl font-bold mt-2 ${theme === 'light' ? 'text-gray-900' : 'text-emerald-400'}`}>₹{monthlyTotalReceived.toLocaleString()}</p>
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
              <p className={`${theme === 'light' ? 'text-gray-600' : 'text-gray-400'} text-sm`}>Total Transactions</p>
              <p className={`text-2xl font-bold mt-2 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>{monthlyTransactionCount}</p>
            </div>
            <div className="p-3 bg-gradient-cyber rounded-xl border border-cyber-blue/30">
              <IndianRupee size={28} className="text-white" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Transactions Table - Filtered by Month */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={`${theme === 'light' ? 'bg-white/80 backdrop-blur-xl border border-gray-200/50' : 'glass-dark'} rounded-xl overflow-hidden`}
      >
        <div className={`p-4 border-b ${theme === 'light' ? 'border-gray-200 bg-gray-50' : 'border-white/10 bg-white/5'}`}>
          <h2 className={`text-lg font-semibold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
            Transactions for {selectedMonthLabel}
          </h2>
          <p className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
            {monthlyTransactionCount} transaction{monthlyTransactionCount !== 1 ? 's' : ''} found
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${theme === 'light' ? 'border-gray-200 bg-gray-50' : 'border-white/10 bg-white/5'}`}>
                <th className={`text-left py-4 px-6 font-semibold text-sm uppercase tracking-wider ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>Date</th>
                <th className={`text-left py-4 px-6 font-semibold text-sm uppercase tracking-wider ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>Amount</th>
                <th className={`text-left py-4 px-6 font-semibold text-sm uppercase tracking-wider ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>Payment Mode</th>
                <th className={`text-left py-4 px-6 font-semibold text-sm uppercase tracking-wider ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>Status</th>
                <th className={`text-left py-4 px-6 font-semibold text-sm uppercase tracking-wider ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>Received By</th>
                <th className={`text-left py-4 px-6 font-semibold text-sm uppercase tracking-wider ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>Case</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((t) => {
                  const caseData = cases.find((c) => c.id === t.caseId);
                  return (
                    <tr key={t.id} className={`border-b ${theme === 'light' ? 'border-gray-100 hover:bg-orange-50/50' : 'border-white/10 hover:bg-white/5'} transition-colors`}>
                      <td className={`py-4 px-6 ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
                        {formatIndianDate(t.createdAt)}
                      </td>
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
                })
              ) : (
                <tr>
                  <td colSpan={6} className={`py-12 text-center ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                    No transactions found for {selectedMonthLabel}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </MainLayout>
  );
};

export default FinancePage;
