import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Edit, Home, FileText, Shield, RefreshCw, CreditCard, CheckSquare, Clock, Trash2, ExternalLink, Download, CheckCircle, Bell } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import RichTextEditor from '../components/RichTextEditor';
import { useData } from '../contexts/DataContext';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { getAllUsers } from '../lib/userManagement';
import { User } from '../types';
import { formatIndianDate } from '../utils/dateFormat';

type TabType = 'basic' | 'files' | 'interim' | 'circulation' | 'payments' | 'tasks' | 'timeline';

interface CaseFile {
  id: string;
  title: string;
  file: string;
  url: string;
  dateAttached: Date;
  attachedBy: string;
}

interface CaseTask {
  id: string;
  title: string;
  user: string;
  deadline: Date;
  details: string;
  completed: boolean;
}

interface CasePayment {
  id: string;
  amount: number;
  date: Date;
  receivedBy: string;
  paymentMode: string;
  referenceId: string;
  tds: number;
  isAccepted: boolean;
}

interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
}

const CaseDetailsPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cases, deleteCase, updateCase, courts, caseTypes } = useData();
  const { theme } = useTheme();
  const { isAdmin, user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<TabType>('basic');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Users state
  const [users, setUsers] = useState<User[]>([]);
  const [assignedUserId, setAssignedUserId] = useState<string>('');
  
  // Files state
  const [files, setFiles] = useState<CaseFile[]>([]);
  const [newFile, setNewFile] = useState({ title: '', file: '', url: '' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Interim Relief state
  const [interimRelief, setInterimRelief] = useState('NA');
  const [interimDate, setInterimDate] = useState('');
  const [grantedDate, setGrantedDate] = useState('');
  const [isInterimLoading, setIsInterimLoading] = useState(false);
  const [interimNotification, setInterimNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  // Circulation state
  const [circulationStatus, setCirculationStatus] = useState('NON CIRCULATED');
  const [circulationDate, setCirculationDate] = useState('');
  const [nextDate, setNextDate] = useState('');
  const [isCirculationLoading, setIsCirculationLoading] = useState(false);
  const [circulationNotification, setCirculationNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  // Payments state
  const [payments, setPayments] = useState<CasePayment[]>([
    { id: '1', amount: 15000, date: new Date('2021-06-24'), receivedBy: 'PR Katneshwarkar', paymentMode: 'cash', referenceId: 'REF-001', tds: 0, isAccepted: true }
  ]);
  const [newPayment, setNewPayment] = useState({ amount: '', date: '', paymentMode: '', referenceId: '', tds: '' });
  const [feesQuoted] = useState(25000);
  const [feesPaid, setFeesPaid] = useState(15000);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [paymentNotification, setPaymentNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  // Tasks state
  const [tasks, setTasks] = useState<CaseTask[]>([]);
  const [newTask, setNewTask] = useState({ title: '', user: '', deadline: '', details: '' });
  
  // Timeline state
  const [timeline, setTimeline] = useState<TimelineEvent[]>([
    { id: '1', title: 'Case Status Updated to DISPOSED', description: 'Updated by PR Katneshwarkar', date: new Date('2021-06-29') },
    { id: '2', title: 'Reserved for order', description: '', date: new Date('2021-06-24') }
  ]);
  const [newTimelineEvent, setNewTimelineEvent] = useState({ title: '', description: '' });
  const [editingTimelineEvent, setEditingTimelineEvent] = useState<TimelineEvent | null>(null);

  // Fetch all users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      const result = await getAllUsers();
      if (result.success && result.users) {
        setUsers(result.users);
      }
    };
    fetchUsers();
  }, []);

  // Get case data
  const caseData = useMemo(() => {
    if (id) {
      return cases.find(c => c.id === id);
    }
    return cases[0];
  }, [cases, id]);

  // Initialize state from case data
  useEffect(() => {
    if (caseData) {
      // Set interim relief values
      if (caseData.interimRelief) {
        setInterimRelief(caseData.interimRelief);
      }
      if (caseData.interimDate) {
        setInterimDate(new Date(caseData.interimDate).toISOString().split('T')[0]);
      }
      if (caseData.grantedDate) {
        setGrantedDate(new Date(caseData.grantedDate).toISOString().split('T')[0]);
      }
      
      // Set circulation values
      if (caseData.circulationStatus) {
        setCirculationStatus(caseData.circulationStatus);
      }
      if (caseData.circulationDate) {
        setCirculationDate(new Date(caseData.circulationDate).toISOString().split('T')[0]);
      }
      if (caseData.nextDate) {
        setNextDate(new Date(caseData.nextDate).toISOString().split('T')[0]);
      }
    }
  }, [caseData]);

  const bgClass = theme === 'light' ? 'bg-white text-black' : 'glass-dark text-cyber-blue';
  const borderClass = theme === 'light' ? 'border-gray-300' : 'border-cyber-blue/20';
  const inputBgClass = theme === 'light' ? 'bg-white text-gray-900 border-gray-300 placeholder-gray-500' : 'bg-white/5 text-white border-orange-500/30 placeholder-gray-400';
  const labelClass = theme === 'light' ? 'text-gray-700' : 'text-cyber-blue/80';
  const cardBgClass = theme === 'light' ? 'bg-orange-50 border border-orange-200' : 'bg-cyber-blue/10 border border-cyber-blue/20';

  // Debug: Log courts and case types
  console.log('Courts available:', courts);
  console.log('Case Types available:', caseTypes);

  if (!caseData) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p className={theme === 'light' ? 'text-gray-500' : 'text-gray-400'}>Case not found</p>
        </div>
      </MainLayout>
    );
  }

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'basic', label: 'BASIC DETAILS', icon: <Home size={16} /> },
    { id: 'files', label: 'FILES', icon: <FileText size={16} /> },
    { id: 'interim', label: 'INTERIM RELIEF', icon: <Shield size={16} /> },
    { id: 'circulation', label: 'CIRCULATION', icon: <RefreshCw size={16} /> },
    { id: 'payments', label: 'PAYMENTS', icon: <CreditCard size={16} /> },
    { id: 'tasks', label: 'CASE TASKS', icon: <CheckSquare size={16} /> },
    { id: 'timeline', label: 'CASE TIMELINE', icon: <Clock size={16} /> },
  ];

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Create a local URL for the file that can be downloaded
      const fileUrl = URL.createObjectURL(file);
      setNewFile({ ...newFile, file: fileUrl });
    }
  };

  const handleAddFile = () => {
    if (newFile.title && (newFile.file || newFile.url)) {
      setFiles([...files, {
        id: Date.now().toString(),
        title: newFile.title,
        file: newFile.file,
        url: newFile.url,
        dateAttached: new Date(),
        attachedBy: 'Current User'
      }]);
      setNewFile({ title: '', file: '', url: '' });
      setSelectedFile(null);
    }
  };

  const handleDownloadFile = (file: CaseFile) => {
    // Priority: 1. URL (Dropbox/Drive), 2. Local file
    if (file.url) {
      // Open external URL in new tab
      window.open(file.url, '_blank');
    } else if (file.file) {
      // Download local file
      const link = document.createElement('a');
      link.href = file.file;
      link.download = file.title || 'download';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleAddPayment = async () => {
    if (!newPayment.amount || !newPayment.date || !newPayment.paymentMode) {
      setPaymentNotification({ type: 'error', message: 'Please fill all payment fields' });
      setTimeout(() => setPaymentNotification(null), 3000);
      return;
    }
    
    setIsPaymentLoading(true);
    try {
      const paymentData: CasePayment = {
        id: Date.now().toString(),
        amount: parseFloat(newPayment.amount),
        date: new Date(newPayment.date),
        receivedBy: user?.name || 'Admin',
        paymentMode: newPayment.paymentMode,
        referenceId: newPayment.referenceId || '',
        tds: parseFloat(newPayment.tds) || 0,
        isAccepted: false
      };
      
      setPayments(prev => [...prev, paymentData]);
      setFeesPaid(prev => prev + paymentData.amount);
      setNewPayment({ amount: '', date: '', paymentMode: '', referenceId: '', tds: '' });
      
      setPaymentNotification({ type: 'success', message: `Payment of ₹${paymentData.amount.toLocaleString()} received successfully! Pending admin approval.` });
      setTimeout(() => setPaymentNotification(null), 4000);
      
      // This would trigger real-time update to all users via Supabase
      console.log('Payment added - will sync to all users:', paymentData);
    } catch (error) {
      setPaymentNotification({ type: 'error', message: 'Failed to add payment' });
      setTimeout(() => setPaymentNotification(null), 3000);
    } finally {
      setIsPaymentLoading(false);
    }
  };
  
  const handleAcceptPayment = (paymentId: string) => {
    setPayments(prev => prev.map(p => 
      p.id === paymentId ? { ...p, isAccepted: true } : p
    ));
    setPaymentNotification({ type: 'success', message: 'Payment accepted by admin!' });
    setTimeout(() => setPaymentNotification(null), 3000);
  };

  const handleAddTask = async () => {
    if (!newTask.title || !newTask.user) {
      setPaymentNotification({ type: 'error', message: 'Please fill task title and assign a user' });
      setTimeout(() => setPaymentNotification(null), 3000);
      return;
    }
    
    const taskData = {
      id: Date.now().toString(),
      ...newTask,
      deadline: new Date(newTask.deadline),
      completed: false,
      assignedBy: user?.name || 'Admin',
      assignedByRole: isAdmin ? 'admin' : 'user',
      caseId: id,
      caseName: caseData?.clientName || 'Unknown Case',
      createdAt: new Date()
    };
    
    setTasks(prev => [...prev, taskData]);
    setNewTask({ title: '', user: '', deadline: '', details: '' });
    
    // Show notification for task assignment
    setPaymentNotification({ 
      type: 'success', 
      message: `Task "${taskData.title}" assigned to ${taskData.user}. Notification sent!` 
    });
    setTimeout(() => setPaymentNotification(null), 4000);
    
    // This would create a notification for the assigned user
    console.log('Task assigned - notification will be sent to:', taskData.user, taskData);
  };

  const handleAddTimelineEvent = () => {
    if (newTimelineEvent.title) {
      setTimeline([{
        id: Date.now().toString(),
        ...newTimelineEvent,
        date: new Date()
      }, ...timeline]);
      setNewTimelineEvent({ title: '', description: '' });
    }
  };

  const handleEditTimelineEvent = (event: TimelineEvent) => {
    setEditingTimelineEvent(event);
  };

  const handleSaveTimelineEvent = () => {
    if (editingTimelineEvent && editingTimelineEvent.title) {
      setTimeline(prev => prev.map(e => 
        e.id === editingTimelineEvent.id ? editingTimelineEvent : e
      ));
      setEditingTimelineEvent(null);
    }
  };

  const handleDeleteTimelineEvent = (eventId: string) => {
    if (window.confirm('Are you sure you want to delete this timeline event?')) {
      setTimeline(prev => prev.filter(e => e.id !== eventId));
    }
  };

  // Handle Update Interim Relief
  const handleUpdateInterimRelief = async () => {
    if (!id) return;
    
    setIsInterimLoading(true);
    try {
      await updateCase(id, {
        interimRelief: interimRelief,
        interimDate: interimDate ? new Date(interimDate) : undefined,
        grantedDate: grantedDate ? new Date(grantedDate) : undefined,
      });
      
      // Add to timeline
      const dateInfo = [];
      if (interimDate) dateInfo.push(`Date: ${formatIndianDate(interimDate)}`);
      if (grantedDate) dateInfo.push(`Granted: ${formatIndianDate(grantedDate)}`);
      
      setTimeline([{
        id: Date.now().toString(),
        title: `Interim Relief Updated to ${interimRelief}`,
        description: dateInfo.join(', '),
        date: new Date()
      }, ...timeline]);
      
      setInterimNotification({ type: 'success', message: `Interim Relief updated to ${interimRelief} successfully!` });
      setTimeout(() => setInterimNotification(null), 4000);
    } catch (error) {
      setInterimNotification({ type: 'error', message: 'Failed to update interim relief' });
      setTimeout(() => setInterimNotification(null), 3000);
    } finally {
      setIsInterimLoading(false);
    }
  };

  // Handle Update Circulation Status
  const handleUpdateCirculation = async () => {
    if (!id) return;
    
    setIsCirculationLoading(true);
    try {
      await updateCase(id, {
        circulationStatus: circulationStatus,
        circulationDate: circulationDate ? new Date(circulationDate) : undefined,
        nextDate: nextDate ? new Date(nextDate) : undefined,
      });
      
      // Add to timeline
      setTimeline([{
        id: Date.now().toString(),
        title: `Circulation Status Updated to ${circulationStatus}`,
        description: circulationDate ? `Circulation Date: ${formatIndianDate(circulationDate)}${nextDate ? `, Next Date: ${formatIndianDate(nextDate)}` : ''}` : '',
        date: new Date()
      }, ...timeline]);
      
      setCirculationNotification({ type: 'success', message: `Circulation status updated to ${circulationStatus} successfully!` });
      setTimeout(() => setCirculationNotification(null), 4000);
    } catch (error) {
      setCirculationNotification({ type: 'error', message: 'Failed to update circulation status' });
      setTimeout(() => setCirculationNotification(null), 3000);
    } finally {
      setIsCirculationLoading(false);
    }
  };

  const handleEdit = () => {
    if (id) {
      navigate(`/cases/${id}/edit`);
    }
  };

  const handleDelete = async () => {
    if (id) {
      await deleteCase(id);
      navigate('/cases');
    }
  };

  return (
    <MainLayout>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${bgClass} p-6 rounded-xl border ${borderClass} mb-6`}
      >
        <div className="flex items-center justify-between">
          <h1 className={`text-2xl font-bold font-cyber ${theme === 'light' ? 'text-gray-900' : 'holographic-text'}`}>Case Details</h1>
          <div className="flex gap-3">
            <button 
              onClick={handleEdit}
              className="px-6 py-2 rounded-lg font-semibold font-cyber transition-all duration-300 flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-lg border border-amber-500/30"
            >
              <Edit size={18} />
              EDIT
            </button>
            {isAdmin && (
              <button 
                onClick={() => setShowDeleteConfirm(true)}
                className="px-6 py-2 rounded-lg font-semibold font-cyber transition-all duration-300 flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-lg border border-red-500/30"
              >
                <Trash2 size={18} />
                DELETE
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className={`${bgClass} p-8 rounded-2xl border ${borderClass} max-w-md w-full mx-4`}
          >
            <h2 className={`text-2xl font-bold mb-4 ${theme === 'light' ? 'text-gray-900' : 'text-cyber-blue'}`}>
              Confirm Delete
            </h2>
            <p className={`mb-6 ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
              Are you sure you want to delete this case? This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={handleDelete}
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold py-3 rounded-lg hover:shadow-lg transition-all duration-300 border border-red-500/30"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className={`flex-1 font-semibold py-3 rounded-lg transition-all duration-300 ${
                  theme === 'light' 
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300' 
                    : 'bg-cyber-blue/10 text-cyber-blue hover:bg-cyber-blue/20 border border-cyber-blue/30'
                }`}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Tabs */}
      <div className={`flex gap-1 mb-6 border-b ${borderClass} overflow-x-auto`}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 px-4 font-medium font-cyber transition-all duration-300 whitespace-nowrap flex items-center gap-2 text-sm ${
              activeTab === tab.id
                ? 'text-cyber-blue border-b-2 border-cyber-blue text-glow'
                : theme === 'light' ? 'text-gray-600 hover:text-black' : 'text-cyber-blue/50 hover:text-cyber-blue'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Basic Details Tab */}
        {activeTab === 'basic' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Details Card */}
            <div className={`${cardBgClass} p-6 rounded-xl`}>
              <h3 className="text-lg font-bold mb-4 text-orange-600">Basic Details</h3>
              <div className="space-y-3">
                <p><span className="font-medium">Client -</span> <span className="text-cyan-500">{caseData.clientName} | {caseData.clientMobile}</span></p>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Assigned To -</span>
                  <select 
                    value={assignedUserId} 
                    onChange={(e) => setAssignedUserId(e.target.value)}
                    className={`px-3 py-1 rounded border ${inputBgClass} flex-1`}
                  >
                    <option value="">Not Assigned</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.role})
                      </option>
                    ))}
                  </select>
                </div>
                <p><span className="font-medium">Name of Parties -</span> {caseData.partiesName}</p>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Case Status -</span>
                  <select className={`px-3 py-1 rounded border ${inputBgClass}`} defaultValue={caseData.status}>
                    <option value="pending">PENDING</option>
                    <option value="active">ACTIVE</option>
                    <option value="disposed">DISPOSED</option>
                    <option value="closed">CLOSED</option>
                  </select>
                </div>
                <p><span className="font-medium">On Behalf Of -</span> {caseData.onBehalfOf || 'PETITIONER'}</p>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Case Stage -</span>
                  <select 
                    className={`px-3 py-1 rounded border ${inputBgClass} flex-1`} 
                    defaultValue={caseData.stage || ''}
                    onChange={(e) => {
                      // Update case stage - this will be saved when user clicks save
                      console.log('Stage changed to:', e.target.value);
                    }}
                  >
                    <option value="">Select Stage</option>
                    <option value="consultation">Consultation</option>
                    <option value="drafting">Drafting</option>
                    <option value="filing">Filing</option>
                    <option value="circulation">Circulation</option>
                    <option value="notice">Notice</option>
                    <option value="pre-admission">Pre Admission</option>
                    <option value="admitted">Admitted</option>
                    <option value="final-hearing">Final Hearing</option>
                    <option value="reserved">Reserved For Judgement</option>
                    <option value="disposed">Disposed</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Case Type -</span>
                  <select className={`px-3 py-1 rounded border ${inputBgClass}`} defaultValue={caseData.caseType}>
                    <option value="">Select Case Type</option>
                    {caseTypes.map((ct) => (
                      <option key={ct.id} value={ct.name}>{ct.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Court -</span>
                  <select className={`px-3 py-1 rounded border ${inputBgClass}`} defaultValue={caseData.court}>
                    <option value="">Select Court</option>
                    {courts.map((court) => (
                      <option key={court.id} value={court.name}>{court.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">District -</span>
                  <select className={`px-3 py-1 rounded border ${inputBgClass}`} defaultValue={caseData.district}>
                    <option value="">Select</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Pune">Pune</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Important Details Card */}
            <div className={`${cardBgClass} p-6 rounded-xl`}>
              <h3 className="text-lg font-bold mb-4 text-orange-600">Important Details</h3>
              <div className="space-y-3">
                <p><span className="font-medium">Circulation Status -</span> {caseData.circulationStatus?.toUpperCase() || 'NON CIRCULATED'}</p>
                <p><span className="font-medium">Office File Number -</span> {caseData.fileNo}</p>
                <p><span className="font-medium">Stamp Number -</span> {caseData.stampNo || '-'}</p>
                <p><span className="font-medium">Registration Number -</span> {caseData.regNo}</p>
                <p><span className="font-medium">Created On -</span> {formatIndianDate(caseData.createdAt)}</p>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Filing Date -</span>
                  <input type="date" className={`px-3 py-1 rounded border ${inputBgClass}`} defaultValue={new Date(caseData.filingDate).toISOString().split('T')[0]} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Next Date -</span>
                  <input type="date" className={`px-3 py-1 rounded border ${inputBgClass}`} defaultValue={new Date(caseData.nextDate).toISOString().split('T')[0]} />
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div className={`${cardBgClass} p-6 rounded-xl md:col-span-2`}>
              <h3 className="text-lg font-bold mb-4 text-orange-600">Additional Details</h3>
              <p>{caseData.additionalDetails || 'No additional details'}</p>
            </div>
          </div>
        )}

        {/* Files Tab */}
        {activeTab === 'files' && (
          <div className={`${bgClass} p-6 rounded-xl border ${borderClass}`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className={`block text-sm font-semibold mb-2 ${labelClass}`}>FILE TITLE</label>
                <select
                  value={newFile.title}
                  onChange={(e) => setNewFile({ ...newFile, title: e.target.value })}
                  className={`w-full px-4 py-3 rounded-lg border ${inputBgClass}`}
                >
                  <option value="">Select Document Type</option>
                  <option value="Case Proceedings">Case Proceedings</option>
                  <option value="Praecipe">Praecipe</option>
                  <option value="Acknowledgments">Acknowledgments</option>
                  <option value="Service">Service</option>
                  <option value="Intimation Notice">Intimation Notice</option>
                  <option value="Communications">Communications</option>
                  <option value="Court Orders">Court Orders</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-semibold mb-2 ${labelClass}`}>FILE</label>
                <input
                  type="file"
                  onChange={handleFileInputChange}
                  className={`w-full px-4 py-2 rounded-lg border ${inputBgClass}`}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                />
                {selectedFile && (
                  <p className="text-xs text-green-400 mt-1">Selected: {selectedFile.name}</p>
                )}
              </div>
              <div>
                <label className={`block text-sm font-semibold mb-2 ${labelClass}`}>URL</label>
                <input
                  type="text"
                  placeholder="Dropbox / Drive Link (Optional)"
                  value={newFile.url}
                  onChange={(e) => setNewFile({ ...newFile, url: e.target.value })}
                  className={`w-full px-4 py-3 rounded-lg border ${inputBgClass}`}
                />
              </div>
            </div>
            <div className="flex justify-end mb-6">
              <button onClick={handleAddFile} className="bg-gradient-cyber text-white px-6 py-2 rounded-lg font-semibold font-cyber hover:shadow-cyber transition-all border border-cyber-blue/30">
                ATTACH
              </button>
            </div>

            {/* Files Table */}
            <table className="w-full">
              <thead>
                <tr className={`border-b ${borderClass}`}>
                  <th className={`text-left py-3 px-4 ${labelClass}`}>SR</th>
                  <th className={`text-left py-3 px-4 ${labelClass}`}>ATTACHMENT TITLE</th>
                  <th className={`text-left py-3 px-4 ${labelClass}`}>DATE ATTACHED</th>
                  <th className={`text-left py-3 px-4 ${labelClass}`}>ATTACHED BY</th>
                  <th className={`text-left py-3 px-4 ${labelClass}`}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {files.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-8 text-gray-400">0 Attachments Found</td></tr>
                ) : (
                  files.map((file, index) => (
                    <tr key={file.id} className={`border-b ${borderClass}`}>
                      <td className="py-3 px-4">{index + 1}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleDownloadFile(file)}
                          className="text-blue-400 hover:text-blue-300 underline hover:no-underline transition-all cursor-pointer font-medium text-left"
                          title="Click to download file"
                        >
                          {file.title}
                        </button>
                      </td>
                      <td className="py-3 px-4">{formatIndianDate(file.dateAttached)}</td>
                      <td className="py-3 px-4">{file.attachedBy}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleDownloadFile(file)}
                            className="text-green-400 hover:text-green-300 p-2 rounded-lg hover:bg-green-500/20 transition-all flex items-center gap-1"
                            title="Download File"
                          >
                            <Download size={18} />
                          </button>
                          <button 
                            onClick={() => handleDownloadFile(file)}
                            className="text-blue-400 hover:text-blue-300 p-2 rounded-lg hover:bg-blue-500/20 transition-all"
                            title="Open in New Tab"
                          >
                            <ExternalLink size={18} />
                          </button>
                          <button 
                            onClick={() => setFiles(files.filter(f => f.id !== file.id))} 
                            className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/20 transition-all"
                            title="Delete File"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Interim Relief Tab */}
        {activeTab === 'interim' && (
          <div className={`${bgClass} p-6 rounded-xl border ${borderClass}`}>
            {/* Interim Relief Notification */}
            {interimNotification && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`mb-4 p-4 rounded-xl flex items-center gap-3 ${
                  interimNotification.type === 'success'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}
              >
                {interimNotification.type === 'success' ? <CheckCircle size={20} /> : <Bell size={20} />}
                {interimNotification.message}
              </motion.div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className={`block text-sm font-semibold mb-2 ${labelClass}`}>INTERIM RELIEF</label>
                <select
                  value={interimRelief}
                  onChange={(e) => setInterimRelief(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${inputBgClass}`}
                >
                  <option value="NA">NA</option>
                  <option value="FAVOR">FAVOR</option>
                  <option value="AGAINST">AGAINST</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-semibold mb-2 ${labelClass}`}>DATE</label>
                <input
                  type="date"
                  value={interimDate}
                  onChange={(e) => setInterimDate(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${inputBgClass}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-semibold mb-2 ${labelClass}`}>GRANTED DATE</label>
                <input
                  type="date"
                  value={grantedDate}
                  onChange={(e) => setGrantedDate(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${inputBgClass}`}
                />
              </div>
              <button 
                onClick={handleUpdateInterimRelief}
                disabled={isInterimLoading}
                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  isInterimLoading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-purple-600 hover:to-pink-600 hover:shadow-lg hover:shadow-orange-500/30'
                } text-white border border-orange-500/30`}
              >
                <Shield size={18} />
                {isInterimLoading ? 'UPDATING...' : 'UPDATE INTERIM RELIEF'}
              </button>
            </div>
          </div>
        )}

        {/* Circulation Tab */}
        {activeTab === 'circulation' && (
          <div className={`${bgClass} p-6 rounded-xl border ${borderClass}`}>
            {/* Circulation Notification */}
            {circulationNotification && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`mb-4 p-4 rounded-xl flex items-center gap-3 ${
                  circulationNotification.type === 'success'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}
              >
                {circulationNotification.type === 'success' ? <CheckCircle size={20} /> : <Bell size={20} />}
                {circulationNotification.message}
              </motion.div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className={`block text-sm font-semibold mb-2 ${labelClass}`}>CIRCULATION STATUS</label>
                <select
                  value={circulationStatus}
                  onChange={(e) => setCirculationStatus(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${inputBgClass}`}
                >
                  <option value="NON CIRCULATED">NON CIRCULATED</option>
                  <option value="CIRCULATED">CIRCULATED</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-semibold mb-2 ${labelClass}`}>CIRCULATION DATE</label>
                <input
                  type="date"
                  value={circulationDate}
                  onChange={(e) => setCirculationDate(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${inputBgClass}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-semibold mb-2 ${labelClass}`}>NEXT DATE</label>
                <input
                  type="date"
                  value={nextDate}
                  onChange={(e) => setNextDate(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${inputBgClass}`}
                />
              </div>
              <button 
                onClick={handleUpdateCirculation}
                disabled={isCirculationLoading}
                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  isCirculationLoading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-purple-600 hover:to-pink-600 hover:shadow-lg hover:shadow-orange-500/30'
                } text-white border border-orange-500/30`}
              >
                <RefreshCw size={18} />
                {isCirculationLoading ? 'UPDATING...' : 'UPDATE CIRCULATION STATUS'}
              </button>
            </div>
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div className={`${bgClass} p-6 rounded-xl border ${borderClass}`}>
            {/* Payment Notification */}
            {paymentNotification && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`mb-4 p-4 rounded-xl flex items-center gap-3 ${
                  paymentNotification.type === 'success'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}
              >
                {paymentNotification.type === 'success' ? <CheckCircle size={20} /> : <Bell size={20} />}
                {paymentNotification.message}
              </motion.div>
            )}
            
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="text-emerald-500" size={24} />
              Receive Payment
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className={`block text-sm font-semibold mb-2 ${labelClass}`}>AMOUNT</label>
                <input
                  type="number"
                  placeholder="Amount"
                  value={newPayment.amount}
                  onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
                  className={`w-full px-4 py-3 rounded-lg border ${inputBgClass}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-semibold mb-2 ${labelClass}`}>DATE</label>
                <input
                  type="date"
                  value={newPayment.date}
                  onChange={(e) => setNewPayment({ ...newPayment, date: e.target.value })}
                  className={`w-full px-4 py-3 rounded-lg border ${inputBgClass}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-semibold mb-2 ${labelClass}`}>REFERENCE ID</label>
                <input
                  type="text"
                  placeholder="Transaction/Reference ID"
                  value={newPayment.referenceId}
                  onChange={(e) => setNewPayment({ ...newPayment, referenceId: e.target.value })}
                  className={`w-full px-4 py-3 rounded-lg border ${inputBgClass}`}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end mb-6">
              <div>
                <label className={`block text-sm font-semibold mb-2 ${labelClass}`}>TDS AMOUNT</label>
                <input
                  type="number"
                  placeholder="TDS Amount (if any)"
                  value={newPayment.tds}
                  onChange={(e) => setNewPayment({ ...newPayment, tds: e.target.value })}
                  className={`w-full px-4 py-3 rounded-lg border ${inputBgClass}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-semibold mb-2 ${labelClass}`}>PAYMENT MODE</label>
                <select
                  value={newPayment.paymentMode || ''}
                  onChange={(e) => setNewPayment({ ...newPayment, paymentMode: e.target.value })}
                  className={`w-full px-4 py-3 rounded-lg border ${inputBgClass}`}
                >
                  <option value="">Select Mode</option>
                  <option value="cash">💵 Cash</option>
                  <option value="upi">📱 UPI</option>
                  <option value="bank-transfer">🏦 Bank Transfer</option>
                  <option value="check">📝 Check</option>
                  <option value="card">💳 Card</option>
                  <option value="online">🌐 Online Payment</option>
                  <option value="other">📋 Other</option>
                </select>
              </div>
              <button 
                onClick={handleAddPayment}
                disabled={isPaymentLoading}
                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  isPaymentLoading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 hover:shadow-lg hover:shadow-emerald-500/30'
                } text-white border border-emerald-500/30`}
              >
                <CheckCircle size={18} />
                {isPaymentLoading ? 'PROCESSING...' : 'RECEIVE PAYMENT'}
              </button>
            </div>

            <p className={`text-sm ${labelClass} mb-6 p-3 rounded-lg ${theme === 'light' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
              ⚠️ Fees must be accepted by admin before its added to the client's account! Fees must be accepted by admin before its added to the client's account
            </p>

            {/* Fees Summary */}
            <div className={`${theme === 'light' ? 'bg-gray-100' : 'bg-white/5'} rounded-lg mb-6`}>
              <div className={`flex justify-between py-3 px-6 border-b ${borderClass}`}>
                <span className="font-semibold">Fees Quoted</span>
                <span>{feesQuoted}</span>
              </div>
              <div className={`flex justify-between py-3 px-6 border-b ${borderClass}`}>
                <span className="font-semibold">Fees Paid</span>
                <span>{feesPaid}</span>
              </div>
              <div className="flex justify-between py-3 px-6">
                <span className="font-semibold">Pending Fees</span>
                <span>{feesQuoted - feesPaid}</span>
              </div>
            </div>

            {/* Payments Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${borderClass}`}>
                    <th className={`text-left py-3 px-4 ${labelClass}`}>SR</th>
                    <th className={`text-left py-3 px-4 ${labelClass}`}>DATE</th>
                    <th className={`text-left py-3 px-4 ${labelClass}`}>AMOUNT</th>
                    <th className={`text-left py-3 px-4 ${labelClass}`}>TDS</th>
                    <th className={`text-left py-3 px-4 ${labelClass}`}>REFERENCE ID</th>
                    <th className={`text-left py-3 px-4 ${labelClass}`}>PAYMENT MODE</th>
                    <th className={`text-left py-3 px-4 ${labelClass}`}>RECEIVED BY</th>
                    <th className={`text-left py-3 px-4 ${labelClass}`}>IS ACCEPTED BY ADMIN</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment, index) => (
                    <tr key={payment.id} className={`border-b ${borderClass} ${theme === 'light' ? 'hover:bg-gray-50' : 'hover:bg-white/5'}`}>
                      <td className="py-3 px-4">{index + 1}</td>
                      <td className="py-3 px-4">{formatIndianDate(payment.date)}</td>
                      <td className="py-3 px-4 font-semibold text-emerald-500">₹{payment.amount.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        {payment.tds > 0 ? (
                          <span className="text-red-500 font-medium">₹{payment.tds.toLocaleString()}</span>
                        ) : (
                          <span className={labelClass}>-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {payment.referenceId ? (
                          <span className={`px-2 py-1 rounded text-xs font-mono ${theme === 'light' ? 'bg-gray-100 text-gray-700' : 'bg-white/10 text-gray-300'}`}>
                            {payment.referenceId}
                          </span>
                        ) : (
                          <span className={labelClass}>-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase flex items-center gap-1 w-fit ${
                          payment.paymentMode === 'cash' ? 'bg-green-500/20 text-green-500 border border-green-500/30' :
                          payment.paymentMode === 'upi' ? 'bg-purple-500/20 text-purple-500 border border-orange-500/30' :
                          payment.paymentMode === 'bank-transfer' ? 'bg-blue-500/20 text-blue-500 border border-blue-500/30' :
                          payment.paymentMode === 'check' ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' :
                          payment.paymentMode === 'card' ? 'bg-pink-500/20 text-pink-500 border border-pink-500/30' :
                          payment.paymentMode === 'online' ? 'bg-cyan-500/20 text-cyan-500 border border-cyan-500/30' :
                          'bg-gray-500/20 text-gray-500 border border-gray-500/30'
                        }`}>
                          {payment.paymentMode === 'cash' && '💵'}
                          {payment.paymentMode === 'upi' && '📱'}
                          {payment.paymentMode === 'bank-transfer' && '🏦'}
                          {payment.paymentMode === 'check' && '📝'}
                          {payment.paymentMode === 'card' && '💳'}
                          {payment.paymentMode === 'online' && '🌐'}
                          {payment.paymentMode || 'N/A'}
                        </span>
                      </td>
                      <td className="py-3 px-4">{payment.receivedBy}</td>
                      <td className="py-3 px-4">
                        {payment.isAccepted ? (
                          <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-500/20 text-green-500 border border-green-500/30 flex items-center gap-1 w-fit">
                            <CheckCircle size={14} />
                            YES
                          </span>
                        ) : isAdmin ? (
                          <button
                            onClick={() => handleAcceptPayment(payment.id)}
                            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-lg hover:shadow-amber-500/30 transition-all duration-300 flex items-center gap-1"
                          >
                            <CheckCircle size={14} />
                            ACCEPT
                          </button>
                        ) : (
                          <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/20 text-amber-500 border border-amber-500/30 flex items-center gap-1 w-fit">
                            ⏳ PENDING
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Case Tasks Tab */}
        {activeTab === 'tasks' && (
          <div className={`${bgClass} p-6 rounded-xl border ${borderClass}`}>
            {/* Task Notification */}
            {paymentNotification && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`mb-4 p-4 rounded-xl flex items-center gap-3 ${
                  paymentNotification.type === 'success'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}
              >
                {paymentNotification.type === 'success' ? <CheckCircle size={20} /> : <Bell size={20} />}
                {paymentNotification.message}
              </motion.div>
            )}
            
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CheckSquare className="text-purple-500" size={24} />
              Assign Task
              {isAdmin && <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full ml-2">Admin Mode</span>}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className={`block text-sm font-semibold mb-2 ${labelClass}`}>TASK TITLE</label>
                <input
                  type="text"
                  placeholder="Ex - Prepare Draft"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className={`w-full px-4 py-3 rounded-lg border ${inputBgClass}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-semibold mb-2 ${labelClass}`}>FOR USER</label>
                <select
                  value={newTask.user}
                  onChange={(e) => setNewTask({ ...newTask, user: e.target.value })}
                  className={`w-full px-4 py-3 rounded-lg border ${inputBgClass}`}
                >
                  <option value="">Select User</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.name}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`block text-sm font-semibold mb-2 ${labelClass}`}>DEADLINE</label>
                <input
                  type="date"
                  value={newTask.deadline}
                  onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                  className={`w-full px-4 py-3 rounded-lg border ${inputBgClass}`}
                />
              </div>
            </div>
            <div className="mb-6">
              <label className={`block text-sm font-semibold mb-2 ${labelClass}`}>TASK DETAILS</label>
              <RichTextEditor
                label=""
                value={newTask.details}
                onChange={(value) => setNewTask({ ...newTask, details: value })}
              />
            </div>
            <div className="flex justify-end gap-3">
              <p className={`text-sm ${labelClass} flex items-center gap-2`}>
                <Bell size={16} className="text-amber-500" />
                User will receive a notification when task is assigned
              </p>
              <button onClick={handleAddTask} className="bg-gradient-cyber text-white px-6 py-3 rounded-lg font-semibold font-cyber hover:shadow-cyber transition-all border border-cyber-blue/30 flex items-center gap-2">
                <CheckSquare size={18} />
                CREATE TASK
              </button>
            </div>

            {/* Tasks List */}
            {tasks.length > 0 && (
              <div className="mt-6 space-y-4">
                <h4 className={`font-semibold ${labelClass} mb-3`}>Assigned Tasks ({tasks.length})</h4>
                {tasks.map((task: any) => (
                  <motion.div 
                    key={task.id} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl ${theme === 'light' ? 'bg-gray-100 border border-gray-200' : 'bg-white/5 border border-white/10'}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{task.title}</h4>
                          {task.completed ? (
                            <span className="text-xs bg-green-500/20 text-green-500 px-2 py-0.5 rounded-full">Completed</span>
                          ) : (
                            <span className="text-xs bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded-full">Pending</span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <p className={labelClass}>
                            <span className="font-medium">Assigned to:</span> {task.user}
                          </p>
                          <p className={labelClass}>
                            <span className="font-medium">Deadline:</span> {formatIndianDate(task.deadline)}
                          </p>
                          {task.assignedBy && (
                            <p className={labelClass}>
                              <span className="font-medium">Assigned by:</span> {task.assignedBy}
                              {task.assignedByRole === 'admin' && (
                                <span className="ml-1 text-xs bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded">Admin</span>
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                      <button 
                        onClick={() => setTasks(tasks.filter(t => t.id !== task.id))} 
                        className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/20 transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Case Timeline Tab */}
        {activeTab === 'timeline' && (
          <div className={`${bgClass} p-6 rounded-xl border ${borderClass}`}>
            {/* Add New Timeline Event Form */}
            <div className="mb-6 p-4 rounded-xl border border-dashed border-cyan-500/30 bg-cyan-500/5">
              <h4 className={`font-semibold mb-4 ${theme === 'light' ? 'text-cyan-600' : 'text-cyan-400'}`}>Add New Timeline Event</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${labelClass}`}>EVENT TITLE *</label>
                  <input
                    type="text"
                    placeholder="Ex - Case Status Updated"
                    value={newTimelineEvent.title}
                    onChange={(e) => setNewTimelineEvent({ ...newTimelineEvent, title: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg border ${inputBgClass}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${labelClass}`}>DESCRIPTION</label>
                  <input
                    type="text"
                    placeholder="Additional details..."
                    value={newTimelineEvent.description}
                    onChange={(e) => setNewTimelineEvent({ ...newTimelineEvent, description: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg border ${inputBgClass}`}
                  />
                </div>
              </div>
              <button 
                onClick={handleAddTimelineEvent} 
                disabled={!newTimelineEvent.title}
                className={`px-6 py-2 rounded-lg font-semibold font-cyber transition-all border ${
                  newTimelineEvent.title 
                    ? 'bg-gradient-cyber text-white hover:shadow-cyber border-cyber-blue/30' 
                    : 'bg-gray-400 text-gray-200 cursor-not-allowed border-gray-400'
                }`}
              >
                ADD EVENT
              </button>
            </div>

            {/* Edit Timeline Event Modal */}
            {editingTimelineEvent && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-6 p-4 rounded-xl border ${theme === 'light' ? 'border-amber-300 bg-amber-50' : 'border-amber-500/30 bg-amber-500/10'}`}
              >
                <h4 className={`font-semibold mb-4 ${theme === 'light' ? 'text-amber-600' : 'text-amber-400'}`}>Edit Timeline Event</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${labelClass}`}>EVENT TITLE *</label>
                    <input
                      type="text"
                      value={editingTimelineEvent.title}
                      onChange={(e) => setEditingTimelineEvent({ ...editingTimelineEvent, title: e.target.value })}
                      className={`w-full px-4 py-3 rounded-lg border ${inputBgClass}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${labelClass}`}>DESCRIPTION</label>
                    <input
                      type="text"
                      value={editingTimelineEvent.description}
                      onChange={(e) => setEditingTimelineEvent({ ...editingTimelineEvent, description: e.target.value })}
                      className={`w-full px-4 py-3 rounded-lg border ${inputBgClass}`}
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={handleSaveTimelineEvent}
                    className="px-6 py-2 rounded-lg font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-lg transition-all"
                  >
                    SAVE CHANGES
                  </button>
                  <button 
                    onClick={() => setEditingTimelineEvent(null)}
                    className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                      theme === 'light' 
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    CANCEL
                  </button>
                </div>
              </motion.div>
            )}

            {/* Timeline */}
            <div className="relative">
              <div className={`absolute left-4 top-0 bottom-0 w-0.5 ${theme === 'light' ? 'bg-gray-300' : 'bg-white/20'}`}></div>
              <div className="space-y-6">
                {timeline.map((event) => (
                  <motion.div 
                    key={event.id} 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex items-start gap-4 ml-2 p-3 rounded-lg transition-all ${
                      theme === 'light' ? 'hover:bg-gray-50' : 'hover:bg-white/5'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-cyan-500 border-4 ${theme === 'light' ? 'border-white' : 'border-gray-900'} z-10 flex-shrink-0 mt-1`}></div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium ${theme === 'light' ? 'text-cyan-600' : 'text-cyan-400'}`}>{event.title}</p>
                      {event.description && (
                        <p className={`${labelClass} mt-1 text-sm`}>{event.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`font-cyber text-sm ${theme === 'light' ? 'text-pink-600' : 'text-cyber-pink'}`}>
                        {formatIndianDate(event.date)}
                      </span>
                      <button
                        onClick={() => handleEditTimelineEvent(event)}
                        className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-all"
                        title="Edit Event"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteTimelineEvent(event.id)}
                        className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all"
                        title="Delete Event"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            
            {timeline.length === 0 && (
              <div className={`text-center py-8 ${labelClass}`}>
                <Clock size={48} className="mx-auto mb-4 opacity-30" />
                <p>No timeline events yet</p>
                <p className="text-sm mt-2">Add your first event above</p>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-8 text-center"
      >
        <p className={`text-sm ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
          Designed and Developed by <span className="text-cyan-400">sawantrishi152@gmail.com</span> © 2025
        </p>
      </motion.div>
    </MainLayout>
  );
};

export default CaseDetailsPage;
