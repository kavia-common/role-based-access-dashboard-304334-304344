import React, { useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './App.css';

import { AuthProvider, useAuth } from './auth/AuthContext';
import { ProtectedRoute, RoleRoute } from './auth/ProtectedRoute';
import { Navbar } from './components/Navbar';

import HomePage from './pages/Home';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import DashboardRouter from './pages/DashboardRouter';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';

function AppShell() {
  const { isAuthenticated, loading } = useAuth();

  // Keep theme behavior from template.
  const [theme, setTheme] = useState('light');
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    /** Toggle between light and dark theme variables. */
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const themeLabel = useMemo(
    () => `Switch to ${theme === 'light' ? 'dark' : 'light'} mode`,
    [theme]
  );

  return (
    <div className="App">
      <button className="theme-toggle" onClick={toggleTheme} aria-label={themeLabel}>
        {theme === 'light' ? 'Dark' : 'Light'}
      </button>

      <Navbar />

      <div className="app-content">
        {loading ? <p className="muted" style={{ padding: 16 }}>Loading session…</p> : null}

        <Routes>
          <Route path="/" element={<HomePage />} />

          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
          />
          <Route
            path="/register"
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />}
          />

          {/* Protected area */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardRouter />} />
            <Route path="/user" element={<UserDashboard />} />

            <Route element={<RoleRoute allowedRoles={['admin']} />}>
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

// PUBLIC_INTERFACE
function App() {
  /** App entry component: provides auth context + routing. */
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
