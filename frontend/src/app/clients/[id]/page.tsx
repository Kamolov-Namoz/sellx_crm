'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import ProtectedRoute from '@/components/ProtectedRoute';
import ConfirmDialog from '@/components/ConfirmDialog';
import Timeline from '@/components/Timeline';
import AddConversationModal from '@/components/AddConversationModal';
import { ClientDetailSkeleton } from '@/components/Skeleton';
import { useToast } from '@/contexts/ToastContext';
import { clientService } from '@/services/client.service';
import { conversationService } from '@/services/conversation.service';
import { Client, Conversation, STATUS_LABELS, ClientStatus, ConversationType } from '@/types';

const statusColors: Record<ClientStatus, string> = {
  interested: 'bg-blue-500',
  thinking: 'bg-yellow-500',
  callback: 'bg-purple-500',
  not_interested: 'bg-red-500',
  deal_closed: 'bg-green-500',
};

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    loadData();
  }, [params.id]);

  const loadData = async () => {
    try {
      const [clientRes, convRes] = await Promise.all([
        clientService.getClient(params.id as string),
        conversationService.getConversations(params.id as string),
      ]);
      setClient(clientRes.data ?? null);
      setConversations(convRes.data ?? []);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Ma\'lumotlarni yuklashda xatolik');
      router.push('/clients');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!client) return;
    
    setIsDeleting(true);
    try {
      await clientService.deleteClient(client._id);
      toast.success(`${client.fullName} o'chirildi`);
      router.push('/clients');
    } catch (error) {
      console.error('Failed to delete client:', error);
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
    nextFollowUpDate: string;
    metadata?: {
      fileName?: string;
      fileSize?: number;
      mimeType?: string;
    };
  }) => {
    if (!client) return;
    
    setIsSubmitting(true);
    try {
      const response = await conversationService.createConversation({
        clientId: client._id,
        type: data.type,
        content: data.content,
        summary: data.summary,
        nextFollowUpDate: new Date(data.nextFollowUpDate).toISOString(),
        metadata: data.metadata,
      });
      
      if (response.success && response.data) {
        // Add new conversation to the end (newest at bottom)
        setConversations([...conversations, response.data]);
        setClient({
          ...client,
          lastConversationSummary: data.summary,
          followUpDate: data.nextFollowUpDate,
        });
        toast.success('Suhbat qo\'shildi');
      }
    } catch (error) {
      console.error('Failed to add conversation:', error);
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
      console.error('Failed to delete conversation:', error);
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
        {/* Header - Telegram style */}
        {client && (
          <header className="bg-[#17212b] text-white sticky top-0 z-50 safe-top">
            <div className="flex items-center gap-3 px-4 py-3">
              <button
                onClick={() => router.back()}
                className="p-1 hover:bg-white/10 rounded-full transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              {/* Avatar */}
              <div className={`w-10 h-10 rounded-full ${statusColors[client.status]} flex items-center justify-center text-white font-semibold`}>
                {client.fullName.charAt(0).toUpperCase()}
              </div>
              
              {/* Info */}
              <div className="flex-1 min-w-0">
                <h1 className="font-semibold truncate">{client.fullName}</h1>
                <p className="text-xs text-gray-400 truncate">
                  {client.brandName ? `${client.brandName} • ` : ''}{STATUS_LABELS[client.status]}
                </p>
              </div>
              
              {/* Actions */}
              <button onClick={handleCall} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </button>
              
              <Link href={`/clients/${client._id}/edit`} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </Link>
            </div>
            
            {/* Client Info Bar */}
            <div className="px-4 pb-3 flex items-center gap-4 text-xs text-gray-400 overflow-x-auto">
              <span className="flex items-center gap-1 whitespace-nowrap">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {client.location}
              </span>
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
                  {format(new Date(client.followUpDate), 'd MMM, HH:mm', { locale: enUS })}
                </span>
              )}
            </div>
          </header>
        )}

        {/* Chat Area */}
        <main className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4">
              <ClientDetailSkeleton />
            </div>
          ) : client ? (
            <div 
              className="min-h-full p-4 pb-20"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                backgroundColor: '#0e1621'
              }}
            >
              {/* Last Summary Pinned */}
              {client.lastConversationSummary && (
                <div className="mb-4 bg-[#182533] rounded-lg p-3 border-l-4 border-primary-500">
                  <p className="text-xs text-gray-400 mb-1">📌 Oxirgi xulosa</p>
                  <p className="text-sm text-gray-200">{client.lastConversationSummary}</p>
                </div>
              )}

              {/* Notes */}
              {client.notes && (
                <div className="mb-4 bg-[#182533] rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">📝 Izohlar</p>
                  <p className="text-sm text-gray-200 whitespace-pre-wrap">{client.notes}</p>
                </div>
              )}

              {/* Timeline */}
              <Timeline conversations={conversations} onDelete={handleDeleteConversation} />
              
              {/* Meta Info */}
              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500">
                  Yaratilgan: {format(new Date(client.createdAt), 'd MMMM yyyy', { locale: enUS })}
                </p>
                <button
                  onClick={() => setShowDeleteDialog(true)}
                  className="mt-4 text-xs text-red-400 hover:text-red-300 transition-colors"
                >
                  Mijozni o'chirish
                </button>
              </div>
            </div>
          ) : null}
        </main>

        {/* Bottom Input Bar Trigger */}
        {client && !showAddModal && (
          <div className="fixed bottom-0 left-0 right-0 bg-[#17212b] safe-bottom z-40">
            <div 
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 p-2 cursor-pointer"
            >
              <button className="p-2.5 rounded-full hover:bg-gray-700 transition-colors">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </button>
              <div className="flex-1 bg-[#242f3d] rounded-2xl px-4 py-3">
                <span className="text-gray-500 text-[15px]">Xabar yozing...</span>
              </div>
              <button className="p-2.5 rounded-full hover:bg-gray-700 transition-colors">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Delete Confirmation */}
        <ConfirmDialog
          isOpen={showDeleteDialog}
          title="Mijozni o'chirish"
          message={`${client?.fullName} ni o'chirishni tasdiqlaysizmi? Bu amalni qaytarib bo'lmaydi.`}
          confirmLabel="O'chirish"
          cancelLabel="Bekor qilish"
          confirmVariant="danger"
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteDialog(false)}
          isLoading={isDeleting}
        />

        {/* Add Conversation Modal */}
        <AddConversationModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddConversation}
          isSubmitting={isSubmitting}
        />
      </div>
    </ProtectedRoute>
  );
}
