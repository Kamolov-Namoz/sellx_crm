'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { adminService, MapClient } from '@/services/admin.service';
import { STATUS_LABELS } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';

// Dynamic import for the entire map component to avoid SSR issues
const AdminMap = dynamic(() => import('@/components/AdminMap'), {
  ssr: false,
  loading: () => <div className="h-[60vh] bg-dark-800 rounded-xl animate-pulse" />,
});

const statusColors: Record<string, string> = {
  new: '#3b82f6',
  thinking: '#eab308',
  agreed: '#22c55e',
  rejected: '#ef4444',
  callback: '#a855f7',
};

export default function AdminMapPage() {
  const [clients, setClients] = useState<MapClient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<MapClient | null>(null);
  const { isAdmin } = useAuth();
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    if (!isAdmin) {
      router.push('/dashboard');
      return;
    }
    fetchClients();
  }, [isAdmin, router]);

  const fetchClients = async () => {
    try {
      const response = await adminService.getClientsForMap();
      if (response.success && response.data) {
        setClients(response.data);
      }
    } catch {
      toast.error('Mijozlarni yuklashda xatolik');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAdmin) return null;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#0e1621] pb-20">
        <Header title="Xaritada mijozlar" />
        <main className="p-4">
          <div className="bg-dark-800 rounded-xl p-3 mb-4">
            <p className="text-sm text-gray-400">{clients.length} ta mijoz xaritada</p>
            <div className="flex gap-2 mt-2 flex-wrap">
              {Object.entries(statusColors).map(([status, color]) => (
                <div key={status} className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-xs text-gray-500">{STATUS_LABELS[status as keyof typeof STATUS_LABELS]}</span>
                </div>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="h-[60vh] bg-dark-800 rounded-xl animate-pulse" />
          ) : (
            <div className="h-[60vh] rounded-xl overflow-hidden">
              <AdminMap clients={clients} onClientSelect={setSelectedClient} />
            </div>
          )}

          {selectedClient && (
            <div className="mt-4 bg-dark-800 rounded-xl p-4">
              <h3 className="font-semibold text-white">{selectedClient.fullName || selectedClient.companyName}</h3>
              <p className="text-sm text-gray-500">{selectedClient.phoneNumber}</p>
              <p className="text-sm text-gray-600">{selectedClient.location?.address}</p>
              <button
                onClick={() => router.push(`/clients/${selectedClient._id}`)}
                className="btn-primary mt-3 w-full"
              >
                Batafsil ko'rish
              </button>
            </div>
          )}
        </main>
        <BottomNav />
      </div>
    </ProtectedRoute>
  );
}
