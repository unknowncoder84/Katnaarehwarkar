import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Plus, Trash2, Search, X, MapPin, Upload, FileText, Download, Link as LinkIcon } from 'lucide-react';
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
  const { isAdmin, user } = useAuth();
  const { libraryLocations } = useData();
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Library items state - starts empty, items are added dynamically
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
  
  // Form fields
  const [itemName, setItemName] = useState('');
  const [itemNumber, setItemNumber] = useState('');
  const [itemLocationId, setItemLocationId] = useState('');
  const [itemType, setItemType] = useState<'File' | 'Book'>('Book');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!itemName || !itemNumber || !itemLocationId) {
      setError('Please fill in all required fields');
      return;
    }

    const selectedLoc = libraryLocations.find(loc => loc.id === itemLocationId);
    if (!selectedLoc) {
      setError('Please select a valid location');
      return;
    }

    let dropboxPath = '';
    let dropboxLink = '';

    // Upload file to Dropbox if selected
    if (selectedFile && itemType === 'File') {
      setUploading(true);
      try {
        const result = await dropbox.uploadFile(selectedFile, `library-${Date.now()}`);
        dropboxPath = result.path;
        // Try to get shareable link
        try {
          const linkResult = await dropbox.getShareableLink(result.path);
          dropboxLink = linkResult.url;
        } catch {
          console.log('Could not get shareable link');
        }
      } catch (err) {
        console.error('Dropbox upload error:', err);
        setError('File upload failed. Item will be added without file.');
      } finally {
        setUploading(false);
      }
    }

    const newItem: LibraryItem = {
      id: Date.now().toString(),
      name: itemName,
      number: itemNumber,
      location: selectedLoc.name,
      locationId: itemLocationId,
      type: itemType,
      addedAt: new Date(),
      addedBy: user?.name || 'Current User',
      dropboxPath,
      dropboxLink,
    };

    setLibraryItems([...libraryItems, newItem]);
    
    // Reset form
    setItemName('');
    setItemNumber('');
    setItemLocationId('');
    setItemType('Book');
    setSelectedFile(null);
    setShowAddForm(false);
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
    
    setLibraryItems(libraryItems.filter(item => item.id !== id));
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

  // Filter by selected location first, then by search term
  const filteredItems = libraryItems.filter((item) => {
    // Filter by location if one is selected
    if (selectedLocation && item.locationId !== selectedLocation) {
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

      {/* Location Filter Buttons */}
      {libraryLocations.length > 0 && (
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
          <div className="flex flex-wrap gap-2">
            {/* All Button */}
            <button
              onClick={() => setSelectedLocation(null)}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                selectedLocation === null
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                  : theme === 'light'
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              All Locations
            </button>
            {/* Dynamic Location Buttons from Settings */}
            {libraryLocations.map((loc) => (
              <button
                key={loc.id}
                onClick={() => setSelectedLocation(loc.id)}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
                  selectedLocation === loc.id
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                    : theme === 'light'
                      ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                      : 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/30'
                }`}
              >
                <BookOpen size={16} />
                {loc.name}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* No Locations Message */}
      {libraryLocations.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className={`${cardBg} p-4 rounded-xl border mb-4 md:mb-6`}
        >
          <div className="flex items-center gap-3">
            <MapPin size={20} className="text-amber-500" />
            <p className={textSecondary}>
              No library locations configured. {isAdmin ? 'Add locations in Settings to organize your library.' : 'Contact admin to add library locations.'}
            </p>
          </div>
        </motion.div>
      )}

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
                  theme === 'light' ? 'border-gray-300 hover:border-amber-400' : 'border-purple-500/30 hover:border-amber-500/50'
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
    </MainLayout>
  );
};

export default LibraryPage;
