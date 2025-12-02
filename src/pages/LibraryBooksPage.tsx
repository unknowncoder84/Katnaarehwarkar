import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Plus, Trash2, Search } from 'lucide-react';
import MainLayout from '../components/MainLayout';
import { useData } from '../contexts/DataContext';
import { useTheme } from '../contexts/ThemeContext';

const LibraryBooksPage: React.FC = () => {
  const { books, addBook, deleteBook } = useData();
  const { theme } = useTheme();
  const [bookName, setBookName] = useState('');
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const result = await addBook(bookName);
    if (result.success) {
      setBookName('');
    } else {
      setError(result.error || 'Failed to add book');
    }
  };

  const filteredBooks = books.filter((book) =>
    book.name.toLowerCase().includes(searchTerm.toLowerCase())
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
        <div className="flex items-center gap-2 md:gap-3">
          <div className="p-2 md:p-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg md:rounded-xl">
            <BookOpen size={20} className="text-white md:w-6 md:h-6" />
          </div>
          <div>
            <h1 className={`text-xl md:text-3xl font-bold font-cyber ${textPrimary}`}>
              Library Books (L1)
            </h1>
            <p className={`text-sm md:text-base ${textSecondary}`}>Manage your legal reference books</p>
          </div>
        </div>
      </motion.div>

      {/* Add Book Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`${cardBg} p-4 md:p-6 rounded-xl md:rounded-2xl border mb-4 md:mb-6`}
      >
        <h2 className={`text-lg md:text-xl font-bold font-cyber mb-3 md:mb-4 ${textPrimary}`}>Add New Book</h2>
        <form onSubmit={handleAddBook} className="flex flex-col sm:flex-row gap-3 md:gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={bookName}
              onChange={(e) => setBookName(e.target.value)}
              placeholder="Enter book name..."
              className={`w-full px-3 md:px-4 py-2.5 md:py-3 rounded-lg md:rounded-xl border ${inputBg} focus:outline-none focus:border-purple-500 transition-all text-sm md:text-base`}
            />
            {error && <p className="text-red-500 text-xs md:text-sm mt-2">{error}</p>}
          </div>
          <button
            type="submit"
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 md:px-6 py-2.5 md:py-3 rounded-lg md:rounded-xl font-semibold font-cyber hover:shadow-lg transition-all text-sm md:text-base"
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
            className={`w-full sm:w-64 pl-11 pr-4 py-2.5 rounded-xl border ${inputBg} focus:outline-none focus:border-purple-500 transition-all`}
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
            Books in L1 ({filteredBooks.length})
          </h2>
        </div>
        
        {filteredBooks.length === 0 ? (
          <div className="p-8 text-center">
            <BookOpen size={48} className={`mx-auto mb-4 ${textSecondary} opacity-50`} />
            <p className={textSecondary}>No books found</p>
            <p className={`text-sm mt-2 ${textSecondary}`}>Add a book using the form above</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200/10">
            {filteredBooks.map((book, index) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-4 flex items-center justify-between ${theme === 'light' ? 'hover:bg-purple-50/50' : 'hover:bg-white/5'} transition-colors`}
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-lg">
                    <BookOpen size={20} className="text-amber-500" />
                  </div>
                  <div>
                    <p className={`font-semibold ${textPrimary}`}>{book.name}</p>
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
