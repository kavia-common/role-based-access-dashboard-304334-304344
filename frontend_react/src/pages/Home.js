import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

// PUBLIC_INTERFACE
export default function HomePage() {
  /** Landing page. */
  const { isAuthenticated, role } = useAuth();

  return (
    <main className="page">
      <div className="card">
        <h1 className="title">Role-Based Access Dashboard</h1>
        <p className="muted">
          This app demonstrates authentication + role-based access control with separate dashboards
          for admins and users.
        </p>

        <div className="row">
          {!isAuthenticated ? (
            <>
              <Link className="btn btn-primary" to="/login">
                Login
              </Link>
              <Link className="btn" to="/register">
                Register
              </Link>
            </>
          ) : (
            <>
              <Link className="btn btn-primary" to="/dashboard">
                Go to dashboard
              </Link>
              <span className="chip" style={{ marginLeft: 12 }}>
                role: {role || 'user'}
              </span>
            </>
          )}
        </div>

        <p className="muted" style={{ marginTop: 16 }}>
          Backend base URL can be configured via <code>REACT_APP_API_BASE_URL</code> (defaults to
          <code> http://localhost:3001</code>).
        </p>
      </div>
    </main>
  );
}
