import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  const { cases, counsel, appointments, tasks, expenses, books, sofaItems } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  
  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  // Generate notifications from recent activity
  const notifications = useMemo(() => {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    
    const notifs: Array<{
      id: string;
      type: 'case' | 'task' | 'appointment' | 'expense' | 'book' | 'sofa';
      title: string;
      description: string;
      time: Date;
      icon: string;
    }> = [];
    
    // Recent cases (last 3 days)
    cases
      .filter(c => new Date(c.createdAt) > threeDaysAgo)
      .forEach(c => {
        notifs.push({
          id: c.id,
          type: 'case',
          title: 'New Case Added',
          description: `${c.clientName} - ${c.fileNo}`,
          time: new Date(c.createdAt),
          icon: '⚖️'
        });
      });
    
    // Upcoming tasks (next 3 days)
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    tasks
      .filter(t => t.status === 'pending' && new Date(t.deadline) <= threeDaysFromNow)
      .forEach(t => {
        notifs.push({
          id: t.id,
          type: 'task',
          title: 'Task Due Soon',
          description: `${t.title} - Due: ${new Date(t.deadline).toLocaleDateString()}`,
          time: new Date(t.deadline),
          icon: '📋'
        });
      });
    
    // Upcoming appointments (next 3 days)
    appointments
      .filter(a => new Date(a.date) >= now && new Date(a.date) <= threeDaysFromNow)
      .forEach(a => {
        notifs.push({
          id: a.id,
          type: 'appointment',
          title: 'Upcoming Appointment',
          description: `${a.client} - ${new Date(a.date).toLocaleDateString()} at ${a.time}`,
          time: new Date(a.date),
          icon: '📅'
        });
      });
    
    // Recent expenses (last 24 hours)
    expenses
      .filter(e => new Date(e.createdAt) > oneDayAgo)
      .forEach(e => {
        notifs.push({
          id: e.id,
          type: 'expense',
          title: 'New Expense Added',
          description: `₹${e.amount.toLocaleString()} - ${e.description}`,
          time: new Date(e.createdAt),
          icon: '💰'
        });
      });
    
    // Recent books (last 3 days)
    books
      .filter(b => new Date(b.addedAt) > threeDaysAgo)
      .forEach(b => {
        notifs.push({
          id: b.id,
          type: 'book',
          title: 'New Book Added',
          description: `${b.name} added to library`,
          time: new Date(b.addedAt),
          icon: '📚'
        });
      });
    
    // Recent sofa items (last 3 days)
    sofaItems
      .filter(s => new Date(s.addedAt) > threeDaysAgo)
      .forEach(s => {
        const caseItem = cases.find(c => c.id === s.caseId);
        notifs.push({
          id: s.id,
          type: 'sofa',
          title: 'Case Added to Storage',
          description: `${caseItem?.clientName || 'Case'} - Compartment ${s.compartment}`,
          time: new Date(s.addedAt),
          icon: '🗄️'
        });
      });
    
    // Sort by time (most recent first)
    return notifs.sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 10);
  }, [cases, tasks, appointments, expenses, books, sofaItems]);

  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return { 
      cases: [], 
      counsel: [], 
      appointments: [], 
      tasks: [], 
      expenses: [], 
      books: [], 
      sofaItems: [] 
    };
    
    const term = searchTerm.toLowerCase();
    
    // Search cases: client name, file number, parties name, case type
    const matchedCases = cases.filter(c => 
      c.clientName.toLowerCase().includes(term) ||
      c.fileNo.toLowerCase().includes(term) ||
      c.partiesName.toLowerCase().includes(term) ||
      c.caseType.toLowerCase().includes(term)
    ).slice(0, 5);
    
    // Search counsel: name, email
    const matchedCounsel = counsel.filter(c =>
      c.name.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term)
    ).slice(0, 5);
    
    // Search appointments: client name, details
    const matchedAppointments = appointments.filter(a =>
      a.client.toLowerCase().includes(term) ||
      a.details.toLowerCase().includes(term)
    ).slice(0, 5);
    
    // Search tasks: title, description, assigned to name
    const matchedTasks = tasks.filter(t =>
      t.title.toLowerCase().includes(term) ||
      t.description.toLowerCase().includes(term) ||
      t.assignedToName.toLowerCase().includes(term)
    ).slice(0, 5);
    
    // Search expenses: description
    const matchedExpenses = expenses.filter(e =>
      e.description.toLowerCase().includes(term)
    ).slice(0, 5);
    
    // Search books: book name
    const matchedBooks = books.filter(b =>
      b.name.toLowerCase().includes(term)
    ).slice(0, 5);
    
    // Search sofa items: associated case name
    const matchedSofaItems = sofaItems
      .map(item => {
        const associatedCase = cases.find(c => c.id === item.caseId);
        return {
          ...item,
          caseName: associatedCase?.clientName || 'Unknown Case'
        };
      })
      .filter(item =>
        item.caseName.toLowerCase().includes(term)
      )
      .slice(0, 5);
    
    return {
      cases: matchedCases,
      counsel: matchedCounsel,
      appointments: matchedAppointments,
      tasks: matchedTasks,
      expenses: matchedExpenses,
      books: matchedBooks,
      sofaItems: matchedSofaItems
    };
  }, [searchTerm, cases, counsel, appointments, tasks, expenses, books, sofaItems]);

  const handleResultClick = (type: 'case' | 'counsel' | 'appointment' | 'task' | 'expense' | 'book' | 'sofaItem', id: string) => {
    setSearchTerm('');
    setShowResults(false);
    
    switch (type) {
      case 'case':
        navigate(`/cases/${id}`);
        break;
      case 'counsel':
        navigate('/counsel');
        break;
      case 'appointment':
        navigate('/appointments');
        break;
      case 'task':
        navigate('/tasks');
        break;
      case 'expense':
        navigate('/expenses');
        break;
      case 'book':
        navigate('/library/books');
        break;
      case 'sofaItem':
        navigate('/library/sofa');
        break;
    }
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
    <header className={`${bgClass} border-b px-4 md:px-6 py-3.5 flex items-center justify-between gap-4 relative z-50`}>
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
          {showResults && searchTerm && (() => {
            const hasResults = searchResults.cases.length > 0 || 
                              searchResults.counsel.length > 0 || 
                              searchResults.appointments.length > 0 || 
                              searchResults.tasks.length > 0 || 
                              searchResults.expenses.length > 0 || 
                              searchResults.books.length > 0 || 
                              searchResults.sofaItems.length > 0;
            
            return (
              <div className={`absolute top-full left-0 right-0 mt-2 ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-[#1a1a2e] border-purple-500/30'} border rounded-xl shadow-xl z-50 overflow-hidden max-h-96 overflow-y-auto`}>
                {!hasResults && (
                  <div className="px-4 py-6 text-center">
                    <p className={`text-sm ${secondaryText}`}>No results found</p>
                  </div>
                )}
                
                {/* Cases */}
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
                
                {/* Counsel */}
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
                
                {/* Appointments */}
                {searchResults.appointments.length > 0 && (
                  <div>
                    <p className={`px-4 py-2 text-xs font-semibold uppercase ${theme === 'light' ? 'bg-gray-50 text-gray-600' : 'bg-white/5 text-gray-400'}`}>Appointments</p>
                    {searchResults.appointments.map(a => (
                      <button
                        key={a.id}
                        onClick={() => handleResultClick('appointment', a.id)}
                        className={`w-full px-4 py-3 text-left ${theme === 'light' ? 'hover:bg-purple-50' : 'hover:bg-white/5'} transition-colors`}
                      >
                        <p className={`font-medium ${textClass}`}>{a.client}</p>
                        <p className={`text-xs ${secondaryText}`}>{new Date(a.date).toLocaleDateString()} | {a.time}</p>
                      </button>
                    ))}
                  </div>
                )}
                
                {/* Tasks */}
                {searchResults.tasks.length > 0 && (
                  <div>
                    <p className={`px-4 py-2 text-xs font-semibold uppercase ${theme === 'light' ? 'bg-gray-50 text-gray-600' : 'bg-white/5 text-gray-400'}`}>Tasks</p>
                    {searchResults.tasks.map(t => (
                      <button
                        key={t.id}
                        onClick={() => handleResultClick('task', t.id)}
                        className={`w-full px-4 py-3 text-left ${theme === 'light' ? 'hover:bg-purple-50' : 'hover:bg-white/5'} transition-colors`}
                      >
                        <p className={`font-medium ${textClass}`}>{t.title}</p>
                        <p className={`text-xs ${secondaryText}`}>Assigned to: {t.assignedToName} | Due: {new Date(t.deadline).toLocaleDateString()}</p>
                      </button>
                    ))}
                  </div>
                )}
                
                {/* Expenses */}
                {searchResults.expenses.length > 0 && (
                  <div>
                    <p className={`px-4 py-2 text-xs font-semibold uppercase ${theme === 'light' ? 'bg-gray-50 text-gray-600' : 'bg-white/5 text-gray-400'}`}>Expenses</p>
                    {searchResults.expenses.map(e => (
                      <button
                        key={e.id}
                        onClick={() => handleResultClick('expense', e.id)}
                        className={`w-full px-4 py-3 text-left ${theme === 'light' ? 'hover:bg-purple-50' : 'hover:bg-white/5'} transition-colors`}
                      >
                        <p className={`font-medium ${textClass}`}>{e.description}</p>
                        <p className={`text-xs ${secondaryText}`}>₹{e.amount.toLocaleString()} | {e.month}</p>
                      </button>
                    ))}
                  </div>
                )}
                
                {/* Books */}
                {searchResults.books.length > 0 && (
                  <div>
                    <p className={`px-4 py-2 text-xs font-semibold uppercase ${theme === 'light' ? 'bg-gray-50 text-gray-600' : 'bg-white/5 text-gray-400'}`}>Books</p>
                    {searchResults.books.map(b => (
                      <button
                        key={b.id}
                        onClick={() => handleResultClick('book', b.id)}
                        className={`w-full px-4 py-3 text-left ${theme === 'light' ? 'hover:bg-purple-50' : 'hover:bg-white/5'} transition-colors`}
                      >
                        <p className={`font-medium ${textClass}`}>{b.name}</p>
                        <p className={`text-xs ${secondaryText}`}>Added: {new Date(b.addedAt).toLocaleDateString()}</p>
                      </button>
                    ))}
                  </div>
                )}
                
                {/* Sofa Items */}
                {searchResults.sofaItems.length > 0 && (
                  <div>
                    <p className={`px-4 py-2 text-xs font-semibold uppercase ${theme === 'light' ? 'bg-gray-50 text-gray-600' : 'bg-white/5 text-gray-400'}`}>Sofa Storage</p>
                    {searchResults.sofaItems.map(s => (
                      <button
                        key={s.id}
                        onClick={() => handleResultClick('sofaItem', s.id)}
                        className={`w-full px-4 py-3 text-left ${theme === 'light' ? 'hover:bg-purple-50' : 'hover:bg-white/5'} transition-colors`}
                      >
                        <p className={`font-medium ${textClass}`}>{s.caseName}</p>
                        <p className={`text-xs ${secondaryText}`}>Compartment: {s.compartment} | Added: {new Date(s.addedAt).toLocaleDateString()}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </div>

      {/* Right - Actions */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative p-2.5 rounded-xl transition-all duration-300 ${theme === 'light' ? 'hover:bg-purple-50' : 'hover:bg-white/5'} group`}
          >
            <Bell size={20} className={`${textClass} group-hover:text-purple-500 transition-colors`} />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-gradient-cyber rounded-full ring-2 ring-white dark:ring-dark-void animate-cyber-pulse" />
            )}
          </button>
          
          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className={`absolute top-full right-0 mt-2 w-80 md:w-96 ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-[#1a1a2e] border-purple-500/30'} border rounded-xl shadow-2xl z-[9999] overflow-hidden max-h-96 overflow-y-auto`}>
              <div className={`px-4 py-3 border-b ${theme === 'light' ? 'border-gray-200 bg-gray-50' : 'border-purple-500/30 bg-white/5'}`}>
                <h3 className={`font-semibold ${textClass}`}>Notifications</h3>
                <p className={`text-xs ${secondaryText}`}>{notifications.length} recent updates</p>
              </div>
              
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <Bell size={32} className={`mx-auto mb-2 ${secondaryText}`} />
                  <p className={`text-sm ${secondaryText}`}>No new notifications</p>
                  <p className={`text-xs ${secondaryText} mt-1`}>You're all caught up!</p>
                </div>
              ) : (
                <div>
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`px-4 py-3 border-b ${theme === 'light' ? 'border-gray-100 hover:bg-purple-50' : 'border-white/5 hover:bg-white/5'} transition-colors cursor-pointer`}
                      onClick={() => {
                        setShowNotifications(false);
                        // Navigate based on type
                        switch (notif.type) {
                          case 'case':
                            navigate(`/cases/${notif.id}`);
                            break;
                          case 'task':
                            navigate('/tasks');
                            break;
                          case 'appointment':
                            navigate('/appointments');
                            break;
                          case 'expense':
                            navigate('/expenses');
                            break;
                          case 'book':
                            navigate('/library/books');
                            break;
                          case 'sofa':
                            navigate('/library/sofa');
                            break;
                        }
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{notif.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${textClass}`}>{notif.title}</p>
                          <p className={`text-xs ${secondaryText} truncate`}>{notif.description}</p>
                          <p className={`text-xs ${secondaryText} mt-1`}>
                            {(() => {
                              const diff = Date.now() - notif.time.getTime();
                              const hours = Math.floor(diff / (1000 * 60 * 60));
                              const days = Math.floor(hours / 24);
                              
                              if (days > 0) return `${days}d ago`;
                              if (hours > 0) return `${hours}h ago`;
                              return 'Just now';
                            })()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className={`px-4 py-3 text-center border-t ${theme === 'light' ? 'border-gray-200 bg-gray-50' : 'border-purple-500/30 bg-white/5'}`}>
                <button
                  onClick={() => setShowNotifications(false)}
                  className={`text-xs font-medium ${theme === 'light' ? 'text-purple-600 hover:text-purple-700' : 'text-purple-400 hover:text-purple-300'} transition-colors`}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>

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
