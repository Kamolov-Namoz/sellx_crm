'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import ClientCard from '@/components/ClientCard';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useToast } from '@/contexts/ToastContext';
import { clientService } from '@/services/client.service';
import { Client, ClientStatus, STATUS_LABELS } from '@/types';

const STATUSES: (ClientStatus | 'all')[] = ['all', 'new', 'thinking', 'agreed', 'rejected', 'callback'];

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<ClientStatus | 'all'>('all');
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const toast = useToast();

  const loadClients = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await clientService.getClients({
        status: statusFilter === 'all' ? undefined : statusFilter,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      setClients(response.data);
    } catch (error) {
      console.error('Failed to load clients:', error);
      toast.error('Mijozlarni yuklashda xatolik');
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    
    setIsDeleting(true);
    try {
      await clientService.deleteClient(deleteTarget._id);
      setClients((prev) => prev.filter((c) => c._id !== deleteTarget._id));
      toast.success(`${deleteTarget.fullName} o'chirildi`);
      setDeleteTarget(null);
    } catch (error) {
      console.error('Failed to delete client:', error);
      toast.error('O\'chirishda xatolik yuz berdi');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="page-container pb-20">
        <Header />
        
        <main className="p-4">
          {/* Header with Add Button */}
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-white">Mijozlar</h1>
            <Link href="/clients/new" className="btn-primary flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Qo'shish
            </Link>
          </div>

          {/* Status Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-4 px-4 scrollbar-hide">
            {STATUSES.map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  statusFilter === status
                    ? 'bg-primary-500 text-white'
                    : 'bg-[#242f3d] text-gray-400 hover:bg-[#2d3a4d]'
                }`}
              >
                {status === 'all' ? 'Barchasi' : STATUS_LABELS[status]}
              </button>
            ))}
          </div>

          {/* Client List */}
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="card animate-pulse h-20" />
              ))}
            </div>
          ) : clients.length > 0 ? (
            <div className="space-y-3">
              {clients.map((client, index) => (
                <div 
                  key={client._id} 
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <ClientCard 
                    client={client} 
                    onDelete={() => setDeleteTarget(client)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-[#242f3d] rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-gray-400 font-medium">Mijozlar yo'q</p>
              <p className="text-gray-600 text-sm mt-1">
                {statusFilter !== 'all' 
                  ? `"${STATUS_LABELS[statusFilter]}" statusidagi mijozlar topilmadi`
                  : "Birinchi mijozingizni qo'shing"
                }
              </p>
              <Link href="/clients/new" className="btn-primary mt-4 inline-flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Mijoz qo'shish
              </Link>
            </div>
          )}
        </main>

        <BottomNav />

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={!!deleteTarget}
          title="Mijozni o'chirish"
          message={`${deleteTarget?.fullName} ni o'chirishni tasdiqlaysizmi?`}
          confirmLabel="O'chirish"
          cancelLabel="Bekor qilish"
          confirmVariant="danger"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          isLoading={isDeleting}
        />
      </div>
    </ProtectedRoute>
  );
}
