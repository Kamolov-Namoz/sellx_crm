'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';

interface FormErrors {
  username?: string;
  password?: string;
}

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();

  useEffect(() => {
    const registered = searchParams.get('registered');
    if (registered === 'true') {
      toast.success('Muvaffaqiyatli ro\'yxatdan o\'tdingiz! Endi kiring.');
      // Remove query param to prevent showing again
      window.history.replaceState({}, '', '/auth/login');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!username.trim()) {
      newErrors.username = 'Foydalanuvchi nomi kiritilishi shart';
    }

    if (!password) {
      newErrors.password = 'Parol kiritilishi shart';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await login({ username, password });
      toast.success('Muvaffaqiyatli kirdingiz!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Xatolik yuz berdi';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const EyeIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );

  const EyeOffIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );

  return (
    <div className="min-h-screen bg-[#0e1621] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Sales CRM</h1>
          <p className="text-gray-500 mt-1">Hisobingizga kiring</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setErrors(prev => ({...prev, username: undefined})); }}
              placeholder="Foydalanuvchi nomi"
              className={`input w-full ${errors.username ? 'border-red-500 focus:border-red-500' : ''}`}
              autoComplete="username"
            />
            {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
          </div>

          <div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors(prev => ({...prev, password: undefined})); }}
                placeholder="Parol"
                className={`input w-full pr-12 ${errors.password ? 'border-red-500 focus:border-red-500' : ''}`}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Kirish...' : 'Kirish'}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-500">
          Hisobingiz yo'qmi?{' '}
          <Link href="/auth/register" className="text-primary-400 hover:text-primary-300">
            Ro'yxatdan o'ting
          </Link>
        </p>
      </div>
    </div>
  );
}
