import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Plus, Trash2, Search, X } from 'lucide-react';
import MainLayout from '../components/MainLayout';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

interface LibraryItem {
  id: string;
  name: string;
  number: string;
  location: string;
  type: 'File' | 'Book';
  addedAt: Date;
  addedBy: string;
}

const LibraryPage: React.FC = () => {
  const { theme } = useTheme();
  const { isAdmin } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  
  // Mock data - replace with actual data from context
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([
    {
      id: '1',
      name: 'Constitution of India',
      number: 'BK-2024-001',
      location: 'L1-Shelf-A-01',
      type: 'Book',
      addedAt: new Date(),
      addedBy: 'Admin'
    },
    {
      id: '2',
      name: 'Criminal Procedure Code',
      number: 'BK-2024-002',
      location: 'L1-Shelf-A-02',
      type: 'Book',
      addedAt: new Date(),
      addedBy: 'Admin'
    }
  ]);
  
  // Form fields
  const [itemName, setItemName] = useState('');
  const [itemNumber, setItemNumber] = useState('');
  const [itemLocation, setItemLocation] = useState('');
  const [itemType, setItemType] = useState<'File' | 'Book'>('Book');

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!itemName || !itemNumber || !itemLocation) {
      setError('Please fill in all fields');
      return;
    }

    const newItem: LibraryItem = {
      id: Date.now().toString(),
      name: itemName,
      number: itemNumber,
      location: itemLocation,
      type: itemType,
      addedAt: new Date(),
      addedBy: 'Current User'
    };

    setLibraryItems([...libraryItems, newItem]);
    
    // Reset form
    setItemName('');
    setItemNumber('');
    setItemLocation('');
    setItemType('Book');
    setShowAddForm(false);
  };

  const handleDeleteItem = (id: string) => {
    setLibraryItems(libraryItems.filter(item => item.id !== id));
  };

  const filteredItems = libraryItems.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const cardBg = theme === 'light' 
    ? 'bg-white/95 backdrop-blur-xl border-gray-200 shadow-md' 
    : 'glass-dark border-cyber-blue/20';
  const textPrimary = theme === 'light' ? 'text-gray-900' : 'text-cyber-blue';
  const textSecondary = theme === 'light' ? 'text-gray-700' : 'text-cyber-blue/60';
  const inputBg = theme === 'light' 
    ? 'bg-white border-gray-300 text-gray-900 placeholder-gray-500' 
    : 'bg-white/5 border-purple-500/30 text-white placeholder-gray-400';

  return (
    <MainLayout>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 md:mb-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="p-2 md:p-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg md:rounded-xl">
              <BookOpen size={20} className="text-white md:w-6 md:h-6" />
            </div>
            <div>
              <h1 className={`text-xl md:text-3xl font-bold font-cyber ${textPrimary}`}>
                Library Management
              </h1>
              <p className={`text-sm md:text-base ${textSecondary}`}>Manage your legal reference library</p>
            </div>
          </div>
          
          {/* Admin Only: Add Button */}
          {isAdmin && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2.5 rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              {showAddForm ? <X size={18} /> : <Plus size={18} />}
              {showAddForm ? 'Cancel' : 'Add Item'}
            </button>
          )}
        </div>
      </motion.div>

      {/* Admin Only: Add Item Form */}
      {isAdmin && showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${cardBg} p-4 md:p-6 rounded-xl md:rounded-2xl border mb-4 md:mb-6`}
        >
          <h2 className={`text-lg md:text-xl font-bold font-cyber mb-3 md:mb-4 ${textPrimary}`}>Add New Item</h2>
          <form onSubmit={handleAddItem} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Name</label>
                <input
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="Enter item name..."
                  className={`w-full px-4 py-2.5 rounded-xl border ${inputBg} focus:outline-none focus:border-purple-500 transition-all`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Number</label>
                <input
                  type="text"
                  value={itemNumber}
                  onChange={(e) => setItemNumber(e.target.value)}
                  placeholder="Enter reference number..."
                  className={`w-full px-4 py-2.5 rounded-xl border ${inputBg} focus:outline-none focus:border-purple-500 transition-all`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Location</label>
                <input
                  type="text"
                  value={itemLocation}
                  onChange={(e) => setItemLocation(e.target.value)}
                  placeholder="Enter library location..."
                  className={`w-full px-4 py-2.5 rounded-xl border ${inputBg} focus:outline-none focus:border-purple-500 transition-all`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Type</label>
                <select
                  value={itemType}
                  onChange={(e) => setItemType(e.target.value as 'File' | 'Book')}
                  className={`w-full px-4 py-2.5 rounded-xl border ${inputBg} focus:outline-none focus:border-purple-500 transition-all`}
                >
                  <option value="Book">Book</option>
                  <option value="File">File</option>
                </select>
              </div>
            </div>
            
            {error && <p className="text-red-500 text-sm">{error}</p>}
            
            <button
              type="submit"
              className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              <Plus size={18} />
              Add to Library
            </button>
          </form>
        </motion.div>
      )}

      {/* Search Bar - Available to All Users */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <div className="relative">
          <Search size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 ${textSecondary}`} />
          <input
            type="text"
            placeholder="Search by name, number, location, or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-11 pr-4 py-3 rounded-xl border ${inputBg} focus:outline-none focus:border-purple-500 transition-all`}
          />
        </div>
      </motion.div>

      {/* Library Items Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`${cardBg} rounded-2xl border overflow-hidden`}
      >
        <div className="p-4 border-b border-gray-200/20">
          <h2 className={`text-lg font-bold font-cyber ${textPrimary}`}>
            Library Items ({filteredItems.length})
          </h2>
        </div>
        
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center">
            <BookOpen size={48} className={`mx-auto mb-4 ${textSecondary} opacity-50`} />
            <p className={textSecondary}>No items found</p>
            {isAdmin && (
              <p className={`text-sm mt-2 ${textSecondary}`}>Click "Add Item" to add library items</p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${theme === 'light' ? 'bg-gray-50' : 'bg-white/5'}`}>
                <tr>
                  <th className={`px-4 py-3 text-left text-sm font-semibold ${textPrimary}`}>Name</th>
                  <th className={`px-4 py-3 text-left text-sm font-semibold ${textPrimary}`}>Number</th>
                  <th className={`px-4 py-3 text-left text-sm font-semibold ${textPrimary}`}>Location</th>
                  <th className={`px-4 py-3 text-left text-sm font-semibold ${textPrimary}`}>Type</th>
                  <th className={`px-4 py-3 text-left text-sm font-semibold ${textPrimary}`}>Added</th>
                  {isAdmin && <th className={`px-4 py-3 text-left text-sm font-semibold ${textPrimary}`}>Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/10">
                {filteredItems.map((item, index) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`${theme === 'light' ? 'hover:bg-purple-50/50' : 'hover:bg-white/5'} transition-colors`}
                  >
                    <td className={`px-4 py-3 ${textPrimary}`}>{item.name}</td>
                    <td className={`px-4 py-3 ${textSecondary}`}>{item.number}</td>
                    <td className={`px-4 py-3 ${textSecondary}`}>{item.location}</td>
                    <td className={`px-4 py-3`}>
                      <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                        item.type === 'Book' 
                          ? 'bg-amber-500/20 text-amber-500' 
                          : 'bg-blue-500/20 text-blue-500'
                      }`}>
                        {item.type}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-sm ${textSecondary}`}>
                      {new Date(item.addedAt).toLocaleDateString()}
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-2 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors"
                          title="Delete item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    )}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </MainLayout>
  );
};

export default LibraryPage;
