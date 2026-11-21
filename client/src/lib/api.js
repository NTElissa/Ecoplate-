const configuredBase = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
const BASE = configuredBase.endsWith('/api') ? configuredBase : `${configuredBase}/api`;
export const LOGIN_PATH = (import.meta.env.VITE_ADMIN_LOGIN_PATH || '').replace(/^\/+|\/+$/g, '');
const TOKEN_KEY = 'ecoplate_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => (t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY));

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function request(path, { method = 'GET', body, auth = false, raw = false } = {}) {
  const headers = {};
  const isForm = body instanceof FormData;
  if (body && !isForm) headers['Content-Type'] = 'application/json';
  if (auth && getToken()) headers.Authorization = `Bearer ${getToken()}`;

  let res;
  try {
    res = await fetch(BASE + path, { method, headers, body: body ? (isForm ? body : JSON.stringify(body)) : undefined });
  } catch {
    throw new ApiError('Cannot reach the server. Check your connection and try again.', 0);
  }
  if (raw && res.ok) return res;

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && auth) {
      setToken(null);
      window.dispatchEvent(new Event('ecoplate:signed-out'));
    }
    throw new ApiError(data.message || 'Something went wrong.', res.status);
  }
  return data;
}

export const api = {
  // public
  home: () => request('/public/home'),
  donate: (b) => request('/public/donations', { method: 'POST', body: b }),
  message: (b) => request('/public/messages', { method: 'POST', body: b }),
  subscribe: (b) => request('/public/subscribe', { method: 'POST', body: b }),

  // auth
  login: (b) => request(`/access/${LOGIN_PATH}/login`, { method: 'POST', body: b }),
  me: () => request('/auth/me', { auth: true }),
  changePassword: (b) => request('/auth/password', { method: 'PUT', body: b, auth: true }),
  updateProfile: (b) => request('/auth/profile', { method: 'PUT', body: b, auth: true }),

  // dashboard
  get: (p) => request(`/admin/${p}`, { auth: true }),
  post: (p, b) => request(`/admin/${p}`, { method: 'POST', body: b, auth: true }),
  put: (p, b) => request(`/admin/${p}`, { method: 'PUT', body: b, auth: true }),
  del: (p) => request(`/admin/${p}`, { method: 'DELETE', auth: true }),
  upload: (file) => {
    const fd = new FormData();
    fd.append('image', file);
    return request('/admin/upload', { method: 'POST', body: fd, auth: true });
  },
  download: async (p, filename) => {
    const res = await request(`/admin/${p}`, { auth: true, raw: true });
    const blob = await res.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  },
};
