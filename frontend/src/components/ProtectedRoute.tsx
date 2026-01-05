'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    // Role-based redirect
    if (!isLoading && isAuthenticated && user) {
      // Agar developer bo'lsa va developer sahifasida bo'lmasa
      if (user.role === 'developer' && !requiredRole) {
        router.push('/developer');
        return;
      }
      
      // Agar kerakli rol bor va user roli mos kelmasa
      if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
        if (user.role === 'developer') {
          router.push('/developer');
        } else {
          router.push('/dashboard');
        }
      }
    }
  }, [isAuthenticated, isLoading, router, user, requiredRole]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
