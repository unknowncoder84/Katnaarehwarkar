import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun, Trash2 } from 'lucide-react';
import MainLayout from '../components/MainLayout';
import { useTheme } from '../contexts/ThemeContext';
import { useData } from '../contexts/DataContext';

const SettingsPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { courts, caseTypes, addCourt, deleteCourt, addCaseType, deleteCaseType } = useData();
  const [courtName, setCourtName] = useState('');
  const [caseTypeName, setCaseTypeName] = useState('');

  const handleAddCourt = () => {
    if (courtName.trim()) {
      addCourt(courtName);
      setCourtName('');
    }
  };

  const handleAddCaseType = () => {
    if (caseTypeName.trim()) {
      addCaseType(caseTypeName);
      setCaseTypeName('');
    }
  };

  const cardBg = theme === 'light' ? 'bg-white/90 backdrop-blur-xl border-gray-200/50' : 'glass-dark border-cyber-blue/20';
  const inputBgClass = theme === 'light' ? 'bg-white text-gray-900 border-gray-300 placeholder-gray-500' : 'bg-white/5 text-white border-purple-500/30 placeholder-gray-400';
  const itemBgClass = theme === 'light' ? 'bg-gray-50' : 'bg-cyber-blue/10';
  const textPrimary = theme === 'light' ? 'text-gray-900' : 'text-cyber-blue';
  const textSecondary = theme === 'light' ? 'text-gray-600' : 'text-cyber-blue/60';

  return (
    <MainLayout>
      <h1 className={`text-2xl md:text-4xl font-bold font-cyber mb-8 ${textPrimary}`}>Settings</h1>

      {/* Theme Switcher */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${cardBg} p-6 rounded-2xl mb-6 border`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className={`text-xl font-bold ${textPrimary}`}>Appearance</h2>
            <p className={`text-sm mt-1 ${textSecondary}`}>Customize how the app looks</p>
          </div>
          <button
            onClick={toggleTheme}
            className="bg-gradient-cyber text-white px-6 py-3 rounded-xl hover:shadow-cyber transition-all duration-300 flex items-center gap-2 font-medium font-cyber border border-cyber-blue/30"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </motion.div>

      {/* Court Management */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`${cardBg} p-6 rounded-2xl mb-6 border`}
      >
        <h2 className={`text-xl font-bold mb-4 ${textPrimary}`}>Court Management</h2>
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            value={courtName}
            onChange={(e) => setCourtName(e.target.value)}
            placeholder="Enter court name"
            className={`flex-1 px-4 py-3 border rounded-xl focus:outline-none focus:border-purple-500 transition-colors ${inputBgClass}`}
            onKeyPress={(e) => e.key === 'Enter' && handleAddCourt()}
          />
          <button
            onClick={handleAddCourt}
            className="bg-gradient-to-r from-cyber-green to-emerald-500 text-white px-6 py-3 rounded-xl hover:shadow-cyber transition-all duration-300 font-medium font-cyber border border-cyber-green/30"
          >
            Add Court
          </button>
        </div>
        <div className="space-y-2">
          {courts.length === 0 ? (
            <p className={`text-center py-6 ${textSecondary}`}>No courts added yet</p>
          ) : (
            courts.map((court) => (
              <div key={court.id} className={`flex items-center justify-between ${itemBgClass} p-4 rounded-xl`}>
                <span className={textPrimary}>{court.name}</span>
                <button
                  onClick={() => deleteCourt(court.id)}
                  className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>
      </motion.div>

      {/* Case Type Management */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`${cardBg} p-6 rounded-2xl border`}
      >
        <h2 className={`text-xl font-bold mb-4 ${textPrimary}`}>Case Type Management</h2>
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            value={caseTypeName}
            onChange={(e) => setCaseTypeName(e.target.value)}
            placeholder="Enter case type"
            className={`flex-1 px-4 py-3 border rounded-xl focus:outline-none focus:border-purple-500 transition-colors ${inputBgClass}`}
            onKeyPress={(e) => e.key === 'Enter' && handleAddCaseType()}
          />
          <button
            onClick={handleAddCaseType}
            className="bg-gradient-to-r from-cyber-blue to-neon-blue text-white px-6 py-3 rounded-xl hover:shadow-cyber transition-all duration-300 font-medium font-cyber border border-cyber-blue/30"
          >
            Add Type
          </button>
        </div>
        <div className="space-y-2">
          {caseTypes.length === 0 ? (
            <p className={`text-center py-6 ${textSecondary}`}>No case types added yet</p>
          ) : (
            caseTypes.map((ct) => (
              <div key={ct.id} className={`flex items-center justify-between ${itemBgClass} p-4 rounded-xl`}>
                <span className={textPrimary}>{ct.name}</span>
                <button
                  onClick={() => deleteCaseType(ct.id)}
                  className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </MainLayout>
  );
};

export default SettingsPage;
