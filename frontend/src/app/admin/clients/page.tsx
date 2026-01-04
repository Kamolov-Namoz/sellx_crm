'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { adminService, AdminUser } from '@/services/admin.service';
import { Client, ClientStatus, STATUS_LABELS, STATUS_COLORS } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';

const STATUSES: (ClientStatus | 'all')[] = ['all', 'new', 'thinking', 'agreed', 'rejected', 'callback'];

export default function AdminClientsPage() {
  const [clients, setClients] = useState<(Client & { userId: AdminUser })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<ClientStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const { isAdmin } = useAuth();
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    if (!isAdmin) {
      router.push('/dashboard');
      return;
    }
    fetchClients();
  }, [isAdmin, statusFilter]);

  const fetchClients = async (searchQuery?: string) => {
    setIsLoading(true);
    try {
      const params: { status?: ClientStatus; search?: string; limit: number } = { limit: 100 };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (searchQuery) params.search = searchQuery;
      
      const response = await adminService.getClients(params);
      if (response.success) {
        setClients(response.data || []);
      }
    } catch {
      toast.error('Mijozlarni yuklashda xatolik');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchClients(search);
  };

  if (!isAdmin) return null;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#0e1621] pb-20">
        <Header title="Barcha mijozlar" />
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

          <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-4 px-4 scrollbar-hide">
            {STATUSES.map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  statusFilter === status ? 'bg-primary-500 text-white' : 'bg-[#242f3d] text-gray-400'
                }`}
              >
                {status === 'all' ? 'Barchasi' : STATUS_LABELS[status]}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-dark-800 rounded-xl p-4 animate-pulse">
                  <div className="h-5 bg-dark-700 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-dark-700 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : clients.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Mijozlar topilmadi</p>
            </div>
          ) : (
            <div className="space-y-3">
              {clients.map((client) => (
                <Link key={client._id} href={`/clients/${client._id}`} className="block bg-dark-800 rounded-xl p-4 hover:bg-dark-700">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-white">{client.fullName || client.companyName || client.phoneNumber}</h3>
                    <span className={`text-xs px-2 py-1 rounded ${STATUS_COLORS[client.status]}`}>
                      {STATUS_LABELS[client.status]}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{client.phoneNumber}</p>
                  {client.userId && (
                    <p className="text-xs text-gray-600 mt-1">
                      Sotuvchi: {client.userId.firstName} {client.userId.lastName}
                    </p>
                  )}
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
