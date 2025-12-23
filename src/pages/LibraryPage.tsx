import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Plus, Trash2, Search, X, MapPin, Upload, FileText, Download, Link as LinkIcon, Edit2 } from 'lucide-react';
import MainLayout from '../components/MainLayout';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { dropbox, downloadBlob } from '../lib/dropbox';

interface LibraryItem {
  id: string;
  name: string;
  number: string;
  location: string;
  locationId: string;
  type: 'File' | 'Book';
  addedAt: Date;
  addedBy: string;
  dropboxPath?: string;
  dropboxLink?: string;
}

const LibraryPage: React.FC = () => {
  const { theme } = useTheme();
  const { isAdmin } = useAuth();
  const { libraryLocations, books, addBook, deleteBook } = useData();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<LibraryItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Library items state - now synced with database books
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
  
  // Sync library items with database books
  React.useEffect(() => {
    const items: LibraryItem[] = books.map(book => ({
      id: book.id,
      name: book.name,
      number: book.number || book.id.slice(-6).toUpperCase(), // Use stored number, fallback to ID
      location: book.location || 'Default',
      locationId: '',
      type: 'Book' as const,
      addedAt: new Date(book.addedAt),
      addedBy: book.addedBy || 'Unknown',
    }));
    setLibraryItems(items);
  }, [books]);
  
  // Form fields
  const [itemName, setItemName] = useState('');
  const [itemNumber, setItemNumber] = useState('');
  const [itemLocationId, setItemLocationId] = useState('');
  const [itemType, setItemType] = useState<'File' | 'Book'>('Book');
  
  // Edit form fields
  const [editName, setEditName] = useState('');
  const [editNumber, setEditNumber] = useState('');
  const [editLocation, setEditLocation] = useState('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!itemName) {
      setError('Please enter a name');
      return;
    }

    // Upload file to Dropbox if selected
    if (selectedFile && itemType === 'File') {
      setUploading(true);
      try {
        await dropbox.uploadFile(selectedFile, `library-${Date.now()}`);
      } catch (err) {
        console.error('Dropbox upload error:', err);
        setError('File upload failed. Item will be added without file.');
      } finally {
        setUploading(false);
      }
    }

    // Save to database using addBook function with number and location
    try {
      // Get location name from locationId
      const selectedLoc = libraryLocations.find(loc => loc.id === itemLocationId);
      const locationName = selectedLoc?.name || '';
      
      const result = await addBook(itemName, itemNumber, locationName);
      if (!result.success) {
        setError(result.error || 'Failed to add item');
        return;
      }
      
      // Reset form
      setItemName('');
      setItemNumber('');
      setItemLocationId('');
      setItemType('Book');
      setSelectedFile(null);
      setShowAddForm(false);
    } catch (err) {
      console.error('Error adding item:', err);
      setError('Failed to add item to library');
    }
  };

  const handleDeleteItem = async (id: string) => {
    const item = libraryItems.find(i => i.id === id);
    
    // Delete from Dropbox if it has a path
    if (item?.dropboxPath) {
      try {
        await dropbox.deleteFile(item.dropboxPath);
      } catch (err) {
        console.error('Error deleting from Dropbox:', err);
      }
    }
    
    // Delete from database
    try {
      await deleteBook(id);
    } catch (err) {
      console.error('Error deleting from database:', err);
    }
  };

  const handleDownload = async (item: LibraryItem) => {
    if (!item.dropboxPath) return;
    
    try {
      const blob = await dropbox.downloadFile(item.dropboxPath);
      downloadBlob(blob, item.name);
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to download file');
    }
  };

  const openEditModal = (item: LibraryItem) => {
    setEditingItem(item);
    setEditName(item.name);
    setEditNumber(item.number);
    setEditLocation(item.location);
    setShowEditModal(true);
  };

  const handleEditItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    
    try {
      // Update in Supabase
      const { supabase } = await import('../lib/supabase');
      const { error } = await supabase
        .from('books')
        .update({
          name: editName,
          number: editNumber,
          location: editLocation,
        })
        .eq('id', editingItem.id);
      
      if (error) {
        console.error('Error updating item:', error);
        alert('Failed to update item: ' + error.message);
        return;
      }
      
      // Update local state
      setLibraryItems(prev => prev.map(item => 
        item.id === editingItem.id 
          ? { ...item, name: editName, number: editNumber, location: editLocation }
          : item
      ));
      
      setShowEditModal(false);
      setEditingItem(null);
    } catch (err) {
      console.error('Error updating item:', err);
      alert('Failed to update item');
    }
  };

  // Filter by selected location first, then by search term
  const filteredItems = libraryItems.filter((item) => {
    // Filter by location if one is selected (now comparing by location name)
    if (selectedLocation && item.location !== selectedLocation) {
      return false;
    }
    // Then filter by search term
    return (
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.type.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const cardBg = theme === 'light' 
    ? 'bg-white/95 backdrop-blur-xl border-gray-200 shadow-md' 
    : 'glass-dark border-cyber-blue/20';
  const textPrimary = theme === 'light' ? 'text-gray-900' : 'text-cyber-blue';
  const textSecondary = theme === 'light' ? 'text-gray-700' : 'text-cyber-blue/60';
  const inputBg = theme === 'light' 
    ? 'bg-white border-gray-300 text-gray-900 placeholder-gray-500' 
    : 'bg-white/5 border-orange-500/30 text-white placeholder-gray-400';

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
                Library
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

      {/* Location Filter Dropdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mb-4 md:mb-6"
      >
        <div className="flex items-center gap-2 mb-3">
          <MapPin size={18} className={textSecondary} />
          <span className={`text-sm font-semibold ${textSecondary}`}>Filter by Location</span>
        </div>
        <div className="relative max-w-xs">
          <select
            value={selectedLocation || ''}
            onChange={(e) => setSelectedLocation(e.target.value || null)}
            className={`w-full px-4 py-3 rounded-xl border appearance-none cursor-pointer ${inputBg} focus:outline-none focus:border-amber-500 transition-all pr-10`}
          >
            <option value="">All Locations</option>
            {libraryLocations.map((loc) => (
              <option key={loc.id} value={loc.name}>{loc.name}</option>
            ))}
          </select>
          {/* Dropdown Arrow Icon */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className={`w-5 h-5 ${textSecondary}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {libraryLocations.length === 0 && (
          <p className={`text-sm mt-2 ${textSecondary}`}>
            {isAdmin ? 'Add locations in Settings to organize your library.' : 'Contact admin to add library locations.'}
          </p>
        )}
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
                <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Name *</label>
                <input
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="Enter item name..."
                  className={`w-full px-4 py-2.5 rounded-xl border ${inputBg} focus:outline-none focus:border-amber-500 transition-all`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Number *</label>
                <input
                  type="text"
                  value={itemNumber}
                  onChange={(e) => setItemNumber(e.target.value)}
                  placeholder="Enter reference number..."
                  className={`w-full px-4 py-2.5 rounded-xl border ${inputBg} focus:outline-none focus:border-amber-500 transition-all`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Location *</label>
                <select
                  value={itemLocationId}
                  onChange={(e) => setItemLocationId(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border ${inputBg} focus:outline-none focus:border-amber-500 transition-all`}
                  disabled={libraryLocations.length === 0}
                >
                  <option value="">Select a location...</option>
                  {libraryLocations.map((loc) => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
                {libraryLocations.length === 0 && (
                  <p className="text-xs text-amber-500 mt-1">Add locations in Settings first</p>
                )}
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Type</label>
                <select
                  value={itemType}
                  onChange={(e) => setItemType(e.target.value as 'File' | 'Book')}
                  className={`w-full px-4 py-2.5 rounded-xl border ${inputBg} focus:outline-none focus:border-amber-500 transition-all`}
                >
                  <option value="Book">Book</option>
                  <option value="File">File</option>
                </select>
              </div>
            </div>

            {/* Dropbox File Upload */}
            {itemType === 'File' && (
              <div>
                <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>
                  <Upload size={16} className="inline mr-2" />
                  Upload to Dropbox (Optional)
                </label>
                <div className={`border-2 border-dashed rounded-xl p-4 text-center ${
                  theme === 'light' ? 'border-gray-300 hover:border-amber-400' : 'border-orange-500/30 hover:border-amber-500/50'
                } transition-colors`}>
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    {selectedFile ? (
                      <div className="flex items-center justify-center gap-2">
                        <FileText size={20} className="text-amber-500" />
                        <span className={textPrimary}>{selectedFile.name}</span>
                        <button
                          type="button"
                          onClick={(e) => { e.preventDefault(); setSelectedFile(null); }}
                          className="p-1 hover:bg-red-500/20 rounded-full"
                        >
                          <X size={16} className="text-red-500" />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <Upload size={32} className={`mx-auto mb-2 ${textSecondary}`} />
                        <p className={textSecondary}>Click to select a file</p>
                        <p className={`text-xs ${textSecondary} mt-1`}>File will be uploaded to Dropbox</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            )}
            
            {error && <p className="text-red-500 text-sm">{error}</p>}
            
            <button
              type="submit"
              disabled={uploading || libraryLocations.length === 0}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Plus size={18} />
                  Add to Library
                </>
              )}
            </button>
          </form>
        </motion.div>
      )}

      {/* Search Bar */}
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
            className={`w-full pl-11 pr-4 py-3 rounded-xl border ${inputBg} focus:outline-none focus:border-amber-500 transition-all`}
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
            <p className={textSecondary}>{searchTerm ? 'No items match your search' : 'No library items yet'}</p>
            {isAdmin && libraryLocations.length > 0 && !searchTerm && (
              <p className={`text-sm mt-2 ${textSecondary}`}>Click "Add Item" to add your first library item</p>
            )}
            {isAdmin && libraryLocations.length === 0 && !searchTerm && (
              <p className={`text-sm mt-2 text-amber-500`}>First, add library locations in Settings</p>
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
                  <th className={`px-4 py-3 text-left text-sm font-semibold ${textPrimary}`}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/10">
                {filteredItems.map((item, index) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`${theme === 'light' ? 'hover:bg-amber-50/50' : 'hover:bg-white/5'} transition-colors`}
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
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {/* Dropbox Actions */}
                        {item.dropboxPath && (
                          <>
                            <button
                              onClick={() => handleDownload(item)}
                              className="p-2 text-blue-500 hover:bg-blue-500/20 rounded-lg transition-colors"
                              title="Download from Dropbox"
                            >
                              <Download size={16} />
                            </button>
                            {item.dropboxLink && (
                              <a
                                href={item.dropboxLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-green-500 hover:bg-green-500/20 rounded-lg transition-colors"
                                title="Open Dropbox Link"
                              >
                                <LinkIcon size={16} />
                              </a>
                            )}
                          </>
                        )}
                        {/* Edit - Admin Only */}
                        {isAdmin && (
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-2 text-blue-500 hover:bg-blue-500/20 rounded-lg transition-colors"
                            title="Edit item"
                          >
                            <Edit2 size={16} />
                          </button>
                        )}
                        {/* Delete - Admin Only */}
                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-2 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors"
                            title="Delete item"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Edit Item Modal */}
      {showEditModal && editingItem && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowEditModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className={`${cardBg} rounded-2xl border p-6 w-full max-w-md shadow-2xl`}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                  <Edit2 size={20} className="text-white" />
                </div>
                <h2 className={`text-xl font-bold ${textPrimary}`}>Edit Library Item</h2>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className={`p-2 rounded-lg hover:bg-gray-500/20 transition-colors`}
              >
                <X size={20} className={textSecondary} />
              </button>
            </div>

            <form onSubmit={handleEditItem} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-2`}>Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border ${inputBg} focus:outline-none focus:border-blue-500 transition-colors`}
                  placeholder="Enter item name"
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-2`}>Number</label>
                <input
                  type="text"
                  value={editNumber}
                  onChange={(e) => setEditNumber(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border ${inputBg} focus:outline-none focus:border-blue-500 transition-colors`}
                  placeholder="Enter reference number"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-2`}>Location</label>
                <select
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border ${inputBg} focus:outline-none focus:border-blue-500 transition-colors`}
                >
                  <option value="">Select a location...</option>
                  {libraryLocations.map((loc) => (
                    <option key={loc.id} value={loc.name}>{loc.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className={`flex-1 px-4 py-3 rounded-xl border ${theme === 'light' ? 'border-gray-300 text-gray-700 hover:bg-gray-100' : 'border-white/20 text-white hover:bg-white/10'} font-medium transition-colors`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </MainLayout>
  );
};

export default LibraryPage;
