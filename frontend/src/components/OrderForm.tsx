'use client';

import { useState } from 'react';
import { orderService } from '@/services/order.service';
import { OrderStatus, ORDER_STATUS_LABELS, Milestone } from '@/types';
import { useToast } from '@/contexts/ToastContext';

interface OrderFormProps {
  clientId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const STATUSES: OrderStatus[] = ['new', 'in_progress', 'completed'];

const DEFAULT_MILESTONES: Partial<Milestone>[] = [
  { title: 'Avans to\'lov', percentage: 30, tasks: ['Loyihani boshlash', 'Tahlil qilish'] },
  { title: 'O\'rta bosqich', percentage: 40, tasks: ['Asosiy ishlarni bajarish'] },
  { title: 'Yakuniy to\'lov', percentage: 30, tasks: ['Sinovdan o\'tkazish', 'Topshirish'] },
];

export default function OrderForm({ clientId, onSuccess, onCancel }: OrderFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState<OrderStatus>('new');
  const [useMilestones, setUseMilestones] = useState(false);
  const [milestones, setMilestones] = useState<Partial<Milestone>[]>(DEFAULT_MILESTONES);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const totalAmount = parseFloat(amount) || 0;
  const totalPercentage = milestones.reduce((sum, m) => sum + (m.percentage || 0), 0);

  const updateMilestone = (index: number, field: keyof Milestone, value: any) => {
    setMilestones(prev => prev.map((m, i) => i === index ? { ...m, [field]: value } : m));
  };

  const addMilestone = () => {
    setMilestones(prev => [...prev, { title: '', percentage: 0, tasks: [] }]);
  };

  const removeMilestone = (index: number) => {
    setMilestones(prev => prev.filter((_, i) => i !== index));
  };

  const addTask = (milestoneIndex: number) => {
    setMilestones(prev => prev.map((m, i) => 
      i === milestoneIndex ? { ...m, tasks: [...(m.tasks || []), ''] } : m
    ));
  };

  const updateTask = (milestoneIndex: number, taskIndex: number, value: string) => {
    setMilestones(prev => prev.map((m, i) => 
      i === milestoneIndex ? { 
        ...m, 
        tasks: m.tasks?.map((t, ti) => ti === taskIndex ? value : t) 
      } : m
    ));
  };

  const removeTask = (milestoneIndex: number, taskIndex: number) => {
    setMilestones(prev => prev.map((m, i) => 
      i === milestoneIndex ? { ...m, tasks: m.tasks?.filter((_, ti) => ti !== taskIndex) } : m
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { toast.error('Loyiha nomini kiriting'); return; }
    if (useMilestones && totalPercentage !== 100) { toast.error('Bosqichlar foizi 100% bo\'lishi kerak'); return; }

    setIsSubmitting(true);
    try {
      const orderData: any = {
        clientId,
        title: title.trim(),
        description: description.trim() || undefined,
        amount: totalAmount || undefined,
        status,
      };

      if (useMilestones && milestones.length > 0) {
        orderData.milestones = milestones.map(m => ({
          title: m.title,
          description: m.description,
          amount: Math.round((totalAmount * (m.percentage || 0)) / 100),
          percentage: m.percentage,
          dueDate: m.dueDate,
          status: 'pending',
          tasks: m.tasks?.filter(t => t.trim()),
        }));
      }

      await orderService.createOrder(orderData);
      toast.success('Loyiha qo\'shildi');
      onSuccess();
    } catch { toast.error('Loyiha qo\'shishda xatolik'); }
    finally { setIsSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-dark-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-dark-700 sticky top-0 bg-dark-800 z-10">
          <h2 className="text-lg font-semibold text-white">Yangi loyiha</h2>
          <button onClick={onCancel} className="p-2 text-gray-400 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="label">Loyiha nomi *</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Masalan: Veb-sayt yaratish" className="input" />
          </div>

          <div>
            <label className="label">Tavsif</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Qo'shimcha ma'lumot..." rows={2} className="input resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Umumiy summa</label>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" min="0" className="input" />
            </div>
            <div>
              <label className="label">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as OrderStatus)} className="input">
                {STATUSES.map((s) => (<option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>))}
              </select>
            </div>
          </div>

          {/* Bosqichlar toggle */}
          <div className="flex items-center justify-between p-3 bg-dark-700 rounded-lg">
            <div>
              <p className="text-white font-medium">To'lovni bosqichlarga bo'lish</p>
              <p className="text-xs text-gray-400">Avans, o'rta va yakuniy to'lovlar</p>
            </div>
            <button type="button" onClick={() => setUseMilestones(!useMilestones)} className={`w-12 h-6 rounded-full transition-colors ${useMilestones ? 'bg-primary-500' : 'bg-dark-600'}`}>
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${useMilestones ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>

          {/* Bosqichlar */}
          {useMilestones && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400">Bosqichlar ({totalPercentage}%)</p>
                {totalPercentage !== 100 && <p className="text-xs text-red-400">100% bo'lishi kerak</p>}
              </div>

              {milestones.map((milestone, mIndex) => (
                <div key={mIndex} className="bg-dark-700 rounded-lg p-3 space-y-3">
                  <div className="flex items-start gap-2">
                    <div className="flex-1 space-y-2">
                      <input type="text" value={milestone.title || ''} onChange={(e) => updateMilestone(mIndex, 'title', e.target.value)} placeholder="Bosqich nomi" className="input text-sm py-2" />
                      <div className="grid grid-cols-2 gap-2">
                        <div className="relative">
                          <input type="number" value={milestone.percentage || ''} onChange={(e) => updateMilestone(mIndex, 'percentage', parseInt(e.target.value) || 0)} placeholder="%" min="0" max="100" className="input text-sm py-2 pr-8" />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">%</span>
                        </div>
                        <input type="date" value={milestone.dueDate || ''} onChange={(e) => updateMilestone(mIndex, 'dueDate', e.target.value)} className="input text-sm py-2" />
                      </div>
                      {totalAmount > 0 && milestone.percentage && (
                        <p className="text-xs text-primary-400">{Math.round((totalAmount * milestone.percentage) / 100).toLocaleString()} so'm</p>
                      )}
                    </div>
                    {milestones.length > 1 && (
                      <button type="button" onClick={() => removeMilestone(mIndex)} className="p-1 text-gray-500 hover:text-red-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    )}
                  </div>

                  {/* Vazifalar */}
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500">Bajariladigan ishlar:</p>
                    {milestone.tasks?.map((task, tIndex) => (
                      <div key={tIndex} className="flex items-center gap-2">
                        <input type="text" value={task} onChange={(e) => updateTask(mIndex, tIndex, e.target.value)} placeholder="Vazifa..." className="flex-1 bg-dark-600 rounded px-2 py-1 text-sm text-white" />
                        <button type="button" onClick={() => removeTask(mIndex, tIndex)} className="text-gray-500 hover:text-red-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    ))}
                    <button type="button" onClick={() => addTask(mIndex)} className="text-xs text-primary-400 hover:text-primary-300">+ Vazifa qo'shish</button>
                  </div>
                </div>
              ))}

              <button type="button" onClick={addMilestone} className="w-full py-2 border border-dashed border-dark-600 rounded-lg text-gray-400 hover:border-primary-500 hover:text-primary-400 text-sm">+ Bosqich qo'shish</button>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onCancel} className="flex-1 btn-secondary py-2.5">Bekor qilish</button>
            <button type="submit" disabled={isSubmitting} className="flex-1 btn-primary py-2.5">{isSubmitting ? 'Saqlanmoqda...' : 'Saqlash'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
