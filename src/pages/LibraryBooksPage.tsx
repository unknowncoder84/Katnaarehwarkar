import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Plus, Trash2, Search, Filter } from 'lucide-react';
import MainLayout from '../components/MainLayout';
import { useData } from '../contexts/DataContext';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

const LibraryBooksPage: React.FC = () => {
  const { books, addBook, deleteBook, libraryLocations } = useData();
  const { theme } = useTheme();
  const { isAdmin } = useAuth();
  const [bookName, setBookName] = useState('');
  const [bookLocationId, setBookLocationId] = useState('');
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLocation, setFilterLocation] = useState('all'); // 'all' or location name

  // Get unique locations from books (for filtering existing books)
  const uniqueLocationsFromBooks = useMemo(() => {
    const locations = new Set<string>();
    books.forEach(book => {
      if (book.location && book.location.trim()) {
        locations.add(book.location.trim());
      }
    });
    return Array.from(locations).sort();
  }, [books]);

  // Combine library locations from settings with locations found in books
  const allAvailableLocations = useMemo(() => {
    const locationSet = new Set<string>();
    
    // Add locations from settings
    libraryLocations.forEach(loc => locationSet.add(loc.name));
    
    // Add locations from existing books
    uniqueLocationsFromBooks.forEach(loc => locationSet.add(loc));
    
    return Array.from(locationSet).sort();
  }, [libraryLocations, uniqueLocationsFromBooks]);

  // Filter books based on selected location and search term
  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      // Filter by location if not 'all'
      if (filterLocation !== 'all') {
        const bookLoc = book.location?.trim() || '';
        if (bookLoc !== filterLocation) {
          return false;
        }
      }
      // Filter by search term
      if (searchTerm) {
        return book.name.toLowerCase().includes(searchTerm.toLowerCase());
      }
      return true;
    });
  }, [books, filterLocation, searchTerm]);

  // Count books per location
  const getBookCountForLocation = (locationName: string): number => {
    return books.filter(book => book.location?.trim() === locationName).length;
  };

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!bookName.trim()) {
      setError('Please enter a book name');
      return;
    }

    if (!bookLocationId) {
      setError('Please select a location');
      return;
    }

    // Get the location name to store with the book
    const selectedLocation = libraryLocations.find(loc => loc.id === bookLocationId);
    const locationName = selectedLocation?.name || bookLocationId;
    
    // Pass location name when adding book
    const result = await addBook(bookName.trim(), '', locationName);
    if (result.success) {
      setBookName('');
      // Keep the same location selected for convenience
    } else {
      setError(result.error || 'Failed to add book');
    }
  };

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
        <div className="flex items-center gap-2 md:gap-3">
          <div className="p-2 md:p-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg md:rounded-xl">
            <BookOpen size={20} className="text-white md:w-6 md:h-6" />
          </div>
          <div>
            <h1 className={`text-xl md:text-3xl font-bold font-cyber ${textPrimary}`}>
              Library Books
            </h1>
            <p className={`text-sm md:text-base ${textSecondary}`}>Manage your legal reference books</p>
          </div>
        </div>
      </motion.div>

      {/* Filter Section - Dropdown */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className={`${cardBg} p-4 rounded-xl border mb-4`}
      >
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-orange-500" />
            <span className={`text-sm font-semibold ${textPrimary}`}>Filter by Location:</span>
          </div>
          <select
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            className={`px-4 py-2 rounded-xl border ${inputBg} focus:outline-none focus:border-orange-500 transition-all min-w-[200px]`}
          >
            <option value="all">📚 All Locations ({books.length} books)</option>
            {allAvailableLocations.map((location) => (
              <option key={location} value={location}>
                📍 {location} ({getBookCountForLocation(location)} books)
              </option>
            ))}
          </select>
          {filterLocation !== 'all' && (
            <button
              onClick={() => setFilterLocation('all')}
              className="text-sm text-orange-500 hover:text-orange-600 underline"
            >
              Clear Filter
            </button>
          )}
        </div>
        {filterLocation !== 'all' && (
          <p className={`mt-2 text-sm ${textSecondary}`}>
            Showing {filteredBooks.length} book(s) in "{filterLocation}"
          </p>
        )}
      </motion.div>

      {/* Add Book Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`${cardBg} p-4 md:p-6 rounded-xl md:rounded-2xl border mb-4 md:mb-6`}
      >
        <h2 className={`text-lg md:text-xl font-bold font-cyber mb-3 md:mb-4 ${textPrimary}`}>Add New Book</h2>
        <form onSubmit={handleAddBook} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Book Name *</label>
              <input
                type="text"
                value={bookName}
                onChange={(e) => setBookName(e.target.value)}
                placeholder="Enter book name..."
                className={`w-full px-3 md:px-4 py-2.5 md:py-3 rounded-lg md:rounded-xl border ${inputBg} focus:outline-none focus:border-orange-500 transition-all text-sm md:text-base`}
                required
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Location *</label>
              <select
                value={bookLocationId}
                onChange={(e) => setBookLocationId(e.target.value)}
                className={`w-full px-3 md:px-4 py-2.5 md:py-3 rounded-lg md:rounded-xl border ${inputBg} focus:outline-none focus:border-orange-500 transition-all text-sm md:text-base`}
                required
              >
                <option value="">Select a location...</option>
                {libraryLocations.map((location) => (
                  <option key={location.id} value={location.id}>
                    📚 {location.name}
                  </option>
                ))}
              </select>
              {libraryLocations.length === 0 && (
                <p className="text-xs text-orange-500 mt-1">
                  {isAdmin ? 'Add locations in Settings first' : 'Contact admin to add library locations'}
                </p>
              )}
            </div>
          </div>
          {error && <p className="text-red-500 text-xs md:text-sm">{error}</p>}
          <button
            type="submit"
            disabled={libraryLocations.length === 0}
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 md:px-6 py-2.5 md:py-3 rounded-lg md:rounded-xl font-semibold font-cyber hover:shadow-lg transition-all text-sm md:text-base disabled:opacity-50"
          >
            <Plus size={18} />
            Add Book
          </button>
        </form>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <div className="relative">
          <Search size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 ${textSecondary}`} />
          <input
            type="text"
            placeholder="Search books..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full sm:w-64 pl-11 pr-4 py-2.5 rounded-xl border ${inputBg} focus:outline-none focus:border-orange-500 transition-all`}
          />
        </div>
      </motion.div>

      {/* Books List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={`${cardBg} rounded-2xl border overflow-hidden`}
      >
        <div className="p-4 border-b border-gray-200/20">
          <h2 className={`text-lg font-bold font-cyber ${textPrimary}`}>
            {filterLocation !== 'all' ? `Books in ${filterLocation}` : 'All Books'} ({filteredBooks.length})
          </h2>
        </div>
        
        {filteredBooks.length === 0 ? (
          <div className="p-8 text-center">
            <BookOpen size={48} className={`mx-auto mb-4 ${textSecondary} opacity-50`} />
            <p className={textSecondary}>
              {searchTerm ? 'No books match your search' : filterLocation !== 'all' ? `No books in "${filterLocation}"` : 'No books found'}
            </p>
            <p className={`text-sm mt-2 ${textSecondary}`}>
              {filterLocation !== 'all' 
                ? 'Try selecting a different location or add a book to this location.'
                : libraryLocations.length > 0 
                  ? 'Add a book using the form above'
                  : 'First, add library locations in Settings'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200/10">
            {filteredBooks.map((book, index) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className={`p-4 flex items-center justify-between ${theme === 'light' ? 'hover:bg-orange-50/50' : 'hover:bg-white/5'} transition-colors`}
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-lg">
                    <BookOpen size={20} className="text-amber-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`font-semibold ${textPrimary}`}>{book.name}</p>
                      {book.location && (
                        <span className="text-xs px-2 py-1 rounded-full bg-orange-500/20 text-orange-600">
                          📍 {book.location}
                        </span>
                      )}
                    </div>
                    <p className={`text-sm ${textSecondary}`}>
                      Added: {new Date(book.addedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => deleteBook(book.id)}
                  className="p-2 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors"
                  title="Delete book"
                >
                  <Trash2 size={18} />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </MainLayout>
  );
};

export default LibraryBooksPage;
