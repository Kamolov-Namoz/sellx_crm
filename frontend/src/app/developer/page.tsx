'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { useToast } from '@/contexts/ToastContext';
import { projectTaskService, DeveloperStats, ProjectTask } from '@/services/projectTask.service';

export default function DeveloperDashboard() {
  const [stats, setStats] = useState<DeveloperStats | null>(null);
  const [recentTasks, setRecentTasks] = useState<ProjectTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, tasksRes] = await Promise.all([
        projectTaskService.getMyStats(),
        projectTaskService.getMyTasks(),
      ]);
      setStats(statsRes.data ?? null);
      // Faqat oxirgi 3 ta vazifani ko'rsatish
      setRecentTasks((tasksRes.data ?? []).slice(0, 3));
    } catch {
      toast.error("Ma'lumotlarni yuklashda xatolik");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute requiredRole="developer">
      <div className="min-h-screen bg-[#0e1621] pb-20">
        <Header title="Dashboard" />
        
        <main className="p-4">
          {isLoading ? (
            <div className="space-y-4 animate-pulse">
              <div className="grid grid-cols-2 gap-3">
                <div className="h-24 bg-dark-800 rounded-xl" />
                <div className="h-24 bg-dark-800 rounded-xl" />
              </div>
              <div className="h-32 bg-dark-800 rounded-xl" />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="card bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-blue-500/30">
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <p className="text-blue-400 text-sm">Loyihalar</p>
                  </div>
                  <p className="text-3xl font-bold text-white">{stats?.totalProjects || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats?.completedProjects || 0} tugallangan
                  </p>
                </div>
                
                <div className="card bg-gradient-to-br from-green-500/20 to-green-600/10 border-green-500/30">
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-green-400 text-sm">Vazifalar</p>
                  </div>
                  <p className="text-3xl font-bold text-white">{stats?.completedTasks || 0}<span className="text-lg text-gray-500">/{stats?.totalTasks || 0}</span></p>
                  <p className="text-xs text-gray-500 mt-1">bajarilgan</p>
                </div>
              </div>

              {/* Overall Progress */}
              <div className="card">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-medium">Umumiy progress</h3>
                  <span className="text-2xl font-bold text-primary-400">{stats?.avgProgress || 0}%</span>
                </div>
                <div className="h-4 bg-dark-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary-600 to-primary-400 transition-all duration-500"
                    style={{ width: `${stats?.avgProgress || 0}%` }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <div className="text-center p-2 bg-blue-500/10 rounded-lg">
                    <p className="text-lg font-bold text-blue-400">{stats?.inProgressTasks || 0}</p>
                    <p className="text-xs text-gray-500">Jarayonda</p>
                  </div>
                  <div className="text-center p-2 bg-green-500/10 rounded-lg">
                    <p className="text-lg font-bold text-green-400">{stats?.completedTasks || 0}</p>
                    <p className="text-xs text-gray-500">Tugallangan</p>
                  </div>
                </div>
              </div>

              {/* Recent Tasks */}
              <div className="card">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-medium">Oxirgi vazifalar</h3>
                  <Link href="/developer/tasks" className="text-primary-400 text-sm">
                    Barchasi →
                  </Link>
                </div>
                
                {recentTasks.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Vazifalar yo'q</p>
                ) : (
                  <div className="space-y-2">
                    {recentTasks.map((task) => (
                      <div key={task._id} className="flex items-center gap-3 p-3 bg-dark-700 rounded-lg">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                          task.isAccepted ? 'bg-green-500' : 
                          task.status === 'in_progress' ? 'bg-blue-500' : 'bg-yellow-500'
                        }`}>
                          {task.isAccepted ? '✓' : `${task.progress}%`}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate">{task.title}</p>
                          <p className="text-xs text-gray-500 truncate">{task.projectId?.title}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Links */}
              <div className="grid grid-cols-2 gap-3">
                <Link href="/developer/tasks" className="card flex flex-col items-center gap-2 py-4 hover:bg-dark-700 transition-colors">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <p className="text-white text-sm font-medium">Vazifalar</p>
                </Link>
                
                <Link href="/developer/projects" className="card flex flex-col items-center gap-2 py-4 hover:bg-dark-700 transition-colors">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <p className="text-white text-sm font-medium">Loyihalar</p>
                </Link>
                
                <Link href="/developer/portfolio" className="card flex flex-col items-center gap-2 py-4 hover:bg-dark-700 transition-colors col-span-2">
                  <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <p className="text-white text-sm font-medium">Portfolio</p>
                </Link>
              </div>
            </div>
          )}
        </main>

        <BottomNav />
      </div>
    </ProtectedRoute>
  );
}
