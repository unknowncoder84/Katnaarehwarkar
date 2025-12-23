import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Users,
  IndianRupee,
  Settings,
  LogOut,
  ChevronDown,
  ChevronUp,
  Plus,
  List,
  UserCheck,
  X,
  Shield,
  Scale,
  BookOpen,
  Archive,
  TrendingDown,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const location = useLocation();
  const { logout, isAdmin } = useAuth();
  const { theme } = useTheme();
  const [isOfficeCasesOpen, setIsOfficeCasesOpen] = useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: FileText, label: 'My Cases', path: '/cases' },
    { icon: UserCheck, label: 'Tasks', path: '/tasks' },
    { icon: UserCheck, label: 'Attendance', path: '/attendance' },
    { icon: Users, label: 'Appointments', path: '/appointments' },
    { icon: IndianRupee, label: 'Payment', path: '/finance' },
    { icon: TrendingDown, label: 'Expenses', path: '/expenses' },
    { icon: BookOpen, label: 'Library', path: '/library' },
    { icon: Archive, label: 'Storage', path: '/storage' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const adminMenuItems = [
    { icon: Shield, label: 'Admin Panel', path: '/admin' },
  ];

  const officeCasesSubmenu = [
    { icon: Plus, label: 'Create Case', path: '/cases/create' },
    { icon: List, label: 'List Cases', path: '/cases' },
    { icon: Scale, label: 'Council Cases', path: '/counsel/cases' },
  ];

  const isActive = (path: string) => location.pathname === path;


  const bgClass = theme === 'light' 
    ? 'bg-white/98 backdrop-blur-2xl border-gray-200' 
    : 'bg-[#1a1a2e]/98 backdrop-blur-2xl border-white/5';
  const textClass = theme === 'light' ? 'text-gray-800' : 'text-gray-300';
  const secondaryTextClass = theme === 'light' ? 'text-gray-500' : 'text-gray-500';
  const hoverClass = theme === 'light' ? 'hover:bg-orange-50' : 'hover:bg-white/5';
  const activeBgClass = 'bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 text-white shadow-lg shadow-orange-500/30';

  return (
    <>
      <div
        className={`${bgClass} w-64 md:w-72 h-screen flex flex-col transition-transform duration-300 ease-in-out border-r ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed md:relative z-40 overflow-hidden`}
      >
        {/* Background Overlay - Solid black for dark mode */}
        <div className={`absolute inset-0 ${theme === 'dark' ? 'bg-[#1a1a2e]' : 'bg-white/98'}`} />
        {/* Header */}
        <div className={`relative p-4 md:p-5 border-b ${theme === 'light' ? 'border-gray-100' : 'border-white/5'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl blur-lg opacity-50" />
                <div className="relative w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-glow">
                  <Scale className="text-white" size={24} />
                </div>
              </div>
              <div>
                <h1 className={`text-lg font-bold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>Katneshwarkar's</h1>
                <p className={`text-xs ${secondaryTextClass}`}>Legal Management</p>
              </div>
            </div>
            <button onClick={onToggle} className={`md:hidden p-2.5 rounded-xl ${hoverClass} transition-colors`}>
              <X size={20} className={textClass} />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="relative flex-1 p-3 md:p-4 space-y-1 overflow-y-auto">
          <p className={`text-xs font-semibold uppercase ${secondaryTextClass} px-3 py-2 tracking-wider`}>Main Menu</p>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path + item.label}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  active ? activeBgClass : `${textClass} ${hoverClass}`
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}

          {isAdmin && (
            <>
              <p className={`text-xs font-semibold uppercase ${secondaryTextClass} px-3 py-2 mt-6 tracking-wider`}>Administration</p>
              {adminMenuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link key={item.path} to={item.path} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${active ? activeBgClass : `${textClass} ${hoverClass}`}`}>
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </>
          )}


          <p className={`text-xs font-semibold uppercase ${secondaryTextClass} px-3 py-2 mt-6 tracking-wider`}>Case Management</p>
          
          {/* Office Cases */}
          <div>
            <button
              onClick={() => setIsOfficeCasesOpen(!isOfficeCasesOpen)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                isOfficeCasesOpen ? (theme === 'light' ? 'bg-orange-100 text-orange-700' : 'bg-orange-500/20 text-orange-400') : `${textClass} ${hoverClass}`
              }`}
            >
              <div className="flex items-center gap-3">
                <FileText size={20} />
                <span className="font-medium">Office Cases</span>
              </div>
              {isOfficeCasesOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            {isOfficeCasesOpen && (
              <div className="ml-4 mt-2 space-y-1 border-l-2 border-orange-500/30 pl-4">
                {officeCasesSubmenu.map((subItem) => {
                  const SubIcon = subItem.icon;
                  const active = isActive(subItem.path);
                  return (
                    <Link key={subItem.path + subItem.label} to={subItem.path} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm ${active ? (theme === 'light' ? 'bg-orange-100 text-orange-700' : 'bg-orange-500/20 text-orange-400') : `${textClass} ${hoverClass}`}`}>
                      <SubIcon size={16} />
                      <span className="font-medium">{subItem.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

        </nav>

        {/* Logout */}
        <div className={`relative p-3 md:p-4 border-t ${theme === 'light' ? 'border-gray-200' : 'border-white/5'}`}>
          <button onClick={logout} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${theme === 'light' ? 'text-red-600 hover:bg-red-50' : 'text-red-400 hover:bg-red-500/10'}`}>
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {isOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm md:hidden z-30" onClick={onToggle} />}
    </>
  );
};

export default Sidebar;
