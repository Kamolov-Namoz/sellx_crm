'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { orderService, GetOrdersParams } from '@/services/order.service';
import { Order, OrderStatus, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/types';
import { useToast } from '@/contexts/ToastContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { format } from 'date-fns';

const STATUSES: (OrderStatus | 'all')[] = ['all', 'new', 'in_progress', 'completed'];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const router = useRouter();
  const toast = useToast();

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const params: GetOrdersParams = {};
      if (filter !== 'all') params.status = filter;
      
      const response = await orderService.getOrders(params);
      if (response.success) {
        setOrders(response.data);
      }
    } catch (error) {
      toast.error('Zakazlarni yuklashda xatolik');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await orderService.updateOrder(orderId, { status: newStatus });
      toast.success('Status yangilandi');
      fetchOrders();
    } catch {
      toast.error('Statusni yangilashda xatolik');
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#0e1621] pb-20">
        <Header title="Zakazlar" />
        
        <main className="p-4">
          {/* Filter */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {STATUSES.map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  filter === status
                    ? 'bg-primary-500 text-white'
                    : 'bg-dark-700 text-gray-400 hover:bg-dark-600'
                }`}
              >
                {status === 'all' ? 'Barchasi' : ORDER_STATUS_LABELS[status]}
              </button>
            ))}
          </div>

          {/* Orders List */}
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
              <div className="w-16 h-16 bg-dark-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <p className="text-gray-500">Zakazlar topilmadi</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div key={order._id} className="bg-dark-800 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-white">{order.title}</h3>
                      {typeof order.clientId === 'object' && (
                        <p className="text-sm text-gray-500">
                          {order.clientId.fullName || order.clientId.companyName || order.clientId.phoneNumber}
                        </p>
                      )}
                    </div>
                    {order.amount && (
                      <span className="text-primary-400 font-semibold">
                        {order.amount.toLocaleString()} so'm
                      </span>
                    )}
                  </div>
                  
                  {order.description && (
                    <p className="text-sm text-gray-400 mb-3">{order.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">
                      {format(new Date(order.createdAt), 'dd.MM.yyyy HH:mm')}
                    </span>
                    
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order._id, e.target.value as OrderStatus)}
                      className={`text-xs px-3 py-1 rounded-lg font-medium border-0 ${ORDER_STATUS_COLORS[order.status]}`}
                    >
                      <option value="new">Yangi</option>
                      <option value="in_progress">Jarayonda</option>
                      <option value="completed">Tugallangan</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        <BottomNav />
      </div>
    </ProtectedRoute>
  );
}
