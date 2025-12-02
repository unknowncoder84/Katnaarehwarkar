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
import CaseDetailsPage from './pages/CaseDetailsPage';
import ClientsPage from './pages/ClientsPage';
import CounselPage from './pages/CounselPage';
import CreateCounsellorPage from './pages/CreateCounsellorPage';
import CounselCasesPage from './pages/CounselCasesPage';
import CreateCounselCasePage from './pages/CreateCounselCasePage';
import AppointmentsPage from './pages/AppointmentsPage';
import FinancePage from './pages/FinancePage';
import SettingsPage from './pages/SettingsPage';
import AdminPage from './pages/AdminPage';
import DateEventsPage from './pages/DateEventsPage';
import LibraryBooksPage from './pages/LibraryBooksPage';
import SofaPage from './pages/SofaPage';
import DisposePage from './pages/DisposePage';
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
                path="/cases/:id"
                element={
                  <ProtectedRoute>
                    <CaseDetailsPage />
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
                path="/counsel/cases/create"
                element={
                  <ProtectedRoute>
                    <CreateCounselCasePage />
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
              {/* Library Management Routes */}
              <Route
                path="/library/books"
                element={
                  <ProtectedRoute>
                    <LibraryBooksPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/library/sofa"
                element={
                  <ProtectedRoute>
                    <SofaPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/library/dispose"
                element={
                  <ProtectedRoute>
                    <DisposePage />
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
