import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, TrendingDown } from 'lucide-react';
import MainLayout from '../components/MainLayout';
import { useData } from '../contexts/DataContext';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

const ExpensesPage: React.FC = () => {
  const { expenses, deleteExpense, getExpensesByMonth } = useData();
  const { theme } = useTheme();
  const { user, isAdmin } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const monthlyExpenses = useMemo(() => {
    return getExpensesByMonth(selectedMonth);
  }, [expenses, selectedMonth, getExpensesByMonth]);

  const stats = useMemo(() => {
    const total = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);
    const count = monthlyExpenses.length;
    const average = count > 0 ? total / count : 0;
    return { total, count, average };
  }, [monthlyExpenses]);

  const cardBg = theme === 'light' ? 'bg-white/95 backdrop-blur-xl border-gray-200 shadow-md' : 'glass-dark border-cyber-blue/20';
  const textPrimary = theme === 'light' ? 'text-gray-900' : 'text-cyber-blue';
  const textSecondary = theme === 'light' ? 'text-gray-700' : 'text-cyber-blue/60';

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      await deleteExpense(id);
    }
  };

  const formatMonthName = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <MainLayout>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${cardBg} p-6 rounded-2xl mb-6 border`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl md:text-3xl font-bold font-cyber ${textPrimary}`}>
              Expense Management
            </h1>
            <p className={`mt-1 ${textSecondary} font-court`}>
              Track and manage monthly office expenses
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-cyber text-white px-6 py-3 rounded-xl font-semibold font-cyber hover:shadow-cyber transition-all duration-300 border border-cyber-blue/30 flex items-center gap-2"
          >
            <Plus size={20} />
            Add Expense
          </button>
        </div>
      </motion.div>

      {/* Month Filter */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${cardBg} p-6 rounded-2xl mb-6 border`}
      >
        <div className="flex items-center gap-4">
          <label className={`text-sm font-semibold ${textSecondary}`}>Filter by Month:</label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${
              theme === 'light'
                ? 'bg-white text-gray-900 border-gray-300'
                : 'bg-white/5 text-white border-orange-500/30'
            }`}
          />
          <span className={`text-lg font-bold ${textPrimary}`}>{formatMonthName(selectedMonth)}</span>
        </div>
      </motion.div>

      {/* Total Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <button
          className={`${cardBg} p-6 rounded-xl border w-full flex items-center justify-between hover:shadow-lg transition-all duration-300`}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl">
              <TrendingDown size={28} className="text-white" />
            </div>
            <div className="text-left">
              <p className={`text-sm ${textSecondary}`}>Total Expenses for {formatMonthName(selectedMonth)}</p>
              <p className={`text-3xl font-bold ${textPrimary}`}>₹{stats.total.toLocaleString()}</p>
            </div>
          </div>
          <div className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold">
            TOTAL
          </div>
        </button>
      </motion.div>

      {/* Expenses List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        {monthlyExpenses.length === 0 ? (
          <div className={`${cardBg} p-12 rounded-2xl border text-center`}>
            <p className={textSecondary}>No expenses found for {formatMonthName(selectedMonth)}</p>
          </div>
        ) : (
          monthlyExpenses.map((expense) => (
            <motion.div
              key={expense.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`${cardBg} p-6 rounded-xl border hover:shadow-lg transition-all duration-300`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className={`text-lg font-bold ${textPrimary}`}>₹{expense.amount.toLocaleString()}</h3>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30">
                      EXPENSE
                    </span>
                  </div>
                  <p className={`${textSecondary} mb-3`}>{expense.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <p className={textSecondary}>
                      <span className="font-semibold">Added by:</span> {expense.addedByName}
                    </p>
                    <p className={textSecondary}>
                      <span className="font-semibold">Date:</span> {new Date(expense.createdAt).toLocaleDateString()}
                    </p>
                    <p className={textSecondary}>
                      <span className="font-semibold">Month:</span> {formatMonthName(expense.month)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {(isAdmin || expense.addedBy === user?.id) && (
                    <button
                      onClick={() => handleDelete(expense.id)}
                      className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all border border-red-500/30"
                      title="Delete Expense"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Add Expense Modal */}
      {showAddModal && <AddExpenseModal onClose={() => setShowAddModal(false)} />}
    </MainLayout>
  );
};

// Add Expense Modal Component
interface AddExpenseModalProps {
  onClose: () => void;
}

const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ onClose }) => {
  const { addExpense: addExpenseToContext } = useData();
  const { theme } = useTheme();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    month: (() => {
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    })(),
  });

  const cardBg = theme === 'light' ? 'bg-white' : 'glass-dark';
  const inputBgClass = theme === 'light' ? 'bg-white text-gray-900 border-gray-300' : 'bg-white/5 text-white border-orange-500/30';
  const labelClass = theme === 'light' ? 'text-gray-700' : 'text-cyber-blue/80';
  const textPrimary = theme === 'light' ? 'text-gray-900' : 'text-cyber-blue';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.amount || !formData.description || !formData.month) {
      alert('Please fill in all required fields');
      return;
    }

    const expenseData = {
      amount: parseFloat(formData.amount),
      description: formData.description,
      month: formData.month,
      addedBy: user?.id || '',
      addedByName: user?.name || 'Unknown',
    };

    await addExpenseToContext(expenseData);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className={`${cardBg} p-6 rounded-2xl border ${
          theme === 'light' ? 'border-gray-200' : 'border-cyber-blue/20'
        } max-w-2xl w-full max-h-[90vh] overflow-y-auto`}
      >
        <h2 className={`text-2xl font-bold mb-6 ${textPrimary}`}>Add New Expense</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Amount */}
          <div>
            <label className={`block text-sm font-semibold mb-2 ${labelClass}`}>
              Amount *
            </label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="Enter amount"
              className={`w-full px-4 py-3 rounded-lg border ${inputBgClass} focus:outline-none focus:border-orange-500`}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className={`block text-sm font-semibold mb-2 ${labelClass}`}>
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter expense description"
              rows={4}
              className={`w-full px-4 py-3 rounded-lg border ${inputBgClass} focus:outline-none focus:border-orange-500 resize-none`}
              required
            />
          </div>

          {/* Month */}
          <div>
            <label className={`block text-sm font-semibold mb-2 ${labelClass}`}>
              Month *
            </label>
            <input
              type="month"
              value={formData.month}
              onChange={(e) => setFormData({ ...formData, month: e.target.value })}
              className={`w-full px-4 py-3 rounded-lg border ${inputBgClass} focus:outline-none focus:border-orange-500`}
              required
            />
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 bg-gradient-cyber text-white font-semibold py-3 rounded-lg hover:shadow-cyber transition-all duration-300 border border-cyber-blue/30"
            >
              Add Expense
            </button>
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 font-semibold py-3 rounded-lg transition-all duration-300 ${
                theme === 'light'
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                  : 'bg-cyber-blue/10 text-cyber-blue hover:bg-cyber-blue/20 border border-cyber-blue/30'
              }`}
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ExpensesPage;
