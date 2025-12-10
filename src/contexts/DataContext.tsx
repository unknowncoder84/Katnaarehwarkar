import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Case, Counsel, Appointment, Transaction, Court, CaseType, Book, SofaItem, Task, Attendance, AttendanceStatus, Expense, DataContextType, LibraryLocation, StorageLocation } from '../types';
import { db, supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const DataContext = createContext<DataContextType | undefined>(undefined);

// Helper to convert snake_case to camelCase
const toCamelCase = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(toCamelCase);
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      acc[camelKey] = toCamelCase(obj[key]);
      return acc;
    }, {} as any);
  }
  return obj;
};

// Helper to convert camelCase to snake_case
const toSnakeCase = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(toSnakeCase);
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
      acc[snakeKey] = toSnakeCase(obj[key]);
      return acc;
    }, {} as any);
  }
  return obj;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [cases, setCases] = useState<Case[]>([]);
  const [counsel, setCounsel] = useState<Counsel[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [courts, setCourts] = useState<Court[]>([
    { id: '1', name: 'High Court', createdAt: new Date() },
    { id: '2', name: 'District Court', createdAt: new Date() },
    { id: '3', name: 'Commercial Court', createdAt: new Date() },
    { id: '4', name: 'Supreme Court', createdAt: new Date() },
  ]);
  const [caseTypes, setCaseTypes] = useState<CaseType[]>([
    { id: '1', name: 'Civil', createdAt: new Date() },
    { id: '2', name: 'Criminal', createdAt: new Date() },
    { id: '3', name: 'Commercial', createdAt: new Date() },
    { id: '4', name: 'Family', createdAt: new Date() },
  ]);
  const [books, setBooks] = useState<Book[]>([]);
  const [sofaItems, setSofaItems] = useState<SofaItem[]>([]);
  const [libraryLocations, setLibraryLocations] = useState<LibraryLocation[]>([]);
  const [storageLocations, setStorageLocations] = useState<StorageLocation[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [, setLoading] = useState(true);

  // Fetch all data from Supabase
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [
        casesRes,
        counselRes,
        appointmentsRes,
        transactionsRes,
        courtsRes,
        caseTypesRes,
        booksRes,
        sofaItemsRes,
        libraryLocationsRes,
        storageLocationsRes,
        tasksRes,
        expensesRes,
      ] = await Promise.all([
        db.cases.getAll(),
        db.counsel.getAll(),
        db.appointments.getAll(),
        db.transactions.getAll(),
        db.courts.getAll(),
        db.caseTypes.getAll(),
        db.books.getAll(),
        db.sofaItems.getAll(),
        db.libraryLocations.getAll(),
        db.storageLocations.getAll(),
        db.tasks.getAll(),
        db.expenses.getAll(),
      ]);

      if (casesRes.data) setCases(toCamelCase(casesRes.data));
      if (counselRes.data) setCounsel(toCamelCase(counselRes.data));
      if (appointmentsRes.data) setAppointments(toCamelCase(appointmentsRes.data));
      if (transactionsRes.data) setTransactions(toCamelCase(transactionsRes.data));
      // Only update courts and caseTypes if we get data from the database
      if (courtsRes.data && courtsRes.data.length > 0) setCourts(toCamelCase(courtsRes.data));
      if (caseTypesRes.data && caseTypesRes.data.length > 0) setCaseTypes(toCamelCase(caseTypesRes.data));
      if (booksRes.data) setBooks(toCamelCase(booksRes.data));
      if (sofaItemsRes.data) setSofaItems(toCamelCase(sofaItemsRes.data));
      if (libraryLocationsRes.data) setLibraryLocations(toCamelCase(libraryLocationsRes.data));
      if (storageLocationsRes.data) setStorageLocations(toCamelCase(storageLocationsRes.data));
      if (tasksRes.data) setTasks(toCamelCase(tasksRes.data));
      if (expensesRes.data) setExpenses(toCamelCase(expensesRes.data));
      
      console.log('✅ All data fetched from database');
    } catch (error) {
      console.error('Error fetching data:', error);
      // Keep the default courts and caseTypes on error
    } finally {
      setLoading(false);
    }
  };

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    console.log('🔔 Setting up real-time subscriptions...');

    // Subscribe to cases changes
    const casesChannel = supabase
      .channel('cases-realtime')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'cases' },
        (payload) => {
          console.log('📦 Cases change detected:', payload);
          fetchAllData(); // Refresh all data when cases change
        }
      )
      .subscribe();

    // Subscribe to appointments changes
    const appointmentsChannel = supabase
      .channel('appointments-realtime')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'appointments' },
        (payload) => {
          console.log('📅 Appointments change detected:', payload);
          fetchAllData(); // Refresh all data when appointments change
        }
      )
      .subscribe();

    // Subscribe to counsel changes
    const counselChannel = supabase
      .channel('counsel-realtime')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'counsel' },
        (payload) => {
          console.log('👨‍⚖️ Counsel change detected:', payload);
          fetchAllData(); // Refresh all data when counsel change
        }
      )
      .subscribe();

    // Subscribe to transactions changes
    const transactionsChannel = supabase
      .channel('transactions-realtime')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'transactions' },
        (payload) => {
          console.log('💰 Transactions change detected:', payload);
          fetchAllData(); // Refresh all data when transactions change
        }
      )
      .subscribe();

    // Subscribe to tasks changes
    const tasksChannel = supabase
      .channel('tasks-realtime')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'tasks' },
        (payload) => {
          console.log('✅ Tasks change detected:', payload);
          fetchAllData(); // Refresh all data when tasks change
        }
      )
      .subscribe();

    // Subscribe to expenses changes
    const expensesChannel = supabase
      .channel('expenses-realtime')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'expenses' },
        (payload) => {
          console.log('💸 Expenses change detected:', payload);
          fetchAllData(); // Refresh all data when expenses change
        }
      )
      .subscribe();

    // Subscribe to library locations changes
    const libraryLocationsChannel = supabase
      .channel('library-locations-realtime')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'library_locations' },
        (payload) => {
          console.log('📚 Library locations change detected:', payload);
          fetchAllData(); // Refresh all data when library locations change
        }
      )
      .subscribe();

    // Subscribe to storage locations changes
    const storageLocationsChannel = supabase
      .channel('storage-locations-realtime')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'storage_locations' },
        (payload) => {
          console.log('📦 Storage locations change detected:', payload);
          fetchAllData(); // Refresh all data when storage locations change
        }
      )
      .subscribe();

    // Cleanup subscriptions on unmount
    return () => {
      console.log('🔕 Cleaning up real-time subscriptions...');
      supabase.removeChannel(casesChannel);
      supabase.removeChannel(appointmentsChannel);
      supabase.removeChannel(counselChannel);
      supabase.removeChannel(transactionsChannel);
      supabase.removeChannel(tasksChannel);
      supabase.removeChannel(expensesChannel);
      supabase.removeChannel(libraryLocationsChannel);
      supabase.removeChannel(storageLocationsChannel);
    };
  }, [user]);

  // Fetch data when user logs in
  useEffect(() => {
    if (user) {
      fetchAllData();
      
      // Add dummy data for testing if no data exists
      setTimeout(() => {
        if (cases.length === 0) {
          // Add dummy cases
          const dummyCases: Case[] = [
            {
              id: 'case-1',
              clientName: 'Rajesh Kumar',
              clientEmail: 'rajesh.kumar@email.com',
              clientMobile: '+91 98765 43210',
              fileNo: 'FN-2024-001',
              stampNo: 'ST-001',
              regNo: 'REG-2024-001',
              partiesName: 'Rajesh Kumar vs State of Maharashtra',
              district: 'Mumbai',
              caseType: 'Civil',
              court: 'High Court',
              onBehalfOf: 'Petitioner',
              noResp: '2',
              opponentLawyer: 'Adv. Sharma',
              additionalDetails: 'Property dispute case regarding ancestral property',
              feesQuoted: 50000,
              status: 'active',
              stage: 'admitted',
              nextDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
              filingDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
              circulationStatus: 'circulated',
              interimRelief: 'favor',
              createdBy: user.id,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: 'case-2',
              clientName: 'Priya Sharma',
              clientEmail: 'priya.sharma@email.com',
              clientMobile: '+91 98765 43211',
              fileNo: 'FN-2024-002',
              stampNo: 'ST-002',
              regNo: 'REG-2024-002',
              partiesName: 'Priya Sharma vs XYZ Corporation',
              district: 'Pune',
              caseType: 'Commercial',
              court: 'District Court',
              onBehalfOf: 'Petitioner',
              noResp: '1',
              opponentLawyer: 'Adv. Mehta',
              additionalDetails: 'Contract breach case',
              feesQuoted: 75000,
              status: 'active',
              stage: 'final-hearing',
              nextDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
              filingDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
              circulationStatus: 'non-circulated',
              interimRelief: 'none',
              createdBy: user.id,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ];
          setCases(dummyCases);
          
          // Add dummy appointments
          const dummyAppointments: Appointment[] = [
            {
              id: 'apt-1',
              date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
              time: '10:00 AM',
              user: user.id,
              client: 'Rajesh Kumar',
              details: 'Initial consultation for property case',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: 'apt-2',
              date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
              time: '2:00 PM',
              user: user.id,
              client: 'Priya Sharma',
              details: 'Document review meeting',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: 'apt-3',
              date: new Date(), // Today
              time: '11:30 AM',
              user: user.id,
              client: 'Amit Patel',
              details: 'Case status discussion',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ];
          setAppointments(dummyAppointments);
          
          // Add dummy transactions
          const dummyTransactions: Transaction[] = [
            {
              id: 'txn-1',
              amount: 25000,
              status: 'received',
              paymentMode: 'upi',
              receivedBy: user.name || 'Admin',
              confirmedBy: user.name || 'Admin',
              caseId: 'case-1',
              createdAt: new Date(),
            },
            {
              id: 'txn-2',
              amount: 30000,
              status: 'pending',
              paymentMode: 'check',
              receivedBy: user.name || 'Admin',
              confirmedBy: user.name || 'Admin',
              caseId: 'case-2',
              createdAt: new Date(),
            },
          ];
          setTransactions(dummyTransactions);
          
          // Add dummy tasks
          const dummyTasks: Task[] = [
            {
              id: 'task-1',
              type: 'case',
              title: 'Prepare case documents',
              description: 'Prepare all necessary documents for the upcoming hearing',
              assignedTo: user.id,
              assignedToName: user.name || 'User',
              assignedBy: user.id,
              assignedByName: user.name || 'Admin',
              caseId: 'case-1',
              caseName: 'Rajesh Kumar',
              deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
              status: 'pending',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: 'task-2',
              type: 'custom',
              title: 'Review contract terms',
              description: 'Review and analyze contract terms for client meeting',
              assignedTo: user.id,
              assignedToName: user.name || 'User',
              assignedBy: user.id,
              assignedByName: user.name || 'Admin',
              deadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
              status: 'pending',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ];
          setTasks(dummyTasks);
          
          // Add dummy expenses
          const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
          const dummyExpenses: Expense[] = [
            {
              id: 'exp-1',
              amount: 5000,
              description: 'Office supplies and stationery',
              addedBy: user.id,
              addedByName: user.name || 'User',
              month: currentMonth,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: 'exp-2',
              amount: 3500,
              description: 'Legal research database subscription',
              addedBy: user.id,
              addedByName: user.name || 'User',
              month: currentMonth,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ];
          setExpenses(dummyExpenses);
          
          console.log('✅ Dummy data added for testing');
        }
      }, 1000);
    } else {
      // Clear data on logout
      setCases([]);
      setCounsel([]);
      setAppointments([]);
      setTransactions([]);
      setCourts([]);
      setCaseTypes([]);
      setBooks([]);
      setSofaItems([]);
      setTasks([]);
      setAttendance([]);
      setExpenses([]);
      setLibraryLocations([]);
      setStorageLocations([]);
    }
  }, [user]);


  // Case operations
  const addCase = async (caseData: Omit<Case, 'id' | 'createdAt' | 'updatedAt'>) => {
    console.log('🔵 addCase called with data:', caseData);
    
    // Create temporary case immediately for instant feedback
    const tempCase: Case = {
      ...caseData,
      id: `temp-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    console.log('🟡 Adding temporary case locally:', tempCase);
    setCases((prev) => {
      const newCases = [tempCase, ...prev];
      console.log('🟢 Cases updated. Total cases:', newCases.length);
      return newCases;
    });
    
    // Try to save to database in background with timeout
    try {
      const snakeCaseData = toSnakeCase(caseData);
      snakeCaseData.created_by = user?.id;
      
      console.log('🔵 Attempting to create case in database (background)...');
      
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database timeout')), 2000)
      );
      
      // Race between database call and timeout
      const result = await Promise.race([
        db.cases.create(snakeCaseData),
        timeoutPromise
      ]) as any;
      
      const { data, error } = result;
      
      if (error) {
        console.warn('🟠 Database error (keeping temp case):', error);
        return;
      }
      
      if (data) {
        console.log('🟢 Case created in database successfully, replacing temp case');
        // Replace temp case with real case from database
        setCases((prev) => prev.map(c => c.id === tempCase.id ? toCamelCase(data) : c));
      }
    } catch (err) {
      console.warn('🟠 Database unavailable (keeping temp case):', err);
      // Keep the temp case, database is unavailable
    }
  };

  const updateCase = async (id: string, caseData: Partial<Case>) => {
    console.log('🔵 updateCase called for ID:', id, 'with data:', caseData);
    
    // Update case immediately in UI
    setCases((prev) => prev.map((c) => {
      if (c.id === id) {
        const updated = { ...c, ...caseData, updatedAt: new Date() };
        console.log('🟢 Case updated in UI:', updated);
        return updated;
      }
      return c;
    }));
    
    // Try to update in database in background with timeout
    try {
      const snakeCaseData = toSnakeCase(caseData);
      
      console.log('🔵 Attempting to update case in database (background)...');
      
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database timeout')), 2000)
      );
      
      // Race between database call and timeout
      const result = await Promise.race([
        db.cases.update(id, snakeCaseData),
        timeoutPromise
      ]) as any;
      
      const { data, error } = result;
      
      if (error) {
        console.warn('🟠 Database error (keeping local update):', error);
        return;
      }
      
      if (data) {
        console.log('🟢 Case updated in database successfully');
        // Optionally sync with database version
        setCases((prev) => prev.map((c) => (c.id === id ? toCamelCase(data) : c)));
      }
    } catch (err) {
      console.warn('🟠 Database unavailable (keeping local update):', err);
      // Keep the local update, database is unavailable
    }
  };

  const deleteCase = async (id: string) => {
    console.log('🔵 deleteCase called for ID:', id);
    
    // Delete case immediately from UI
    setCases((prev) => {
      const filtered = prev.filter((c) => c.id !== id);
      console.log('🟢 Case deleted from UI. Remaining cases:', filtered.length);
      return filtered;
    });
    
    // Try to delete from database in background with timeout
    try {
      console.log('🔵 Attempting to delete case from database (background)...');
      
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database timeout')), 2000)
      );
      
      // Race between database call and timeout
      const result = await Promise.race([
        db.cases.delete(id),
        timeoutPromise
      ]) as any;
      
      const { error } = result;
      
      if (error) {
        console.warn('🟠 Database error (case already removed from UI):', error);
        return;
      }
      
      console.log('🟢 Case deleted from database successfully');
    } catch (err) {
      console.warn('🟠 Database unavailable (case already removed from UI):', err);
      // Case is already removed from UI, database is unavailable
    }
  };

  // Counsel operations
  const addCounsel = async (counselData: Omit<Counsel, 'id' | 'createdAt' | 'updatedAt'>) => {
    const snakeCaseData = toSnakeCase(counselData);
    snakeCaseData.created_by = user?.id;
    
    const { data, error } = await db.counsel.create(snakeCaseData);
    if (error) {
      console.error('Error adding counsel:', error);
      return;
    }
    if (data) {
      setCounsel((prev) => [toCamelCase(data), ...prev]);
    }
  };

  const updateCounsel = async (id: string, counselData: Partial<Counsel>) => {
    const snakeCaseData = toSnakeCase(counselData);
    const { data, error } = await db.counsel.update(id, snakeCaseData);
    if (error) {
      console.error('Error updating counsel:', error);
      return;
    }
    if (data) {
      setCounsel((prev) => prev.map((c) => (c.id === id ? toCamelCase(data) : c)));
    }
  };

  const deleteCounsel = async (id: string) => {
    const { error } = await db.counsel.delete(id);
    if (error) {
      console.error('Error deleting counsel:', error);
      return;
    }
    setCounsel((prev) => prev.filter((c) => c.id !== id));
  };

  // Appointment operations
  const addAppointment = async (appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => {
    console.log('🔵 addAppointment called with data:', appointmentData);
    
    // Create temporary appointment immediately for instant feedback
    const tempAppointment: Appointment = {
      ...appointmentData,
      id: `temp-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    console.log('🟡 Adding temporary appointment locally:', tempAppointment);
    setAppointments((prev) => {
      const newAppointments = [tempAppointment, ...prev];
      console.log('🟢 Appointments updated. Total appointments:', newAppointments.length);
      return newAppointments;
    });
    
    // Try to save to database in background with timeout
    try {
      const snakeCaseData = toSnakeCase(appointmentData);
      snakeCaseData.user_id = user?.id;
      snakeCaseData.user_name = user?.name;
      
      console.log('🔵 Attempting to create appointment in database (background)...');
      
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database timeout')), 2000)
      );
      
      // Race between database call and timeout
      const result = await Promise.race([
        db.appointments.create(snakeCaseData),
        timeoutPromise
      ]) as any;
      
      const { data, error } = result;
      
      if (error) {
        console.warn('🟠 Database error (keeping temp appointment):', error);
        return;
      }
      
      if (data) {
        console.log('🟢 Appointment created in database successfully, replacing temp appointment');
        // Replace temp appointment with real appointment from database
        setAppointments((prev) => prev.map(a => a.id === tempAppointment.id ? toCamelCase(data) : a));
      }
    } catch (err) {
      console.warn('🟠 Database unavailable (keeping temp appointment):', err);
      // Keep the temp appointment, database is unavailable
    }
  };

  const updateAppointment = async (id: string, appointmentData: Partial<Appointment>) => {
    console.log('🔵 updateAppointment called for ID:', id, 'with data:', appointmentData);
    
    // Update appointment immediately in UI
    setAppointments((prev) => prev.map((a) => {
      if (a.id === id) {
        const updated = { ...a, ...appointmentData, updatedAt: new Date() };
        console.log('🟢 Appointment updated in UI:', updated);
        return updated;
      }
      return a;
    }));
    
    // Try to update in database in background with timeout
    try {
      const snakeCaseData = toSnakeCase(appointmentData);
      
      console.log('🔵 Attempting to update appointment in database (background)...');
      
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database timeout')), 2000)
      );
      
      // Race between database call and timeout
      const result = await Promise.race([
        db.appointments.update(id, snakeCaseData),
        timeoutPromise
      ]) as any;
      
      const { data, error } = result;
      
      if (error) {
        console.warn('🟠 Database error (keeping local update):', error);
        return;
      }
      
      if (data) {
        console.log('🟢 Appointment updated in database successfully');
        // Optionally sync with database version
        setAppointments((prev) => prev.map((a) => (a.id === id ? toCamelCase(data) : a)));
      }
    } catch (err) {
      console.warn('🟠 Database unavailable (keeping local update):', err);
      // Keep the local update, database is unavailable
    }
  };

  const deleteAppointment = async (id: string) => {
    console.log('🔵 deleteAppointment called for ID:', id);
    
    // Delete appointment immediately from UI
    setAppointments((prev) => {
      const filtered = prev.filter((a) => a.id !== id);
      console.log('🟢 Appointment deleted from UI. Remaining appointments:', filtered.length);
      return filtered;
    });
    
    // Try to delete from database in background with timeout
    try {
      console.log('🔵 Attempting to delete appointment from database (background)...');
      
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database timeout')), 2000)
      );
      
      // Race between database call and timeout
      const result = await Promise.race([
        db.appointments.delete(id),
        timeoutPromise
      ]) as any;
      
      const { error } = result;
      
      if (error) {
        console.warn('🟠 Database error (appointment already removed from UI):', error);
        return;
      }
      
      console.log('🟢 Appointment deleted from database successfully');
    } catch (err) {
      console.warn('🟠 Database unavailable (appointment already removed from UI):', err);
      // Appointment is already removed from UI, database is unavailable
    }
  };

  // Transaction operations
  const addTransaction = async (transactionData: Omit<Transaction, 'id' | 'createdAt'>) => {
    const snakeCaseData = toSnakeCase(transactionData);
    const { data, error } = await db.transactions.create(snakeCaseData);
    if (error) {
      console.error('Error adding transaction:', error);
      return;
    }
    if (data) {
      setTransactions((prev) => [toCamelCase(data), ...prev]);
    }
  };


  // Court operations
  const addCourt = async (courtName: string) => {
    const { data, error } = await db.courts.create(courtName);
    if (error) {
      console.error('Error adding court:', error);
      return;
    }
    if (data) {
      setCourts((prev) => [...prev, toCamelCase(data)]);
    }
  };

  const deleteCourt = async (id: string) => {
    const { error } = await db.courts.delete(id);
    if (error) {
      console.error('Error deleting court:', error);
      return;
    }
    setCourts((prev) => prev.filter((c) => c.id !== id));
  };

  // Case Type operations
  const addCaseType = async (caseTypeName: string) => {
    const { data, error } = await db.caseTypes.create(caseTypeName);
    if (error) {
      console.error('Error adding case type:', error);
      return;
    }
    if (data) {
      setCaseTypes((prev) => [...prev, toCamelCase(data)]);
    }
  };

  const deleteCaseType = async (id: string) => {
    const { error } = await db.caseTypes.delete(id);
    if (error) {
      console.error('Error deleting case type:', error);
      return;
    }
    setCaseTypes((prev) => prev.filter((ct) => ct.id !== id));
  };

  // Library Management - Books
  const addBook = async (name: string): Promise<{ success: boolean; error?: string }> => {
    if (!name || name.trim().length === 0) {
      return { success: false, error: 'Book name cannot be empty' };
    }

    const { data, error } = await db.books.create(name.trim(), user?.id || '');
    if (error) {
      return { success: false, error: error.message };
    }
    if (data) {
      setBooks((prev) => [toCamelCase(data), ...prev]);
    }
    return { success: true };
  };

  const deleteBook = async (id: string) => {
    const { error } = await db.books.delete(id);
    if (error) {
      console.error('Error deleting book:', error);
      return;
    }
    setBooks((prev) => prev.filter((b) => b.id !== id));
  };

  // Library Management - Sofa Items
  const addSofaItem = async (caseId: string, compartment: 'C1' | 'C2'): Promise<{ success: boolean; error?: string }> => {
    const caseExists = cases.find((c) => c.id === caseId);
    if (!caseExists) {
      return { success: false, error: 'Case not found' };
    }

    const alreadyInCompartment = sofaItems.find(
      (item) => item.caseId === caseId && item.compartment === compartment
    );
    if (alreadyInCompartment) {
      return { success: false, error: `Case is already in compartment ${compartment}` };
    }

    const { data, error } = await db.sofaItems.create(caseId, compartment, user?.id || '');
    if (error) {
      return { success: false, error: error.message };
    }
    if (data) {
      setSofaItems((prev) => [toCamelCase(data), ...prev]);
    }
    return { success: true };
  };

  const removeSofaItem = async (id: string) => {
    const { error } = await db.sofaItems.delete(id);
    if (error) {
      console.error('Error removing sofa item:', error);
      return;
    }
    setSofaItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Library Location Management
  const addLibraryLocation = async (name: string): Promise<{ success: boolean; error?: string }> => {
    if (!name || name.trim().length === 0) {
      return { success: false, error: 'Library location name cannot be empty' };
    }

    // Create local location immediately for instant feedback
    const tempLocation = {
      id: `lib-loc-${Date.now()}`,
      name: name.trim(),
      createdBy: user?.id || '',
      createdAt: new Date(),
    };
    setLibraryLocations((prev) => [...prev, tempLocation]);

    // Try to save to database in background
    try {
      const { data, error } = await db.libraryLocations.create(name.trim(), user?.id || '');
      if (error) {
        console.warn('Database error (keeping local location):', error);
        return { success: true }; // Still return success since local state is updated
      }
      if (data) {
        // Replace temp location with database version
        setLibraryLocations((prev) => prev.map(loc => 
          loc.id === tempLocation.id ? toCamelCase(data) : loc
        ));
      }
    } catch (err) {
      console.warn('Database unavailable (keeping local location):', err);
    }
    return { success: true };
  };

  const deleteLibraryLocation = async (id: string) => {
    // Delete from local state immediately
    setLibraryLocations((prev) => prev.filter((loc) => loc.id !== id));
    
    // Try to delete from database in background
    try {
      const { error } = await db.libraryLocations.delete(id);
      if (error) {
        console.warn('Database error (location already removed from UI):', error);
      }
    } catch (err) {
      console.warn('Database unavailable (location already removed from UI):', err);
    }
  };

  // Storage Location Management
  const addStorageLocation = async (name: string): Promise<{ success: boolean; error?: string }> => {
    if (!name || name.trim().length === 0) {
      return { success: false, error: 'Storage location name cannot be empty' };
    }

    // Create local location immediately for instant feedback
    const tempLocation = {
      id: `stor-loc-${Date.now()}`,
      name: name.trim(),
      createdBy: user?.id || '',
      createdAt: new Date(),
    };
    setStorageLocations((prev) => [...prev, tempLocation]);

    // Try to save to database in background
    try {
      const { data, error } = await db.storageLocations.create(name.trim(), user?.id || '');
      if (error) {
        console.warn('Database error (keeping local location):', error);
        return { success: true }; // Still return success since local state is updated
      }
      if (data) {
        // Replace temp location with database version
        setStorageLocations((prev) => prev.map(loc => 
          loc.id === tempLocation.id ? toCamelCase(data) : loc
        ));
      }
    } catch (err) {
      console.warn('Database unavailable (keeping local location):', err);
    }
    return { success: true };
  };

  const deleteStorageLocation = async (id: string) => {
    // Delete from local state immediately
    setStorageLocations((prev) => prev.filter((loc) => loc.id !== id));
    
    // Try to delete from database in background
    try {
      const { error } = await db.storageLocations.delete(id);
      if (error) {
        console.warn('Database error (location already removed from UI):', error);
      }
    } catch (err) {
      console.warn('Database unavailable (location already removed from UI):', err);
    }
  };

  const getDisposedCases = useCallback((): Case[] => {
    return cases.filter((c) => c.status === 'closed');
  }, [cases]);

  // Task Management Operations
  const addTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    console.log('🔵 addTask called with data:', taskData);
    
    // Create temp task for immediate UI feedback
    const tempTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setTasks((prev) => [tempTask, ...prev]);
    console.log('🟢 Task added locally:', tempTask);
    
    // Try to save to database
    try {
      const snakeCaseData = toSnakeCase(taskData);
      const { data, error } = await db.tasks.create(snakeCaseData);
      if (error) {
        console.warn('🟠 Database error (keeping local task):', error);
        return;
      }
      if (data) {
        console.log('🟢 Task saved to database');
        setTasks((prev) => prev.map(t => t.id === tempTask.id ? toCamelCase(data) : t));
      }
    } catch (err) {
      console.warn('🟠 Database unavailable (keeping local task):', err);
    }
  };

  const updateTask = async (id: string, taskData: Partial<Task>) => {
    console.log('🔵 updateTask called for ID:', id);
    
    // Update locally first
    setTasks((prev) => prev.map((t) => {
      if (t.id === id) {
        return { ...t, ...taskData, updatedAt: new Date() };
      }
      return t;
    }));
    
    // Try to update in database
    try {
      const snakeCaseData = toSnakeCase(taskData);
      const { error } = await db.tasks.update(id, snakeCaseData);
      if (error) {
        console.warn('🟠 Database error (keeping local update):', error);
      } else {
        console.log('🟢 Task updated in database');
      }
    } catch (err) {
      console.warn('🟠 Database unavailable (keeping local update):', err);
    }
  };

  const deleteTask = async (id: string) => {
    console.log('🔵 deleteTask called for ID:', id);
    
    // Delete locally first
    setTasks((prev) => prev.filter((t) => t.id !== id));
    
    // Try to delete from database
    try {
      const { error } = await db.tasks.delete(id);
      if (error) {
        console.warn('🟠 Database error (task already removed from UI):', error);
      } else {
        console.log('🟢 Task deleted from database');
      }
    } catch (err) {
      console.warn('🟠 Database unavailable (task already removed from UI):', err);
    }
  };

  const completeTask = async (id: string) => {
    console.log('🔵 completeTask called for ID:', id);
    
    // Update locally first
    setTasks((prev) => prev.map((t) => {
      if (t.id === id) {
        return { 
          ...t, 
          status: 'completed' as const, 
          completedAt: new Date(),
          updatedAt: new Date() 
        };
      }
      return t;
    }));
    
    // Try to update in database
    try {
      const { error } = await db.tasks.complete(id);
      if (error) {
        console.warn('🟠 Database error (keeping local update):', error);
      } else {
        console.log('🟢 Task completed in database');
      }
    } catch (err) {
      console.warn('🟠 Database unavailable (keeping local update):', err);
    }
  };

  const getPendingTasksCount = (userId?: string): number => {
    if (userId) {
      return tasks.filter((t) => t.assignedTo === userId && t.status === 'pending').length;
    }
    return tasks.filter((t) => t.status === 'pending').length;
  };

  // Attendance Management Functions
  const markAttendance = async (userId: string, date: Date, status: AttendanceStatus) => {
    const dateStr = date.toISOString().split('T')[0];
    const existingRecord = attendance.find(
      (a) => a.userId === userId && new Date(a.date).toISOString().split('T')[0] === dateStr
    );

    if (existingRecord) {
      // Update existing record
      const updatedAttendance = attendance.map((a) =>
        a.id === existingRecord.id
          ? { ...a, status, updatedAt: new Date() }
          : a
      );
      setAttendance(updatedAttendance);
    } else {
      // Create new record
      const newAttendance: Attendance = {
        id: Date.now().toString(),
        userId,
        userName: '', // Will be filled from users context
        date,
        status,
        markedBy: user?.id || '',
        markedByName: user?.name || '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setAttendance([...attendance, newAttendance]);
    }
  };

  const getAttendanceByUser = (userId: string, month?: number, year?: number): Attendance[] => {
    let filtered = attendance.filter((a) => a.userId === userId);
    
    if (month !== undefined && year !== undefined) {
      filtered = filtered.filter((a) => {
        const date = new Date(a.date);
        return date.getMonth() === month && date.getFullYear() === year;
      });
    }
    
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const getAttendanceByDate = (date: Date): Attendance[] => {
    const dateStr = date.toISOString().split('T')[0];
    return attendance.filter((a) => new Date(a.date).toISOString().split('T')[0] === dateStr);
  };

  // Expense Management Functions
  const addExpense = async (expenseData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: `expense-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setExpenses((prev) => [newExpense, ...prev]);
  };

  const updateExpense = async (id: string, expenseData: Partial<Expense>) => {
    setExpenses((prev) => prev.map((e) => {
      if (e.id === id) {
        return { ...e, ...expenseData, updatedAt: new Date() };
      }
      return e;
    }));
  };

  const deleteExpense = async (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const getExpensesByMonth = (month: string): Expense[] => {
    return expenses.filter((e) => e.month === month).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  // Transaction update function
  const updateTransaction = async (id: string, transactionData: Partial<Transaction>) => {
    setTransactions((prev) => prev.map((t) => {
      if (t.id === id) {
        return { ...t, ...transactionData };
      }
      return t;
    }));
  };

  const value: DataContextType = {
    cases,
    counsel,
    appointments,
    transactions,
    courts,
    caseTypes,
    books,
    sofaItems,
    libraryLocations,
    storageLocations,
    tasks,
    attendance,
    expenses,
    addCase,
    updateCase,
    deleteCase,
    addCounsel,
    updateCounsel,
    deleteCounsel,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    addTransaction,
    addCourt,
    deleteCourt,
    addCaseType,
    deleteCaseType,
    addBook,
    deleteBook,
    addSofaItem,
    removeSofaItem,
    getDisposedCases,
    addLibraryLocation,
    deleteLibraryLocation,
    addStorageLocation,
    deleteStorageLocation,
    addTask,
    updateTask,
    deleteTask,
    completeTask,
    getPendingTasksCount,
    markAttendance,
    getAttendanceByUser,
    getAttendanceByDate,
    addExpense,
    updateExpense,
    deleteExpense,
    getExpensesByMonth,
    updateTransaction,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
