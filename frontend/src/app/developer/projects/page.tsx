'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { useToast } from '@/contexts/ToastContext';
import { projectTaskService, DeveloperProject } from '@/services/projectTask.service';
import { projectChatService } from '@/services/projectChat.service';

const statusColors = {
  new: 'bg-blue-500',
  in_progress: 'bg-yellow-500',
  completed: 'bg-green-500',
};

const statusLabels = {
  new: 'Yangi',
  in_progress: 'Jarayonda',
  completed: 'Tugallangan',
};

export default function DeveloperProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<DeveloperProject[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    loadProjects();
    loadUnreadCounts();
  }, []);

  const loadProjects = async () => {
    try {
      const res = await projectTaskService.getMyProjects();
      setProjects(res.data ?? []);
    } catch {
      toast.error('Loyihalarni yuklashda xatolik');
    } finally {
      setIsLoading(false);
    }
  };

  const loadUnreadCounts = async () => {
    try {
      const res = await projectChatService.getDeveloperUnreadAll();
      if (res.success && res.data) {
        const counts: Record<string, number> = {};
        res.data.forEach(item => { counts[item._id] = item.count; });
        setUnreadCounts(counts);
      }
    } catch {}
  };

  const getClientName = (project: DeveloperProject) => {
    if (project.clientId) {
      return project.clientId.fullName || project.clientId.companyName || '';
    }
    return '';
  };

  const formatAmount = (amount?: number) => {
    if (!amount) return '';
    return new Intl.NumberFormat('uz-UZ').format(amount) + " so'm";
  };

  return (
    <ProtectedRoute requiredRole="developer">
      <div className="min-h-screen bg-[#0e1621] pb-20">
        <Header title="Loyihalarim" />
        
        <main className="p-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-dark-800 rounded-xl p-4 animate-pulse">
                  <div className="h-5 bg-dark-700 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-dark-700 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-dark-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <p className="text-gray-500">Loyihalar topilmadi</p>
              <p className="text-gray-600 text-sm mt-2">Sizga vazifa biriktirilganda loyihalar bu yerda ko'rinadi</p>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map((project) => (
                <div 
                  key={project._id} 
                  className="bg-dark-800 rounded-xl p-4 cursor-pointer hover:bg-dark-700 transition-colors relative"
                  onClick={() => router.push(`/developer/projects/${project._id}`)}
                >
                  {/* Unread badge */}
                  {unreadCounts[project._id] > 0 && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white font-bold">{unreadCounts[project._id]}</span>
                    </div>
                  )}
                  
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white text-lg">{project.title}</h3>
                        {project.isTeamLead && (
                          <span style={{ backgroundColor: '#f59e0b', color: 'white', padding: '2px 8px', borderRadius: '9999px', fontSize: '10px', fontWeight: 600 }}>
                            Team Lead
                          </span>
                        )}
                      </div>
                      {getClientName(project) && (
                        <p className="text-sm text-gray-400 mt-1">
                          <span className="text-gray-500">Mijoz:</span> {getClientName(project)}
                        </p>
                      )}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs text-white ${statusColors[project.status as keyof typeof statusColors] || 'bg-gray-500'}`}>
                      {statusLabels[project.status as keyof typeof statusLabels] || project.status}
                    </span>
                  </div>
                  
                  {project.description && (
                    <p className="text-sm text-gray-400 mb-4">{project.description}</p>
                  )}
                  
                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">Mening progressim</span>
                      <span className="text-lg font-bold text-primary-400">{project.myProgress}%</span>
                    </div>
                    <div className="h-3 bg-dark-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${
                          project.myProgress === 100 ? 'bg-green-500' : 'bg-primary-500'
                        }`}
                        style={{ width: `${project.myProgress}%` }}
                      />
                    </div>
                  </div>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center p-2 bg-dark-700 rounded-lg">
                      <p className="text-lg font-bold text-white">{project.myTasks}</p>
                      <p className="text-xs text-gray-500">Vazifalar</p>
                    </div>
                    <div className="text-center p-2 bg-dark-700 rounded-lg">
                      <p className="text-lg font-bold text-green-400">{project.completedTasks}</p>
                      <p className="text-xs text-gray-500">Bajarilgan</p>
                    </div>
                    <div className="text-center p-2 bg-dark-700 rounded-lg">
                      <p className="text-lg font-bold text-yellow-400">{project.myTasks - project.completedTasks}</p>
                      <p className="text-xs text-gray-500">Qolgan</p>
                    </div>
                  </div>
                  
                  {/* Amount & Date */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-dark-700">
                    {project.amount && (
                      <span className="text-green-400 font-medium">{formatAmount(project.amount)}</span>
                    )}
                    <span className="text-xs text-gray-500">
                      {new Date(project.createdAt).toLocaleDateString('uz-UZ')}
                    </span>
                  </div>
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
