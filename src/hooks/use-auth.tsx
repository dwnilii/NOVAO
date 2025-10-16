'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import type { User } from '@/lib/types';
import { findUserByUsername } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { loginAdmin, logoutAdmin } from '@/app/admin-login/actions';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  checkUser: () => Promise<void>;
  login: (username: string, pass: string) => Promise<{ success: boolean; message: string; user: User | null }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // This function is the single source of truth for checking the user's state on the client.
  // It only checks localStorage.
  const checkUser = useCallback(async () => {
    setLoading(true);
    try {
      const storedUser = localStorage.getItem('novao-user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('novao-user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkUser();
  }, [checkUser]);


  // This login function is ONLY for regular portal users. Admin login is handled by a server action.
  const login = async (username: string, pass: string): Promise<{ success: boolean, message: string, user: User | null }> => {
    setLoading(true);

    const portalUser = await findUserByUsername(username);

    if (!portalUser || portalUser.password !== pass) {
      setLoading(false);
      return { success: false, message: 'Invalid portal username or password.', user: null };
    }
    
    // Omit password from stored user object for security
    const { password, ...userToStore } = portalUser;
    setUser(userToStore);
    localStorage.setItem('novao-user', JSON.stringify(userToStore));
    setLoading(false);
    return { success: true, message: 'Login successful!', user: userToStore };
  };

  const logout = useCallback(async () => {
    const wasAdmin = user?.name === 'admin';
    
    // Clear client-side state
    setUser(null);
    localStorage.removeItem('novao-user');

    if (wasAdmin) {
      // If it was an admin, we also need to call the server action to clear the httpOnly session cookie.
      await logoutAdmin();
      router.push('/admin-login');
    } else {
      router.push('/user-login');
    }
  }, [user, router]);

  const value = useMemo(() => ({ user, loading, login, logout, checkUser }), [user, loading, login, logout, checkUser]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
