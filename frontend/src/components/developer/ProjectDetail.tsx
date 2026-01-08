'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { projectTaskService } from '@/services/projectTask.service';
import { orderService } from '@/services/order.service';

interface TeamMember {
  developerId: { _id: string; firstName: string; lastName: string; username: string };
  role?: string;
}

interface ProjectData {
  _id: string;
  title: string;
  clientName: string;
  amount?: number;
  teamLeadId?: string;
  team: TeamMember[];
}

interface TaskData {
  _id: string;
  title: string;
  description?: string;
  developerId?: { _id: string; firstName: string; lastName: string };
  isAccepted: boolean;
}

export default function ProjectDetail() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();
  
  const [project, setProject] = useState<ProjectData | null>(null);
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [showAddTask, setShowAddTask] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskData | null>(null);
  
  // Add task form
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [selectedDev, setSelectedDev] = useState('');
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    if (!user?.userId || !params.id) return;
    
    try {
      setError(null);
      const orderRes = await orderService.getOrder(params.id as string);
      
      if (orderRes.success && orderRes.data) {
        const order = orderRes.data;
        
        let clientName = 'Loyiha';
        const clientData = order.clientId;
        if (clientData && typeof clientData === 'object') {
          clientName = clientData.companyName || clientData.fullName || 'Loyiha';
        }
        
        setProject({
          _id: order._id,
          title: order.title,
          clientName,
          amount: order.amount,
          teamLeadId: order.teamLeadId?._id,
          team: order.team || [],
        });
        
        try {
          const tasksRes = await projectTaskService.getByProject(params.id as string);
          if (tasksRes.success && tasksRes.data) {
            const taskList = tasksRes.data.tasks || [];
            const mappedTasks: TaskData[] = taskList.map((t) => ({
              _id: t._id,
              title: t.title,
              description: t.description,
              developerId: typeof t.developerId === 'object' ? t.developerId : undefined,
              isAccepted: t.isAccepted,
            }));
            setTasks(mappedTasks);
          }
        } catch (taskErr) {
          console.error('Vazifalarni yuklashda xatolik:', taskErr);
          setTasks([]);
        }
      }
    } catch (err) {
      console.error('Xatolik:', err);
      setError("Ma'lumotlarni yuklashda xatolik");
      toast.error("Ma'lumotlarni yuklashda xatolik");
    } finally {
      setIsLoading(false);
    }
  }, [params.id, user?.userId, toast]);

  useEffect(() => {
    if (user?.userId) {
      loadData();
    }
  }, [user?.userId, loadData]);

  const handleAcceptTask = async (taskId: string) => {
    try {
      await projectTaskService.acceptTask(taskId);
      toast.success('Vazifa tasdiqlandi!');
      loadData();
    } catch {
      toast.error('Xatolik yuz berdi');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Vazifani o'chirmoqchimisiz?")) return;
    try {
      await projectTaskService.deleteTask(taskId);
      toast.success("Vazifa o'chirildi");
      loadData();
    } catch {
      toast.error('Xatolik yuz berdi');
    }
  };

  const openAddModal = () => {
    setEditingTask(null);
    setTaskTitle('');
    setTaskDescription('');
    setSelectedDev('');
    setShowAddTask(true);
  };

  const openEditModal = (task: TaskData) => {
    setEditingTask(task);
    setTaskTitle(task.title);
    setTaskDescription(task.description || '');
    setSelectedDev(task.developerId?._id || '');
    setShowAddTask(true);
  };

  const handleSubmitTask = async () => {
    if (!selectedDev || !taskTitle.trim()) {
      toast.error('Dasturchi va vazifa nomini kiriting');
      return;
    }
    setSaving(true);
    try {
      if (editingTask) {
        await projectTaskService.updateTask(editingTask._id, { 
          title: taskTitle.trim(), 
          description: taskDescription.trim() || undefined, 
          developerId: selectedDev 
        });
        toast.success('Vazifa yangilandi');
      } else {
        await projectTaskService.createTask({ 
          projectId: params.id as string, 
          developerId: selectedDev, 
          title: taskTitle.trim(), 
          description: taskDescription.trim() || undefined 
        });
        toast.success("Vazifa qo'shildi");
      }
      setShowAddTask(false);
      setEditingTask(null);
      loadData();
    } catch {
      toast.error('Xatolik');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0e1621] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0e1621] flex flex-col items-center justify-center p-4">
        <p className="text-red-400 mb-4">{error}</p>
        <button onClick={() => router.back()} className="px-4 py-2 bg-primary-500 text-white rounded-lg">
          Orqaga
        </button>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#0e1621] flex flex-col items-center justify-center p-4">
        <p className="text-gray-500 mb-4">Loyiha topilmadi</p>
        <button onClick={() => router.back()} className="px-4 py-2 bg-primary-500 text-white rounded-lg">
          Orqaga
        </button>
      </div>
    );
  }

  const isTeamLead = project.teamLeadId === user?.userId;
  const myTasks = tasks.filter(t => t.developerId?._id === user?.userId);
  const displayTasks = isTeamLead ? tasks : myTasks;
  const completedCount = displayTasks.filter(t => t.isAccepted).length;
  const inProgressCount = displayTasks.filter(t => !t.isAccepted).length;
  const progress = displayTasks.length > 0 ? Math.round((completedCount / displayTasks.length) * 100) : 0;

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
            <h1 className="font-semibold truncate">{project.title}</h1>
            <p className="text-xs text-gray-400 truncate">{project.clientName}</p>
          </div>
          {isTeamLead && (
            <span className="text-xs px-2 py-1 rounded bg-yellow-500/20 text-yellow-400">Team Lead</span>
          )}
        </div>
      </header>

      <main className="p-4 space-y-4">
        {/* Progress Card */}
        <div className="bg-[#1a2332] rounded-xl p-4">
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="40" cy="40" r="34" stroke="#1e293b" strokeWidth="8" fill="none" />
                <circle cx="40" cy="40" r="34" stroke="#3b82f6" strokeWidth="8" fill="none" strokeLinecap="round"
                  strokeDasharray={`${progress * 2.14} 214`} />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-white">{progress}%</span>
              </div>
            </div>
            <div className="flex-1">
              {project.amount && (
                <p className="text-lg font-bold text-blue-400">{project.amount.toLocaleString()} so&apos;m</p>
              )}
              <p className="text-sm text-gray-400">{completedCount} / {displayTasks.length} vazifa</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-[#1a2332] rounded-xl p-3 text-center">
            <div className="text-xl font-bold text-blue-400">{inProgressCount}</div>
            <div className="text-xs text-gray-500">Jarayonda</div>
          </div>
          <div className="bg-[#1a2332] rounded-xl p-3 text-center">
            <div className="text-xl font-bold text-green-400">{completedCount}</div>
            <div className="text-xs text-gray-500">Bajarildi</div>
          </div>
        </div>

        {/* Add Task Button - faqat TeamLead uchun */}
        {isTeamLead && (
          <button
            onClick={openAddModal}
            className="w-full py-3 bg-primary-500 text-white rounded-xl flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Vazifa qo&apos;shish</span>
          </button>
        )}

        {/* Tasks */}
        {displayTasks.length > 0 ? (
          <div className="space-y-2">
            {/* In Progress */}
            {inProgressCount > 0 && (
              <div>
                <h3 className="text-sm font-medium text-blue-400 mb-2">Jarayonda</h3>
                <div className="space-y-2">
                  {displayTasks.filter(t => !t.isAccepted).map(task => (
                    <div key={task._id} className="bg-[#1a2332] rounded-xl p-4 border-l-4 border-blue-500">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-blue-500/20">
                          <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-medium">{task.title}</h3>
                          {task.description && <p className="text-sm text-gray-400 mt-1">{task.description}</p>}
                          {task.developerId && (
                            <p className="text-xs text-gray-500 mt-1">{task.developerId.firstName} {task.developerId.lastName}</p>
                          )}
                          {task.developerId?._id === user?.userId && (
                            <button 
                              onClick={() => handleAcceptTask(task._id)} 
                              className="mt-2 w-full py-2 bg-green-500/20 text-green-400 rounded-lg text-sm"
                            >
                              Bajarildi - Tasdiqlash
                            </button>
                          )}
                        </div>
                        {isTeamLead && (
                          <div className="flex gap-1">
                            <button onClick={() => openEditModal(task)} className="p-2 text-gray-500 hover:text-primary-400">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button onClick={() => handleDeleteTask(task._id)} className="p-2 text-gray-500 hover:text-red-400">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Completed */}
            {completedCount > 0 && (
              <div>
                <h3 className="text-sm font-medium text-green-400 mb-2">Bajarildi</h3>
                <div className="space-y-2">
                  {displayTasks.filter(t => t.isAccepted).map(task => (
                    <div key={task._id} className="bg-[#1a2332] rounded-xl p-4 border-l-4 border-green-500">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-green-500/20">
                          <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-medium">{task.title}</h3>
                          {task.description && <p className="text-sm text-gray-400 mt-1">{task.description}</p>}
                          {task.developerId && (
                            <p className="text-xs text-gray-500 mt-1">{task.developerId.firstName} {task.developerId.lastName}</p>
                          )}
                        </div>
                        {isTeamLead && (
                          <button onClick={() => handleDeleteTask(task._id)} className="p-2 text-gray-500 hover:text-red-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-[#1a2332] rounded-xl p-8 text-center">
            <p className="text-gray-400">{isTeamLead ? "Hali vazifa qo'shilmagan" : 'Sizga vazifa berilmagan'}</p>
          </div>
        )}
      </main>

      {/* Add/Edit Task Modal */}
      {showAddTask && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70">
          <div className="w-full sm:max-w-md max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl bg-[#1e2836]">
            <div className="flex justify-between items-center p-4 border-b border-[#2d3848]">
              <h2 className="text-lg font-semibold text-white">
                {editingTask ? 'Vazifani tahrirlash' : "Vazifa qo'shish"}
              </h2>
              <button 
                onClick={() => { setShowAddTask(false); setEditingTask(null); }} 
                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-white bg-[#2d3848]"
              >
                ✕
              </button>
            </div>
            <div className="p-4 space-y-4 overflow-y-auto max-h-[70vh]">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Vazifa nomi *</label>
                <input 
                  type="text" 
                  value={taskTitle} 
                  onChange={e => setTaskTitle(e.target.value)} 
                  placeholder="Masalan: Login sahifasini yaratish"
                  className="w-full rounded-lg px-3 py-2.5 text-white border-0 outline-none focus:ring-2 focus:ring-primary-500 bg-[#2d3848]" 
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Tavsif</label>
                <textarea 
                  value={taskDescription} 
                  onChange={e => setTaskDescription(e.target.value)} 
                  placeholder="Qo'shimcha ma'lumot..." 
                  rows={2}
                  className="w-full rounded-lg px-3 py-2.5 text-white resize-none border-0 outline-none focus:ring-2 focus:ring-primary-500 bg-[#2d3848]" 
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Dasturchi *</label>
                {project.team.length > 0 ? (
                  <div className="space-y-2">
                    {project.team.map(member => (
                      <button 
                        key={member.developerId._id} 
                        type="button" 
                        onClick={() => setSelectedDev(member.developerId._id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition ${
                          selectedDev === member.developerId._id ? 'ring-2 ring-primary-500 bg-primary-500/20' : 'bg-[#2d3848]'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          member.role === 'team_lead' ? 'bg-yellow-500/30' : 'bg-primary-500/30'
                        }`}>
                          <span className={`text-sm ${member.role === 'team_lead' ? 'text-yellow-400' : 'text-primary-400'}`}>
                            {member.developerId.firstName?.[0]}{member.developerId.lastName?.[0]}
                          </span>
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-white text-sm">{member.developerId.firstName} {member.developerId.lastName}</p>
                          <p className="text-xs text-gray-500">@{member.developerId.username}</p>
                        </div>
                        {member.role === 'team_lead' && (
                          <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs">Lead</span>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">Jamoa bo&apos;sh</p>
                )}
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => { setShowAddTask(false); setEditingTask(null); }} 
                  className="flex-1 py-3 rounded-xl text-white font-medium hover:opacity-80 bg-[#2d3848]"
                >
                  Bekor
                </button>
                <button 
                  onClick={handleSubmitTask} 
                  disabled={saving || !selectedDev || !taskTitle.trim()}
                  className="flex-1 py-3 bg-primary-500 rounded-xl text-white font-medium disabled:opacity-50 hover:bg-primary-600"
                >
                  {saving ? 'Saqlanmoqda...' : (editingTask ? 'Saqlash' : "Qo'shish")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
