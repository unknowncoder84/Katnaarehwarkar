import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, CheckCircle, Trash2 } from 'lucide-react';
import MainLayout from '../components/MainLayout';
import { useData } from '../contexts/DataContext';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Task } from '../types';

type TaskFilter = 'all' | 'my-tasks' | 'pending' | 'completed';
type TaskTypeFilter = 'all' | 'case' | 'custom';

const TasksPage: React.FC = () => {
  const { tasks, completeTask, deleteTask } = useData();
  const { theme } = useTheme();
  const { user, isAdmin } = useAuth();
  const [filter, setFilter] = useState<TaskFilter>('my-tasks');
  const [typeFilter, setTypeFilter] = useState<TaskTypeFilter>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    // Apply status filter
    switch (filter) {
      case 'my-tasks':
        filtered = filtered.filter((t) => t.assignedTo === user?.id);
        break;
      case 'pending':
        filtered = filtered.filter((t) => t.status === 'pending');
        break;
      case 'completed':
        filtered = filtered.filter((t) => t.status === 'completed');
        break;
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter((t) => t.type === typeFilter);
    }

    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [tasks, filter, typeFilter, user?.id]);

  const stats = useMemo(() => {
    const myTasks = tasks.filter((t) => t.assignedTo === user?.id);
    return {
      total: tasks.length,
      myTasks: myTasks.length,
      pending: myTasks.filter((t) => t.status === 'pending').length,
      completed: myTasks.filter((t) => t.status === 'completed').length,
    };
  }, [tasks, user?.id]);

  const cardBg = theme === 'light' ? 'bg-white/95 backdrop-blur-xl border-gray-200 shadow-md' : 'glass-dark border-cyber-blue/20';
  const textPrimary = theme === 'light' ? 'text-gray-900' : 'text-cyber-blue';
  const textSecondary = theme === 'light' ? 'text-gray-700' : 'text-cyber-blue/60';

  const handleComplete = (taskId: string) => {
    completeTask(taskId);
  };

  const handleDelete = (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTask(taskId);
    }
  };

  return (
    <MainLayout>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${cardBg} p-6 rounded-2xl mb-6 border`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl md:text-3xl font-bold font-cyber ${textPrimary}`}>
              Task Management
            </h1>
            <p className={`mt-1 ${textSecondary} font-court`}>
              Manage and track your tasks
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-cyber text-white px-6 py-3 rounded-xl font-semibold font-cyber hover:shadow-cyber transition-all duration-300 border border-cyber-blue/30 flex items-center gap-2"
            >
              <Plus size={20} />
              Create Task
            </button>
          )}
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${cardBg} p-4 rounded-xl border`}
        >
          <p className={`text-sm ${textSecondary}`}>My Tasks</p>
          <p className={`text-2xl font-bold ${textPrimary}`}>{stats.myTasks}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`${cardBg} p-4 rounded-xl border`}
        >
          <p className={`text-sm ${textSecondary}`}>Pending</p>
          <p className="text-2xl font-bold text-yellow-500">{stats.pending}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`${cardBg} p-4 rounded-xl border`}
        >
          <p className={`text-sm ${textSecondary}`}>Completed</p>
          <p className="text-2xl font-bold text-green-500">{stats.completed}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`${cardBg} p-4 rounded-xl border`}
        >
          <p className={`text-sm ${textSecondary}`}>Total Tasks</p>
          <p className={`text-2xl font-bold ${textPrimary}`}>{stats.total}</p>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex gap-2 flex-wrap">
          {(['my-tasks', 'all', 'pending', 'completed'] as TaskFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl font-medium font-cyber transition-all duration-300 text-sm ${
                filter === f
                  ? 'bg-gradient-cyber text-white shadow-cyber border border-cyber-blue/50'
                  : theme === 'light'
                    ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    : 'bg-cyber-blue/10 text-cyber-blue/60 hover:bg-cyber-blue/20 border border-cyber-blue/20'
              }`}
            >
              {f === 'my-tasks' ? 'My Tasks' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['all', 'case', 'custom'] as TaskTypeFilter[]).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 text-sm ${
                typeFilter === t
                  ? 'bg-purple-500 text-white'
                  : theme === 'light'
                    ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    : 'bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/30'
              }`}
            >
              {t === 'all' ? 'All Types' : t === 'case' ? 'Case Tasks' : 'Custom Tasks'}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        {filteredTasks.length === 0 ? (
          <div className={`${cardBg} p-12 rounded-2xl border text-center`}>
            <p className={textSecondary}>No tasks found</p>
          </div>
        ) : (
          filteredTasks.map((task: Task) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`${cardBg} p-6 rounded-xl border hover:shadow-lg transition-all duration-300`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className={`text-lg font-bold ${textPrimary}`}>{task.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      task.type === 'case' 
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                        : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                    }`}>
                      {task.type === 'case' ? 'Case Task' : 'Custom Task'}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      task.status === 'completed'
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    }`}>
                      {task.status === 'completed' ? 'Completed' : 'Pending'}
                    </span>
                  </div>
                  <p className={`${textSecondary} mb-3`}>{task.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <p className={textSecondary}>
                      <span className="font-semibold">Assigned to:</span> {task.assignedToName}
                    </p>
                    <p className={textSecondary}>
                      <span className="font-semibold">Assigned by:</span> {task.assignedByName}
                    </p>
                    <p className={textSecondary}>
                      <span className="font-semibold">Deadline:</span> {new Date(task.deadline).toLocaleDateString()}
                    </p>
                    {task.caseName && (
                      <p className={textSecondary}>
                        <span className="font-semibold">Case:</span> {task.caseName}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {task.status === 'pending' && task.assignedTo === user?.id && (
                    <button
                      onClick={() => handleComplete(task.id)}
                      className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-all border border-green-500/30"
                      title="Mark as Complete"
                    >
                      <CheckCircle size={20} />
                    </button>
                  )}
                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all border border-red-500/30"
                      title="Delete Task"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Create Task Modal */}
      {showCreateModal && <CreateTaskModal onClose={() => setShowCreateModal(false)} />}
    </MainLayout>
  );
};

// Create Task Modal Component
interface CreateTaskModalProps {
  onClose: () => void;
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ onClose }) => {
  const { addTask, cases } = useData();
  const { theme } = useTheme();
  const { user, users } = useAuth();
  const [taskType, setTaskType] = useState<'case' | 'custom'>('custom');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    caseId: '',
    customCaseName: '',
    deadline: '',
  });
  const [caseInputMode, setCaseInputMode] = useState<'select' | 'custom'>('select');
  const [caseTypeFilter, setCaseTypeFilter] = useState<string>('all');

  const cardBg = theme === 'light' ? 'bg-white' : 'glass-dark';
  const inputBgClass = theme === 'light' ? 'bg-white text-gray-900 border-gray-300' : 'bg-white/5 text-white border-purple-500/30';
  const labelClass = theme === 'light' ? 'text-gray-700' : 'text-cyber-blue/80';
  const textPrimary = theme === 'light' ? 'text-gray-900' : 'text-cyber-blue';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.assignedTo || !formData.deadline) {
      alert('Please fill in all required fields');
      return;
    }

    if (taskType === 'case' && caseInputMode === 'select' && !formData.caseId) {
      alert('Please select a case');
      return;
    }

    if (taskType === 'case' && caseInputMode === 'custom' && !formData.customCaseName) {
      alert('Please enter a custom case name');
      return;
    }

    const assignedUser = users.find((u) => u.id === formData.assignedTo);
    const selectedCase = taskType === 'case' && formData.caseId ? cases.find((c) => c.id === formData.caseId) : null;

    const taskData = {
      type: taskType,
      title: formData.title,
      description: formData.description,
      assignedTo: formData.assignedTo,
      assignedToName: assignedUser?.name || 'Unknown',
      assignedBy: user?.id || '',
      assignedByName: user?.name || 'Unknown',
      caseId: taskType === 'case' && caseInputMode === 'select' ? formData.caseId : undefined,
      caseName: caseInputMode === 'custom' ? formData.customCaseName : selectedCase?.clientName,
      deadline: new Date(formData.deadline),
      status: 'pending' as const,
    };

    await addTask(taskData);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className={`${cardBg} p-6 rounded-2xl border ${theme === 'light' ? 'border-gray-200' : 'border-cyber-blue/20'} max-w-2xl w-full max-h-[90vh] overflow-y-auto`}
      >
        <h2 className={`text-2xl font-bold mb-6 ${textPrimary}`}>Create New Task</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Task Type Selection */}
          <div>
            <label className={`block text-sm font-semibold mb-2 ${labelClass}`}>
              Task Type *
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setTaskType('custom')}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                  taskType === 'custom'
                    ? 'bg-purple-500 text-white shadow-lg'
                    : theme === 'light'
                      ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      : 'bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/30'
                }`}
              >
                Custom Task
              </button>
              <button
                type="button"
                onClick={() => setTaskType('case')}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                  taskType === 'case'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : theme === 'light'
                      ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      : 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/30'
                }`}
              >
                Case Task
              </button>
            </div>
          </div>

          {/* Case Selection (only for case tasks) */}
          {taskType === 'case' && (
            <div>
              <label className={`block text-sm font-semibold mb-2 ${labelClass}`}>
                Select Case *
              </label>
              <div className="flex gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setCaseInputMode('select')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    caseInputMode === 'select'
                      ? 'bg-blue-500 text-white shadow-lg'
                      : theme === 'light'
                        ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        : 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/30'
                  }`}
                >
                  Select from List
                </button>
                <button
                  type="button"
                  onClick={() => setCaseInputMode('custom')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    caseInputMode === 'custom'
                      ? 'bg-purple-500 text-white shadow-lg'
                      : theme === 'light'
                        ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        : 'bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/30'
                  }`}
                >
                  Custom Input
                </button>
              </div>
              
              {caseInputMode === 'custom' ? (
                <input
                  type="text"
                  value={formData.customCaseName}
                  placeholder="Enter custom case name or reference"
                  onChange={(e) => setFormData({ ...formData, customCaseName: e.target.value, caseId: '' })}
                  className={`w-full px-4 py-3 rounded-lg border ${inputBgClass} focus:outline-none focus:border-purple-500`}
                  required
                />
              ) : (
                <>
                  {/* Case Type Filter */}
                  <div className="mb-3">
                    <label className={`block text-xs font-semibold mb-2 ${labelClass}`}>
                      Filter by Case Type
                    </label>
                    <select
                      value={caseTypeFilter}
                      onChange={(e) => setCaseTypeFilter(e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border text-sm ${inputBgClass} focus:outline-none focus:border-blue-500`}
                    >
                      <option value="all">All Case Types</option>
                      <option value="Civil">Civil</option>
                      <option value="Criminal">Criminal</option>
                      <option value="Family">Family</option>
                      <option value="Corporate">Corporate</option>
                      <option value="Property">Property</option>
                      <option value="Labour">Labour</option>
                      <option value="Tax">Tax</option>
                      <option value="Constitutional">Constitutional</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  {/* Case Selection Dropdown */}
                  <select
                    value={formData.caseId}
                    onChange={(e) => setFormData({ ...formData, caseId: e.target.value, customCaseName: '' })}
                    className={`w-full px-4 py-3 rounded-lg border ${inputBgClass} focus:outline-none focus:border-blue-500`}
                    required={taskType === 'case'}
                  >
                    <option value="">Select a case...</option>
                    {cases
                      .filter((c) => caseTypeFilter === 'all' || c.caseType === caseTypeFilter)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.clientName} - {c.fileNo} ({c.caseType})
                        </option>
                      ))}
                  </select>
                </>
              )}
            </div>
          )}

          {/* Task Title */}
          <div>
            <label className={`block text-sm font-semibold mb-2 ${labelClass}`}>
              Task Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter task title"
              className={`w-full px-4 py-3 rounded-lg border ${inputBgClass} focus:outline-none focus:border-purple-500`}
              required
            />
          </div>

          {/* Task Description */}
          <div>
            <label className={`block text-sm font-semibold mb-2 ${labelClass}`}>
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter task description"
              rows={4}
              className={`w-full px-4 py-3 rounded-lg border ${inputBgClass} focus:outline-none focus:border-purple-500 resize-none`}
            />
          </div>

          {/* Assign To */}
          <div>
            <label className={`block text-sm font-semibold mb-2 ${labelClass}`}>
              Assign To *
            </label>
            <select
              value={formData.assignedTo}
              onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
              className={`w-full px-4 py-3 rounded-lg border ${inputBgClass} focus:outline-none focus:border-purple-500`}
              required
            >
              <option value="">Select user...</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>

          {/* Deadline */}
          <div>
            <label className={`block text-sm font-semibold mb-2 ${labelClass}`}>
              Deadline *
            </label>
            <input
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              className={`w-full px-4 py-3 rounded-lg border ${inputBgClass} focus:outline-none focus:border-purple-500`}
              required
            />
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 bg-gradient-cyber text-white font-semibold py-3 rounded-lg hover:shadow-cyber transition-all duration-300 border border-cyber-blue/30"
            >
              Create Task
            </button>
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 font-semibold py-3 rounded-lg transition-all duration-300 ${
                theme === 'light'
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                  : 'bg-cyber-blue/10 text-cyber-blue hover:bg-cyber-blue/20 border border-cyber-blue/30'
              }`}
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default TasksPage;
