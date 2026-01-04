'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import ProtectedRoute from '@/components/ProtectedRoute';
import ConfirmDialog from '@/components/ConfirmDialog';
import Timeline from '@/components/Timeline';
import AddConversationModal from '@/components/AddConversationModal';
import OrderForm from '@/components/OrderForm';
import { ClientDetailSkeleton } from '@/components/Skeleton';
import { useToast } from '@/contexts/ToastContext';
import { clientService } from '@/services/client.service';
import { conversationService } from '@/services/conversation.service';
import { orderService } from '@/services/order.service';
import { Client, Conversation, Order, STATUS_LABELS, ClientStatus, ConversationType, ORDER_STATUS_LABELS } from '@/types';

const statusColors: Record<ClientStatus, string> = {
  new: 'bg-blue-500',
  thinking: 'bg-yellow-500',
  agreed: 'bg-green-500',
  rejected: 'bg-red-500',
  callback: 'bg-purple-500',
};

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    loadData();
  }, [params.id]);

  const loadData = async () => {
    try {
      const [clientRes, convRes, ordersRes] = await Promise.all([
        clientService.getClient(params.id as string),
        conversationService.getConversations(params.id as string),
        orderService.getOrders({ clientId: params.id as string }),
      ]);
      setClient(clientRes.data ?? null);
      setConversations(convRes.data ?? []);
      setOrders(ordersRes.data ?? []);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Ma\'lumotlarni yuklashda xatolik');
      router.push('/clients');
    } finally {
      setIsLoading(false);
    }
  };

  const getDisplayName = () => {
    if (!client) return '';
    return client.fullName || client.companyName || client.phoneNumber;
  };

  const handleDelete = async () => {
    if (!client) return;
    
    setIsDeleting(true);
    try {
      await clientService.deleteClient(client._id);
      toast.success(`${getDisplayName()} o'chirildi`);
      router.push('/clients');
    } catch (error) {
      toast.error('O\'chirishda xatolik yuz berdi');
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleAddConversation = async (data: {
    type: ConversationType;
    content: string;
    summary: string;
    nextFollowUpDate?: string;
    metadata?: { fileName?: string; fileSize?: number; mimeType?: string };
  }) => {
    if (!client) return;
    
    setIsSubmitting(true);
    try {
      const response = await conversationService.createConversation({
        clientId: client._id,
        type: data.type,
        content: data.content,
        summary: data.summary,
        nextFollowUpDate: data.nextFollowUpDate ? new Date(data.nextFollowUpDate).toISOString() : undefined,
        metadata: data.metadata,
      });
      
      if (response.success && response.data) {
        setConversations([...conversations, response.data]);
        setClient({
          ...client,
          lastConversationSummary: data.summary,
          ...(data.nextFollowUpDate && { followUpDate: data.nextFollowUpDate }),
        });
        toast.success('Suhbat qo\'shildi');
      }
    } catch (error) {
      toast.error('Suhbat qo\'shishda xatolik');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConversation = async (id: string) => {
    try {
      await conversationService.deleteConversation(id);
      setConversations(conversations.filter((c) => c._id !== id));
      toast.success('Suhbat o\'chirildi');
    } catch (error) {
      toast.error('O\'chirishda xatolik');
    }
  };

  const handleCall = () => {
    if (client?.phoneNumber) {
      window.location.href = `tel:${client.phoneNumber}`;
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-[#0e1621]">
        {client && (
          <header className="bg-[#17212b] text-white sticky top-0 z-50 safe-top">
            <div className="flex items-center gap-3 px-4 py-3">
              <button onClick={() => router.back()} className="p-1 hover:bg-white/10 rounded-full">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <div className={`w-10 h-10 rounded-full ${statusColors[client.status]} flex items-center justify-center text-white font-semibold`}>
                {getDisplayName().charAt(0).toUpperCase()}
              </div>
              
              <div className="flex-1 min-w-0">
                <h1 className="font-semibold truncate">{getDisplayName()}</h1>
                <p className="text-xs text-gray-400 truncate">
                  {client.companyName && client.fullName ? `${client.companyName} • ` : ''}{STATUS_LABELS[client.status]}
                </p>
              </div>
              
              <button onClick={handleCall} className="p-2 hover:bg-white/10 rounded-full">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </button>
              
              <Link href={`/clients/${client._id}/edit`} className="p-2 hover:bg-white/10 rounded-full">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </Link>
            </div>
            
            <div className="px-4 pb-3 flex items-center gap-4 text-xs text-gray-400 overflow-x-auto">
              {client.location?.address && (
                <span className="flex items-center gap-1 whitespace-nowrap">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  {client.location.address}
                </span>
              )}
              <span className="flex items-center gap-1 whitespace-nowrap">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {client.phoneNumber}
              </span>
              {client.followUpDate && (
                <span className="flex items-center gap-1 text-orange-400 whitespace-nowrap">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {format(new Date(client.followUpDate), 'd MMM, HH:mm')}
                </span>
              )}
            </div>
          </header>
        )}

        <main className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4"><ClientDetailSkeleton /></div>
          ) : client ? (
            <div className="min-h-full p-4 pb-20" style={{ backgroundColor: '#0e1621' }}>
              {/* Orders */}
              {orders.length > 0 && (
                <div className="mb-4 bg-[#182533] rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-gray-400">📦 Zakazlar ({orders.length})</p>
                    <button onClick={() => setShowOrderForm(true)} className="text-xs text-primary-400">+ Qo'shish</button>
                  </div>
                  <div className="space-y-2">
                    {orders.slice(0, 3).map((order) => (
                      <div key={order._id} className="flex items-center justify-between py-1">
                        <span className="text-sm text-white">{order.title}</span>
                        <span className="text-xs text-gray-500">{ORDER_STATUS_LABELS[order.status]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Timeline conversations={conversations} onDelete={handleDeleteConversation} />
            </div>
          ) : null}
        </main>

        {client && !showAddModal && (
          <div className="fixed bottom-0 left-0 right-0 bg-[#17212b] safe-bottom z-40">
            <div className="flex items-center gap-2 p-2">
              <button onClick={() => setShowOrderForm(true)} className="p-2.5 rounded-full hover:bg-gray-700">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </button>
              <div onClick={() => setShowAddModal(true)} className="flex-1 bg-[#242f3d] rounded-2xl px-4 py-3 cursor-pointer">
                <span className="text-gray-500 text-[15px]">Xabar yozing...</span>
              </div>
              <button onClick={() => setShowAddModal(true)} className="p-2.5 rounded-full hover:bg-gray-700">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>
            </div>
          </div>
        )}

        <ConfirmDialog
          isOpen={showDeleteDialog}
          title="Mijozni o'chirish"
          message={`${getDisplayName()} ni o'chirishni tasdiqlaysizmi?`}
          confirmLabel="O'chirish"
          cancelLabel="Bekor qilish"
          confirmVariant="danger"
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteDialog(false)}
          isLoading={isDeleting}
        />

        <AddConversationModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddConversation}
          isSubmitting={isSubmitting}
        />

        {showOrderForm && client && (
          <OrderForm
            clientId={client._id}
            onSuccess={() => { setShowOrderForm(false); loadData(); }}
            onCancel={() => setShowOrderForm(false)}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
