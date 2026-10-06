'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { authApi } from '../lib/api';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string, role?: string) => Promise<User>;
  register: (name: string, email: string, password: string, mobile?: string) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Hydrate token & user from localStorage on client boot
    const storedToken = localStorage.getItem('scanpayeat_token');
    const storedUser = localStorage.getItem('scanpayeat_user');

    if (storedToken) {
      setToken(storedToken);
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          // ignore corrupted json
        }
      }

      // Verify token with backend
      authApi
        .getMe()
        .then((res) => {
          if (res?.user) {
            setUser(res.user);
            localStorage.setItem('scanpayeat_user', JSON.stringify(res.user));
          }
        })
        .catch(() => {
          // Token expired or invalid
          localStorage.removeItem('scanpayeat_token');
          localStorage.removeItem('scanpayeat_user');
          setToken(null);
          setUser(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string, role?: string): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await authApi.login({ email, password, role });
      setToken(res.accessToken);
      setUser(res.user);
      localStorage.setItem('scanpayeat_token', res.accessToken);
      localStorage.setItem('scanpayeat_user', JSON.stringify(res.user));
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    mobile?: string
  ): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await authApi.register({ name, email, mobile, password });
      setToken(res.accessToken);
      setUser(res.user);
      localStorage.setItem('scanpayeat_token', res.accessToken);
      localStorage.setItem('scanpayeat_user', JSON.stringify(res.user));
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await authApi.logout();
    localStorage.removeItem('scanpayeat_token');
    localStorage.removeItem('scanpayeat_user');
    setToken(null);
    setUser(null);
    router.push('/login');
  };

  const refreshUser = async () => {
    try {
      const res = await authApi.getMe();
      if (res?.user) {
        setUser(res.user);
        localStorage.setItem('scanpayeat_user', JSON.stringify(res.user));
      }
    } catch (e) {
      // ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
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
