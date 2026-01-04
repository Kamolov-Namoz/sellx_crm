'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import EmployeeFormModal from '@/components/EmployeeFormModal';
import { useToast } from '@/contexts/ToastContext';
import { employeeService } from '@/services/employee.service';
import { Employee } from '@/types';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const toast = useToast();

  const fetchEmployees = async () => {
    try {
      const response = await employeeService.getEmployees();
      if (response.success) {
        setEmployees(response.data || []);
      }
    } catch {
      toast.error('Xodimlarni yuklashda xatolik');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Xodimni o'chirishni tasdiqlaysizmi?")) return;
    try {
      await employeeService.deleteEmployee(id);
      toast.success("Xodim o'chirildi");
      fetchEmployees();
    } catch {
      toast.error("O'chirishda xatolik");
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#0e1621] pb-20">
        <Header title="Xodimlar" />
        <main className="p-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-400 text-sm">{employees.length} ta xodim</p>
            <button onClick={() => { setEditingEmployee(null); setShowForm(true); }} className="btn-primary flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Qo'shish
            </button>
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
          ) : employees.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Xodimlar topilmadi</p>
              <button onClick={() => setShowForm(true)} className="btn-primary mt-4">Birinchi xodimni qo'shing</button>
            </div>
          ) : (
            <div className="space-y-3">
              {employees.map((employee) => (
                <div key={employee._id} className="bg-dark-800 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-400 font-semibold text-lg">
                      {employee.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{employee.fullName}</h3>
                      <p className="text-sm text-gray-500">{employee.position}</p>
                    </div>
                    <button onClick={() => { setEditingEmployee(employee); setShowForm(true); }} className="p-2 text-gray-400 hover:text-white">Edit</button>
                    <button onClick={() => handleDelete(employee._id)} className="p-2 text-gray-400 hover:text-red-400">Del</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
        <BottomNav />
        {showForm && (
          <EmployeeFormModal
            employee={editingEmployee}
            onClose={() => { setShowForm(false); setEditingEmployee(null); }}
            onSuccess={() => { setShowForm(false); setEditingEmployee(null); fetchEmployees(); }}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
