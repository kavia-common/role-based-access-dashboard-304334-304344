import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

// PUBLIC_INTERFACE
export default function DashboardRouter() {
  /** Redirects authenticated users to the correct dashboard based on their role. */
  const { role } = useAuth();
  if (role === 'admin') return <Navigate to="/admin" replace />;
  return <Navigate to="/user" replace />;
}
