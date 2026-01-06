'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { useToast } from '@/contexts/ToastContext';
import { projectTaskService, ProjectTask } from '@/services/projectTask.service';

const statusColors = {
  pending: 'bg-yellow-500',
  in_progress: 'bg-blue-500',
  completed: 'bg-green-500',
};

const statusLabels = {
  pending: 'Kutilmoqda',
  in_progress: 'Jarayonda',
  completed: 'Tugallangan',
};

type FilterStatus = 'all' | 'pending' | 'in_progress' | 'completed';

export default function DeveloperTasksPage() {
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [acceptingTaskId, setAcceptingTaskId] = useState<string | null>(null);
  const toast = useToast();

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const res = await projectTaskService.getMyTasks();
      setTasks(res.data ?? []);
    } catch {
      toast.error('Vazifalarni yuklashda xatolik');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (taskId: string) => {
    setAcceptingTaskId(taskId);
    try {
      await projectTaskService.acceptTask(taskId);
      toast.success('Vazifa tasdiqlandi! ✓');
      loadTasks();
    } catch {
      toast.error('Xatolik yuz berdi');
    } finally {
      setAcceptingTaskId(null);
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'completed') return task.isAccepted;
    if (filter === 'in_progress') return !task.isAccepted;
    return !task.isAccepted;
  });

  const getClientName = (task: ProjectTask) => {
    if (task.projectId?.clientId) {
      return task.projectId.clientId.fullName || task.projectId.clientId.companyName || '';
    }
    return '';
  };

  return (
    <ProtectedRoute requiredRole="developer">
      <div className="min-h-screen bg-[#0e1621] pb-20">
        <Header title="Vazifalarim" />
        
        <main className="p-4">
          {/* Filter */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {(['all', 'pending', 'in_progress', 'completed'] as FilterStatus[]).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                  filter === status
                    ? 'bg-primary-500 text-white'
                    : 'bg-dark-700 text-gray-400 hover:bg-dark-600'
                }`}
              >
                {status === 'all' ? 'Barchasi' : statusLabels[status]}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-dark-800 rounded-xl p-4 animate-pulse">
                  <div className="h-5 bg-dark-700 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-dark-700 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-dark-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-gray-500">Vazifalar topilmadi</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTasks.map((task) => (
                <div key={task._id} className={`bg-dark-800 rounded-xl p-4 ${task.isAccepted ? 'border border-green-500/30' : ''}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-white">{task.title}</h3>
                        {task.isAccepted && (
                          <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                            ✓ Tasdiqlangan
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-primary-400 mt-1">{task.projectId?.title}</p>
                      {getClientName(task) && (
                        <p className="text-xs text-gray-500 mt-0.5">Mijoz: {getClientName(task)}</p>
                      )}
                    </div>
                    {!task.isAccepted && (
                      <span className={`px-2 py-1 rounded-full text-xs text-white ${statusColors[task.status]}`}>
                        {statusLabels[task.status]}
                      </span>
                    )}
                  </div>
                  
                  {task.description && (
                    <p className="text-sm text-gray-400 mb-3">{task.description}</p>
                  )}
                  
                  {/* Accept Button - faqat tugallanmagan vazifalar uchun */}
                  {!task.isAccepted && (
                    <button
                      onClick={() => handleAccept(task._id)}
                      disabled={acceptingTaskId === task._id}
                      className="w-full py-3 bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      {acceptingTaskId === task._id ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Tasdiqlanmoqda...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Bajarildi - Tasdiqlash
                        </>
                      )}
                    </button>
                  )}

                  {/* Tasdiqlangan vazifa ma'lumotlari */}
                  {task.isAccepted && task.acceptedAt && (
                    <div className="flex items-center gap-2 text-xs text-green-400 mt-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Tasdiqlangan: {new Date(task.acceptedAt).toLocaleDateString('uz-UZ')}
                    </div>
                  )}

                  {task.dueDate && !task.isAccepted && (
                    <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Muddat: {new Date(task.dueDate).toLocaleDateString('uz-UZ')}
                    </div>
                  )}
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
