import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';
import { useTheme } from '../contexts/ThemeContext';

const Calendar: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const startingDayOfWeek = monthStart.getDay();
  const previousMonthDays = Array(startingDayOfWeek).fill(null);
  const allDays = [...previousMonthDays, ...daysInMonth];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const cardBg = theme === 'light' 
    ? 'bg-white/95 backdrop-blur-xl border-gray-200 shadow-md' 
    : 'glass-dark border-cyber-blue/20';
  const textPrimary = theme === 'light' ? 'text-gray-900' : 'text-cyber-blue';
  const textSecondary = theme === 'light' ? 'text-gray-600' : 'text-cyber-blue/60';
  const hoverBg = theme === 'light' ? 'hover:bg-purple-100' : 'hover:bg-cyber-blue/10';

  return (
    <div className={`${cardBg} rounded-2xl p-6 border shadow-card`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-cyber rounded-lg border border-cyber-blue/30 animate-cyber-pulse">
            <CalendarIcon size={18} className="text-white" />
          </div>
          <h3 className={`text-lg font-bold font-cyber ${textPrimary}`}>{format(currentDate, 'MMMM yyyy')}</h3>
        </div>
        <div className="flex gap-1">
          <button
            onClick={handlePrevMonth}
            className={`p-2 ${hoverBg} rounded-lg transition-colors`}
          >
            <ChevronLeft size={20} className={textSecondary} />
          </button>
          <button
            onClick={handleNextMonth}
            className={`p-2 ${hoverBg} rounded-lg transition-colors`}
          >
            <ChevronRight size={20} className={textSecondary} />
          </button>
        </div>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-1 mb-3">
        {dayNames.map((day) => (
          <div key={day} className={`text-center text-xs font-semibold ${textSecondary} uppercase tracking-wide py-2`}>
            {day}
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-1">
        {allDays.map((day, index) => (
          <div
            key={index}
            onClick={() => {
              if (day) {
                const dateStr = format(day, 'yyyy-MM-dd');
                navigate(`/events/${dateStr}`);
              }
            }}
            className={`aspect-square flex items-center justify-center rounded-xl text-sm font-medium font-cyber transition-all cursor-pointer ${
              day === null
                ? 'text-gray-600 cursor-default'
                : isToday(day)
                  ? 'bg-gradient-cyber text-white font-bold shadow-cyber border border-cyber-blue/50 hover:shadow-justice'
                  : isSameMonth(day, currentDate)
                    ? `${textPrimary} ${hoverBg} hover:scale-110 hover:border-cyber-blue/30`
                    : 'text-gray-600'
            }`}
          >
            {day ? format(day, 'd') : ''}
          </div>
        ))}
      </div>

      {/* Today indicator */}
      <div className={`mt-4 pt-4 border-t ${theme === 'light' ? 'border-gray-200' : 'border-cyber-blue/20'}`}>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gradient-cyber animate-cyber-pulse" />
          <span className={`text-sm font-court ${textSecondary}`}>Today: {format(new Date(), 'MMMM d, yyyy')}</span>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
