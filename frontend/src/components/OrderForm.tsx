'use client';

import { useState } from 'react';
import { orderService } from '@/services/order.service';
import { OrderStatus, ORDER_STATUS_LABELS } from '@/types';
import { useToast } from '@/contexts/ToastContext';

interface OrderFormProps {
  clientId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const STATUSES: OrderStatus[] = ['new', 'in_progress', 'completed'];

export default function OrderForm({ clientId, onSuccess, onCancel }: OrderFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState<OrderStatus>('new');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('Zakaz nomini kiriting');
      return;
    }

    setIsSubmitting(true);
    try {
      await orderService.createOrder({
        clientId,
        title: title.trim(),
        description: description.trim() || undefined,
        amount: amount ? parseFloat(amount) : undefined,
        status,
      });
      toast.success('Zakaz qo\'shildi');
      onSuccess();
    } catch {
      toast.error('Zakaz qo\'shishda xatolik');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-dark-800 rounded-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-dark-700">
          <h2 className="text-lg font-semibold text-white">Yangi zakaz</h2>
          <button onClick={onCancel} className="p-2 text-gray-400 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="label">Zakaz nomi *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Masalan: 10 dona mahsulot"
              className="input"
            />
          </div>

          <div>
            <label className="label">Tavsif (ixtiyoriy)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Qo'shimcha ma'lumot..."
              rows={3}
              className="input resize-none"
            />
          </div>

          <div>
            <label className="label">Summa (ixtiyoriy)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              min="0"
              className="input"
            />
          </div>

          <div>
            <label className="label">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as OrderStatus)}
              className="input"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 btn-secondary py-2.5"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 btn-primary py-2.5"
            >
              {isSubmitting ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
