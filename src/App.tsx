import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { useAuth } from './contexts/AuthContext';

import Layout from './components/Layout/Layout';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Projects from './pages/Projects';
import Meetings from './pages/Meetings';
import Components from './pages/Components';
import Themes from './pages/Themes';
import Settings from './pages/Settings';
import Requirements from './pages/Requirements';
import AgileBoard from './pages/AgileBoard';
import TeamManagement from './pages/TeamManagement';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? <>{children}</> : <Navigate to="/auth" />;
};

const AppRoutes: React.FC = () => {
  const { currentUser } = useAuth();

  if (currentUser === null) {
    return <Auth />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/clients" 
          element={
            <ProtectedRoute>
              <Clients />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/projects" 
          element={
            <ProtectedRoute>
              <Projects />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/agile/:projectId" 
          element={
            <ProtectedRoute>
              <AgileBoard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/agile" 
          element={
            <ProtectedRoute>
              <AgileBoard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/teams" 
          element={
            <ProtectedRoute>
              <TeamManagement />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/meetings" 
          element={
            <ProtectedRoute>
              <Meetings />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/components" 
          element={
            <ProtectedRoute>
              <Components />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/themes" 
          element={
            <ProtectedRoute>
              <Themes />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/requirements" 
          element={
            <ProtectedRoute>
              <Requirements />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } 
        />
        <Route path="/auth" element={<Auth />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
            <AppRoutes />
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="colored"
            />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;