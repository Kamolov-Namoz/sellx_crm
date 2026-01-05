'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useToast } from '@/contexts/ToastContext';
import { orderService } from '@/services/order.service';
import { projectTaskService, ProjectTask, MilestoneProgress } from '@/services/projectTask.service';
import { Order, Milestone, MILESTONE_STATUS_LABELS, MILESTONE_STATUS_COLORS, MilestoneStatus } from '@/types';

function MilestoneTrackingContent() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [milestone, setMilestone] = useState<Milestone | null>(null);
  const [progress, setProgress] = useState<MilestoneProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterDev, setFilterDev] = useState<string>('all');
  
  // Modal states
  const [showAddTask, setShowAddTask] = useState(false);
  const [editingTask, setEditingTask] = useState<ProjectTask | null>(null);

  const loadData = async () => {
    try {
      const orderRes = await orderService.getOrder(params.id as string);
      if (orderRes.success && orderRes.data) {
        setOrder(orderRes.data);
        const m = orderRes.data.milestones?.find(m => m._id === params.milestoneId);
        setMilestone(m || null);
      }
      
      const progressRes = await projectTaskService.getByMilestone(
        params.id as string, 
        params.milestoneId as string
      );
      if (progressRes.success && progressRes.data) {
        setProgress(progressRes.data);
      }
    } catch {
      toast.error('Ma\'lumotlarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [params.id, params.milestoneId]);

  const handleStatusChange = async (newStatus: MilestoneStatus) => {
    try {
      await orderService.updateMilestoneStatus(params.id as string, params.milestoneId as string, newStatus);
      toast.success('Status yangilandi');
      loadData();
    } catch {
      toast.error('Xatolik');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0e1621] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order || !milestone) {
    return (
      <div className="min-h-screen bg-[#0e1621] flex items-center justify-center">
        <p className="text-gray-500">Bosqich topilmadi</p>
      </div>
    );
  }

  // Statistikalar
  const allTasks = progress?.tasks || [];
  const filteredTasks = filterDev === 'all' 
    ? allTasks 
    : allTasks.filter(t => (t.developerId as { _id: string })?._id === filterDev);
  
  const inProgressTasks = filteredTasks.filter(t => t.status === 'in_progress' && !t.isAccepted);
  const completedTasks = filteredTasks.filter(t => t.isAccepted || t.status === 'completed');

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
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold truncate">{milestone.title}</h1>
            <p className="text-xs text-gray-400 truncate">{order.title}</p>
          </div>
          <span className={`text-xs px-2 py-1 rounded whitespace-nowrap ${MILESTONE_STATUS_COLORS[milestone.status]}`}>
            {MILESTONE_STATUS_LABELS[milestone.status]}
          </span>
        </div>
      </header>

      <main className="p-4 space-y-4">
        {/* Progress Card */}
        <div className="bg-dark-800 rounded-xl p-4">
          <div className="flex items-center gap-4">
            {/* Circular Progress */}
            <div className="relative w-20 h-20 flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="40" cy="40" r="34" stroke="#1e293b" strokeWidth="8" fill="none" />
                <circle 
                  cx="40" cy="40" r="34" 
                  stroke="#3b82f6" 
                  strokeWidth="8" 
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${(progress?.avgProgress || 0) * 2.14} 214`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-white">{progress?.avgProgress || 0}%</span>
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <p className="text-lg font-bold text-primary-400">{milestone.amount.toLocaleString()} so'm</p>
              <p className="text-sm text-gray-400">{milestone.percentage}% • {progress?.totalTasks || 0} vazifa</p>
              {milestone.dueDate && (
                <p className="text-xs text-gray-500 mt-1">
                  Muddat: {new Date(milestone.dueDate).toLocaleDateString('uz-UZ')}
                </p>
              )}
            </div>

            {/* Status Action */}
            {milestone.status === 'in_progress' && (
              <button
                onClick={() => handleStatusChange('completed')}
                className="px-3 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm"
              >
                ✓ Bajarildi
              </button>
            )}
            {milestone.status === 'completed' && (
              <button
                onClick={() => handleStatusChange('paid')}
                className="px-3 py-2 bg-purple-500/20 text-purple-400 rounded-lg text-sm"
              >
                💰 To'landi
              </button>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-dark-800 rounded-xl p-3 text-center">
            <div className="text-xl font-bold text-blue-400">{inProgressTasks.length}</div>
            <div className="text-xs text-gray-500">Jarayonda</div>
          </div>
          <div className="bg-dark-800 rounded-xl p-3 text-center">
            <div className="text-xl font-bold text-green-400">{completedTasks.length}</div>
            <div className="text-xs text-gray-500">Bajarildi</div>
          </div>
        </div>

        {/* Filter & Add */}
        <div className="flex gap-2">
          {/* Developer Filter */}
          <select
            value={filterDev}
            onChange={e => setFilterDev(e.target.value)}
            className="flex-1 bg-dark-800 rounded-xl px-3 py-3 text-white text-sm"
          >
            <option value="all">Barcha dasturchilar</option>
            {order.team?.map(member => (
              <option key={member.developerId._id} value={member.developerId._id}>
                {member.developerId.firstName} {member.developerId.lastName}
                {member.role === 'team_lead' ? ' (Lead)' : ''}
              </option>
            ))}
          </select>
          
          {/* Add Task Button */}
          <button
            onClick={() => setShowAddTask(true)}
            className="px-4 py-3 bg-primary-500 text-white rounded-xl flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">Vazifa</span>
          </button>
        </div>

        {/* Tasks List */}
        {filteredTasks.length > 0 ? (
          <div className="space-y-3">
            {/* In Progress */}
            {inProgressTasks.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-blue-400 mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
                  Jarayonda
                </h3>
                <div className="space-y-2">
                  {inProgressTasks.map(task => (
                    <TaskCard key={task._id} task={task} onUpdate={loadData} onEdit={setEditingTask} />
                  ))}
                </div>
              </div>
            )}

            {/* Completed */}
            {completedTasks.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-green-400 mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  Bajarildi
                </h3>
                <div className="space-y-2">
                  {completedTasks.map(task => (
                    <TaskCard key={task._id} task={task} onUpdate={loadData} onEdit={setEditingTask} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-dark-800 rounded-xl p-8 text-center">
            <div className="text-4xl mb-3">📋</div>
            <p className="text-gray-400">Hali vazifa qo'shilmagan</p>
            <p className="text-sm text-gray-500 mt-1">Yuqoridagi "+" tugmasini bosing</p>
          </div>
        )}
      </main>

      {/* Add Task Modal */}
      {showAddTask && (
        <AddTaskModal
          projectId={params.id as string}
          milestoneId={params.milestoneId as string}
          teamMembers={order.team || []}
          onClose={() => setShowAddTask(false)}
          onSuccess={() => { setShowAddTask(false); loadData(); }}
        />
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <EditTaskModal
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSuccess={() => { setEditingTask(null); loadData(); }}
        />
      )}
    </div>
  );
}

// Task Card Component
function TaskCard({ task, onUpdate, onEdit }: { task: ProjectTask; onUpdate: () => void; onEdit: (task: ProjectTask) => void }) {
  const toast = useToast();
  const dev = task.developerId as { _id: string; firstName: string; lastName: string };
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Vazifani o\'chirmoqchimisiz?')) return;
    setDeleting(true);
    try {
      await projectTaskService.delete(task._id);
      toast.success('Vazifa o\'chirildi');
      onUpdate();
    } catch {
      toast.error('Xatolik');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className={`bg-dark-800 rounded-xl p-4 border-l-4 ${
      task.isAccepted ? 'border-green-500' :
      task.status === 'in_progress' ? 'border-blue-500' :
      'border-gray-600'
    }`}>
      <div className="flex items-start gap-3">
        {/* Status Icon */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          task.isAccepted ? 'bg-green-500/20' :
          task.status === 'in_progress' ? 'bg-blue-500/20' :
          'bg-gray-500/20'
        }`}>
          {task.isAccepted ? (
            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : task.status === 'in_progress' ? (
            <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <div className="w-3 h-3 bg-gray-400 rounded-full" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-white font-medium">{task.title}</h3>
          {task.description && (
            <p className="text-sm text-gray-400 mt-1 line-clamp-2">{task.description}</p>
          )}
          
          {/* Developer & Progress */}
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 bg-primary-500/30 rounded-full flex items-center justify-center">
                <span className="text-primary-400 text-xs">{dev?.firstName?.[0]}</span>
              </div>
              <span className="text-xs text-gray-400">{dev?.firstName} {dev?.lastName}</span>
            </div>
            <span className="text-xs text-gray-500">•</span>
            <span className="text-xs text-gray-500">{task.progress}%</span>
          </div>

          {/* Progress Bar */}
          <div className="mt-2">
            <div className="w-full bg-dark-700 rounded-full h-1.5">
              <div 
                className={`h-1.5 rounded-full transition-all ${
                  task.isAccepted ? 'bg-green-500' : 'bg-blue-500'
                }`}
                style={{ width: `${task.progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-1">
          {/* Edit Button */}
          <button
            onClick={() => onEdit(task)}
            className="p-2 text-gray-500 hover:text-primary-400 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          
          {/* Delete Button */}
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-2 text-gray-500 hover:text-red-400 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// Add Task Modal - faqat loyiha jamoasidagi dasturchilardan tanlash
function AddTaskModal({ 
  projectId, 
  milestoneId, 
  teamMembers,
  onClose, 
  onSuccess 
}: { 
  projectId: string;
  milestoneId: string;
  teamMembers: { developerId: { _id: string; firstName: string; lastName: string; username: string }; role: string }[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const toast = useToast();
  const [selectedDev, setSelectedDev] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!selectedDev || !title.trim()) {
      toast.error('Dasturchi va vazifa nomini kiriting');
      return;
    }
    
    setSaving(true);
    try {
      await projectTaskService.create({
        projectId,
        milestoneId,
        developerId: selectedDev,
        title: title.trim(),
        description: description.trim() || undefined,
      });
      toast.success('Vazifa qo\'shildi');
      onSuccess();
    } catch {
      toast.error('Xatolik');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
      <div className="w-full sm:max-w-md max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl" style={{ backgroundColor: '#1e2836' }}>
        <div className="flex justify-between items-center p-4" style={{ borderBottom: '1px solid #2d3848' }}>
          <h2 className="text-lg font-semibold text-white">Vazifa qo'shish</h2>
          <button 
            onClick={onClose} 
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-white transition"
            style={{ backgroundColor: '#2d3848' }}
          >
            ✕
          </button>
        </div>
        
        <div className="p-4 space-y-4 overflow-y-auto max-h-[70vh]">
          {/* Vazifa nomi */}
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Vazifa nomi *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Masalan: Login sahifasini yaratish"
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
              placeholder="Qo'shimcha ma'lumot..."
              rows={2}
              className="w-full rounded-lg px-3 py-2.5 text-white resize-none border-0 outline-none focus:ring-2 focus:ring-primary-500"
              style={{ backgroundColor: '#2d3848' }}
            />
          </div>

          {/* Dasturchi tanlash - faqat jamoadagilar */}
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Dasturchi *</label>
            
            {teamMembers.length > 0 ? (
              <div className="space-y-2">
                {teamMembers.map(member => (
                  <button
                    key={member.developerId._id}
                    type="button"
                    onClick={() => setSelectedDev(member.developerId._id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition ${
                      selectedDev === member.developerId._id 
                        ? 'ring-2 ring-primary-500' 
                        : ''
                    }`}
                    style={{ backgroundColor: selectedDev === member.developerId._id ? 'rgba(59,130,246,0.2)' : '#2d3848' }}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      member.role === 'team_lead' ? 'bg-yellow-500/30' : 'bg-primary-500/30'
                    }`}>
                      <span className={`text-sm ${
                        member.role === 'team_lead' ? 'text-yellow-400' : 'text-primary-400'
                      }`}>
                        {member.developerId.firstName?.[0]}{member.developerId.lastName?.[0]}
                      </span>
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-white text-sm">{member.developerId.firstName} {member.developerId.lastName}</p>
                      <p className="text-xs text-gray-500">@{member.developerId.username}</p>
                    </div>
                    {member.role === 'team_lead' && (
                      <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs">
                        Lead
                      </span>
                    )}
                    {selectedDev === member.developerId._id && (
                      <svg className="w-5 h-5 text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 rounded-xl" style={{ backgroundColor: '#2d3848' }}>
                <div className="text-3xl mb-2">👥</div>
                <p className="text-gray-400 text-sm">Jamoa bo'sh</p>
                <p className="text-gray-500 text-xs mt-1">Avval loyihaga dasturchilar qo'shing</p>
              </div>
            )}
          </div>
          
          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button 
              onClick={onClose} 
              className="flex-1 py-3 rounded-xl text-white font-medium hover:opacity-80 transition"
              style={{ backgroundColor: '#2d3848' }}
            >
              Bekor
            </button>
            <button 
              onClick={handleSubmit} 
              disabled={saving || !selectedDev || !title.trim()}
              className="flex-1 py-3 bg-primary-500 rounded-xl text-white font-medium disabled:opacity-50 hover:bg-primary-600 transition"
            >
              {saving ? 'Saqlanmoqda...' : 'Qo\'shish'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MilestoneTrackingPage() {
  return (
    <ProtectedRoute>
      <MilestoneTrackingContent />
    </ProtectedRoute>
  );
}

// Edit Task Modal
function EditTaskModal({ 
  task,
  onClose, 
  onSuccess 
}: { 
  task: ProjectTask;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const toast = useToast();
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [status, setStatus] = useState(task.status);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Vazifa nomini kiriting');
      return;
    }
    
    setSaving(true);
    try {
      await projectTaskService.update(task._id, {
        title: title.trim(),
        description: description.trim() || undefined,
        status,
      });
      toast.success('Vazifa yangilandi');
      onSuccess();
    } catch {
      toast.error('Xatolik');
    } finally {
      setSaving(false);
    }
  };

  const dev = task.developerId as { firstName: string; lastName: string };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
      <div className="w-full sm:max-w-md rounded-2xl shadow-2xl" style={{ backgroundColor: '#1e2836' }}>
        <div className="flex justify-between items-center p-4" style={{ borderBottom: '1px solid #2d3848' }}>
          <h2 className="text-lg font-semibold text-white">Vazifani tahrirlash</h2>
          <button 
            onClick={onClose} 
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-white transition"
            style={{ backgroundColor: '#2d3848' }}
          >
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Dasturchi (faqat ko'rsatish) */}
          <div className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: '#2d3848' }}>
            <div className="w-10 h-10 bg-primary-500/30 rounded-full flex items-center justify-center">
              <span className="text-primary-400">{dev?.firstName?.[0]}{dev?.lastName?.[0]}</span>
            </div>
            <div>
              <p className="text-white text-sm">{dev?.firstName} {dev?.lastName}</p>
              <p className="text-xs text-gray-500">Dasturchi</p>
            </div>
          </div>

          {/* Vazifa nomi */}
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Vazifa nomi *</label>
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
              rows={3}
              className="w-full rounded-lg px-3 py-2.5 text-white resize-none border-0 outline-none focus:ring-2 focus:ring-primary-500"
              style={{ backgroundColor: '#2d3848' }}
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Status</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setStatus('in_progress')}
                className={`py-2.5 rounded-lg text-sm font-medium transition ${
                  status === 'in_progress' 
                    ? 'bg-blue-500/30 text-blue-300 ring-2 ring-blue-500' 
                    : 'text-gray-400'
                }`}
                style={{ backgroundColor: status === 'in_progress' ? undefined : '#2d3848' }}
              >
                Jarayonda
              </button>
              <button
                type="button"
                onClick={() => setStatus('completed')}
                className={`py-2.5 rounded-lg text-sm font-medium transition ${
                  status === 'completed' 
                    ? 'bg-green-500/30 text-green-300 ring-2 ring-green-500' 
                    : 'text-gray-400'
                }`}
                style={{ backgroundColor: status === 'completed' ? undefined : '#2d3848' }}
              >
                Bajarildi
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              * Dasturchi o'zi ham statusni o'zgartirishi mumkin
            </p>
          </div>
          
          {/* Buttons */}
          <div className="flex gap-3 pt-2">
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
              disabled={saving || !title.trim()}
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
