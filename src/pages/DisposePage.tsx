import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Archive, Search, FileText } from 'lucide-react';
import MainLayout from '../components/MainLayout';
import { useData } from '../contexts/DataContext';
import { useTheme } from '../contexts/ThemeContext';
import { exportToCSV, exportToExcel, exportToPDF } from '../utils/exportData';

const DisposePage: React.FC = () => {
  const { getDisposedCases } = useData();
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');

  const disposedCases = useMemo(() => getDisposedCases(), [getDisposedCases]);

  const filteredCases = useMemo(() => {
    if (!searchTerm) return disposedCases;
    const term = searchTerm.toLowerCase();
    return disposedCases.filter(
      (c) =>
        c.clientName.toLowerCase().includes(term) ||
        c.fileNo.toLowerCase().includes(term) ||
        c.caseType.toLowerCase().includes(term) ||
        c.partiesName.toLowerCase().includes(term)
    );
  }, [disposedCases, searchTerm]);

  const cardBg = theme === 'light' 
    ? 'bg-white/95 backdrop-blur-xl border-gray-200 shadow-md' 
    : 'glass-dark border-cyber-blue/20';
  const textPrimary = theme === 'light' ? 'text-gray-900' : 'text-cyber-blue';
  const textSecondary = theme === 'light' ? 'text-gray-700' : 'text-cyber-blue/60';
  const inputBg = theme === 'light' 
    ? 'bg-white border-gray-300 text-gray-900 placeholder-gray-500' 
    : 'bg-white/5 border-orange-500/30 text-white placeholder-gray-400';
  const headerBg = theme === 'light' ? 'bg-gray-100' : 'bg-cyber-blue/10';

  return (
    <MainLayout>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 md:mb-6"
      >
        <div className="flex items-center gap-2 md:gap-3">
          <div className="p-2 md:p-3 bg-gradient-to-r from-gray-500 to-slate-600 rounded-lg md:rounded-xl">
            <Archive size={20} className="text-white md:w-6 md:h-6" />
          </div>
          <div>
            <h1 className={`text-xl md:text-3xl font-bold font-cyber ${textPrimary}`}>
              Disposed Cases
            </h1>
            <p className={`text-sm md:text-base ${textSecondary}`}>View all closed and disposed cases</p>
          </div>
        </div>
      </motion.div>

      {/* Export and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between mb-4 md:mb-6 gap-3 md:gap-4"
      >
        <div className="flex gap-2 md:gap-3 flex-wrap">
          <button
            onClick={() => exportToCSV(filteredCases, `disposed_cases_${Date.now()}.csv`)}
            className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-3 md:px-4 py-2 md:py-2.5 rounded-lg md:rounded-xl font-semibold font-cyber hover:shadow-lg transition-all text-xs md:text-sm flex items-center gap-1 md:gap-2"
          >
            <span>📊</span> CSV
          </button>
          <button
            onClick={() => exportToExcel(filteredCases, `disposed_cases_${Date.now()}.xlsx`)}
            className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-3 md:px-4 py-2 md:py-2.5 rounded-lg md:rounded-xl font-semibold font-cyber hover:shadow-lg transition-all text-xs md:text-sm flex items-center gap-1 md:gap-2"
          >
            <span>📑</span> EXCEL
          </button>
          <button
            onClick={() => exportToPDF(filteredCases, `disposed_cases_${Date.now()}.pdf`)}
            className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-3 md:px-4 py-2 md:py-2.5 rounded-lg md:rounded-xl font-semibold font-cyber hover:shadow-lg transition-all text-xs md:text-sm flex items-center gap-1 md:gap-2"
          >
            <span>📄</span> PDF
          </button>
        </div>

        <div className="relative">
          <Search size={16} className={`absolute left-3 md:left-4 top-1/2 -translate-y-1/2 ${textSecondary}`} />
          <input
            type="text"
            placeholder="Search disposed cases..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full sm:w-56 md:w-64 pl-9 md:pl-11 pr-3 md:pr-4 py-2 md:py-2.5 rounded-lg md:rounded-xl border ${inputBg} focus:outline-none focus:border-orange-500 transition-all text-sm`}
          />
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`${cardBg} p-4 rounded-2xl border mb-6`}
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-r from-gray-500/20 to-slate-600/20 rounded-xl">
            <Archive size={24} className="text-gray-500" />
          </div>
          <div>
            <p className={`text-2xl font-bold ${textPrimary}`}>{filteredCases.length}</p>
            <p className={textSecondary}>Total Disposed Cases</p>
          </div>
        </div>
      </motion.div>

      {/* Cases Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={`${cardBg} rounded-2xl border overflow-hidden`}
      >
        {filteredCases.length === 0 ? (
          <div className="p-8 text-center">
            <FileText size={48} className={`mx-auto mb-4 ${textSecondary} opacity-50`} />
            <p className={textSecondary}>No disposed cases found</p>
            <p className={`text-sm mt-2 ${textSecondary}`}>
              Cases with "closed" status will appear here
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${theme === 'light' ? 'border-gray-200' : 'border-white/10'} ${headerBg}`}>
                  <th className={`text-left py-4 px-4 font-semibold text-sm ${theme === 'light' ? 'text-gray-700' : 'text-gray-400'}`}>SR</th>
                  <th className={`text-left py-4 px-4 font-semibold text-sm ${theme === 'light' ? 'text-gray-700' : 'text-gray-400'}`}>CLIENT NAME</th>
                  <th className={`text-left py-4 px-4 font-semibold text-sm ${theme === 'light' ? 'text-gray-700' : 'text-gray-400'}`}>FILE NO</th>
                  <th className={`text-left py-4 px-4 font-semibold text-sm ${theme === 'light' ? 'text-gray-700' : 'text-gray-400'}`}>CASE TYPE</th>
                  <th className={`text-left py-4 px-4 font-semibold text-sm ${theme === 'light' ? 'text-gray-700' : 'text-gray-400'}`}>PARTIES</th>
                  <th className={`text-left py-4 px-4 font-semibold text-sm ${theme === 'light' ? 'text-gray-700' : 'text-gray-400'}`}>DISPOSAL DATE</th>
                </tr>
              </thead>
              <tbody>
                {filteredCases.map((caseItem, index) => (
                  <tr
                    key={caseItem.id}
                    className={`border-b ${theme === 'light' ? 'border-gray-100 hover:bg-orange-50/50' : 'border-white/5 hover:bg-white/5'} transition-colors`}
                  >
                    <td className={`py-4 px-4 text-sm ${textPrimary}`}>{index + 1}</td>
                    <td className={`py-4 px-4 font-medium text-sm ${textPrimary}`}>{caseItem.clientName}</td>
                    <td className={`py-4 px-4 text-sm ${textSecondary}`}>{caseItem.fileNo}</td>
                    <td className={`py-4 px-4 text-sm ${textSecondary}`}>{caseItem.caseType}</td>
                    <td className={`py-4 px-4 text-sm ${textSecondary} max-w-xs truncate`}>{caseItem.partiesName}</td>
                    <td className={`py-4 px-4 text-sm ${textSecondary}`}>
                      {new Date(caseItem.updatedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </MainLayout>
  );
};

export default DisposePage;
