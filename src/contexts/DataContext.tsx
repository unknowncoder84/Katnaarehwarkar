import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Case, Counsel, Appointment, Transaction, Court, CaseType, District, Book, SofaItem, StorageItem, Task, Attendance, AttendanceStatus, Expense, DataContextType, LibraryLocation, StorageLocation } from '../types';
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
  // Handle Date objects - convert to ISO string for database
  if (obj instanceof Date) {
    return obj.toISOString().split('T')[0]; // Return YYYY-MM-DD format
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
  const [districts, setDistricts] = useState<District[]>([
    { id: '1', name: 'Mumbai', createdAt: new Date() },
    { id: '2', name: 'Pune', createdAt: new Date() },
    { id: '3', name: 'Nagpur', createdAt: new Date() },
    { id: '4', name: 'Nashik', createdAt: new Date() },
    { id: '5', name: 'Aurangabad', createdAt: new Date() },
  ]);
  const [books, setBooks] = useState<Book[]>([]);
  const [sofaItems, setSofaItems] = useState<SofaItem[]>([]);
  const [storageItems, setStorageItems] = useState<StorageItem[]>([]);
  const [libraryLocations, setLibraryLocations] = useState<LibraryLocation[]>([]);
  const [storageLocations, setStorageLocations] = useState<StorageLocation[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [, setLoading] = useState(true);

  // Fetch all data from Supabase
  const fetchAllData = async () => {
    setLoading(true);
    console.log('🔵 Fetching all data from Supabase database...');
    
    try {
      const [
        casesRes,
        counselRes,
        appointmentsRes,
        transactionsRes,
        courtsRes,
        caseTypesRes,
        districtsRes,
        booksRes,
        sofaItemsRes,
        storageItemsRes,
        libraryLocationsRes,
        storageLocationsRes,
        tasksRes,
        expensesRes,
        attendanceRes,
      ] = await Promise.all([
        db.cases.getAll(),
        db.counsel.getAll(),
        db.appointments.getAll(),
        db.transactions.getAll(),
        db.courts.getAll(),
        db.caseTypes.getAll(),
        db.districts.getAll(),
        db.books.getAll(),
        db.sofaItems.getAll(),
        db.storageItems.getAll(),
        db.libraryLocations.getAll(),
        db.storageLocations.getAll(),
        db.tasks.getAll(),
        db.expenses.getAll(),
        db.attendance.getAll(),
      ]);

      // Log any errors from individual queries
      if (casesRes.error) console.error('❌ Error fetching cases:', casesRes.error);
      if (counselRes.error) console.error('❌ Error fetching counsel:', counselRes.error);
      if (appointmentsRes.error) console.error('❌ Error fetching appointments:', appointmentsRes.error);
      if (transactionsRes.error) console.error('❌ Error fetching transactions:', transactionsRes.error);
      if (courtsRes.error) console.error('❌ Error fetching courts:', courtsRes.error);
      if (caseTypesRes.error) console.error('❌ Error fetching case types:', caseTypesRes.error);
      if (districtsRes.error) console.error('❌ Error fetching districts:', districtsRes.error);
      if (booksRes.error) console.error('❌ Error fetching books:', booksRes.error);
      if (sofaItemsRes.error) console.error('❌ Error fetching sofa items:', sofaItemsRes.error);
      if (storageItemsRes.error) console.error('❌ Error fetching storage items:', storageItemsRes.error);
      if (libraryLocationsRes.error) console.error('❌ Error fetching library locations:', libraryLocationsRes.error);
      if (storageLocationsRes.error) console.error('❌ Error fetching storage locations:', storageLocationsRes.error);
      if (tasksRes.error) console.error('❌ Error fetching tasks:', tasksRes.error);
      if (expensesRes.error) console.error('❌ Error fetching expenses:', expensesRes.error);
      if (attendanceRes.error) console.error('❌ Error fetching attendance:', attendanceRes.error);

      // Update state with fetched data
      if (casesRes.data) {
        setCases(toCamelCase(casesRes.data));
        console.log(`✅ Loaded ${casesRes.data.length} cases from database`);
      }
      if (counselRes.data) {
        setCounsel(toCamelCase(counselRes.data));
        console.log(`✅ Loaded ${counselRes.data.length} counsel from database`);
      }
      if (appointmentsRes.data) {
        setAppointments(toCamelCase(appointmentsRes.data));
        console.log(`✅ Loaded ${appointmentsRes.data.length} appointments from database`);
      }
      if (transactionsRes.data) {
        setTransactions(toCamelCase(transactionsRes.data));
        console.log(`✅ Loaded ${transactionsRes.data.length} transactions from database`);
      }
      // Only update courts and caseTypes if we get data from the database
      if (courtsRes.data && courtsRes.data.length > 0) {
        setCourts(toCamelCase(courtsRes.data));
        console.log(`✅ Loaded ${courtsRes.data.length} courts from database`);
      }
      if (caseTypesRes.data && caseTypesRes.data.length > 0) {
        setCaseTypes(toCamelCase(caseTypesRes.data));
        console.log(`✅ Loaded ${caseTypesRes.data.length} case types from database`);
      }
      if (districtsRes.data && districtsRes.data.length > 0) {
        setDistricts(toCamelCase(districtsRes.data));
        console.log(`✅ Loaded ${districtsRes.data.length} districts from database`);
      }
      if (booksRes.data) {
        setBooks(toCamelCase(booksRes.data));
        console.log(`✅ Loaded ${booksRes.data.length} books from database`);
      }
      if (sofaItemsRes.data) {
        setSofaItems(toCamelCase(sofaItemsRes.data));
        console.log(`✅ Loaded ${sofaItemsRes.data.length} sofa items from database`);
      }
      if (storageItemsRes.data) {
        setStorageItems(toCamelCase(storageItemsRes.data));
        console.log(`✅ Loaded ${storageItemsRes.data.length} storage items from database`);
      }
      if (libraryLocationsRes.data) {
        setLibraryLocations(toCamelCase(libraryLocationsRes.data));
        console.log(`✅ Loaded ${libraryLocationsRes.data.length} library locations from database`);
      }
      if (storageLocationsRes.data) {
        setStorageLocations(toCamelCase(storageLocationsRes.data));
        console.log(`✅ Loaded ${storageLocationsRes.data.length} storage locations from database`);
      }
      if (tasksRes.data) {
        setTasks(toCamelCase(tasksRes.data));
        console.log(`✅ Loaded ${tasksRes.data.length} tasks from database`);
      }
      if (expensesRes.data) {
        setExpenses(toCamelCase(expensesRes.data));
        console.log(`✅ Loaded ${expensesRes.data.length} expenses from database`);
      }
      if (attendanceRes.data) {
        setAttendance(toCamelCase(attendanceRes.data));
        console.log(`✅ Loaded ${attendanceRes.data.length} attendance records from database`);
      }
      
      console.log('✅ All data fetched from database successfully!');
    } catch (error) {
      console.error('❌ Critical error fetching data from database:', error);
      alert('Failed to load data from database. Please check your internet connection and refresh the page.');
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
      console.log('🔵 User logged in, fetching all data from database...');
      fetchAllData();
    } else {
      // Clear data on logout
      console.log('🔵 User logged out, clearing all data...');
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


  // Case operations - DATABASE FIRST approach for persistence
  const addCase = async (caseData: Omit<Case, 'id' | 'createdAt' | 'updatedAt'>) => {
    console.log('🔵 addCase called with data:', caseData);
    
    try {
      const snakeCaseData = toSnakeCase(caseData);
      // NOTE: Don't send created_by to avoid foreign key constraint issues
      // snakeCaseData.created_by = user?.id;
      
      console.log('🔵 Creating case in database...', snakeCaseData);
      const { data, error } = await db.cases.create(snakeCaseData);
      
      if (error) {
        console.error('❌ Database error creating case:', error);
        // Show the actual error message from Supabase
        const errorMsg = error.message || error.details || JSON.stringify(error);
        alert(`Database Error: ${errorMsg}\n\nPlease run the SQL setup in Supabase SQL Editor first.`);
        return;
      }
      
      if (data) {
        console.log('✅ Case created in database successfully:', data);
        setCases((prev) => [toCamelCase(data), ...prev]);
      }
    } catch (err: any) {
      console.error('❌ Error creating case:', err);
      alert(`Error: ${err.message || 'Unknown error'}\n\nPlease check browser console for details.`);
    }
  };

  const updateCase = async (id: string, caseData: Partial<Case>) => {
    console.log('🔵 updateCase called for ID:', id, 'with data:', caseData);
    
    try {
      const snakeCaseData = toSnakeCase(caseData);
      
      console.log('🔵 Updating case in database...');
      const { data, error } = await db.cases.update(id, snakeCaseData);
      
      if (error) {
        console.error('❌ Database error updating case:', error);
        alert('Failed to update case. Please check your connection and try again.');
        return;
      }
      
      if (data) {
        console.log('✅ Case updated in database successfully');
        setCases((prev) => prev.map((c) => (c.id === id ? toCamelCase(data) : c)));
      }
    } catch (err) {
      console.error('❌ Error updating case:', err);
      alert('Failed to update case. Please check your connection and try again.');
    }
  };

  const deleteCase = async (id: string) => {
    console.log('🔵 deleteCase called for ID:', id);
    
    try {
      console.log('🔵 Deleting case from database...');
      const { error } = await db.cases.delete(id);
      
      if (error) {
        console.error('❌ Database error deleting case:', error);
        alert('Failed to delete case. Please check your connection and try again.');
        return;
      }
      
      console.log('✅ Case deleted from database successfully');
      setCases((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error('❌ Error deleting case:', err);
      alert('Failed to delete case. Please check your connection and try again.');
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

  // Appointment operations - DATABASE FIRST approach for persistence
  const addAppointment = async (appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => {
    console.log('🔵 addAppointment called with data:', appointmentData);
    
    try {
      // Format date properly - ensure it's a string in YYYY-MM-DD format
      let dateStr: string;
      if (appointmentData.date instanceof Date) {
        dateStr = appointmentData.date.toISOString().split('T')[0];
      } else if (typeof appointmentData.date === 'string') {
        dateStr = appointmentData.date;
      } else {
        dateStr = new Date().toISOString().split('T')[0];
      }

      // Create the database object with correct column names
      // user field contains the user NAME (not UUID), so we store it in user_name
      // NOTE: We don't send user_id to avoid foreign key constraint issues
      const dbData = {
        date: dateStr,
        time: appointmentData.time || '',
        user_name: appointmentData.user || user?.name || '', // The selected user's name from dropdown
        client: appointmentData.client || '',
        details: appointmentData.details || '',
      };
      
      console.log('🔵 Creating appointment in database...', dbData);
      const { data, error } = await db.appointments.create(dbData);
      
      if (error) {
        console.error('❌ Database error creating appointment:', error);
        const errorMsg = error.message || error.details || JSON.stringify(error);
        alert(`Database Error: ${errorMsg}\n\nPlease run the SQL setup in Supabase SQL Editor first.`);
        return;
      }
      
      if (data) {
        console.log('✅ Appointment created in database successfully:', data);
        setAppointments((prev) => [toCamelCase(data), ...prev]);
      }
    } catch (err: any) {
      console.error('❌ Error creating appointment:', err);
      alert(`Error: ${err.message || 'Unknown error'}\n\nPlease check browser console for details.`);
    }
  };

  const updateAppointment = async (id: string, appointmentData: Partial<Appointment>) => {
    console.log('🔵 updateAppointment called for ID:', id, 'with data:', appointmentData);
    
    try {
      // Build update data with proper field mapping
      const dbData: any = {};
      
      if (appointmentData.date !== undefined) {
        if (appointmentData.date instanceof Date) {
          dbData.date = appointmentData.date.toISOString().split('T')[0];
        } else {
          dbData.date = appointmentData.date;
        }
      }
      if (appointmentData.time !== undefined) dbData.time = appointmentData.time;
      if (appointmentData.user !== undefined) dbData.user_name = appointmentData.user; // Map user to user_name
      if (appointmentData.client !== undefined) dbData.client = appointmentData.client;
      if (appointmentData.details !== undefined) dbData.details = appointmentData.details;
      
      console.log('🔵 Updating appointment in database...', dbData);
      const { data, error } = await db.appointments.update(id, dbData);
      
      if (error) {
        console.error('❌ Database error updating appointment:', error);
        alert('Failed to update appointment. Please check your connection and try again.');
        return;
      }
      
      if (data) {
        console.log('✅ Appointment updated in database successfully');
        setAppointments((prev) => prev.map((a) => (a.id === id ? toCamelCase(data) : a)));
      }
    } catch (err) {
      console.error('❌ Error updating appointment:', err);
      alert('Failed to update appointment. Please check your connection and try again.');
    }
  };

  const deleteAppointment = async (id: string) => {
    console.log('🔵 deleteAppointment called for ID:', id);
    
    try {
      console.log('🔵 Deleting appointment from database...');
      const { error } = await db.appointments.delete(id);
      
      if (error) {
        console.error('❌ Database error deleting appointment:', error);
        alert('Failed to delete appointment. Please check your connection and try again.');
        return;
      }
      
      console.log('✅ Appointment deleted from database successfully');
      setAppointments((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error('❌ Error deleting appointment:', err);
      alert('Failed to delete appointment. Please check your connection and try again.');
    }
  };

  // Transaction operations - DATABASE FIRST approach for persistence
  const addTransaction = async (transactionData: Omit<Transaction, 'id' | 'createdAt'>) => {
    console.log('🔵 addTransaction called with data:', transactionData);
    
    try {
      const snakeCaseData = toSnakeCase(transactionData);
      
      console.log('🔵 Creating transaction in database...');
      const { data, error } = await db.transactions.create(snakeCaseData);
      
      if (error) {
        console.error('❌ Database error creating transaction:', error);
        alert('Failed to create transaction. Please check your connection and try again.');
        return;
      }
      
      if (data) {
        console.log('✅ Transaction created in database successfully:', data);
        setTransactions((prev) => [toCamelCase(data), ...prev]);
      }
    } catch (err) {
      console.error('❌ Error creating transaction:', err);
      alert('Failed to create transaction. Please check your connection and try again.');
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

  // District operations
  const addDistrict = async (districtName: string) => {
    const { data, error } = await db.districts.create(districtName);
    if (error) {
      console.error('Error adding district:', error);
      return;
    }
    if (data) {
      setDistricts((prev) => [...prev, toCamelCase(data)]);
    }
  };

  const deleteDistrict = async (id: string) => {
    const { error } = await db.districts.delete(id);
    if (error) {
      console.error('Error deleting district:', error);
      return;
    }
    setDistricts((prev) => prev.filter((d) => d.id !== id));
  };

  // Library Management - Books
  const addBook = async (name: string, number?: string, location?: string): Promise<{ success: boolean; error?: string }> => {
    if (!name || name.trim().length === 0) {
      return { success: false, error: 'Book name cannot be empty' };
    }

    const { data, error } = await db.books.create(name.trim(), user?.id || '', number || '', location || '');
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

  // Storage Management - Storage Items
  const addStorageItem = async (item: Omit<StorageItem, 'id' | 'addedAt'>): Promise<{ success: boolean; error?: string }> => {
    if (!item.name || item.name.trim().length === 0) {
      return { success: false, error: 'Item name cannot be empty' };
    }
    if (!item.locationId) {
      return { success: false, error: 'Location is required' };
    }

    // Build the data object - include all required fields
    const insertData: any = {
      name: item.name,
      number: item.number || '',
      location: item.location || '', // Location name for display
      location_id: item.locationId,
      type: item.type || 'File',
      added_by: user?.id || '',
    };

    // Only add dropbox fields if they have values (makes them optional)
    if (item.dropboxPath) {
      insertData.dropbox_path = item.dropboxPath;
    }
    if (item.dropboxLink) {
      insertData.dropbox_link = item.dropboxLink;
    }

    console.log('🔵 Creating storage item:', insertData);
    const { data, error } = await db.storageItems.create(insertData);

    if (error) {
      console.error('❌ Error creating storage item:', error);
      return { success: false, error: error.message };
    }
    if (data) {
      console.log('✅ Storage item created:', data);
      setStorageItems((prev) => [toCamelCase(data), ...prev]);
    }
    return { success: true };
  };

  const deleteStorageItem = async (id: string): Promise<{ success: boolean; error?: string }> => {
    const { error } = await db.storageItems.delete(id);
    if (error) {
      console.error('Error deleting storage item:', error);
      return { success: false, error: error.message };
    }
    setStorageItems((prev) => prev.filter((item) => item.id !== id));
    return { success: true };
  };

  // Library Location Management - DATABASE FIRST approach for persistence
  const addLibraryLocation = async (name: string): Promise<{ success: boolean; error?: string }> => {
    if (!name || name.trim().length === 0) {
      return { success: false, error: 'Library location name cannot be empty' };
    }

    try {
      console.log('🔵 Creating library location in database...');
      const { data, error } = await db.libraryLocations.create(name.trim(), user?.id || '');
      
      if (error) {
        console.error('❌ Database error creating library location:', error);
        return { success: false, error: error.message };
      }
      
      if (data) {
        console.log('✅ Library location created in database successfully');
        setLibraryLocations((prev) => [...prev, toCamelCase(data)]);
      }
      return { success: true };
    } catch (err) {
      console.error('❌ Error creating library location:', err);
      return { success: false, error: 'Failed to create library location' };
    }
  };

  const deleteLibraryLocation = async (id: string) => {
    try {
      console.log('🔵 Deleting library location from database...');
      const { error } = await db.libraryLocations.delete(id);
      
      if (error) {
        console.error('❌ Database error deleting library location:', error);
        alert('Failed to delete library location. Please check your connection and try again.');
        return;
      }
      
      console.log('✅ Library location deleted from database successfully');
      setLibraryLocations((prev) => prev.filter((loc) => loc.id !== id));
    } catch (err) {
      console.error('❌ Error deleting library location:', err);
      alert('Failed to delete library location. Please check your connection and try again.');
    }
  };

  // Storage Location Management - DATABASE FIRST approach for persistence
  const addStorageLocation = async (name: string): Promise<{ success: boolean; error?: string }> => {
    if (!name || name.trim().length === 0) {
      return { success: false, error: 'Storage location name cannot be empty' };
    }

    try {
      console.log('🔵 Creating storage location in database...');
      const { data, error } = await db.storageLocations.create(name.trim(), user?.id || '');
      
      if (error) {
        console.error('❌ Database error creating storage location:', error);
        return { success: false, error: error.message };
      }
      
      if (data) {
        console.log('✅ Storage location created in database successfully');
        setStorageLocations((prev) => [...prev, toCamelCase(data)]);
      }
      return { success: true };
    } catch (err) {
      console.error('❌ Error creating storage location:', err);
      return { success: false, error: 'Failed to create storage location' };
    }
  };

  const deleteStorageLocation = async (id: string) => {
    try {
      console.log('🔵 Deleting storage location from database...');
      const { error } = await db.storageLocations.delete(id);
      
      if (error) {
        console.error('❌ Database error deleting storage location:', error);
        alert('Failed to delete storage location. Please check your connection and try again.');
        return;
      }
      
      console.log('✅ Storage location deleted from database successfully');
      setStorageLocations((prev) => prev.filter((loc) => loc.id !== id));
    } catch (err) {
      console.error('❌ Error deleting storage location:', err);
      alert('Failed to delete storage location. Please check your connection and try again.');
    }
  };

  const getDisposedCases = useCallback((): Case[] => {
    return cases.filter((c) => c.status === 'closed');
  }, [cases]);

  // Task Management Operations - DATABASE FIRST approach for persistence
  const addTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    console.log('🔵 addTask called with data:', taskData);
    
    try {
      const snakeCaseData = toSnakeCase(taskData);
      
      console.log('🔵 Creating task in database...');
      const { data, error } = await db.tasks.create(snakeCaseData);
      
      if (error) {
        console.error('❌ Database error creating task:', error);
        alert('Failed to create task. Please check your connection and try again.');
        return;
      }
      
      if (data) {
        console.log('✅ Task created in database successfully:', data);
        setTasks((prev) => [toCamelCase(data), ...prev]);
      }
    } catch (err) {
      console.error('❌ Error creating task:', err);
      alert('Failed to create task. Please check your connection and try again.');
    }
  };

  const updateTask = async (id: string, taskData: Partial<Task>) => {
    console.log('🔵 updateTask called for ID:', id);
    
    try {
      const snakeCaseData = toSnakeCase(taskData);
      
      console.log('🔵 Updating task in database...');
      const { data, error } = await db.tasks.update(id, snakeCaseData);
      
      if (error) {
        console.error('❌ Database error updating task:', error);
        alert('Failed to update task. Please check your connection and try again.');
        return;
      }
      
      if (data) {
        console.log('✅ Task updated in database successfully');
        setTasks((prev) => prev.map((t) => (t.id === id ? toCamelCase(data) : t)));
      }
    } catch (err) {
      console.error('❌ Error updating task:', err);
      alert('Failed to update task. Please check your connection and try again.');
    }
  };

  const deleteTask = async (id: string) => {
    console.log('🔵 deleteTask called for ID:', id);
    
    try {
      console.log('🔵 Deleting task from database...');
      const { error } = await db.tasks.delete(id);
      
      if (error) {
        console.error('❌ Database error deleting task:', error);
        alert('Failed to delete task. Please check your connection and try again.');
        return;
      }
      
      console.log('✅ Task deleted from database successfully');
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error('❌ Error deleting task:', err);
      alert('Failed to delete task. Please check your connection and try again.');
    }
  };

  const completeTask = async (id: string) => {
    console.log('🔵 completeTask called for ID:', id);
    
    try {
      console.log('🔵 Completing task in database...');
      const { data, error } = await db.tasks.complete(id);
      
      if (error) {
        console.error('❌ Database error completing task:', error);
        alert('Failed to complete task. Please check your connection and try again.');
        return;
      }
      
      if (data) {
        console.log('✅ Task completed in database successfully');
        setTasks((prev) => prev.map((t) => (t.id === id ? toCamelCase(data) : t)));
      }
    } catch (err) {
      console.error('❌ Error completing task:', err);
      alert('Failed to complete task. Please check your connection and try again.');
    }
  };

  const getPendingTasksCount = (userId?: string): number => {
    if (userId) {
      return tasks.filter((t) => t.assignedTo === userId && t.status === 'pending').length;
    }
    return tasks.filter((t) => t.status === 'pending').length;
  };

  // Attendance Management Functions - DATABASE FIRST approach
  const markAttendance = async (userId: string, date: Date, status: AttendanceStatus) => {
    console.log('🔵 markAttendance called:', { userId, date, status });
    
    const dateStr = date.toISOString().split('T')[0];
    
    try {
      // Use upsert to handle both insert and update
      const attendanceData = {
        user_id: userId,
        user_name: '', // Will be filled from context if needed
        date: dateStr,
        status,
        marked_by: user?.id || null,
        marked_by_name: user?.name || '',
      };
      
      console.log('🔵 Saving attendance to database...', attendanceData);
      const { data, error } = await db.attendance.upsert(attendanceData);
      
      if (error) {
        console.error('❌ Database error saving attendance:', error);
        // Fallback to local state
        const existingRecord = attendance.find(
          (a) => a.userId === userId && new Date(a.date).toISOString().split('T')[0] === dateStr
        );

        if (existingRecord) {
          const updatedAttendance = attendance.map((a) =>
            a.id === existingRecord.id
              ? { ...a, status, updatedAt: new Date() }
              : a
          );
          setAttendance(updatedAttendance);
        } else {
          const newAttendance: Attendance = {
            id: Date.now().toString(),
            userId,
            userName: '',
            date,
            status,
            markedBy: user?.id || '',
            markedByName: user?.name || '',
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          setAttendance([...attendance, newAttendance]);
        }
        return;
      }
      
      if (data) {
        console.log('✅ Attendance saved to database successfully:', data);
        // Update local state
        const existingIndex = attendance.findIndex(
          (a) => a.userId === userId && new Date(a.date).toISOString().split('T')[0] === dateStr
        );
        
        const newRecord = toCamelCase(data);
        if (existingIndex >= 0) {
          setAttendance(prev => prev.map((a, i) => i === existingIndex ? newRecord : a));
        } else {
          setAttendance(prev => [...prev, newRecord]);
        }
      }
    } catch (err) {
      console.error('❌ Error saving attendance:', err);
      alert('Failed to save attendance. Please check your connection.');
    }
  };

  // Clear attendance (delete record) - Admin only
  const clearAttendance = async (userId: string, date: Date) => {
    console.log('🔵 clearAttendance called:', { userId, date });
    
    const dateStr = date.toISOString().split('T')[0];
    
    try {
      // Delete from database
      const { error } = await supabase
        .from('attendance')
        .delete()
        .eq('user_id', userId)
        .eq('date', dateStr);
      
      if (error) {
        console.error('❌ Database error clearing attendance:', error);
        // Still update local state
      }
      
      // Update local state - remove the attendance record
      setAttendance(prev => prev.filter(
        (a) => !(a.userId === userId && new Date(a.date).toISOString().split('T')[0] === dateStr)
      ));
      
      console.log('✅ Attendance cleared successfully');
    } catch (err) {
      console.error('❌ Error clearing attendance:', err);
      alert('Failed to clear attendance. Please check your connection.');
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

  // Expense Management Functions - DATABASE FIRST approach for persistence
  const addExpense = async (expenseData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => {
    console.log('🔵 addExpense called with data:', expenseData);
    
    try {
      const snakeCaseData = toSnakeCase(expenseData);
      
      console.log('🔵 Creating expense in database...');
      const { data, error } = await db.expenses.create(snakeCaseData);
      
      if (error) {
        console.error('❌ Database error creating expense:', error);
        alert('Failed to create expense. Please check your connection and try again.');
        return;
      }
      
      if (data) {
        console.log('✅ Expense created in database successfully:', data);
        setExpenses((prev) => [toCamelCase(data), ...prev]);
      }
    } catch (err) {
      console.error('❌ Error creating expense:', err);
      alert('Failed to create expense. Please check your connection and try again.');
    }
  };

  const updateExpense = async (id: string, expenseData: Partial<Expense>) => {
    console.log('🔵 updateExpense called for ID:', id);
    
    try {
      const snakeCaseData = toSnakeCase(expenseData);
      
      console.log('🔵 Updating expense in database...');
      const { data, error } = await db.expenses.update(id, snakeCaseData);
      
      if (error) {
        console.error('❌ Database error updating expense:', error);
        alert('Failed to update expense. Please check your connection and try again.');
        return;
      }
      
      if (data) {
        console.log('✅ Expense updated in database successfully');
        setExpenses((prev) => prev.map((e) => (e.id === id ? toCamelCase(data) : e)));
      }
    } catch (err) {
      console.error('❌ Error updating expense:', err);
      alert('Failed to update expense. Please check your connection and try again.');
    }
  };

  const deleteExpense = async (id: string) => {
    console.log('🔵 deleteExpense called for ID:', id);
    
    try {
      console.log('🔵 Deleting expense from database...');
      const { error } = await db.expenses.delete(id);
      
      if (error) {
        console.error('❌ Database error deleting expense:', error);
        alert('Failed to delete expense. Please check your connection and try again.');
        return;
      }
      
      console.log('✅ Expense deleted from database successfully');
      setExpenses((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.error('❌ Error deleting expense:', err);
      alert('Failed to delete expense. Please check your connection and try again.');
    }
  };

  const getExpensesByMonth = (month: string): Expense[] => {
    return expenses.filter((e) => e.month === month).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  // Transaction update function - DATABASE FIRST approach for persistence
  const updateTransaction = async (id: string, transactionData: Partial<Transaction>) => {
    console.log('🔵 updateTransaction called for ID:', id);
    
    try {
      const snakeCaseData = toSnakeCase(transactionData);
      
      console.log('🔵 Updating transaction in database...');
      const { data, error } = await db.transactions.update(id, snakeCaseData);
      
      if (error) {
        console.error('❌ Database error updating transaction:', error);
        alert('Failed to update transaction. Please check your connection and try again.');
        return;
      }
      
      if (data) {
        console.log('✅ Transaction updated in database successfully');
        setTransactions((prev) => prev.map((t) => (t.id === id ? toCamelCase(data) : t)));
      }
    } catch (err) {
      console.error('❌ Error updating transaction:', err);
      alert('Failed to update transaction. Please check your connection and try again.');
    }
  };

  const value: DataContextType = {
    cases,
    counsel,
    appointments,
    transactions,
    courts,
    caseTypes,
    districts,
    books,
    sofaItems,
    storageItems,
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
    addDistrict,
    deleteDistrict,
    addBook,
    deleteBook,
    addSofaItem,
    removeSofaItem,
    addStorageItem,
    deleteStorageItem,
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
    clearAttendance,
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
