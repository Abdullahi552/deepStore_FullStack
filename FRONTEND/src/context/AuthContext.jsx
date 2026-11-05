import React, { createContext, useContext, useState, useEffect, act } from 'react';

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setUser] = useState();
  const [loading, setLoading] = useState(true);

  // Restore session on page refresh
  useEffect(() => {
    const activeId = localStorage.getItem('active_session_id') || [];
    if (activeId) {
      const users = JSON.parse(localStorage.getItem('app_users') || '[]');
      const matchedUser = users.find((u) => u.cryptoId === activeId);
      if (matchedUser) {
        setUser({ name: matchedUser.name, email: matchedUser.email, cryptoId: matchedUser.cryptoId });
      } else {
        localStorage.removeItem('active_session_id');
      }
    }

    setLoading(false);
  }, []);

  const isEmailTaken = (email) => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return false;
    const users = JSON.parse(localStorage.getItem('app_users') || '[]');
    return users.some((u) => u.email.toLowerCase() === cleanEmail);
  };

  const register = async (name, email, password) => {
    const cleanEmail = email.trim();
    if (isEmailTaken(cleanEmail)) throw new Error('Email already registered');
    if (password.length < 8) throw new Error('Password must be at least 8 characters long');

    const passwordHash = await hashPassword(password);
    const newUser = {
      cryptoId: crypto.randomUUID(),
      name: name.trim(),
      email: cleanEmail,
      passwordHash,
    };

    const users = JSON.parse(localStorage.getItem('app_users') || '[]');
    users.push(newUser);
    localStorage.setItem('app_users', JSON.stringify(users));
    
    // Returning true so the Register component knows it succeeded and can route to Login
    return true; 
  };

  const login = async (email, password) => {
    const cleanEmail = email.trim();
    const users = JSON.parse(localStorage.getItem('app_users') || '[]');
    const passwordHash = await hashPassword(password);

    const matchedUser = users.find(
      (u) => u.email.toLowerCase() === cleanEmail.toLowerCase() && u.passwordHash === passwordHash
    );

    if (!matchedUser) throw new Error('Invalid email or password.');

    localStorage.setItem('active_session_id', matchedUser.cryptoId);
    const userState = { name: matchedUser.name, email: matchedUser.email, cryptoId: matchedUser.cryptoId };
    setUser(userState);
    return userState;
  };

  const logout = () => {
    localStorage.removeItem('active_session_id');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, loading, register, login, logout, isEmailTaken }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}