// User Types
export type UserRole = 'admin' | 'user' | 'vipin';

export interface User {
  id: string;
  name: string;
  email: string;
  username?: string;
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
  username: string;
  password: string;
  role: UserRole;
}

// Case Types
export type CaseStage = 
  | 'consultation'
  | 'drafting'
  | 'filing'
  | 'circulation'
  | 'notice'
  | 'pre-admission'
  | 'admitted'
  | 'final-hearing'
  | 'reserved'
  | 'disposed';

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
  stage: CaseStage;
  nextDate: Date | string;
  filingDate: Date | string;
  circulationStatus: string;
  circulationDate?: Date | string;
  interimRelief: string;
  interimDate?: Date | string;
  grantedDate?: Date | string;
  assignedTo?: string;
  assignedToName?: string;
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
  user: string; // For frontend form compatibility
  userName?: string; // From database (user_name column)
  userId?: string; // From database (user_id column)
  client: string;
  details: string;
  createdAt: Date;
  updatedAt: Date;
}

// Transaction Types
export type PaymentMode = 'upi' | 'cash' | 'check' | 'bank-transfer' | 'card' | 'other';

export interface Transaction {
  id: string;
  amount: number;
  status: 'received' | 'pending';
  paymentMode: PaymentMode;
  receivedBy: string;
  confirmedBy: string;
  caseId: string;
  createdAt: Date;
}

// Expense Types
export interface Expense {
  id: string;
  amount: number;
  description: string;
  addedBy: string; // User ID
  addedByName: string; // User name for display
  month: string; // Format: "YYYY-MM"
  createdAt: Date;
  updatedAt: Date;
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

// District Types
export interface District {
  id: string;
  name: string;
  createdAt: Date;
}

// Library and Storage Location Types
export interface LibraryLocation {
  id: string;
  name: string;
  createdBy: string;
  createdAt: Date;
}

export interface StorageLocation {
  id: string;
  name: string;
  createdBy: string;
  createdAt: Date;
}

// Library Management Types
export interface Book {
  id: string;
  name: string;
  number: string; // Reference number entered by user
  location: string; // Now references LibraryLocation name
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

// Storage Management Types
export interface StorageItem {
  id: string;
  name: string;
  number: string;
  location: string; // Location name for display
  locationId: string; // References StorageLocation id
  type: 'File' | 'Document' | 'Box';
  addedAt: Date;
  addedBy: string;
  dropboxPath?: string;
  dropboxLink?: string;
}

// Task Management Types
export type TaskType = 'case' | 'custom';
export type TaskStatus = 'pending' | 'completed';

export interface Task {
  id: string;
  type: TaskType;
  title: string;
  description: string;
  assignedTo: string; // User ID
  assignedToName: string; // User name for display
  assignedBy: string; // User ID
  assignedByName: string; // User name for display
  caseId?: string; // Only for case tasks
  caseName?: string; // Case client name for display
  deadline: Date | string;
  status: TaskStatus;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Attendance Management Types
export type AttendanceStatus = 'present' | 'absent';

export interface Attendance {
  id: string;
  userId: string;
  userName: string;
  date: Date;
  status: AttendanceStatus;
  markedBy: string; // Admin user ID
  markedByName: string; // Admin name for display
  createdAt: Date;
  updatedAt: Date;
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
  districts: District[];
  books: Book[];
  sofaItems: SofaItem[];
  storageItems: StorageItem[];
  libraryLocations: LibraryLocation[];
  storageLocations: StorageLocation[];
  tasks: Task[];
  attendance: Attendance[];
  expenses: Expense[];
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
  // District Management
  addDistrict: (districtName: string) => void | Promise<void>;
  deleteDistrict: (id: string) => void | Promise<void>;
  // Library Management
  addBook: (name: string, number?: string, location?: string) => { success: boolean; error?: string } | Promise<{ success: boolean; error?: string }>;
  deleteBook: (id: string) => void | Promise<void>;
  addSofaItem: (caseId: string, compartment: 'C1' | 'C2') => { success: boolean; error?: string } | Promise<{ success: boolean; error?: string }>;
  removeSofaItem: (id: string) => void | Promise<void>;
  // Storage Management
  addStorageItem: (item: Omit<StorageItem, 'id' | 'addedAt'>) => { success: boolean; error?: string } | Promise<{ success: boolean; error?: string }>;
  deleteStorageItem: (id: string) => { success: boolean; error?: string } | Promise<{ success: boolean; error?: string }>;
  getDisposedCases: () => Case[];
  // Library and Storage Location Management
  addLibraryLocation: (name: string) => Promise<{ success: boolean; error?: string }>;
  deleteLibraryLocation: (id: string) => Promise<void>;
  addStorageLocation: (name: string) => Promise<{ success: boolean; error?: string }>;
  deleteStorageLocation: (id: string) => Promise<void>;
  // Task Management
  addTask: (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void | Promise<void>;
  updateTask: (id: string, taskData: Partial<Task>) => void | Promise<void>;
  deleteTask: (id: string) => void | Promise<void>;
  completeTask: (id: string) => void | Promise<void>;
  getPendingTasksCount: (userId?: string) => number;
  // Attendance Management
  markAttendance: (userId: string, date: Date, status: AttendanceStatus) => void | Promise<void>;
  clearAttendance: (userId: string, date: Date) => void | Promise<void>;
  getAttendanceByUser: (userId: string, month?: number, year?: number) => Attendance[];
  getAttendanceByDate: (date: Date) => Attendance[];
  // Expense Management
  addExpense: (expenseData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => void | Promise<void>;
  updateExpense: (id: string, expenseData: Partial<Expense>) => void | Promise<void>;
  deleteExpense: (id: string) => void | Promise<void>;
  getExpensesByMonth: (month: string) => Expense[];
  updateTransaction: (id: string, transactionData: Partial<Transaction>) => void | Promise<void>;
}
