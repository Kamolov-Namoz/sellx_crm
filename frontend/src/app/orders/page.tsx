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
      toast.error('Loyihalarni yuklashda xatolik');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const handleProjectClick = (orderId: string) => {
    router.push(`/orders/${orderId}`);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#0e1621] pb-20">
        <Header title="Loyihalar" />
        
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <p className="text-gray-500">Loyihalar topilmadi</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div 
                  key={order._id} 
                  className="bg-dark-800 rounded-xl p-4 cursor-pointer hover:bg-dark-700 transition-colors"
                  onClick={() => handleProjectClick(order._id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
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
                  
                  {/* Progress bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Progress</span>
                      <span>{(order as Order & { progress?: number }).progress || 0}%</span>
                    </div>
                    <div className="w-full bg-dark-700 rounded-full h-2">
                      <div 
                        className="bg-primary-500 h-2 rounded-full transition-all"
                        style={{ width: `${(order as Order & { progress?: number }).progress || 0}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">
                      {format(new Date(order.createdAt), 'dd.MM.yyyy')}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${ORDER_STATUS_COLORS[order.status]}`}>
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
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
