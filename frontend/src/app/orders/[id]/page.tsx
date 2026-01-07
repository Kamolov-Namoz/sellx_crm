'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useToast } from '@/contexts/ToastContext';
import { orderService, Developer, TeamMember } from '@/services/order.service';
import { 
  Order, 
  Milestone,
  ORDER_STATUS_LABELS, 
  ORDER_STATUS_COLORS,
  MILESTONE_STATUS_LABELS,
  MILESTONE_STATUS_COLORS,
  MilestoneStatus
} from '@/types';

function OrderDetailContent() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadOrder = async () => {
    try {
      const res = await orderService.getOrder(params.id as string);
      if (res.success && res.data) {
        setOrder(res.data);
      }
    } catch {
      toast.error('Xatolik');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [params.id]);

  const handleDelete = async () => {
    if (!confirm('Loyihani o\'chirmoqchimisiz?')) return;
    setDeleting(true);
    try {
      await orderService.deleteOrder(params.id as string);
      toast.success('Loyiha o\'chirildi');
      router.push('/orders');
    } catch {
      toast.error('Xatolik');
    } finally {
      setDeleting(false);
    }
  };

  const handleMilestoneAction = async (milestoneId: string, currentStatus: MilestoneStatus) => {
    // Faqat completed -> paid o'tishga ruxsat beramiz
    if (currentStatus !== 'completed') {
      // Boshqa statuslar uchun faqat tracking sahifasiga o'tish
      router.push(`/orders/${params.id}/milestone/${milestoneId}`);
      return;
    }
    
    // Completed -> Paid
    try {
      await orderService.updateMilestoneStatus(params.id as string, milestoneId, 'paid');
      toast.success('To\'lov tasdiqlandi');
      loadOrder();
    } catch {
      toast.error('Xatolik');
    }
  };

  // Milestone'ga o'tish (in_progress yoki completed bo'lsa)
  const goToMilestoneTracking = (milestoneId: string) => {
    router.push(`/orders/${params.id}/milestone/${milestoneId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0e1621] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#0e1621] flex items-center justify-center">
        <p className="text-gray-500">Loyiha topilmadi</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0e1621] pb-20">
      {/* Header */}
      <header className="bg-[#17212b] text-white sticky top-0 z-50">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => router.back()} className="p-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1">
            <h1 className="font-semibold truncate">{order.title}</h1>
            <span className={`text-xs px-2 py-0.5 rounded ${ORDER_STATUS_COLORS[order.status]}`}>
              {ORDER_STATUS_LABELS[order.status]}
            </span>
          </div>
          <button onClick={() => setShowEdit(true)} className="p-2 text-primary-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button onClick={handleDelete} disabled={deleting} className="p-2 text-red-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </header>

      <main className="p-4 space-y-4">
        {/* Ma'lumotlar */}
        <div className="bg-dark-800 rounded-xl p-4">
          <h2 className="text-white font-semibold mb-3">Ma'lumotlar</h2>
          {order.description && <p className="text-gray-400 mb-3">{order.description}</p>}
          {order.amount && (
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Umumiy summa:</span>
              <span className="text-xl font-bold text-primary-400">{order.amount.toLocaleString()} so'm</span>
            </div>
          )}
          {order.progress !== undefined && (
            <div className="mt-3">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Progress</span>
                <span className="text-white">{order.progress}%</span>
              </div>
              <div className="w-full bg-dark-700 rounded-full h-2">
                <div className="bg-primary-500 h-2 rounded-full" style={{ width: `${order.progress}%` }} />
              </div>
            </div>
          )}
        </div>

        {/* Bosqichlar */}
        {order.milestones && order.milestones.length > 0 && (
          <div className="bg-dark-800 rounded-xl p-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-white font-semibold">To'lov bosqichlari</h2>
              {order.totalPaid !== undefined && order.amount && (
                <span className="text-sm text-primary-400">
                  {order.totalPaid.toLocaleString()} / {order.amount.toLocaleString()}
                </span>
              )}
            </div>
            <div className="space-y-3">
              {order.milestones.map((m, i) => {
                const nextStatus = getNextMilestoneStatus(m.status);
                const isClickable = m.status === 'in_progress' || m.status === 'completed';
                
                return (
                  <div 
                    key={m._id || i} 
                    className={`border rounded-lg p-3 ${
                      m.status === 'paid' ? 'border-purple-500/30 bg-purple-500/5' :
                      m.status === 'completed' ? 'border-green-500/30 bg-green-500/5' :
                      m.status === 'in_progress' ? 'border-blue-500/30 bg-blue-500/5' :
                      'border-dark-600'
                    } ${isClickable ? 'cursor-pointer' : ''}`}
                    onClick={() => isClickable && m._id && goToMilestoneTracking(m._id)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="text-white font-medium">{m.title}</h3>
                        <p className="text-sm text-primary-400">{m.amount.toLocaleString()} so'm ({m.percentage}%)</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Edit button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingMilestone(m);
                          }}
                          className="p-1.5 text-gray-400 hover:text-primary-400 transition"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <span className={`text-xs px-2 py-1 rounded ${MILESTONE_STATUS_COLORS[m.status]}`}>
                          {MILESTONE_STATUS_LABELS[m.status]}
                        </span>
                      </div>
                    </div>
                    {m.dueDate && (
                      <p className="text-xs text-gray-500 mb-2">Muddat: {new Date(m.dueDate).toLocaleDateString()}</p>
                    )}
                    {m.tasks && m.tasks.length > 0 && (
                      <div className="mb-2 space-y-1">
                        {m.tasks.map((t, ti) => (
                          <p key={ti} className="text-sm text-gray-400">• {t}</p>
                        ))}
                      </div>
                    )}
                    {nextStatus && m._id && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMilestoneAction(m._id!, m.status);
                        }}
                        className={`w-full py-2 rounded-lg text-sm ${
                          nextStatus.status === 'paid' ? 'bg-purple-500/20 text-purple-400' :
                          nextStatus.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}
                      >
                        {nextStatus.label}
                      </button>
                    )}
                    {/* Tracking link for active milestones */}
                    {isClickable && m._id && (
                      <p className="text-xs text-center text-gray-500 mt-2">
                        Batafsil ko'rish uchun bosing →
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Jamoa */}
        <div className="bg-dark-800 rounded-xl p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-white font-semibold">Loyiha jamoasi</h2>
            <button
              onClick={() => setShowTeamModal(true)}
              className="px-3 py-1.5 bg-primary-500/20 text-primary-400 rounded-lg text-sm flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Boshqarish
            </button>
          </div>

          {order.team && order.team.length > 0 ? (
            <div className="space-y-2">
              {order.team.map((member, index) => (
                <div 
                  key={member.developerId?._id || `team-${index}`} 
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    member.role === 'team_lead' ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-dark-700'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    member.role === 'team_lead' ? 'bg-yellow-500/30' : 'bg-primary-500/30'
                  }`}>
                    <span className={`text-sm font-medium ${
                      member.role === 'team_lead' ? 'text-yellow-400' : 'text-primary-400'
                    }`}>
                      {member.developerId.firstName?.[0]}{member.developerId.lastName?.[0]}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">
                      {member.developerId.firstName} {member.developerId.lastName}
                    </p>
                    <p className="text-xs text-gray-500">@{member.developerId.username}</p>
                  </div>
                  {member.role === 'team_lead' && (
                    <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs">
                      Team Lead
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="text-3xl mb-2">👥</div>
              <p className="text-gray-400 text-sm">Hali jamoa qo'shilmagan</p>
              <p className="text-gray-500 text-xs mt-1">"Boshqarish" tugmasini bosing</p>
            </div>
          )}
        </div>
      </main>

      {/* Edit Modal */}
      {showEdit && (
        <EditOrderModal 
          order={order} 
          onClose={() => setShowEdit(false)} 
          onSuccess={() => { setShowEdit(false); loadOrder(); }} 
        />
      )}

      {/* Edit Milestone Modal */}
      {editingMilestone && (
        <EditMilestoneModal 
          orderId={params.id as string}
          milestone={editingMilestone}
          onClose={() => setEditingMilestone(null)}
          onSuccess={() => { setEditingMilestone(null); loadOrder(); }}
        />
      )}

      {/* Team Management Modal */}
      {showTeamModal && (
        <TeamManagementModal
          orderId={params.id as string}
          currentTeam={order.team || []}
          teamLeadId={order.teamLeadId?._id}
          onClose={() => setShowTeamModal(false)}
          onSuccess={() => { setShowTeamModal(false); loadOrder(); }}
        />
      )}
    </div>
  );
}

function getNextMilestoneStatus(status: MilestoneStatus): { status: MilestoneStatus; label: string } | null {
  // Faqat completed bo'lganda "To'landi" tugmasini ko'rsatamiz
  // Boshqa statuslar avtomatik hisoblanadi
  if (status === 'completed') return { status: 'paid', label: 'To\'landi deb belgilash' };
  return null;
}

function EditOrderModal({ order, onClose, onSuccess }: { order: Order; onClose: () => void; onSuccess: () => void }) {
  const toast = useToast();
  const [title, setTitle] = useState(order.title);
  const [description, setDescription] = useState(order.description || '');
  const [amount, setAmount] = useState(order.amount?.toString() || '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Loyiha nomini kiriting');
      return;
    }
    setSaving(true);
    try {
      await orderService.updateOrder(order._id, {
        title: title.trim(),
        description: description.trim() || undefined,
        amount: amount ? parseFloat(amount) : undefined,
      });
      toast.success('Loyiha yangilandi');
      onSuccess();
    } catch {
      toast.error('Xatolik');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl" style={{ backgroundColor: '#1e2836' }}>
        <div className="flex justify-between items-center p-4" style={{ borderBottom: '1px solid #2d3848' }}>
          <h2 className="text-lg font-semibold text-white">Loyihani tahrirlash</h2>
          <button 
            onClick={onClose} 
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-white transition"
            style={{ backgroundColor: '#2d3848' }}
          >
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Loyiha nomi *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full rounded-lg px-3 py-2.5 text-white border-0 outline-none focus:ring-2 focus:ring-primary-500"
              style={{ backgroundColor: '#2d3848' }}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Tavsif</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-lg px-3 py-2.5 text-white resize-none border-0 outline-none focus:ring-2 focus:ring-primary-500"
              style={{ backgroundColor: '#2d3848' }}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Summa</label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full rounded-lg px-3 py-2.5 text-white border-0 outline-none focus:ring-2 focus:ring-primary-500"
              style={{ backgroundColor: '#2d3848' }}
            />
          </div>
          {/* Status avtomatik hisoblanadi - ko'rsatilmaydi */}
          <div className="bg-dark-700 rounded-lg p-3">
            <p className="text-xs text-gray-500">
              💡 Loyiha statusi avtomatik hisoblanadi: barcha vazifalar bajarilganda "Tugallangan" bo'ladi.
            </p>
          </div>
          <div className="flex gap-3 pt-2">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 py-2.5 rounded-lg text-white hover:opacity-80 transition"
              style={{ backgroundColor: '#2d3848' }}
            >
              Bekor
            </button>
            <button 
              type="submit" 
              disabled={saving} 
              className="flex-1 py-2.5 bg-primary-500 rounded-lg text-white hover:bg-primary-600 transition disabled:opacity-50"
            >
              {saving ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function OrderDetailPage() {
  return (
    <ProtectedRoute>
      <OrderDetailContent />
    </ProtectedRoute>
  );
}

// Edit Milestone Modal
function EditMilestoneModal({ 
  orderId,
  milestone, 
  onClose, 
  onSuccess 
}: { 
  orderId: string;
  milestone: Milestone; 
  onClose: () => void; 
  onSuccess: () => void;
}) {
  const toast = useToast();
  const [title, setTitle] = useState(milestone.title);
  const [description, setDescription] = useState(milestone.description || '');
  const [amount, setAmount] = useState(milestone.amount.toString());
  const [percentage, setPercentage] = useState(milestone.percentage.toString());
  const [dueDate, setDueDate] = useState(milestone.dueDate ? new Date(milestone.dueDate).toISOString().split('T')[0] : '');
  const [tasks, setTasks] = useState(milestone.tasks?.join('\n') || '');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Bosqich nomini kiriting');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Summani kiriting');
      return;
    }
    
    setSaving(true);
    try {
      await orderService.updateMilestone(orderId, milestone._id!, {
        title: title.trim(),
        description: description.trim() || undefined,
        amount: parseFloat(amount),
        percentage: parseFloat(percentage) || 0,
        dueDate: dueDate || null,
        tasks: tasks.trim() ? tasks.split('\n').filter(t => t.trim()) : [],
      });
      
      toast.success('Bosqich yangilandi');
      onSuccess();
    } catch {
      toast.error('Xatolik');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Bu bosqichni o\'chirmoqchimisiz?')) return;
    
    setDeleting(true);
    try {
      await orderService.deleteMilestone(orderId, milestone._id!);
      toast.success('Bosqich o\'chirildi');
      onSuccess();
    } catch {
      toast.error('Xatolik');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
      <div className="w-full sm:max-w-md max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl" style={{ backgroundColor: '#1e2836' }}>
        {/* Header */}
        <div className="flex justify-between items-center p-4" style={{ borderBottom: '1px solid #2d3848' }}>
          <h2 className="text-lg font-semibold text-white">Bosqichni tahrirlash</h2>
          <button 
            onClick={onClose} 
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-white transition"
            style={{ backgroundColor: '#2d3848' }}
          >
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto max-h-[70vh]">
          {/* Status - faqat ko'rsatish, o'zgartirish mumkin emas */}
          <div className="bg-dark-700 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Joriy status:</span>
              <span className={`text-xs px-2 py-1 rounded ${MILESTONE_STATUS_COLORS[milestone.status]}`}>
                {MILESTONE_STATUS_LABELS[milestone.status]}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              💡 Status avtomatik hisoblanadi: vazifalar bajarilganda "Bajarildi" bo'ladi.
            </p>
          </div>

          {/* Bosqich nomi */}
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Bosqich nomi *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full rounded-lg px-3 py-2.5 text-white border-0 outline-none focus:ring-2 focus:ring-primary-500"
              style={{ backgroundColor: '#2d3848' }}
            />
          </div>

          {/* Tavsif */}
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Tavsif</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              className="w-full rounded-lg px-3 py-2.5 text-white resize-none border-0 outline-none focus:ring-2 focus:ring-primary-500"
              style={{ backgroundColor: '#2d3848' }}
            />
          </div>

          {/* Summa va Foiz */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Summa *</label>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full rounded-lg px-3 py-2.5 text-white border-0 outline-none focus:ring-2 focus:ring-primary-500"
                style={{ backgroundColor: '#2d3848' }}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Foiz (%)</label>
              <input
                type="number"
                value={percentage}
                onChange={e => setPercentage(e.target.value)}
                min="0"
                max="100"
                className="w-full rounded-lg px-3 py-2.5 text-white border-0 outline-none focus:ring-2 focus:ring-primary-500"
                style={{ backgroundColor: '#2d3848' }}
              />
            </div>
          </div>

          {/* Muddat */}
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Muddat</label>
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="w-full rounded-lg px-3 py-2.5 text-white border-0 outline-none focus:ring-2 focus:ring-primary-500"
              style={{ backgroundColor: '#2d3848' }}
            />
          </div>

          {/* Vazifalar */}
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Vazifalar (har bir qator - bitta vazifa)</label>
            <textarea
              value={tasks}
              onChange={e => setTasks(e.target.value)}
              rows={3}
              placeholder="Loyihani boshlash&#10;Tahlil qilish&#10;Dizayn yaratish"
              className="w-full rounded-lg px-3 py-2.5 text-white resize-none border-0 outline-none focus:ring-2 focus:ring-primary-500 placeholder-gray-500"
              style={{ backgroundColor: '#2d3848' }}
            />
          </div>
          
          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button 
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-3 bg-red-500/20 text-red-400 rounded-xl font-medium hover:bg-red-500/30 transition"
            >
              {deleting ? '...' : 'O\'chirish'}
            </button>
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 py-3 rounded-xl text-white font-medium hover:opacity-80 transition"
              style={{ backgroundColor: '#2d3848' }}
            >
              Bekor
            </button>
            <button 
              type="submit" 
              disabled={saving}
              className="flex-1 py-3 bg-primary-500 rounded-xl text-white font-medium disabled:opacity-50 hover:bg-primary-600 transition"
            >
              {saving ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


// Team Management Modal
function TeamManagementModal({ 
  orderId,
  currentTeam,
  teamLeadId,
  onClose, 
  onSuccess 
}: { 
  orderId: string;
  currentTeam: { developerId: { _id: string; firstName: string; lastName: string; username: string }; role: string; joinedAt: string }[];
  teamLeadId?: string;
  onClose: () => void; 
  onSuccess: () => void;
}) {
  const toast = useToast();
  const [allDevelopers, setAllDevelopers] = useState<Developer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddDev, setShowAddDev] = useState(false);

  useEffect(() => {
    loadDevelopers();
  }, []);

  const loadDevelopers = async () => {
    try {
      const res = await orderService.getDevelopers();
      if (res.success && res.data) {
        setAllDevelopers(res.data);
      }
    } catch {
      toast.error('Xatolik');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (developerId: string) => {
    setSaving(true);
    try {
      await orderService.addTeamMember(orderId, developerId);
      toast.success('Dasturchi qo\'shildi');
      onSuccess();
    } catch {
      toast.error('Xatolik');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveMember = async (developerId: string) => {
    if (!confirm('Dasturchini jamoadan olib tashlamoqchimisiz?')) return;
    setSaving(true);
    try {
      await orderService.removeTeamMember(orderId, developerId);
      toast.success('Dasturchi olib tashlandi');
      onSuccess();
    } catch {
      toast.error('Xatolik');
    } finally {
      setSaving(false);
    }
  };

  const handleSetTeamLead = async (developerId: string) => {
    setSaving(true);
    try {
      await orderService.setTeamLead(orderId, developerId);
      toast.success('Team Lead tayinlandi');
      onSuccess();
    } catch {
      toast.error('Xatolik');
    } finally {
      setSaving(false);
    }
  };

  // Jamoada bo'lmagan dasturchilar
  const teamMemberIds = currentTeam.map(m => m.developerId._id);
  const availableDevelopers = allDevelopers.filter(d => !teamMemberIds.includes(d._id));

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
      <div className="w-full sm:max-w-md max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl" style={{ backgroundColor: '#1e2836' }}>
        <div className="flex justify-between items-center p-4" style={{ borderBottom: '1px solid #2d3848' }}>
          <h2 className="text-lg font-semibold text-white">Jamoani boshqarish</h2>
          <button 
            onClick={onClose} 
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-white transition"
            style={{ backgroundColor: '#2d3848' }}
          >
            ✕
          </button>
        </div>
        
        <div className="p-4 space-y-4 overflow-y-auto max-h-[70vh]">
          {/* Joriy jamoa */}
          <div>
            <h3 className="text-sm text-gray-400 mb-2">Joriy jamoa ({currentTeam.length})</h3>
            {currentTeam.length > 0 ? (
              <div className="space-y-2">
                {currentTeam.map((member) => (
                  <div 
                    key={member.developerId._id} 
                    className={`flex items-center gap-3 p-3 rounded-xl ${
                      member.role === 'team_lead' ? 'bg-yellow-500/10 border border-yellow-500/30' : ''
                    }`}
                    style={{ backgroundColor: member.role !== 'team_lead' ? '#2d3848' : undefined }}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      member.role === 'team_lead' ? 'bg-yellow-500/30' : 'bg-primary-500/30'
                    }`}>
                      <span className={`text-sm font-medium ${
                        member.role === 'team_lead' ? 'text-yellow-400' : 'text-primary-400'
                      }`}>
                        {member.developerId.firstName?.[0]}{member.developerId.lastName?.[0]}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">
                        {member.developerId.firstName} {member.developerId.lastName}
                      </p>
                      <p className="text-xs text-gray-500">@{member.developerId.username}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {member.role !== 'team_lead' && (
                        <button
                          onClick={() => handleSetTeamLead(member.developerId._id)}
                          disabled={saving}
                          className="p-2 text-yellow-400 hover:bg-yellow-500/20 rounded-lg transition"
                          title="Team Lead qilish"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        </button>
                      )}
                      {member.role === 'team_lead' && (
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs mr-1">
                          Lead
                        </span>
                      )}
                      <button
                        onClick={() => handleRemoveMember(member.developerId._id)}
                        disabled={saving}
                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition"
                        title="Olib tashlash"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm text-center py-4">Jamoa bo'sh</p>
            )}
          </div>

          {/* Dasturchi qo'shish */}
          <div>
            <button
              onClick={() => setShowAddDev(!showAddDev)}
              className="w-full flex items-center justify-between p-3 rounded-xl text-sm"
              style={{ backgroundColor: '#2d3848' }}
            >
              <span className="text-primary-400 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Dasturchi qo'shish
              </span>
              <svg className={`w-4 h-4 text-gray-400 transition ${showAddDev ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showAddDev && (
              <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
                {loading ? (
                  <div className="flex justify-center py-4">
                    <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : availableDevelopers.length > 0 ? (
                  availableDevelopers.map(dev => (
                    <button
                      key={dev._id}
                      onClick={() => handleAddMember(dev._id)}
                      disabled={saving}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-primary-500/10 transition"
                      style={{ backgroundColor: '#3a4556' }}
                    >
                      <div className="w-8 h-8 bg-gray-500/30 rounded-full flex items-center justify-center">
                        <span className="text-gray-400 text-xs">{dev.firstName?.[0]}{dev.lastName?.[0]}</span>
                      </div>
                      <div className="text-left flex-1">
                        <p className="text-white text-sm">{dev.firstName} {dev.lastName}</p>
                        <p className="text-xs text-gray-500">@{dev.username}</p>
                      </div>
                      <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm text-center py-4">Barcha dasturchilar jamoada</p>
                )}
              </div>
            )}
          </div>
          
          {/* Close button */}
          <button 
            onClick={onClose} 
            className="w-full py-3 rounded-xl text-white font-medium hover:opacity-80 transition"
            style={{ backgroundColor: '#2d3848' }}
          >
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
}
