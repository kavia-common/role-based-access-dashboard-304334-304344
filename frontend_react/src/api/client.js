const DEFAULT_API_BASE_URL = 'http://localhost:3001';

/**
 * Resolve API base URL.
 * CRA env vars must start with REACT_APP_.
 */
function getApiBaseUrl() {
  return (process.env.REACT_APP_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/+$/, '');
}

/**
 * Normalize fetch errors (network + non-2xx responses).
 */
async function toApiError(response) {
  let details = null;
  try {
    details = await response.json();
  } catch (_) {
    // ignore body parse failures
  }
  const message =
    (details && (details.message || details.error)) ||
    `Request failed with status ${response.status}`;
  const err = new Error(message);
  err.status = response.status;
  err.details = details;
  return err;
}

/**
 * Attach Authorization header when token exists.
 */
function withAuthHeaders(headers = {}, token) {
  if (!token) return headers;
  return { ...headers, Authorization: `Bearer ${token}` };
}

/**
 * Generic request helper.
 */
async function request(path, { method = 'GET', token = null, body = null } = {}) {
  const url = `${getApiBaseUrl()}${path.startsWith('/') ? '' : '/'}${path}`;
  const headers = withAuthHeaders(
    {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    token
  );

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    throw await toApiError(res);
  }

  // Some endpoints may return no JSON
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) return null;
  return res.json();
}

// PUBLIC_INTERFACE
export const apiClient = {
  /** Register a new user. Expected backend: POST /api/auth/register {email,password}. */
  register: (payload) => request('/api/auth/register', { method: 'POST', body: payload }),

  /** Login. Expected backend: POST /api/auth/login {email,password} -> {token, user}. */
  login: (payload) => request('/api/auth/login', { method: 'POST', body: payload }),

  /** Logout. Expected backend: POST /api/auth/logout (token required in this frontend). */
  logout: (token) => request('/api/auth/logout', { method: 'POST', token }),

  /** Current user info. Expected backend: GET /api/auth/me -> {user}. */
  me: (token) => request('/api/auth/me', { method: 'GET', token }),

  /** User dashboard. Expected backend: GET /api/dashboard/user */
  userDashboard: (token) => request('/api/dashboard/user', { method: 'GET', token }),

  /** Admin dashboard. Expected backend: GET /api/dashboard/admin */
  adminDashboard: (token) => request('/api/dashboard/admin', { method: 'GET', token }),
};
