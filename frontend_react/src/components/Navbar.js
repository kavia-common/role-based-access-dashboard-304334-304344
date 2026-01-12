import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

function navClassName({ isActive }) {
  return `nav-link${isActive ? ' nav-link-active' : ''}`;
}

// PUBLIC_INTERFACE
export function Navbar() {
  /** Top navigation with role-aware links and auth actions. */
  const { isAuthenticated, role, user, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="navbar" role="banner">
      <div className="navbar-inner">
        <Link to="/" className="brand">
          RBAC Dashboard
        </Link>

        <nav className="nav" aria-label="Primary">
          {!isAuthenticated ? (
            <>
              <NavLink to="/login" className={navClassName}>
                Login
              </NavLink>
              <NavLink to="/register" className={navClassName}>
                Register
              </NavLink>
            </>
          ) : (
            <>
              <NavLink to="/dashboard" className={navClassName}>
                Dashboard
              </NavLink>

              {role === 'admin' ? (
                <NavLink to="/admin" className={navClassName}>
                  Admin
                </NavLink>
              ) : null}

              <button type="button" className="btn btn-small" onClick={onLogout}>
                Logout
              </button>
            </>
          )}
        </nav>

        <div className="nav-meta" aria-label="Session info">
          {isAuthenticated ? (
            <span className="chip" title={user?.email || ''}>
              {role || 'user'}
            </span>
          ) : (
            <span className="chip chip-muted">guest</span>
          )}
        </div>
      </div>
    </header>
  );
}
