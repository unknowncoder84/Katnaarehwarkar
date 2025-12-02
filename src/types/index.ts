// User Types
export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  isActive: boolean;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

// Case Types
export interface Case {
  id: string;
  clientName: string;
  clientEmail: string;
  clientMobile: string;
  clientAlternateNo?: string;
  fileNo: string;
  stampNo: string;
  regNo: string;
  partiesName: string;
  district: string;
  caseType: string;
  court: string;
  onBehalfOf: string;
  noResp: string;
  opponentLawyer: string;
  additionalDetails: string;
  feesQuoted: number;
  status: 'pending' | 'active' | 'closed' | 'on-hold';
  nextDate: Date;
  filingDate: Date;
  circulationStatus: 'circulated' | 'non-circulated';
  interimRelief: 'favor' | 'against' | 'none';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Counsel Types
export interface Counsel {
  id: string;
  name: string;
  email: string;
  mobile: string;
  address: string;
  details: string;
  totalCases: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Appointment Types
export interface Appointment {
  id: string;
  date: Date;
  time: string;
  user: string;
  client: string;
  details: string;
  createdAt: Date;
  updatedAt: Date;
}

// Transaction Types
export interface Transaction {
  id: string;
  amount: number;
  status: 'received' | 'pending';
  receivedBy: string;
  confirmedBy: string;
  caseId: string;
  createdAt: Date;
}

// Court Types
export interface Court {
  id: string;
  name: string;
  createdAt: Date;
}

// CaseType Types
export interface CaseType {
  id: string;
  name: string;
  createdAt: Date;
}

// Library Management Types
export interface Book {
  id: string;
  name: string;
  location: 'L1';
  addedAt: Date;
  addedBy: string;
}

export interface SofaItem {
  id: string;
  caseId: string;
  compartment: 'C1' | 'C2';
  addedAt: Date;
  addedBy: string;
}

// Auth Context Types
export interface AuthContextType {
  user: User | null;
  users: User[];
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void | Promise<void>;
  createUser: (userData: CreateUserData) => Promise<{ success: boolean; error?: string }>;
  updateUserRole: (userId: string, role: UserRole) => Promise<{ success: boolean; error?: string }>;
  toggleUserStatus: (userId: string) => Promise<{ success: boolean; error?: string }>;
  deleteUser: (userId: string) => Promise<{ success: boolean; error?: string }>;
  loading: boolean;
  error: string | null;
}

// Theme Context Types
export type Theme = 'light' | 'dark';

export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

// Data Context Types
export interface DataContextType {
  cases: Case[];
  counsel: Counsel[];
  appointments: Appointment[];
  transactions: Transaction[];
  courts: Court[];
  caseTypes: CaseType[];
  books: Book[];
  sofaItems: SofaItem[];
  addCase: (caseData: Omit<Case, 'id' | 'createdAt' | 'updatedAt'>) => void | Promise<void>;
  updateCase: (id: string, caseData: Partial<Case>) => void | Promise<void>;
  deleteCase: (id: string) => void | Promise<void>;
  addCounsel: (counselData: Omit<Counsel, 'id' | 'createdAt' | 'updatedAt'>) => void | Promise<void>;
  updateCounsel: (id: string, counselData: Partial<Counsel>) => void | Promise<void>;
  deleteCounsel: (id: string) => void | Promise<void>;
  addAppointment: (appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => void | Promise<void>;
  updateAppointment: (id: string, appointmentData: Partial<Appointment>) => void | Promise<void>;
  deleteAppointment: (id: string) => void | Promise<void>;
  addTransaction: (transactionData: Omit<Transaction, 'id' | 'createdAt'>) => void | Promise<void>;
  addCourt: (courtName: string) => void | Promise<void>;
  deleteCourt: (id: string) => void | Promise<void>;
  addCaseType: (caseTypeName: string) => void | Promise<void>;
  deleteCaseType: (id: string) => void | Promise<void>;
  // Library Management
  addBook: (name: string) => { success: boolean; error?: string } | Promise<{ success: boolean; error?: string }>;
  deleteBook: (id: string) => void | Promise<void>;
  addSofaItem: (caseId: string, compartment: 'C1' | 'C2') => { success: boolean; error?: string } | Promise<{ success: boolean; error?: string }>;
  removeSofaItem: (id: string) => void | Promise<void>;
  getDisposedCases: () => Case[];
}
