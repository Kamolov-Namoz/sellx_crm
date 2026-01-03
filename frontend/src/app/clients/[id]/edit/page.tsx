'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import ClientForm from '@/components/ClientForm';
import { useToast } from '@/contexts/ToastContext';
import { clientService } from '@/services/client.service';
import { Client, ClientFormData } from '@/types';

export default function EditClientPage() {
  const params = useParams();
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    loadClient();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const loadClient = async () => {
    try {
      const response = await clientService.getClient(params.id as string);
      if (response.data) {
        setClient(response.data);
      } else {
        toast.error('Mijoz topilmadi');
        router.push('/clients');
      }
    } catch (error) {
      console.error('Failed to load client:', error);
      toast.error('Mijoz topilmadi');
      router.push('/clients');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: ClientFormData) => {
    if (!client) return;
    
    setIsSubmitting(true);
    try {
      await clientService.updateClient(client._id, data);
      toast.success('Mijoz muvaffaqiyatli yangilandi!');
      router.push(`/clients/${client._id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Xatolik yuz berdi';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="page-container pb-20">
        <Header />
        
        <main className="p-4">
          {/* Back Button */}
          <div className="mb-4">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Orqaga
            </button>
          </div>

          <h1 className="text-xl font-bold text-white mb-4">Mijozni tahrirlash</h1>

          <div className="card animate-slide-up">
            {isLoading ? (
              <div className="space-y-4 animate-pulse">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-12 bg-[#242f3d] rounded-xl" />
                ))}
              </div>
            ) : client ? (
              <ClientForm
                initialData={{
                  fullName: client.fullName,
                  phoneNumber: client.phoneNumber,
                  location: client.location,
                  brandName: client.brandName,
                  notes: client.notes,
                  status: client.status,
                  followUpDate: client.followUpDate,
                }}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                submitLabel="Saqlash"
                autoDetectLocation={false}
              />
            ) : null}
          </div>
        </main>

        <BottomNav />
      </div>
    </ProtectedRoute>
  );
}
