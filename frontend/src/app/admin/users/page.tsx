'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { adminService, AdminUser } from '@/services/admin.service';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { isAdmin } = useAuth();
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    if (!isAdmin) {
      router.push('/dashboard');
      return;
    }
    fetchUsers();
  }, [isAdmin]);

  const fetchUsers = async (searchQuery?: string) => {
    try {
      const response = await adminService.getUsers({ search: searchQuery, limit: 100 });
      if (response.success) {
        setUsers(response.data || []);
      }
    } catch {
      toast.error('Foydalanuvchilarni yuklashda xatolik');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    fetchUsers(search);
  };

  if (!isAdmin) return null;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#0e1621] pb-20">
        <Header title="Foydalanuvchilar" />
        <main className="p-4">
          <form onSubmit={handleSearch} className="mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Qidirish..."
                className="flex-1 input"
              />
              <button type="submit" className="btn-primary px-4">Qidirish</button>
            </div>
          </form>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-dark-800 rounded-xl p-4 animate-pulse">
                  <div className="h-5 bg-dark-700 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-dark-700 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Foydalanuvchilar topilmadi</p>
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <Link key={user._id} href={`/admin/users/${user._id}`} className="block bg-dark-800 rounded-xl p-4 hover:bg-dark-700">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold">
                      {user.firstName.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{user.firstName} {user.lastName}</h3>
                      <p className="text-sm text-gray-500">@{user.username}</p>
                      <div className="flex gap-3 mt-1 text-xs text-gray-600">
                        <span>{user.clientCount || 0} mijoz</span>
                        <span>{user.orderCount || 0} loyiha</span>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${user.role === 'admin' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                      {user.role}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
        <BottomNav />
      </div>
    </ProtectedRoute>
  );
}
