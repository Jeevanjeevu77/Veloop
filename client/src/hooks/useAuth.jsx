import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import * as api from '../api/endpoints';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('veloop_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.fetchMe();
        if (!cancelled) setUser(res.data.user);
      } catch {
        if (!cancelled) {
          localStorage.removeItem('veloop_token');
          setToken(null);
          setUser(null);
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

  const applySession = useCallback((data) => {
    localStorage.setItem('veloop_token', data.token);
    setToken(data.token);
    setUser(data.user);
  }, []);

  const signup = useCallback(
    async (payload) => {
      const res = await api.signup(payload);
      applySession(res.data);
    },
    [applySession]
  );

  const login = useCallback(
    async (payload) => {
      const res = await api.login(payload);
      applySession(res.data);
    },
    [applySession]
  );

  const logout = useCallback(() => {
    localStorage.removeItem('veloop_token');
    setToken(null);
    setUser(null);
  }, []);

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token && user),
    loading,
    signup,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
