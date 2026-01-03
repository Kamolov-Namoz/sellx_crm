'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { useToast } from '@/contexts/ToastContext';
import { clientService } from '@/services/client.service';
import { Client, STATUS_LABELS, ClientStatus } from '@/types';

interface Stats {
  totalClients: number;
  todayFollowUps: number;
  byStatus: Record<string, number>;
}

const statusColors: Record<ClientStatus, string> = {
  interested: 'bg-blue-500',
  thinking: 'bg-yellow-500',
  callback: 'bg-purple-500',
  not_interested: 'bg-red-500',
  deal_closed: 'bg-green-500',
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [todayClients, setTodayClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, clientsRes] = await Promise.all([
        clientService.getStats(),
        clientService.getClients({ sortBy: 'followUpDate', sortOrder: 'asc' }),
      ]);
      
      setStats(statsRes.data ?? null);
      
      // Filter today's follow-ups
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const todayList = clientsRes.data.filter((c) => {
        if (!c.followUpDate) return false;
        const followUp = new Date(c.followUpDate);
        return followUp >= today && followUp < tomorrow;
      });
      
      setTodayClients(todayList);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      toast.error('Ma\'lumotlarni yuklashda xatolik');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="page-container pb-20">
        <Header />
        
        <main className="p-4">
          {isLoading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-24 bg-[#17212b] rounded-xl" />
              <div className="h-32 bg-[#17212b] rounded-xl" />
              <div className="h-48 bg-[#17212b] rounded-xl" />
            </div>
          ) : (
            <div className="space-y-4 animate-fade-in">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="card">
                  <p className="text-gray-500 text-sm">Jami mijozlar</p>
                  <p className="text-3xl font-bold text-white mt-1">{stats?.totalClients || 0}</p>
                </div>
                <div className="card bg-orange-500/10 border-orange-500/30">
                  <p className="text-orange-400 text-sm">Bugungi qo'ng'iroqlar</p>
                  <p className="text-3xl font-bold text-orange-400 mt-1">{stats?.todayFollowUps || 0}</p>
                </div>
              </div>

              {/* Status Breakdown */}
              <div className="card">
                <h2 className="font-semibold text-white mb-3">Status bo'yicha</h2>
                <div className="space-y-2">
                  {Object.entries(STATUS_LABELS).map(([status, label]) => {
                    const count = stats?.byStatus?.[status] || 0;
                    const total = stats?.totalClients || 1;
                    const percentage = Math.round((count / total) * 100) || 0;
                    
                    return (
                      <div key={status} className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${statusColors[status as ClientStatus]}`} />
                        <span className="text-gray-400 text-sm flex-1">{label}</span>
                        <span className="text-white font-medium">{count}</span>
                        <div className="w-16 h-1.5 bg-[#242f3d] rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${statusColors[status as ClientStatus]}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Today's Follow-ups */}
              <div className="card">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-white">Bugungi qo'ng'iroqlar</h2>
                  <Link href="/clients" className="text-primary-400 text-sm">
                    Barchasi →
                  </Link>
                </div>
                
                {todayClients.length > 0 ? (
                  <div className="space-y-2">
                    {todayClients.slice(0, 5).map((client) => (
                      <Link
                        key={client._id}
                        href={`/clients/${client._id}`}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#242f3d] transition-colors"
                      >
                        <div className={`w-10 h-10 rounded-full ${statusColors[client.status]} flex items-center justify-center text-white font-semibold`}>
                          {client.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate">{client.fullName}</p>
                          <p className="text-gray-500 text-sm">{client.phoneNumber}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-orange-400 text-sm font-medium">
                            {client.followUpDate && format(new Date(client.followUpDate), 'HH:mm', { locale: enUS })}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-500">Bugun qo'ng'iroq yo'q</p>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <Link
                href="/clients/new"
                className="card flex items-center gap-3 hover:bg-[#1c2936]"
              >
                <div className="w-12 h-12 bg-primary-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-medium">Yangi mijoz qo'shish</p>
                  <p className="text-gray-500 text-sm">Mijozlar bazasiga qo'shing</p>
                </div>
              </Link>
            </div>
          )}
        </main>

        <BottomNav />
      </div>
    </ProtectedRoute>
  );
}
