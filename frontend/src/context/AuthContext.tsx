import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import type { UserProfile } from '../api/auth';
import { getCurrentUser } from '../api/auth';

interface AuthContextType {
  token: string | null;
  user: UserProfile | null;
  login: (token: string) => void;
  logout: () => void;
  fetchUser: () => Promise<void>;
  updateUserContext: (user: UserProfile) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  user: null,
  login: () => {},
  logout: () => {},
  fetchUser: async () => {},
  updateUserContext: () => {},
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Setup Axios interceptor when token changes
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  }, [token]);

  const fetchUser = async () => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const userData = await getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error("Failed to fetch user, token might be expired", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const login = (newToken: string) => {
    setToken(newToken);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const updateUserContext = (updatedUser: UserProfile) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, fetchUser, updateUserContext, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
