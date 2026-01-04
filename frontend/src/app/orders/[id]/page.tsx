'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useToast } from '@/contexts/ToastContext';
import { orderService } from '@/services/order.service';
import { projectTaskService, ProjectTask, ProjectProgress } from '@/services/projectTask.service';
import { employeeService } from '@/services/employee.service';
import { Order, Employee, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/types';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Order | null>(null);
  const [progress, setProgress] = useState<ProjectProgress | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddTask, setShowAddTask] = useState(false);
  const toast = useToast();

  const fetchData = async () => {
    try {
      const [projectRes, progressRes, employeesRes] = await Promise.all([
        orderService.getOrder(params.id as string),
        projectTaskService.getByProject(params.id as string),
        employeeService.getEmployees(),
      ]);
      
      if (projectRes.success) setProject(projectRes.data || null);
      if (progressRes.success) setProgress(progressRes.data || null);
      if (employeesRes.success) setEmployees(employeesRes.data || []);
    } catch {
      toast.error('Ma\'lumotlarni yuklashda xatolik');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [params.id]);

  const handleUpdateProgress = async (taskId: string, newProgress: number) => {
    try {
      await projectTaskService.update(taskId, { progress: newProgress });
      toast.success('Progress yangilandi');
      fetchData();
    } catch {
      toast.error('Xatolik yuz berdi');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Vazifani o\'chirishni tasdiqlaysizmi?')) return;
    try {
      await projectTaskService.delete(taskId);
      toast.success('Vazifa o\'chirildi');
      fetchData();
    } catch {
      toast.error('Xatolik yuz berdi');
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-[#0e1621] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </ProtectedRoute>
    );
  }

  if (!project) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-[#0e1621] flex items-center justify-center">
          <p className="text-gray-500">Loyiha topilmadi</p>
        </div>
      </ProtectedRoute>
    );
  }

  const avgProgress = progress?.avgProgress || 0;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#0e1621]">
        {/* Header */}
        <header className="bg-[#17212b] text-white sticky top-0 z-50 safe-top">
          <div className="flex items-center gap-3 px-4 py-3">
            <button onClick={() => router.back()} className="p-1 hover:bg-white/10 rounded-full">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex-1">
              <h1 className="font-semibold">{project.title}</h1>
              <span className={`text-xs px-2 py-0.5 rounded ${ORDER_STATUS_COLORS[project.status]}`}>
                {ORDER_STATUS_LABELS[project.status]}
              </span>
            </div>
          </div>
        </header>

        <main className="p-4 pb-20">
          {/* Progress Overview */}
          <div className="bg-dark-800 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400">Umumiy progress</span>
              <span className="text-2xl font-bold text-primary-400">{avgProgress}%</span>
            </div>
            <div className="w-full bg-dark-700 rounded-full h-3">
              <div 
                className="bg-primary-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${avgProgress}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>{progress?.completedTasks || 0} / {progress?.totalTasks || 0} vazifa</span>
              {project.amount && <span>{project.amount.toLocaleString()} so'm</span>}
            </div>
          </div>

          {/* Tasks */}
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white font-semibold">Vazifalar</h2>
            <button
              onClick={() => setShowAddTask(true)}
              className="text-primary-400 text-sm flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Vazifa qo'shish
            </button>
          </div>

          {progress?.tasks && progress.tasks.length > 0 ? (
            <div className="space-y-3">
              {progress.tasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onUpdateProgress={handleUpdateProgress}
                  onDelete={handleDeleteTask}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Vazifalar yo'q</p>
              <button onClick={() => setShowAddTask(true)} className="btn-primary mt-3">
                Birinchi vazifani qo'shing
              </button>
            </div>
          )}
        </main>

        {showAddTask && (
          <AddTaskModal
            projectId={params.id as string}
            employees={employees}
            onClose={() => setShowAddTask(false)}
            onSuccess={() => { setShowAddTask(false); fetchData(); }}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}

function TaskCard({ 
  task, 
  onUpdateProgress, 
  onDelete 
}: { 
  task: ProjectTask; 
  onUpdateProgress: (id: string, progress: number) => void;
  onDelete: (id: string) => void;
}) {
  const [localProgress, setLocalProgress] = useState(task.progress);
  const employee = typeof task.employeeId === 'object' ? task.employeeId : null;

  const handleProgressChange = (value: number) => {
    setLocalProgress(value);
  };

  const handleProgressCommit = () => {
    if (localProgress !== task.progress) {
      onUpdateProgress(task._id, localProgress);
    }
  };

  return (
    <div className="bg-dark-800 rounded-xl p-4">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className="font-medium text-white">{task.title}</h3>
          {employee && (
            <div className="flex items-center gap-2 mt-1">
              <div className="w-6 h-6 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-400 text-xs">
                {employee.fullName.charAt(0)}
              </div>
              <span className="text-sm text-gray-400">{employee.fullName}</span>
              <span className="text-xs text-gray-600">• {employee.position}</span>
            </div>
          )}
        </div>
        <button onClick={() => onDelete(task._id)} className="p-1 text-gray-500 hover:text-red-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {task.description && (
        <p className="text-sm text-gray-500 mb-3">{task.description}</p>
      )}

      <div className="flex items-center gap-3">
        <input
          type="range"
          min="0"
          max="100"
          value={localProgress}
          onChange={(e) => handleProgressChange(Number(e.target.value))}
          onMouseUp={handleProgressCommit}
          onTouchEnd={handleProgressCommit}
          className="flex-1 h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
        />
        <span className={`text-sm font-medium min-w-[3rem] text-right ${
          localProgress === 100 ? 'text-green-400' : 'text-primary-400'
        }`}>
          {localProgress}%
        </span>
      </div>
    </div>
  );
}

function AddTaskModal({
  projectId,
  employees,
  onClose,
  onSuccess,
}: {
  projectId: string;
  employees: Employee[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !employeeId) {
      toast.error('Vazifa nomi va xodimni tanlang');
      return;
    }

    setIsSubmitting(true);
    try {
      await projectTaskService.create({
        projectId,
        employeeId,
        title: title.trim(),
        description: description.trim() || undefined,
      });
      toast.success('Vazifa qo\'shildi');
      onSuccess();
    } catch {
      toast.error('Xatolik yuz berdi');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-dark-800 rounded-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-dark-700">
          <h2 className="text-lg font-semibold text-white">Yangi vazifa</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="label">Vazifa nomi *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Masalan: Dizayn tayyorlash"
              className="input"
            />
          </div>

          <div>
            <label className="label">Mas'ul xodim *</label>
            <select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="input"
            >
              <option value="">Xodimni tanlang</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.fullName} - {emp.position}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Tavsif</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Qo'shimcha ma'lumot..."
              rows={3}
              className="input resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 btn-secondary py-2.5">
              Bekor qilish
            </button>
            <button type="submit" disabled={isSubmitting} className="flex-1 btn-primary py-2.5">
              {isSubmitting ? 'Saqlanmoqda...' : 'Qo\'shish'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
