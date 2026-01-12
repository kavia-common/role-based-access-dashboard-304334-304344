import React, { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { apiClient } from '../api/client';

// PUBLIC_INTERFACE
export default function AdminDashboard() {
  /** Admin-only dashboard. */
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setErr(null);
      try {
        const res = await apiClient.adminDashboard(token);
        if (!cancelled) setData(res);
      } catch (e) {
        if (!cancelled) setErr(e?.message || 'Failed to load admin dashboard.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <main className="page">
      <div className="card">
        <h1 className="title">Admin Dashboard</h1>
        <p className="muted">Admin-only data from <code>/api/dashboard/admin</code>.</p>

        {loading ? <p className="muted">Loading…</p> : null}
        {err ? (
          <div className="alert alert-error" role="alert">
            {err}
          </div>
        ) : null}

        {data ? (
          <pre className="codeblock" aria-label="Admin dashboard payload">
            {JSON.stringify(data, null, 2)}
          </pre>
        ) : null}
      </div>
    </main>
  );
}
