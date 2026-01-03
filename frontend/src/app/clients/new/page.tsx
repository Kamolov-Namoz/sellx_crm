'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import ClientForm from '@/components/ClientForm';
import { useToast } from '@/contexts/ToastContext';
import { clientService } from '@/services/client.service';
import { ClientFormData } from '@/types';

export default function NewClientPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const handleSubmit = async (data: ClientFormData) => {
    setIsSubmitting(true);
    try {
      await clientService.createClient(data);
      toast.success('Mijoz muvaffaqiyatli qo\'shildi!');
      router.push('/clients');
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

          <h1 className="text-xl font-bold text-white mb-4">Yangi mijoz</h1>

          <div className="card animate-slide-up">
            <ClientForm
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              submitLabel="Qo'shish"
            />
          </div>
        </main>

        <BottomNav />
      </div>
    </ProtectedRoute>
  );
}
