import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On page refresh, check if we have a token and fetch user profile
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const user = await authApi.getMe();
          setUser(user);
        } catch (error) {
          console.error("Session expired", error);
          authApi.logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const user = await authApi.login(email, password);
    setUser(user);
    return user;
  };

  const register = async (name, email, password) => {
    await authApi.register(name, email, password);
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, loading, register, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}