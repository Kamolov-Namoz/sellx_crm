'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { adminService, AdminUser } from '@/services/admin.service';
import { Client, Order, ORDER_STATUS_LABELS, STATUS_LABELS } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';

export default function AdminUserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAdmin } = useAuth();
  const toast = useToast();

  useEffect(() => {
    if (!isAdmin) {
      router.push('/dashboard');
      return;
    }
    fetchUser();
  }, [isAdmin, params.id]);

  const fetchUser = async () => {
    try {
      const response = await adminService.getUser(params.id as string);
      if (response.success && response.data) {
        setUser(response.data);
        setClients(response.data.recentClients || []);
        setOrders(response.data.recentOrders || []);
      }
    } catch {
      toast.error('Foydalanuvchini yuklashda xatolik');
      router.push('/admin/users');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAdmin) return null;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#0e1621] pb-20">
        <Header title="Foydalanuvchi" />
        <main className="p-4">
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-20 bg-dark-800 rounded-xl" />
              <div className="h-40 bg-dark-800 rounded-xl" />
            </div>
          ) : user ? (
            <div className="space-y-4">
              <div className="bg-dark-800 rounded-xl p-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary-500 flex items-center justify-center text-white text-2xl font-semibold">
                    {user.firstName.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">{user.firstName} {user.lastName}</h2>
                    <p className="text-gray-500">@{user.username}</p>
                    <p className="text-sm text-gray-600">{user.phoneNumber}</p>
                  </div>
                </div>
                <div className="mt-4 flex gap-4">
                  <div className="flex-1 bg-dark-700 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-primary-400">{user.clientCount || 0}</p>
                    <p className="text-xs text-gray-500">Mijozlar</p>
                  </div>
                  <div className="flex-1 bg-dark-700 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-green-400">{user.orderCount || 0}</p>
                    <p className="text-xs text-gray-500">Loyihalar</p>
                  </div>
                </div>
                <p className="mt-3 text-xs text-gray-600">
                  Ro'yxatdan o'tgan: {format(new Date(user.createdAt), 'dd.MM.yyyy HH:mm')}
                </p>
              </div>

              {clients.length > 0 && (
                <div className="bg-dark-800 rounded-xl p-4">
                  <h3 className="text-white font-medium mb-3">So'nggi mijozlar</h3>
                  <div className="space-y-2">
                    {clients.slice(0, 5).map((client) => (
                      <div key={client._id} className="flex items-center justify-between py-2 border-b border-dark-700 last:border-0">
                        <div>
                          <p className="text-sm text-white">{client.fullName || client.companyName || client.phoneNumber}</p>
                          <p className="text-xs text-gray-600">{client.phoneNumber}</p>
                        </div>
                        <span className="text-xs text-gray-500">{STATUS_LABELS[client.status]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {orders.length > 0 && (
                <div className="bg-dark-800 rounded-xl p-4">
                  <h3 className="text-white font-medium mb-3">So'nggi loyihalar</h3>
                  <div className="space-y-2">
                    {orders.slice(0, 5).map((order) => (
                      <div key={order._id} className="flex items-center justify-between py-2 border-b border-dark-700 last:border-0">
                        <div>
                          <p className="text-sm text-white">{order.title}</p>
                          {order.amount && <p className="text-xs text-primary-400">{order.amount.toLocaleString()} so'm</p>}
                        </div>
                        <span className="text-xs text-gray-500">{ORDER_STATUS_LABELS[order.status]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </main>
        <BottomNav />
      </div>
    </ProtectedRoute>
  );
}
