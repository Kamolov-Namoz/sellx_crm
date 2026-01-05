'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { useToast } from '@/contexts/ToastContext';
import { employeeService } from '@/services/employee.service';
import { Employee } from '@/types';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  const fetchEmployees = async () => {
    try {
      const response = await employeeService.getEmployees();
      if (response.success) {
        setEmployees(response.data || []);
      }
    } catch {
      toast.error('Dasturchilarni yuklashda xatolik');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#0e1621] pb-20">
        <Header title="Dasturchilar" />
        <main className="p-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-400 text-sm">{employees.length} ta dasturchi</p>
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
              <div className="w-16 h-16 bg-dark-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <p className="text-gray-500">Hozircha dasturchilar yo'q</p>
              <p className="text-gray-600 text-sm mt-2">Dasturchilar ro'yxatdan o'tganda bu yerda ko'rinadi</p>
            </div>
          ) : (
            <div className="space-y-3">
              {employees.map((employee) => (
                <div key={employee._id} className="bg-dark-800 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-semibold text-lg">
                      {employee.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{employee.fullName}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                          Dasturchi
                        </span>
                      </div>
                      {employee.phoneNumber && (
                        <p className="text-xs text-gray-500 mt-1">{employee.phoneNumber}</p>
                      )}
                    </div>
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
