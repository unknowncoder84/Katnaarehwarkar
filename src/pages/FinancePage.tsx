import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IndianRupee, TrendingUp, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import PaymentModeBadge from '../components/PaymentModeBadge';
import MonthYearPicker from '../components/MonthYearPicker';
import { db } from '../lib/supabase';
import { useTheme } from '../contexts/ThemeContext';
import { formatIndianDate } from '../utils/dateFormat';

const FinancePage: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  // Local state for payments
  const [allPayments, setAllPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all payments on mount
  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      const { data, error } = await db.casePayments.getAll();
      if (error) {
        console.error('Failed to fetch case payments:', error);
      } else {
        setAllPayments(data || []);
      }
      setLoading(false);
    };
    fetchPayments();
  }, []);

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

  // Filter payments by selected month using the `date` field
  const filteredTransactions = useMemo(() => {
    if (!selectedMonth) return allPayments;

    const [year, month] = selectedMonth.split('-').map(Number);
    return allPayments.filter((p) => {
      if (!p.date) return false;
      const [pYear, pMonth] = p.date.split('-').map(Number);
      return pYear === year && pMonth === month;
    });
  }, [allPayments, selectedMonth]);

  // Calculate totals for selected month
  const monthlyTotalReceived = useMemo(() => {
    return filteredTransactions
      .filter((p) => p.is_accepted === true)
      .reduce((sum, p) => sum + (p.amount || 0), 0);
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
        <MonthYearPicker
          value={selectedMonth}
          onChange={setSelectedMonth}
          label="Select Month:"
        />
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
              {loading ? (
                <tr>
                  <td colSpan={6} className={`py-12 text-center ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                    Loading...
                  </td>
                </tr>
              ) : filteredTransactions.length > 0 ? (
                filteredTransactions.map((p) => {
                  const status = p.is_accepted ? 'received' : 'pending';
                  return (
                    <tr key={p.id} className={`border-b ${theme === 'light' ? 'border-gray-100 hover:bg-orange-50/50' : 'border-white/10 hover:bg-white/5'} transition-colors`}>
                      <td className={`py-4 px-6 ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
                        {formatIndianDate(p.date)}
                      </td>
                      <td className={`py-4 px-6 font-semibold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>₹{(p.amount || 0).toLocaleString()}</td>
                      <td className="py-4 px-6">
                        <PaymentModeBadge mode={(p.payment_mode || '').toLowerCase()} size="md" />
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            status === 'received'
                              ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                          }`}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                      </td>
                      <td className={`py-4 px-6 ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>{p.received_by}</td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col gap-1">
                          {p.cases && (
                            <span className={`text-xs ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                              {p.cases.client_name} {p.cases.file_no ? `• ${p.cases.file_no}` : ''}
                            </span>
                          )}
                          <button
                            onClick={() => navigate(`/cases/${p.case_id}`)}
                            className="px-4 py-2 bg-gradient-cyber text-white rounded-lg text-sm font-medium font-cyber hover:shadow-cyber transition-all border border-cyber-blue/30 w-fit"
                          >
                            VIEW CASE
                          </button>
                        </div>
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
