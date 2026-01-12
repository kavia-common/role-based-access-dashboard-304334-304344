import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

// PUBLIC_INTERFACE
export function ProtectedRoute() {
  /** Require authenticated session; redirect to login. */
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

// PUBLIC_INTERFACE
export function RoleRoute({ allowedRoles }) {
  /** Require role(s); redirect to appropriate dashboard or login. */
  const { isAuthenticated, role, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!role || !allowedRoles?.includes(role)) {
    // If logged in but wrong role, send to generic dashboard which redirects by role.
    return <Navigate to="/dashboard" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
