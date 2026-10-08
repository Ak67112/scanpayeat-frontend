'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { authApi } from '../lib/api';
import { useRouter } from 'next/navigation';

// Session durations
export const STAFF_SESSION_MAX_MS = 24 * 60 * 60 * 1000; // 24 hours
export const CUSTOMER_SESSION_MAX_MS = 30 * 24 * 60 * 60 * 1000; // 30 days (1 month)

export function getSessionMaxMsForRole(role?: string): number {
  if (role === 'ADMIN' || role === 'SHOPKEEPER') {
    return STAFF_SESSION_MAX_MS;
  }
  return CUSTOMER_SESSION_MAX_MS;
}

export function isSessionExpired(role?: string, loginTime?: number | null): boolean {
  if (!loginTime) return false;
  const maxMs = getSessionMaxMsForRole(role);
  return Date.now() - loginTime >= maxMs;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string, role?: string) => Promise<User>;
  register: (
    name: string,
    email: string,
    password: string,
    mobile?: string,
    avatarUrl?: string
  ) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const clearAuth = (redirectExpiredRole?: string) => {
    localStorage.removeItem('scanpayeat_token');
    localStorage.removeItem('scanpayeat_user');
    localStorage.removeItem('scanpayeat_login_time');
    setToken(null);
    setUser(null);

    if (redirectExpiredRole === 'ADMIN') {
      router.push('/admin/login?expired=24h');
    } else if (redirectExpiredRole === 'SHOPKEEPER') {
      router.push('/shopkeeper/login?expired=24h');
    } else if (redirectExpiredRole === 'CUSTOMER') {
      router.push('/login?expired=30d');
    }
  };

  useEffect(() => {
    // Hydrate token & user from localStorage on client boot
    const storedToken = localStorage.getItem('scanpayeat_token');
    const storedUser = localStorage.getItem('scanpayeat_user');
    const storedLoginTime = localStorage.getItem('scanpayeat_login_time');

    if (storedToken) {
      let parsedUser: User | null = null;
      if (storedUser) {
        try {
          parsedUser = JSON.parse(storedUser);
        } catch (e) {
          // ignore corrupted json
        }
      }

      const loginTimestamp = storedLoginTime ? parseInt(storedLoginTime, 10) : null;

      // Check role-based expiration (24h for Staff, 30d for Customer)
      if (loginTimestamp && isSessionExpired(parsedUser?.role, loginTimestamp)) {
        clearAuth(parsedUser?.role);
        setIsLoading(false);
        return;
      }

      // If user had existing valid session without login_time, record current time
      if (!loginTimestamp) {
        localStorage.setItem('scanpayeat_login_time', Date.now().toString());
      }

      setToken(storedToken);
      if (parsedUser) {
        setUser(parsedUser);
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
          // Token expired or invalid on backend
          const expiredRole = parsedUser?.role;
          clearAuth(expiredRole);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  // Periodic active session watcher to automatically log out expired tabs (every 30s)
  useEffect(() => {
    const interval = setInterval(() => {
      const storedToken = localStorage.getItem('scanpayeat_token');
      const storedLoginTime = localStorage.getItem('scanpayeat_login_time');
      const storedUser = localStorage.getItem('scanpayeat_user');

      if (storedToken && storedLoginTime) {
        let role: string | undefined;
        try {
          if (storedUser) {
            const parsed = JSON.parse(storedUser);
            role = parsed.role;
          }
        } catch (e) {}

        const loginTimestamp = parseInt(storedLoginTime, 10);
        if (loginTimestamp && isSessionExpired(role, loginTimestamp)) {
          clearAuth(role);
        }
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const login = async (email: string, password: string, role?: string): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await authApi.login({ email, password, role });
      const now = Date.now().toString();
      setToken(res.accessToken);
      setUser(res.user);
      localStorage.setItem('scanpayeat_token', res.accessToken);
      localStorage.setItem('scanpayeat_user', JSON.stringify(res.user));
      localStorage.setItem('scanpayeat_login_time', now);
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    mobile?: string,
    avatarUrl?: string
  ): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await authApi.register({ name, email, mobile, password, avatarUrl });
      const now = Date.now().toString();
      setToken(res.accessToken);
      setUser(res.user);
      localStorage.setItem('scanpayeat_token', res.accessToken);
      localStorage.setItem('scanpayeat_user', JSON.stringify(res.user));
      localStorage.setItem('scanpayeat_login_time', now);
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    const currentRole = user?.role;
    try {
      await authApi.logout();
    } catch (e) {
      // Ignore network failures on logout
    }
    localStorage.removeItem('scanpayeat_token');
    localStorage.removeItem('scanpayeat_user');
    localStorage.removeItem('scanpayeat_login_time');
    setToken(null);
    setUser(null);

    // Redirect to the appropriate portal
    if (currentRole === 'ADMIN') {
      router.push('/admin/login');
    } else if (currentRole === 'SHOPKEEPER') {
      router.push('/shopkeeper/login');
    } else {
      router.push('/login');
    }
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
