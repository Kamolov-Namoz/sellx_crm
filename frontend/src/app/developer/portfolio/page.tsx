'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { useToast } from '@/contexts/ToastContext';
import { projectTaskService, PortfolioItem, DeveloperStats } from '@/services/projectTask.service';

export default function DeveloperPortfolioPage() {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [stats, setStats] = useState<DeveloperStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [portfolioRes, statsRes] = await Promise.all([
        projectTaskService.getMyPortfolio(),
        projectTaskService.getMyStats(),
      ]);
      setPortfolio(portfolioRes.data ?? []);
      setStats(statsRes.data ?? null);
    } catch {
      toast.error("Ma'lumotlarni yuklashda xatolik");
    } finally {
      setIsLoading(false);
    }
  };

  const getClientName = (item: PortfolioItem) => {
    if (item.project?.clientId) {
      return item.project.clientId.fullName || item.project.clientId.companyName || '';
    }
    return '';
  };

  // O'rtacha bajarish tezligi
  const avgDays = portfolio.length > 0 
    ? Math.round(portfolio.reduce((sum, p) => sum + p.daysToComplete, 0) / portfolio.length)
    : 0;

  // Tezlik bo'yicha badge
  const getSpeedBadge = (days: number) => {
    if (days <= 1) return { text: 'Tez', color: 'bg-green-500/20 text-green-400' };
    if (days <= 3) return { text: "O'rtacha", color: 'bg-yellow-500/20 text-yellow-400' };
    return { text: 'Sekin', color: 'bg-red-500/20 text-red-400' };
  };

  return (
    <ProtectedRoute requiredRole="developer">
      <div className="min-h-screen bg-[#0e1621] pb-20">
        <Header title="Portfolio" />
        
        <main className="p-4">
          {isLoading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-32 bg-dark-800 rounded-xl" />
              <div className="h-48 bg-dark-800 rounded-xl" />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Summary Stats */}
              <div className="card bg-gradient-to-br from-green-500/10 to-blue-500/10 border-green-500/20">
                <h3 className="text-white font-semibold mb-4">Umumiy ko'rsatkichlar</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <div className="w-14 h-14 bg-green-500/20 rounded-full mx-auto mb-2 flex items-center justify-center">
                      <span className="text-2xl font-bold text-green-400">{portfolio.length}</span>
                    </div>
                    <p className="text-xs text-gray-400">Bajarilgan vazifalar</p>
                  </div>
                  <div className="text-center">
                    <div className="w-14 h-14 bg-blue-500/20 rounded-full mx-auto mb-2 flex items-center justify-center">
                      <span className="text-2xl font-bold text-blue-400">{stats?.completedProjects || 0}</span>
                    </div>
                    <p className="text-xs text-gray-400">Tugallangan loyihalar</p>
                  </div>
                  <div className="text-center">
                    <div className="w-14 h-14 bg-yellow-500/20 rounded-full mx-auto mb-2 flex items-center justify-center">
                      <span className="text-2xl font-bold text-yellow-400">{avgDays}</span>
                    </div>
                    <p className="text-xs text-gray-400">O'rtacha kun</p>
                  </div>
                </div>
              </div>

              {/* Portfolio Items */}
              <div className="card">
                <h3 className="text-white font-semibold mb-4">Bajarilgan ishlar</h3>
                
                {portfolio.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-dark-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    </div>
                    <p className="text-gray-500">Hali bajarilgan ishlar yo'q</p>
                    <p className="text-gray-600 text-sm mt-2">Vazifalarni bajaring va portfolio to'ldiring</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {portfolio.map((item) => {
                      const speedBadge = getSpeedBadge(item.daysToComplete);
                      return (
                        <div key={item._id} className="bg-dark-700 rounded-xl p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="font-medium text-white">{item.title}</h4>
                              <p className="text-sm text-primary-400">{item.project?.title}</p>
                              {getClientName(item) && (
                                <p className="text-xs text-gray-500 mt-1">Mijoz: {getClientName(item)}</p>
                              )}
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs ${speedBadge.color}`}>
                              {speedBadge.text}
                            </span>
                          </div>
                          
                          {item.description && (
                            <p className="text-sm text-gray-400 mb-3">{item.description}</p>
                          )}
                          
                          <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-dark-600">
                            <div className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {item.daysToComplete} kunda bajarildi
                            </div>
                            <div className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {item.completedAt && new Date(item.completedAt).toLocaleDateString('uz-UZ')}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Performance Summary */}
              {portfolio.length > 0 && (
                <div className="card">
                  <h3 className="text-white font-semibold mb-3">Samaradorlik</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Tez bajarilgan (1 kun)</span>
                      <span className="text-green-400 font-medium">
                        {portfolio.filter(p => p.daysToComplete <= 1).length} ta
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">O'rtacha (2-3 kun)</span>
                      <span className="text-yellow-400 font-medium">
                        {portfolio.filter(p => p.daysToComplete > 1 && p.daysToComplete <= 3).length} ta
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Uzoq (3+ kun)</span>
                      <span className="text-red-400 font-medium">
                        {portfolio.filter(p => p.daysToComplete > 3).length} ta
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>

        <BottomNav />
      </div>
    </ProtectedRoute>
  );
}
