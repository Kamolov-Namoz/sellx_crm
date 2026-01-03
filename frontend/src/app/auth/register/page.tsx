'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password || !confirmPassword) {
      toast.error('Barcha maydonlarni to\'ldiring');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Parollar mos kelmaydi');
      return;
    }

    if (password.length < 8) {
      toast.error('Parol kamida 8 ta belgidan iborat bo\'lishi kerak');
      return;
    }

    setIsLoading(true);
    try {
      await register({ username, password, confirmPassword });
      toast.success('Muvaffaqiyatli ro\'yxatdan o\'tdingiz!');
      router.push('/dashboard');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Xatolik yuz berdi';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0e1621] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Ro'yxatdan o'tish</h1>
          <p className="text-gray-500 mt-1">Yangi hisob yarating</p>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Foydalanuvchi nomi"
              className="input"
              autoComplete="username"
            />
          </div>

          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Parol (kamida 8 ta belgi)"
              className="input"
              autoComplete="new-password"
            />
          </div>

          <div>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Parolni tasdiqlang"
              className="input"
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full py-3 text-base"
          >
            {isLoading ? 'Yaratilmoqda...' : 'Ro\'yxatdan o\'tish'}
          </button>
        </form>

        {/* Login Link */}
        <p className="text-center mt-6 text-gray-500">
          Hisobingiz bormi?{' '}
          <Link href="/auth/login" className="text-primary-400 hover:text-primary-300">
            Kirish
          </Link>
        </p>
      </div>
    </div>
  );
}
