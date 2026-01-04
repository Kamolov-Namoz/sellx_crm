'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { User, LoginCredentials, RegisterCredentials, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    const response = await authService.login(credentials);
    
    if (response.success && response.token && response.userId) {
      const userData: User = {
        userId: response.userId,
        username: credentials.username,
        role: response.role || 'user',
      };
      
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      router.push('/dashboard');
    } else {
      throw new Error(response.message || 'Login failed');
    }
  };

  const register = async (credentials: RegisterCredentials): Promise<void> => {
    console.log('AuthContext register called', credentials);
    
    if (credentials.password !== credentials.confirmPassword) {
      throw new Error('Parollar mos kelmaydi');
    }

    console.log('Calling authService.register...');
    const response = await authService.register({
      firstName: credentials.firstName,
      lastName: credentials.lastName,
      username: credentials.username,
      phoneNumber: credentials.phoneNumber,
      password: credentials.password,
    });
    console.log('authService.register response:', response);

    if (response.success) {
      router.push('/auth/login?registered=true');
    } else {
      throw new Error(response.message || 'Registration failed');
    }
  };

  const logout = (): void => {
    authService.logout();
    setUser(null);
    router.push('/auth/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
