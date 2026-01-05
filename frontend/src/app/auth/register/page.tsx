'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';

interface FormErrors {
  firstName?: string;
  lastName?: string;
  username?: string;
  phoneNumber?: string;
  password?: string;
  confirmPassword?: string;
  role?: string;
}

export default function RegisterPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'user' | 'developer'>('user');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!firstName.trim()) {
      newErrors.firstName = 'Ism kiritilishi shart';
    } else if (firstName.length < 2) {
      newErrors.firstName = 'Ism kamida 2 ta belgidan iborat bo\'lishi kerak';
    }

    if (!lastName.trim()) {
      newErrors.lastName = 'Familya kiritilishi shart';
    } else if (lastName.length < 2) {
      newErrors.lastName = 'Familya kamida 2 ta belgidan iborat bo\'lishi kerak';
    }

    if (!username.trim()) {
      newErrors.username = 'Foydalanuvchi nomi kiritilishi shart';
    } else if (username.length < 3) {
      newErrors.username = 'Foydalanuvchi nomi kamida 3 ta belgidan iborat bo\'lishi kerak';
    }

    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = 'Telefon raqam kiritilishi shart';
    } else if (!/^\+?[0-9]{9,15}$/.test(phoneNumber.replace(/\s/g, ''))) {
      newErrors.phoneNumber = 'Telefon raqam noto\'g\'ri formatda';
    }

    if (!password) {
      newErrors.password = 'Parol kiritilishi shart';
    } else {
      const passwordErrors: string[] = [];
      if (password.length < 8) passwordErrors.push('kamida 8 ta belgi');
      if (!/[A-Z]/.test(password)) passwordErrors.push('1 ta katta harf');
      if (!/[a-z]/.test(password)) passwordErrors.push('1 ta kichik harf');
      if (!/[0-9]/.test(password)) passwordErrors.push('1 ta raqam');
      
      if (passwordErrors.length > 0) {
        newErrors.password = `Parolda bo'lishi kerak: ${passwordErrors.join(', ')}`;
      }
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Parolni tasdiqlang';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Parollar mos kelmaydi';
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
      await register({ firstName, lastName, username, phoneNumber, password, confirmPassword, role });
      toast.success('Muvaffaqiyatli ro\'yxatdan o\'tdingiz!');
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Ro'yxatdan o'tish</h1>
          <p className="text-gray-500 mt-1">Yangi hisob yarating</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Role tanlash */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Ro'lingizni tanlang
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('user')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  role === 'user'
                    ? 'border-primary-500 bg-primary-500/10 text-primary-400'
                    : 'border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <span className="font-medium">Seller</span>
                  <span className="text-xs opacity-70">Savdogar</span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setRole('developer')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  role === 'developer'
                    ? 'border-primary-500 bg-primary-500/10 text-primary-400'
                    : 'border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  <span className="font-medium">Dasturchi</span>
                  <span className="text-xs opacity-70">Developer</span>
                </div>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <input
                type="text"
                value={firstName}
                onChange={(e) => { setFirstName(e.target.value); setErrors(prev => ({...prev, firstName: undefined})); }}
                placeholder="Ism"
                className={`input w-full ${errors.firstName ? 'border-red-500 focus:border-red-500' : ''}`}
              />
              {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
            </div>
            <div>
              <input
                type="text"
                value={lastName}
                onChange={(e) => { setLastName(e.target.value); setErrors(prev => ({...prev, lastName: undefined})); }}
                placeholder="Familya"
                className={`input w-full ${errors.lastName ? 'border-red-500 focus:border-red-500' : ''}`}
              />
              {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
            </div>
          </div>

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
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => { setPhoneNumber(e.target.value); setErrors(prev => ({...prev, phoneNumber: undefined})); }}
              placeholder="Telefon raqam (+998...)"
              className={`input w-full ${errors.phoneNumber ? 'border-red-500 focus:border-red-500' : ''}`}
            />
            {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
          </div>

          <div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors(prev => ({...prev, password: undefined})); }}
                placeholder="Parol"
                className={`input w-full pr-12 ${errors.password ? 'border-red-500 focus:border-red-500' : ''}`}
                autoComplete="new-password"
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
            {!errors.password && password && (
              <div className="mt-2 space-y-1">
                <div className={`text-xs flex items-center gap-1 ${password.length >= 8 ? 'text-green-500' : 'text-gray-500'}`}>
                  {password.length >= 8 ? '✓' : '○'} Kamida 8 ta belgi
                </div>
                <div className={`text-xs flex items-center gap-1 ${/[A-Z]/.test(password) ? 'text-green-500' : 'text-gray-500'}`}>
                  {/[A-Z]/.test(password) ? '✓' : '○'} Katta harf (A-Z)
                </div>
                <div className={`text-xs flex items-center gap-1 ${/[a-z]/.test(password) ? 'text-green-500' : 'text-gray-500'}`}>
                  {/[a-z]/.test(password) ? '✓' : '○'} Kichik harf (a-z)
                </div>
                <div className={`text-xs flex items-center gap-1 ${/[0-9]/.test(password) ? 'text-green-500' : 'text-gray-500'}`}>
                  {/[0-9]/.test(password) ? '✓' : '○'} Raqam (0-9)
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setErrors(prev => ({...prev, confirmPassword: undefined})); }}
                placeholder="Parolni tasdiqlang"
                className={`input w-full pr-12 ${errors.confirmPassword ? 'border-red-500 focus:border-red-500' : ''}`}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Yaratilmoqda...' : 'Ro\'yxatdan o\'tish'}
          </button>
        </form>

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
