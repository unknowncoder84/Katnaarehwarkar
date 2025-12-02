import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Moon, Sun, Bell, Search, Scale, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user, isAdmin } = useAuth();
  const { cases, counsel } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);

  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return { cases: [], counsel: [] };
    const term = searchTerm.toLowerCase();
    return {
      cases: cases.filter(c => 
        c.clientName.toLowerCase().includes(term) ||
        c.fileNo.toLowerCase().includes(term) ||
        c.partiesName.toLowerCase().includes(term)
      ).slice(0, 5),
      counsel: counsel.filter(c =>
        c.name.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term)
      ).slice(0, 3)
    };
  }, [searchTerm, cases, counsel]);

  const handleResultClick = (type: 'case' | 'counsel', id: string) => {
    setSearchTerm('');
    setShowResults(false);
    if (type === 'case') navigate(`/cases/${id}`);
    else navigate('/counsel');
  };

  const bgClass = theme === 'light' 
    ? 'bg-white/95 backdrop-blur-2xl border-gray-200' 
    : 'glass-dark border-cyber-blue/20';
  const inputBgClass = theme === 'light' 
    ? 'bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-500' 
    : 'bg-white/5 border-purple-500/30 text-white placeholder-gray-400';
  const textClass = theme === 'light' ? 'text-gray-900' : 'text-cyber-blue';
  const secondaryText = theme === 'light' ? 'text-gray-600' : 'text-cyber-blue/60';

  return (
    <header className={`${bgClass} border-b px-4 md:px-6 py-3.5 flex items-center justify-between gap-4`}>
      {/* Left - Menu */}
      <button
        onClick={onMenuClick}
        className={`p-2.5 rounded-xl transition-all duration-300 ${theme === 'light' ? 'hover:bg-purple-50' : 'hover:bg-white/5'} group`}
      >
        <Menu size={22} className={`${textClass} group-hover:text-purple-500 transition-colors`} />
      </button>

      {/* Center - Search */}
      <div className="flex-1 max-w-xl mx-2 md:mx-4">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition-opacity" />
          <div className="relative">
            <Search size={16} className={`absolute left-3 md:left-4 top-1/2 -translate-y-1/2 ${secondaryText} group-focus-within:text-purple-500 transition-colors`} />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowResults(true);
              }}
              onFocus={() => setShowResults(true)}
              onBlur={() => setTimeout(() => setShowResults(false), 200)}
              className={`w-full pl-10 md:pl-11 pr-8 md:pr-10 py-2 md:py-3 ${inputBgClass} border rounded-xl md:rounded-2xl focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all text-sm`}
            />
            {searchTerm && (
              <button
                onClick={() => { setSearchTerm(''); setShowResults(false); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>
          
          {/* Search Results Dropdown */}
          {showResults && searchTerm && (searchResults.cases.length > 0 || searchResults.counsel.length > 0) && (
            <div className={`absolute top-full left-0 right-0 mt-2 ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-[#1a1a2e] border-purple-500/30'} border rounded-xl shadow-xl z-50 overflow-hidden`}>
              {searchResults.cases.length > 0 && (
                <div>
                  <p className={`px-4 py-2 text-xs font-semibold uppercase ${theme === 'light' ? 'bg-gray-50 text-gray-600' : 'bg-white/5 text-gray-400'}`}>Cases</p>
                  {searchResults.cases.map(c => (
                    <button
                      key={c.id}
                      onClick={() => handleResultClick('case', c.id)}
                      className={`w-full px-4 py-3 text-left ${theme === 'light' ? 'hover:bg-purple-50' : 'hover:bg-white/5'} transition-colors`}
                    >
                      <p className={`font-medium ${textClass}`}>{c.clientName}</p>
                      <p className={`text-xs ${secondaryText}`}>File: {c.fileNo} | {c.caseType}</p>
                    </button>
                  ))}
                </div>
              )}
              {searchResults.counsel.length > 0 && (
                <div>
                  <p className={`px-4 py-2 text-xs font-semibold uppercase ${theme === 'light' ? 'bg-gray-50 text-gray-600' : 'bg-white/5 text-gray-400'}`}>Counsel</p>
                  {searchResults.counsel.map(c => (
                    <button
                      key={c.id}
                      onClick={() => handleResultClick('counsel', c.id)}
                      className={`w-full px-4 py-3 text-left ${theme === 'light' ? 'hover:bg-purple-50' : 'hover:bg-white/5'} transition-colors`}
                    >
                      <p className={`font-medium ${textClass}`}>{c.name}</p>
                      <p className={`text-xs ${secondaryText}`}>{c.email}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right - Actions */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button className={`relative p-2.5 rounded-xl transition-all duration-300 ${theme === 'light' ? 'hover:bg-purple-50' : 'hover:bg-white/5'} group`}>
          <Bell size={20} className={`${textClass} group-hover:text-purple-500 transition-colors`} />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-gradient-cyber rounded-full ring-2 ring-white dark:ring-dark-void animate-cyber-pulse" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="relative p-2.5 rounded-xl overflow-hidden group animate-cyber-pulse"
        >
          <div className="absolute inset-0 bg-gradient-cyber opacity-100 group-hover:opacity-90 transition-opacity" />
          <div className="absolute inset-0 bg-gradient-cyber opacity-0 group-hover:opacity-100 blur-xl transition-opacity" />
          <div className="relative">
            {theme === 'dark' ? <Sun size={20} className="text-white" /> : <Moon size={20} className="text-white" />}
          </div>
        </button>

        {/* User Profile */}
        <div className={`flex items-center gap-3 pl-4 ml-1 border-l ${theme === 'light' ? 'border-gray-200' : 'border-cyber-blue/20'}`}>
          <div className="relative group cursor-pointer">
            <div className="absolute inset-0 bg-gradient-cyber rounded-xl blur opacity-40 group-hover:opacity-60 transition-opacity" />
            <div className="relative w-11 h-11 rounded-xl bg-gradient-cyber flex items-center justify-center border border-cyber-blue/30">
              <span className="text-white font-bold font-cyber">{user?.name?.charAt(0) || 'U'}</span>
            </div>
          </div>
          <div className="hidden md:block">
            <p className={`text-sm font-semibold font-cyber ${textClass}`}>{user?.name || 'User'}</p>
            <div className="flex items-center gap-1">
              {isAdmin ? (
                <>
                  <Scale size={10} className="text-cyber-blue" />
                  <span className="text-xs text-cyber-blue font-medium font-cyber">Admin</span>
                </>
              ) : (
                <span className={`text-xs ${secondaryText} capitalize font-cyber`}>{user?.role || 'User'}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
