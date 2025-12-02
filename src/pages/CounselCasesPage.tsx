import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import { useData } from '../contexts/DataContext';
import { useTheme } from '../contexts/ThemeContext';
import { exportToCSV, exportToExcel, exportToPDF } from '../utils/exportData';
import { Case } from '../types';

const CounselCasesPage: React.FC = () => {
  const navigate = useNavigate();
  const { cases } = useData();
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');

  // Filter cases for counsel (you can add specific logic here)
  const counselCases = useMemo(() => {
    let filtered = cases;

    if (searchTerm) {
      filtered = filtered.filter(
        (c) =>
          c.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.fileNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.partiesName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [cases, searchTerm]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-500/20 text-green-400',
      pending: 'bg-yellow-500/20 text-yellow-400',
      closed: 'bg-gray-500/20 text-gray-400',
      'on-hold': 'bg-orange-500/20 text-orange-400',
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400';
  };

  const bgClass = theme === 'light' ? 'bg-white text-black' : 'glass-dark text-cyber-blue';
  const borderClass = theme === 'light' ? 'border-gray-300' : 'border-cyber-blue/20';
  const hoverClass = theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-cyber-blue/10';
  const inputBgClass = theme === 'light' ? 'bg-white text-gray-900 border-gray-300 placeholder-gray-500' : 'bg-white/5 text-white border-purple-500/30 placeholder-gray-400';
  const headerBgClass = theme === 'light' ? 'bg-gray-100' : 'bg-cyber-blue/10';

  return (
    <MainLayout>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${bgClass} p-6 rounded-lg mb-6 border ${borderClass}`}
      >
        <h1 className={`text-2xl font-bold font-cyber ${theme === 'light' ? 'text-gray-900' : 'holographic-text'}`}>Case Management ({counselCases.length} Cases)</h1>
      </motion.div>

      {/* Search Result Info */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`${bgClass} p-4 rounded-lg mb-6 border ${borderClass}`}
      >
        <p className="font-semibold">Search Result For - Council Cases</p>
      </motion.div>

      {/* Export Buttons and Search */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex items-center justify-between mb-6 gap-4 flex-wrap"
      >
        <div className="flex gap-3">
          <button
            onClick={() => exportToCSV(counselCases, `counsel_cases_${new Date().getTime()}.csv`)}
            className="bg-gradient-to-r from-cyber-green to-emerald-500 text-white px-4 py-2 rounded font-semibold font-cyber hover:shadow-cyber transition-all duration-300 flex items-center gap-2 border border-cyber-green/30"
          >
            <Download size={18} />
            CSV
          </button>
          <button
            onClick={() => exportToExcel(counselCases, `counsel_cases_${new Date().getTime()}.xlsx`)}
            className="bg-gradient-to-r from-cyber-blue to-neon-blue text-white px-4 py-2 rounded font-semibold font-cyber hover:shadow-cyber transition-all duration-300 flex items-center gap-2 border border-cyber-blue/30"
          >
            <Download size={18} />
            EXCEL
          </button>
          <button
            onClick={() => exportToPDF(counselCases, `counsel_cases_${new Date().getTime()}.pdf`)}
            className="bg-gradient-to-r from-cyber-pink to-neon-pink text-white px-4 py-2 rounded font-semibold font-cyber hover:shadow-cyber-pink transition-all duration-300 flex items-center gap-2 border border-cyber-pink/30"
          >
            <FileText size={18} />
            PDF
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-semibold">SEARCH</span>
          <input
            type="text"
            placeholder="Search cases..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`px-4 py-2 rounded border ${inputBgClass} focus:outline-none focus:border-cyber-blue focus:shadow-cyber transition-colors`}
          />
          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <Search size={20} />
          </button>
        </div>
      </motion.div>

      {/* Cases Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={`${bgClass} rounded-xl overflow-hidden border ${borderClass}`}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${borderClass} ${headerBgClass}`}>
                <th className={`text-left py-4 px-6 font-semibold ${theme === 'light' ? 'text-gray-700' : 'text-gray-400'}`}>SR</th>
                <th className={`text-left py-4 px-6 font-semibold ${theme === 'light' ? 'text-gray-700' : 'text-gray-400'}`}>CLIENT / COUNSELLOR NAME</th>
                <th className={`text-left py-4 px-6 font-semibold ${theme === 'light' ? 'text-gray-700' : 'text-gray-400'}`}>FILE NO</th>
                <th className={`text-left py-4 px-6 font-semibold ${theme === 'light' ? 'text-gray-700' : 'text-gray-400'}`}>NEXT DATE</th>
                <th className={`text-left py-4 px-6 font-semibold ${theme === 'light' ? 'text-gray-700' : 'text-gray-400'}`}>STAMP NO</th>
                <th className={`text-left py-4 px-6 font-semibold ${theme === 'light' ? 'text-gray-700' : 'text-gray-400'}`}>REG NO</th>
                <th className={`text-left py-4 px-6 font-semibold ${theme === 'light' ? 'text-gray-700' : 'text-gray-400'}`}>STATUS</th>
                <th className={`text-left py-4 px-6 font-semibold ${theme === 'light' ? 'text-gray-700' : 'text-gray-400'}`}>CASE TYPE</th>
                <th className={`text-left py-4 px-6 font-semibold ${theme === 'light' ? 'text-gray-700' : 'text-gray-400'}`}>DETAILS</th>
                <th className={`text-left py-4 px-6 font-semibold ${theme === 'light' ? 'text-gray-700' : 'text-gray-400'}`}>NAME OF PARTIES</th>
              </tr>
            </thead>
            <tbody>
              {counselCases.length > 0 ? (
                counselCases.map((caseItem: Case, index: number) => (
                  <tr
                    key={caseItem.id}
                    className={`border-b ${borderClass} ${hoverClass} transition-colors duration-200`}
                  >
                    <td className="py-4 px-6">{index + 1}</td>
                    <td className="py-4 px-6 font-medium">{caseItem.clientName}</td>
                    <td className="py-4 px-6">{caseItem.fileNo}</td>
                    <td className="py-4 px-6">
                      {new Date(caseItem.nextDate).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6">{caseItem.stampNo}</td>
                    <td className="py-4 px-6">{caseItem.regNo}</td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          caseItem.status
                        )}`}
                      >
                        {caseItem.status.charAt(0).toUpperCase() + caseItem.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-6">{caseItem.caseType}</td>
                    <td className="py-4 px-6">
                      <button 
                        onClick={() => navigate(`/cases/${caseItem.id}`)}
                        className={`px-4 py-2 rounded font-semibold transition-all ${
                          theme === 'light' 
                            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                            : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                      >
                        VIEW CASE
                      </button>
                    </td>
                    <td className="py-4 px-6">{caseItem.partiesName}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="py-12 px-6 text-center">
                    <p className={theme === 'light' ? 'text-gray-500' : 'text-gray-400'}>
                      No data available in table
                    </p>
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

export default CounselCasesPage;
