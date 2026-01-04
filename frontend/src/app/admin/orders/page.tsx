'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { adminService } from '@/services/admin.service';
import { Order, OrderStatus, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, Client } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';

const STATUSES: (OrderStatus | 'all')[] = ['all', 'new', 'in_progress', 'completed'];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const { isAdmin } = useAuth();
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    if (!isAdmin) {
      router.push('/dashboard');
      return;
    }
    fetchOrders();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, statusFilter]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const params: { status?: OrderStatus; limit: number } = { limit: 100 };
      if (statusFilter !== 'all') params.status = statusFilter;
      
      const response = await adminService.getOrders(params);
      if (response.success) {
        setOrders(response.data || []);
      }
    } catch {
      toast.error('Loyihalarni yuklashda xatolik');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAdmin) return null;

  const totalAmount = orders.reduce((sum, order) => sum + (order.amount || 0), 0);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#0e1621] pb-20">
        <Header title="Barcha loyihalar" />
        <main className="p-4">
          <div className="bg-dark-800 rounded-xl p-4 mb-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-sm">Jami summa</p>
                <p className="text-2xl font-bold text-primary-400">{totalAmount.toLocaleString()} so'm</p>
              </div>
              <div className="text-right">
                <p className="text-gray-500 text-sm">Loyihalar</p>
                <p className="text-2xl font-bold text-white">{orders.length}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-4 px-4 scrollbar-hide">
            {STATUSES.map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  statusFilter === status ? 'bg-primary-500 text-white' : 'bg-[#242f3d] text-gray-400'
                }`}
              >
                {status === 'all' ? 'Barchasi' : ORDER_STATUS_LABELS[status]}
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
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loyihalar topilmadi</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <Link key={order._id} href={`/orders/${order._id}`} className="block bg-dark-800 rounded-xl p-4 hover:bg-dark-700">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-white">{order.title}</h3>
                      {order.clientId && typeof order.clientId === 'object' && (
                        <p className="text-sm text-gray-500">
                          {(order.clientId as Client).fullName || (order.clientId as Client).companyName || (order.clientId as Client).phoneNumber}
                        </p>
                      )}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${ORDER_STATUS_COLORS[order.status]}`}>
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    {order.amount ? (
                      <span className="text-primary-400 font-semibold">{order.amount.toLocaleString()} so'm</span>
                    ) : <span />}
                    <span className="text-xs text-gray-600">{format(new Date(order.createdAt), 'dd.MM.yyyy')}</span>
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
