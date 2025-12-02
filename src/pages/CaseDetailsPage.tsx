import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Edit, Home, FileText, Shield, RefreshCw, CreditCard, CheckSquare, Clock, Trash2, ExternalLink } from 'lucide-react';
import { useParams } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import RichTextEditor from '../components/RichTextEditor';
import { useData } from '../contexts/DataContext';
import { useTheme } from '../contexts/ThemeContext';

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
  const { cases } = useData();
  const { theme } = useTheme();
  
  const [activeTab, setActiveTab] = useState<TabType>('basic');
  
  // Files state
  const [files, setFiles] = useState<CaseFile[]>([]);
  const [newFile, setNewFile] = useState({ title: '', file: '', url: '' });
  
  // Interim Relief state
  const [interimRelief, setInterimRelief] = useState('NA');
  const [interimDate, setInterimDate] = useState('');
  
  // Circulation state
  const [circulationStatus, setCirculationStatus] = useState('NON CIRCULATED');
  const [circulationDate, setCirculationDate] = useState('');
  const [nextDate, setNextDate] = useState('');
  
  // Payments state
  const [payments, setPayments] = useState<CasePayment[]>([
    { id: '1', amount: 15000, date: new Date('2021-06-24'), receivedBy: 'PR Katneshwarkar', isAccepted: true }
  ]);
  const [newPayment, setNewPayment] = useState({ amount: '', date: '' });
  const [feesQuoted] = useState(25000);
  const [feesPaid] = useState(15000);
  
  // Tasks state
  const [tasks, setTasks] = useState<CaseTask[]>([]);
  const [newTask, setNewTask] = useState({ title: '', user: '', deadline: '', details: '' });
  
  // Timeline state
  const [timeline, setTimeline] = useState<TimelineEvent[]>([
    { id: '1', title: 'Case Status Updated to DISPOSED', description: 'Updated by PR Katneshwarkar', date: new Date('2021-06-29') },
    { id: '2', title: 'Reserved for order', description: '', date: new Date('2021-06-24') }
  ]);
  const [newTimelineEvent, setNewTimelineEvent] = useState({ title: '', description: '' });

  // Get case data
  const caseData = useMemo(() => {
    if (id) {
      return cases.find(c => c.id === id);
    }
    return cases[0];
  }, [cases, id]);

  const bgClass = theme === 'light' ? 'bg-white text-black' : 'glass-dark text-cyber-blue';
  const borderClass = theme === 'light' ? 'border-gray-300' : 'border-cyber-blue/20';
  const inputBgClass = theme === 'light' ? 'bg-white text-gray-900 border-gray-300 placeholder-gray-500' : 'bg-white/5 text-white border-purple-500/30 placeholder-gray-400';
  const labelClass = theme === 'light' ? 'text-gray-700' : 'text-cyber-blue/80';
  const cardBgClass = theme === 'light' ? 'bg-orange-50 border border-orange-200' : 'bg-cyber-blue/10 border border-cyber-blue/20';

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

  const handleAddFile = () => {
    if (newFile.title) {
      setFiles([...files, {
        id: Date.now().toString(),
        ...newFile,
        dateAttached: new Date(),
        attachedBy: 'Current User'
      }]);
      setNewFile({ title: '', file: '', url: '' });
    }
  };

  const handleAddPayment = () => {
    if (newPayment.amount && newPayment.date) {
      setPayments([...payments, {
        id: Date.now().toString(),
        amount: parseFloat(newPayment.amount),
        date: new Date(newPayment.date),
        receivedBy: 'PR Katneshwarkar',
        isAccepted: false
      }]);
      setNewPayment({ amount: '', date: '' });
    }
  };

  const handleAddTask = () => {
    if (newTask.title && newTask.user) {
      setTasks([...tasks, {
        id: Date.now().toString(),
        ...newTask,
        deadline: new Date(newTask.deadline),
        completed: false
      }]);
      setNewTask({ title: '', user: '', deadline: '', details: '' });
    }
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
          <button className={`px-6 py-2 rounded-lg font-semibold font-cyber transition-all duration-300 flex items-center gap-2 ${
            theme === 'light' ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-cyber-blue/10 text-cyber-blue hover:bg-cyber-blue/20 border border-cyber-blue/30'
          }`}>
            <Edit size={18} />
            EDIT
          </button>
        </div>
      </motion.div>

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
                <p><span className="font-medium">Assigned To -</span> <span className="text-cyan-500">Not Assigned</span> <ExternalLink size={14} className="inline ml-1" /></p>
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
                <p><span className="font-medium">Case Type -</span> {caseData.caseType}</p>
                <p><span className="font-medium">Court -</span> {caseData.court}</p>
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
                <p><span className="font-medium">Created On -</span> {new Date(caseData.createdAt).toLocaleDateString()}</p>
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
                <input
                  type="text"
                  placeholder="Ex - Court Order"
                  value={newFile.title}
                  onChange={(e) => setNewFile({ ...newFile, title: e.target.value })}
                  className={`w-full px-4 py-3 rounded-lg border ${inputBgClass}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-semibold mb-2 ${labelClass}`}>FILE</label>
                <input
                  type="file"
                  className={`w-full px-4 py-2 rounded-lg border ${inputBgClass}`}
                />
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
                  <th className={`text-left py-3 px-4 ${labelClass}`}>DELETE</th>
                </tr>
              </thead>
              <tbody>
                {files.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-8 text-gray-400">0 Attachments Found</td></tr>
                ) : (
                  files.map((file, index) => (
                    <tr key={file.id} className={`border-b ${borderClass}`}>
                      <td className="py-3 px-4">{index + 1}</td>
                      <td className="py-3 px-4">{file.title}</td>
                      <td className="py-3 px-4">{new Date(file.dateAttached).toLocaleDateString()}</td>
                      <td className="py-3 px-4">{file.attachedBy}</td>
                      <td className="py-3 px-4">
                        <button onClick={() => setFiles(files.filter(f => f.id !== file.id))} className="text-red-400 hover:text-red-300">
                          <Trash2 size={18} />
                        </button>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
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
              <button className="bg-gradient-cyber text-white px-6 py-3 rounded-lg font-semibold font-cyber hover:shadow-cyber transition-all border border-cyber-blue/30">
                UPDATE INTERIM RELIEF
              </button>
            </div>
          </div>
        )}

        {/* Circulation Tab */}
        {activeTab === 'circulation' && (
          <div className={`${bgClass} p-6 rounded-xl border ${borderClass}`}>
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
              <button className="bg-gradient-cyber text-white px-6 py-3 rounded-lg font-semibold font-cyber hover:shadow-cyber transition-all border border-cyber-blue/30">
                UPDATE CIRCULATION STATUS
              </button>
            </div>
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div className={`${bgClass} p-6 rounded-xl border ${borderClass}`}>
            <h3 className="text-lg font-semibold mb-4">Receive Payment</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end mb-6">
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
              <button onClick={handleAddPayment} className="bg-cyan-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-cyan-600 transition-all">
                RECEIVE FEES
              </button>
            </div>

            <p className={`text-sm ${labelClass} mb-6`}>
              Fees must be accepted by admin before its added to the client's account! Fees must be accepted by admin before its added to the client's account
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
            <table className="w-full">
              <thead>
                <tr className={`border-b ${borderClass}`}>
                  <th className={`text-left py-3 px-4 ${labelClass}`}>SR</th>
                  <th className={`text-left py-3 px-4 ${labelClass}`}>DATE</th>
                  <th className={`text-left py-3 px-4 ${labelClass}`}>AMOUNT</th>
                  <th className={`text-left py-3 px-4 ${labelClass}`}>RECEIVED BY</th>
                  <th className={`text-left py-3 px-4 ${labelClass}`}>IS ACCEPTED BY ADMIN</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment, index) => (
                  <tr key={payment.id} className={`border-b ${borderClass}`}>
                    <td className="py-3 px-4">{index + 1}</td>
                    <td className="py-3 px-4">{new Date(payment.date).toLocaleDateString()}</td>
                    <td className="py-3 px-4">{payment.amount}</td>
                    <td className="py-3 px-4">{payment.receivedBy}</td>
                    <td className="py-3 px-4">{payment.isAccepted ? 'YES' : 'NO'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Case Tasks Tab */}
        {activeTab === 'tasks' && (
          <div className={`${bgClass} p-6 rounded-xl border ${borderClass}`}>
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
                  <option value="Prashant Reguntewar">Prashant Reguntewar</option>
                  <option value="Admin">Admin</option>
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
            <div className="flex justify-end">
              <button onClick={handleAddTask} className="bg-gradient-cyber text-white px-6 py-3 rounded-lg font-semibold font-cyber hover:shadow-cyber transition-all border border-cyber-blue/30">
                CREATE TASK
              </button>
            </div>

            {/* Tasks List */}
            {tasks.length > 0 && (
              <div className="mt-6 space-y-4">
                {tasks.map((task) => (
                  <div key={task.id} className={`p-4 rounded-lg ${theme === 'light' ? 'bg-gray-100' : 'bg-white/5'}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{task.title}</h4>
                        <p className={`text-sm ${labelClass}`}>Assigned to: {task.user}</p>
                        <p className={`text-sm ${labelClass}`}>Deadline: {new Date(task.deadline).toLocaleDateString()}</p>
                      </div>
                      <button onClick={() => setTasks(tasks.filter(t => t.id !== task.id))} className="text-red-400">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Case Timeline Tab */}
        {activeTab === 'timeline' && (
          <div className={`${bgClass} p-6 rounded-xl border ${borderClass}`}>
            <button onClick={handleAddTimelineEvent} className="bg-gradient-cyber text-white px-6 py-2 rounded-lg font-semibold font-cyber hover:shadow-cyber transition-all mb-6 border border-cyber-blue/30">
              ADD NEW
            </button>

            {/* Timeline */}
            <div className="relative">
              <div className={`absolute left-4 top-0 bottom-0 w-0.5 ${theme === 'light' ? 'bg-gray-300' : 'bg-white/20'}`}></div>
              <div className="space-y-6">
                {timeline.map((event) => (
                  <div key={event.id} className="flex items-start gap-4 ml-2">
                    <div className={`w-5 h-5 rounded-full bg-cyan-500 border-4 ${theme === 'light' ? 'border-white' : 'border-gray-900'} z-10`}></div>
                    <div className="flex-1">
                      <p className={`font-medium ${theme === 'light' ? 'text-cyan-600' : 'text-cyan-400'}`}>{event.title}</p>
                      {event.description && <p className={labelClass}>{event.description}</p>}
                    </div>
                    <span className={`font-cyber ${theme === 'light' ? 'text-pink-600' : 'text-cyber-pink'}`}>{new Date(event.date).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
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
