import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { apiRequest, setStoredToken, getStoredToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  quickSwitchRole: (role: UserRole) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ROLE_EMAILS: Record<UserRole, string> = {
  Admin: 'amit.verma@anjalienterprise.com',
  Sales: 'rahul.sharma@anjalienterprise.com',
  Warehouse: 'vikram.singh@anjalienterprise.com',
  Accounts: 'priya.patel@anjalienterprise.com',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = getStoredToken();
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await apiRequest<{ user: User }>('/auth/me');
        setUser(res.user);
      } catch (err) {
        console.error('Session restore failed:', err);
        setStoredToken(null);
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await apiRequest<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: { email, password },
    });

    setStoredToken(res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const quickSwitchRole = async (role: UserRole) => {
    const email = ROLE_EMAILS[role];
    await login(email, 'password123');
  };

  const logout = () => {
    setStoredToken(null);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, quickSwitchRole, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
