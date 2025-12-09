import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { DataProvider } from './contexts/DataContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CasesPage from './pages/CasesPage';
import CreateCasePage from './pages/CreateCasePage';
import EditCasePage from './pages/EditCasePage';
import CaseDetailsPage from './pages/CaseDetailsPage';
import TasksPage from './pages/TasksPage';
import AttendancePage from './pages/AttendancePage';
import ExpensesPage from './pages/ExpensesPage';
import ClientsPage from './pages/ClientsPage';
import CounselPage from './pages/CounselPage';
import CreateCounsellorPage from './pages/CreateCounsellorPage';
import CounselCasesPage from './pages/CounselCasesPage';
import AppointmentsPage from './pages/AppointmentsPage';
import FinancePage from './pages/FinancePage';
import SettingsPage from './pages/SettingsPage';
import AdminPage from './pages/AdminPage';
import DateEventsPage from './pages/DateEventsPage';
import LibraryPage from './pages/LibraryPage';
import StoragePage from './pages/StoragePage';

import './index.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cases"
                element={
                  <ProtectedRoute>
                    <CasesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cases/create"
                element={
                  <ProtectedRoute>
                    <CreateCasePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cases/:id/edit"
                element={
                  <AdminRoute>
                    <EditCasePage />
                  </AdminRoute>
                }
              />
              <Route
                path="/cases/:id"
                element={
                  <ProtectedRoute>
                    <CaseDetailsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tasks"
                element={
                  <ProtectedRoute>
                    <TasksPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/attendance"
                element={
                  <ProtectedRoute>
                    <AttendancePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/expenses"
                element={
                  <ProtectedRoute>
                    <ExpensesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/clients"
                element={
                  <ProtectedRoute>
                    <ClientsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/counsel"
                element={
                  <ProtectedRoute>
                    <CounselPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/counsel/create"
                element={
                  <ProtectedRoute>
                    <CreateCounsellorPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/counsel/cases"
                element={
                  <ProtectedRoute>
                    <CounselCasesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/appointments"
                element={
                  <ProtectedRoute>
                    <AppointmentsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/finance"
                element={
                  <ProtectedRoute>
                    <FinancePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminPage />
                  </AdminRoute>
                }
              />
              <Route
                path="/events/:date"
                element={
                  <ProtectedRoute>
                    <DateEventsPage />
                  </ProtectedRoute>
                }
              />
              {/* Library and Storage Routes */}
              <Route
                path="/library"
                element={
                  <ProtectedRoute>
                    <LibraryPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/storage"
                element={
                  <ProtectedRoute>
                    <StoragePage />
                  </ProtectedRoute>
                }
              />

              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Router>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
