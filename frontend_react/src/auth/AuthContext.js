import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiClient } from '../api/client';

const STORAGE_KEY = 'rbac_auth_v1';

function safeParse(json) {
  try {
    return JSON.parse(json);
  } catch (_) {
    return null;
  }
}

function loadStoredAuth() {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  const parsed = raw ? safeParse(raw) : null;
  if (!parsed || typeof parsed !== 'object') return { token: null, user: null };
  return {
    token: typeof parsed.token === 'string' ? parsed.token : null,
    user: parsed.user && typeof parsed.user === 'object' ? parsed.user : null,
  };
}

function storeAuth({ token, user }) {
  if (!token || !user) {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user }));
}

const AuthContext = createContext(null);

// PUBLIC_INTERFACE
export function AuthProvider({ children }) {
  /** Auth state */
  const [token, setToken] = useState(() => loadStoredAuth().token);
  const [user, setUser] = useState(() => loadStoredAuth().user);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isAuthenticated = Boolean(token && user);
  const role = user?.role || user?.Role || user?.roles?.[0] || null;

  /**
   * Hydrate user on load if token exists.
   * If token is invalid/expired, clear storage.
   */
  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      setLoading(true);
      setError(null);

      if (!token) {
        if (!cancelled) setLoading(false);
        return;
      }

      try {
        const data = await apiClient.me(token);
        // backend might return {user} or user directly
        const nextUser = data?.user || data;
        if (!nextUser) throw new Error('Malformed /me response');

        if (!cancelled) {
          setUser(nextUser);
          storeAuth({ token, user: nextUser });
        }
      } catch (e) {
        if (!cancelled) {
          setToken(null);
          setUser(null);
          storeAuth({ token: null, user: null });
          setError(e?.message || 'Session expired. Please login again.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    hydrate();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const login = useCallback(async ({ email, password }) => {
    setError(null);
    const data = await apiClient.login({ email, password });
    const nextToken = data?.token || data?.accessToken;
    const nextUser = data?.user;
    if (!nextToken || !nextUser) {
      throw new Error('Malformed login response.');
    }
    setToken(nextToken);
    setUser(nextUser);
    storeAuth({ token: nextToken, user: nextUser });
    return { token: nextToken, user: nextUser };
  }, []);

  const register = useCallback(async ({ email, password }) => {
    setError(null);
    // backend might return created user or success message
    return apiClient.register({ email, password });
  }, []);

  const logout = useCallback(async () => {
    setError(null);
    try {
      if (token) await apiClient.logout(token);
    } catch (_) {
      // Ignore logout failures; clear local state regardless.
    } finally {
      setToken(null);
      setUser(null);
      storeAuth({ token: null, user: null });
    }
  }, [token]);

  const value = useMemo(
    () => ({
      token,
      user,
      role,
      isAuthenticated,
      loading,
      error,
      setError,
      login,
      register,
      logout,
    }),
    [token, user, role, isAuthenticated, loading, error, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// PUBLIC_INTERFACE
export function useAuth() {
  /** Access auth state and actions. */
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
