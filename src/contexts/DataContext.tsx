import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Case, Counsel, Appointment, Transaction, Court, CaseType, Book, SofaItem, DataContextType } from '../types';
import { db } from '../lib/supabase';
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
  const [courts, setCourts] = useState<Court[]>([]);
  const [caseTypes, setCaseTypes] = useState<CaseType[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [sofaItems, setSofaItems] = useState<SofaItem[]>([]);
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
      ] = await Promise.all([
        db.cases.getAll(),
        db.counsel.getAll(),
        db.appointments.getAll(),
        db.transactions.getAll(),
        db.courts.getAll(),
        db.caseTypes.getAll(),
        db.books.getAll(),
        db.sofaItems.getAll(),
      ]);

      if (casesRes.data) setCases(toCamelCase(casesRes.data));
      if (counselRes.data) setCounsel(toCamelCase(counselRes.data));
      if (appointmentsRes.data) setAppointments(toCamelCase(appointmentsRes.data));
      if (transactionsRes.data) setTransactions(toCamelCase(transactionsRes.data));
      if (courtsRes.data) setCourts(toCamelCase(courtsRes.data));
      if (caseTypesRes.data) setCaseTypes(toCamelCase(caseTypesRes.data));
      if (booksRes.data) setBooks(toCamelCase(booksRes.data));
      if (sofaItemsRes.data) setSofaItems(toCamelCase(sofaItemsRes.data));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when user logs in
  useEffect(() => {
    if (user) {
      fetchAllData();
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
    }
  }, [user]);


  // Case operations
  const addCase = async (caseData: Omit<Case, 'id' | 'createdAt' | 'updatedAt'>) => {
    const snakeCaseData = toSnakeCase(caseData);
    snakeCaseData.created_by = user?.id;
    
    const { data, error } = await db.cases.create(snakeCaseData);
    if (error) {
      console.error('Error adding case:', error);
      return;
    }
    if (data) {
      setCases((prev) => [toCamelCase(data), ...prev]);
    }
  };

  const updateCase = async (id: string, caseData: Partial<Case>) => {
    const snakeCaseData = toSnakeCase(caseData);
    const { data, error } = await db.cases.update(id, snakeCaseData);
    if (error) {
      console.error('Error updating case:', error);
      return;
    }
    if (data) {
      setCases((prev) => prev.map((c) => (c.id === id ? toCamelCase(data) : c)));
    }
  };

  const deleteCase = async (id: string) => {
    const { error } = await db.cases.delete(id);
    if (error) {
      console.error('Error deleting case:', error);
      return;
    }
    setCases((prev) => prev.filter((c) => c.id !== id));
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
    const snakeCaseData = toSnakeCase(appointmentData);
    snakeCaseData.user_id = user?.id;
    snakeCaseData.user_name = user?.name;
    
    const { data, error } = await db.appointments.create(snakeCaseData);
    if (error) {
      console.error('Error adding appointment:', error);
      return;
    }
    if (data) {
      setAppointments((prev) => [toCamelCase(data), ...prev]);
    }
  };

  const updateAppointment = async (id: string, appointmentData: Partial<Appointment>) => {
    const snakeCaseData = toSnakeCase(appointmentData);
    const { data, error } = await db.appointments.update(id, snakeCaseData);
    if (error) {
      console.error('Error updating appointment:', error);
      return;
    }
    if (data) {
      setAppointments((prev) => prev.map((a) => (a.id === id ? toCamelCase(data) : a)));
    }
  };

  const deleteAppointment = async (id: string) => {
    const { error } = await db.appointments.delete(id);
    if (error) {
      console.error('Error deleting appointment:', error);
      return;
    }
    setAppointments((prev) => prev.filter((a) => a.id !== id));
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

  const getDisposedCases = useCallback((): Case[] => {
    return cases.filter((c) => c.status === 'closed');
  }, [cases]);

  const value: DataContextType = {
    cases,
    counsel,
    appointments,
    transactions,
    courts,
    caseTypes,
    books,
    sofaItems,
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
