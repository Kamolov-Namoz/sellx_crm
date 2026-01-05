'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function HomePage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && user) {
        // Role-based redirect
        if (user.role === 'admin') {
          router.push('/admin');
        } else if (user.role === 'developer') {
          router.push('/developer');
        } else {
          router.push('/dashboard');
        }
      } else {
        router.push('/auth/login');
      }
    }
  }, [isAuthenticated, isLoading, router, user]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  );
}
