'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '@/contexts/AuthContext';
import { adminService } from '@/services/admin.service';
import { projectTaskService } from '@/services/projectTask.service';
import { 
  Order, 
  ORDER_STATUS_LABELS, 
  ORDER_STATUS_COLORS,
  MILESTONE_STATUS_LABELS,
  MILESTONE_STATUS_COLORS,
} from '@/types';

interface ProjectTask {
  _id: string;
  title: string;
  description?: string;
  status: string;
  progress: number;
  isAccepted: boolean;
  developerId?: string | {
    _id: string;
    firstName: string;
    lastName: string;
    username: string;
  };
  createdAt: string;
  acceptedAt?: string;
}

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAdmin } = useAuth();
  const toast = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'team'>('overview');

  useEffect(() => {
    if (!isAdmin) {
      router.push('/dashboard');
      return;
    }
    loadData();
  }, [params.id, isAdmin]);

  const loadData = async () => {
    try {
      const [orderRes, tasksRes] = await Promise.all([
        adminService.getOrder(params.id as string),
        projectTaskService.getByProject(params.id as string),
      ]);
      
      if (orderRes.success && orderRes.data) {
        setOrder(orderRes.data);
      }
      if (tasksRes.success && tasksRes.data) {
        setTasks(tasksRes.data.tasks || []);
      }
    } catch {
      toast.error('Ma\'lumotlarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) return null;

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-[#0e1621] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </ProtectedRoute>
    );
  }

  if (!order) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-[#0e1621] flex items-center justify-center">
          <p className="text-gray-500">Loyiha topilmadi</p>
        </div>
      </ProtectedRoute>
    );
  }

  // Statistikalar
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.isAccepted).length;
  const inProgressTasks = tasks.filter(t => !t.isAccepted).length;
  const taskProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Milestone statistikasi
  const milestones = order.milestones || [];
  const paidMilestones = milestones.filter(m => m.status === 'paid').length;
  const completedMilestones = milestones.filter(m => m.status === 'completed' || m.status === 'paid').length;

  return (
    <ProtectedRoute>
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
              <h1 className="font-semibold truncate">{order.title}</h1>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded ${ORDER_STATUS_COLORS[order.status]}`}>
                  {ORDER_STATUS_LABELS[order.status]}
                </span>
                <span className="text-xs text-gray-500">
                  {order.userId && typeof order.userId === 'object' && 
                    `${(order.userId as any).firstName} ${(order.userId as any).lastName}`}
                </span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-dark-700">
            {(['overview', 'tasks', 'team'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-sm font-medium transition ${
                  activeTab === tab 
                    ? 'text-primary-400 border-b-2 border-primary-400' 
                    : 'text-gray-400'
                }`}
              >
                {tab === 'overview' ? 'Umumiy' : tab === 'tasks' ? 'Vazifalar' : 'Jamoa'}
              </button>
            ))}
          </div>
        </header>

        <main className="p-4 space-y-4">
          {activeTab === 'overview' && (
            <OverviewTab 
              order={order} 
              taskProgress={taskProgress}
              totalTasks={totalTasks}
              completedTasks={completedTasks}
              inProgressTasks={inProgressTasks}
              paidMilestones={paidMilestones}
              completedMilestones={completedMilestones}
            />
          )}

          {activeTab === 'tasks' && (
            <TasksTab tasks={tasks} />
          )}

          {activeTab === 'team' && (
            <TeamTab order={order} />
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}


// Overview Tab
function OverviewTab({ 
  order, 
  taskProgress, 
  totalTasks, 
  completedTasks, 
  inProgressTasks,
  paidMilestones,
  completedMilestones
}: { 
  order: Order; 
  taskProgress: number;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  paidMilestones: number;
  completedMilestones: number;
}) {
  const milestones = order.milestones || [];

  return (
    <>
      {/* Progress Card */}
      <div className="bg-dark-800 rounded-xl p-4">
        <div className="flex items-center gap-4">
          {/* Circular Progress */}
          <div className="relative w-24 h-24 flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="48" cy="48" r="40" stroke="#1e293b" strokeWidth="8" fill="none" />
              <circle 
                cx="48" cy="48" r="40" 
                stroke={taskProgress === 100 ? '#22c55e' : '#3b82f6'}
                strokeWidth="8" 
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${taskProgress * 2.51} 251`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold text-white">{taskProgress}%</span>
            </div>
          </div>

          <div className="flex-1">
            {order.amount && (
              <p className="text-xl font-bold text-primary-400">{order.amount.toLocaleString()} so'm</p>
            )}
            <p className="text-sm text-gray-400 mt-1">
              {completedTasks} / {totalTasks} vazifa bajarildi
            </p>
            {order.totalPaid !== undefined && order.amount && (
              <p className="text-sm text-green-400 mt-1">
                {order.totalPaid.toLocaleString()} / {order.amount.toLocaleString()} to'landi
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-dark-800 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">{inProgressTasks}</div>
          <div className="text-xs text-gray-500 mt-1">Jarayonda</div>
        </div>
        <div className="bg-dark-800 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{completedTasks}</div>
          <div className="text-xs text-gray-500 mt-1">Bajarildi</div>
        </div>
        <div className="bg-dark-800 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-purple-400">{paidMilestones}</div>
          <div className="text-xs text-gray-500 mt-1">To'langan bosqich</div>
        </div>
        <div className="bg-dark-800 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">{milestones.length}</div>
          <div className="text-xs text-gray-500 mt-1">Jami bosqich</div>
        </div>
      </div>

      {/* Client Info */}
      {order.clientId && typeof order.clientId === 'object' && (
        <div className="bg-dark-800 rounded-xl p-4">
          <h3 className="text-white font-semibold mb-3">Mijoz</h3>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-500/20 rounded-full flex items-center justify-center">
              <span className="text-primary-400 font-medium">
                {((order.clientId as any).fullName || (order.clientId as any).companyName || 'M')[0]}
              </span>
            </div>
            <div>
              <p className="text-white font-medium">
                {(order.clientId as any).fullName || (order.clientId as any).companyName}
              </p>
              <p className="text-sm text-gray-500">{(order.clientId as any).phoneNumber}</p>
            </div>
          </div>
        </div>
      )}

      {/* Milestones */}
      {milestones.length > 0 && (
        <div className="bg-dark-800 rounded-xl p-4">
          <h3 className="text-white font-semibold mb-3">To'lov bosqichlari</h3>
          <div className="space-y-3">
            {milestones.map((m, i) => (
              <div 
                key={m._id || i}
                className={`border rounded-lg p-3 ${
                  m.status === 'paid' ? 'border-purple-500/30 bg-purple-500/5' :
                  m.status === 'completed' ? 'border-green-500/30 bg-green-500/5' :
                  m.status === 'in_progress' ? 'border-blue-500/30 bg-blue-500/5' :
                  'border-dark-600'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-white font-medium">{m.title}</h4>
                    <p className="text-sm text-primary-400">{m.amount.toLocaleString()} so'm ({m.percentage}%)</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${MILESTONE_STATUS_COLORS[m.status]}`}>
                    {MILESTONE_STATUS_LABELS[m.status]}
                  </span>
                </div>
                {m.dueDate && (
                  <p className="text-xs text-gray-500 mt-2">
                    Muddat: {new Date(m.dueDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      {order.description && (
        <div className="bg-dark-800 rounded-xl p-4">
          <h3 className="text-white font-semibold mb-2">Tavsif</h3>
          <p className="text-gray-400 text-sm">{order.description}</p>
        </div>
      )}
    </>
  );
}

// Tasks Tab
function TasksTab({ tasks }: { tasks: any[] }) {
  const inProgressTasks = tasks.filter(t => !t.isAccepted);
  const completedTasks = tasks.filter(t => t.isAccepted);

  if (tasks.length === 0) {
    return (
      <div className="bg-dark-800 rounded-xl p-8 text-center">
        <div className="text-4xl mb-3">📋</div>
        <p className="text-gray-400">Hali vazifa qo'shilmagan</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* In Progress */}
      {inProgressTasks.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-blue-400 mb-2 flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
            Jarayonda ({inProgressTasks.length})
          </h3>
          <div className="space-y-2">
            {inProgressTasks.map(task => (
              <TaskCard key={task._id} task={task} />
            ))}
          </div>
        </div>
      )}

      {/* Completed */}
      {completedTasks.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-green-400 mb-2 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
            Bajarildi ({completedTasks.length})
          </h3>
          <div className="space-y-2">
            {completedTasks.map(task => (
              <TaskCard key={task._id} task={task} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TaskCard({ task }: { task: any }) {
  const dev = task.developerId;

  return (
    <div className={`bg-dark-800 rounded-xl p-4 border-l-4 ${
      task.isAccepted ? 'border-green-500' : 'border-blue-500'
    }`}>
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          task.isAccepted ? 'bg-green-500/20' : 'bg-blue-500/20'
        }`}>
          {task.isAccepted ? (
            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-white font-medium">{task.title}</h4>
          {task.description && (
            <p className="text-sm text-gray-400 mt-1 line-clamp-2">{task.description}</p>
          )}
          
          {dev && (
            <div className="flex items-center gap-2 mt-2">
              <div className="w-5 h-5 bg-primary-500/30 rounded-full flex items-center justify-center">
                <span className="text-primary-400 text-xs">{dev.firstName?.[0]}</span>
              </div>
              <span className="text-xs text-gray-400">{dev.firstName} {dev.lastName}</span>
            </div>
          )}

          {task.acceptedAt && (
            <p className="text-xs text-gray-500 mt-2">
              Bajarildi: {new Date(task.acceptedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Team Tab
function TeamTab({ order }: { order: Order }) {
  const team = order.team || [];
  const teamLead = order.teamLeadId;

  if (team.length === 0) {
    return (
      <div className="bg-dark-800 rounded-xl p-8 text-center">
        <div className="text-4xl mb-3">👥</div>
        <p className="text-gray-400">Hali jamoa qo'shilmagan</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {team.map((member: any, index: number) => {
        const isLead = teamLead && typeof teamLead === 'object' && 
          (teamLead as any)._id === member.developerId?._id;

        return (
          <div 
            key={member.developerId?._id || index}
            className={`bg-dark-800 rounded-xl p-4 ${
              isLead ? 'border border-yellow-500/30' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                isLead ? 'bg-yellow-500/20' : 'bg-primary-500/20'
              }`}>
                <span className={`font-medium ${isLead ? 'text-yellow-400' : 'text-primary-400'}`}>
                  {member.developerId?.firstName?.[0]}{member.developerId?.lastName?.[0]}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">
                  {member.developerId?.firstName} {member.developerId?.lastName}
                </p>
                <p className="text-sm text-gray-500">@{member.developerId?.username}</p>
              </div>
              {isLead && (
                <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs">
                  Team Lead
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
