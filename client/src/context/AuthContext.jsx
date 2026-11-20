import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api, getToken, setToken } from '../lib/api.js';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!getToken());

  useEffect(() => {
    if (!getToken()) return;
    api.me().then((r) => setUser(r.user)).catch(() => setToken(null)).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const out = () => setUser(null);
    window.addEventListener('ecoplate:signed-out', out);
    return () => window.removeEventListener('ecoplate:signed-out', out);
  }, []);

  const login = useCallback(async (email, password) => {
    const r = await api.login({ email, password });
    setToken(r.token);
    setUser(r.user);
    return r.user;
  }, []);

  const logout = useCallback(() => { setToken(null); setUser(null); }, []);
  const can = useCallback((p) => !!user && (user.role === 'superadmin' || user.permissions?.includes(p)), [user]);

  return <AuthContext.Provider value={{ user, setUser, loading, login, logout, can }}>{children}</AuthContext.Provider>;
}
