'use client';

import { useState } from 'react';
import { useToast } from '@/contexts/ToastContext';
import { employeeService } from '@/services/employee.service';
import { Employee, EmployeeFormData } from '@/types';

interface EmployeeFormModalProps {
  employee: Employee | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EmployeeFormModal({ employee, onClose, onSuccess }: EmployeeFormModalProps) {
  const [fullName, setFullName] = useState(employee?.fullName || '');
  const [position, setPosition] = useState(employee?.position || '');
  const [phoneNumber, setPhoneNumber] = useState(employee?.phoneNumber || '');
  const [email, setEmail] = useState(employee?.email || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !position.trim()) {
      toast.error('Ism va lavozimni kiriting');
      return;
    }

    setIsSubmitting(true);
    try {
      const data: EmployeeFormData = {
        fullName: fullName.trim(),
        position: position.trim(),
        phoneNumber: phoneNumber.trim() || undefined,
        email: email.trim() || undefined,
      };

      if (employee) {
        await employeeService.updateEmployee(employee._id, data);
        toast.success('Xodim yangilandi');
      } else {
        await employeeService.createEmployee(data);
        toast.success("Xodim qo'shildi");
      }
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
          <h2 className="text-lg font-semibold text-white">
            {employee ? 'Xodimni tahrirlash' : 'Yangi xodim'}
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="label">Ism *</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="To'liq ism"
              className="input"
            />
          </div>
          <div>
            <label className="label">Lavozim *</label>
            <input
              type="text"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="Masalan: Dasturchi"
              className="input"
            />
          </div>
          <div>
            <label className="label">Telefon</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+998 90 123 45 67"
              className="input"
            />
          </div>
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              className="input"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 btn-secondary py-2.5">
              Bekor qilish
            </button>
            <button type="submit" disabled={isSubmitting} className="flex-1 btn-primary py-2.5">
              {isSubmitting ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
