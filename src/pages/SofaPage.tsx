import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, FileText, Sofa } from 'lucide-react';
import MainLayout from '../components/MainLayout';
import { useData } from '../contexts/DataContext';
import { useTheme } from '../contexts/ThemeContext';

const SofaPage: React.FC = () => {
  const { sofaItems, addSofaItem, removeSofaItem, cases } = useData();
  const { theme } = useTheme();
  const [error, setError] = useState('');
  const [selectedCase, setSelectedCase] = useState('');
  const [selectedCompartment, setSelectedCompartment] = useState<'C1' | 'C2'>('C1');

  const c1Items = useMemo(() => 
    sofaItems.filter((item) => item.compartment === 'C1'), [sofaItems]
  );
  
  const c2Items = useMemo(() => 
    sofaItems.filter((item) => item.compartment === 'C2'), [sofaItems]
  );

  const getCaseDetails = (caseId: string) => {
    return cases.find((c) => c.id === caseId);
  };

  const handleAddToCompartment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!selectedCase) {
      setError('Please select a case');
      return;
    }

    const result = await addSofaItem(selectedCase, selectedCompartment);
    if (result.success) {
      setSelectedCase('');
    } else {
      setError(result.error || 'Failed to add case to compartment');
    }
  };

  const cardBg = theme === 'light' 
    ? 'bg-white/95 backdrop-blur-xl border-gray-200 shadow-md' 
    : 'glass-dark border-cyber-blue/20';
  const textPrimary = theme === 'light' ? 'text-gray-900' : 'text-cyber-blue';
  const textSecondary = theme === 'light' ? 'text-gray-700' : 'text-cyber-blue/60';
  const inputBg = theme === 'light' 
    ? 'bg-white border-gray-300 text-gray-900' 
    : 'bg-white/5 border-orange-500/30 text-white';

  const renderCompartment = (compartment: 'C1' | 'C2', items: typeof sofaItems) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${cardBg} rounded-2xl border overflow-hidden`}
    >
      <div className={`p-4 border-b ${theme === 'light' ? 'border-gray-200' : 'border-white/10'} ${compartment === 'C1' ? 'bg-gradient-to-r from-blue-500/10 to-cyan-500/10' : 'bg-gradient-to-r from-orange-500/10 to-amber-500/10'}`}>
        <h2 className={`text-lg font-bold font-cyber ${textPrimary}`}>
          Compartment {compartment} ({items.length} files)
        </h2>
      </div>
      
      {items.length === 0 ? (
        <div className="p-8 text-center">
          <FileText size={40} className={`mx-auto mb-3 ${textSecondary} opacity-50`} />
          <p className={textSecondary}>No case files in {compartment}</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200/10">
          {items.map((item, index) => {
            const caseData = getCaseDetails(item.caseId);
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-4 flex items-center justify-between ${theme === 'light' ? 'hover:bg-orange-50/50' : 'hover:bg-white/5'} transition-colors`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${compartment === 'C1' ? 'bg-blue-500/20' : 'bg-orange-500/20'}`}>
                    <FileText size={20} className={compartment === 'C1' ? 'text-blue-500' : 'text-orange-500'} />
                  </div>
                  <div>
                    <p className={`font-semibold ${textPrimary}`}>
                      {caseData?.clientName || 'Unknown Case'}
                    </p>
                    <p className={`text-sm ${textSecondary}`}>
                      File No: {caseData?.fileNo || 'N/A'} | Type: {caseData?.caseType || 'N/A'}
                    </p>
                    <p className={`text-xs ${textSecondary}`}>
                      Added: {new Date(item.addedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeSofaItem(item.id)}
                  className="p-2 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors"
                  title="Remove from compartment"
                >
                  <Trash2 size={18} />
                </button>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );

  return (
    <MainLayout>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 md:mb-6"
      >
        <div className="flex items-center gap-2 md:gap-3">
          <div className="p-2 md:p-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg md:rounded-xl">
            <Sofa size={20} className="text-white md:w-6 md:h-6" />
          </div>
          <div>
            <h1 className={`text-xl md:text-3xl font-bold font-cyber ${textPrimary}`}>
              Sofa Storage
            </h1>
            <p className={`text-sm md:text-base ${textSecondary}`}>Organize case files in compartments C1 and C2</p>
          </div>
        </div>
      </motion.div>

      {/* Add to Compartment Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`${cardBg} p-4 md:p-6 rounded-xl md:rounded-2xl border mb-4 md:mb-6`}
      >
        <h2 className={`text-lg md:text-xl font-bold font-cyber mb-3 md:mb-4 ${textPrimary}`}>Add Case to Compartment</h2>
        <form onSubmit={handleAddToCompartment} className="flex flex-col gap-3 md:gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            <select
              value={selectedCase}
              onChange={(e) => setSelectedCase(e.target.value)}
              className={`w-full px-3 md:px-4 py-2.5 md:py-3 rounded-lg md:rounded-xl border ${inputBg} focus:outline-none focus:border-orange-500 transition-all text-sm md:text-base`}
            >
              <option value="">Select a case...</option>
              {cases.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.clientName} - {c.fileNo}
                </option>
              ))}
            </select>
            <select
              value={selectedCompartment}
              onChange={(e) => setSelectedCompartment(e.target.value as 'C1' | 'C2')}
              className={`w-full px-3 md:px-4 py-2.5 md:py-3 rounded-lg md:rounded-xl border ${inputBg} focus:outline-none focus:border-orange-500 transition-all text-sm md:text-base`}
            >
              <option value="C1">Compartment C1</option>
              <option value="C2">Compartment C2</option>
            </select>
          </div>
          <button
            type="submit"
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 md:px-6 py-2.5 md:py-3 rounded-lg md:rounded-xl font-semibold font-cyber hover:shadow-lg transition-all text-sm md:text-base w-full sm:w-auto sm:self-start"
          >
            <Plus size={18} />
            Add to {selectedCompartment}
          </button>
        </form>
        {error && <p className="text-red-500 text-xs md:text-sm mt-2">{error}</p>}
      </motion.div>

      {/* Compartments Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderCompartment('C1', c1Items)}
        {renderCompartment('C2', c2Items)}
      </div>
    </MainLayout>
  );
};

export default SofaPage;
