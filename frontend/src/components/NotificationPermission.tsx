'use client';

import { useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';

export default function NotificationPermission() {
  const { permission, isLoading, requestPermission, isSupported } = useNotifications();
  const [dismissed, setDismissed] = useState(false);

  // Don't show if not supported, already granted, or dismissed
  if (!isSupported || permission === 'granted' || dismissed) {
    return null;
  }

  // Show denied indicator
  if (permission === 'denied') {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div className="flex-1">
            <p className="text-sm text-yellow-800 font-medium">Bildirishnomalar o'chirilgan</p>
            <p className="text-xs text-yellow-700 mt-1">
              Follow-up eslatmalarini olish uchun brauzer sozlamalaridan bildirishnomalarni yoqing.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show permission request prompt
  return (
    <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-4">
      <div className="flex items-start">
        <svg className="w-6 h-6 text-primary-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <div className="flex-1">
          <p className="text-sm text-primary-800 font-medium">Bildirishnomalarni yoqing</p>
          <p className="text-xs text-primary-700 mt-1">
            Follow-up vaqti kelganda eslatma olish uchun bildirishnomalarni yoqing.
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={requestPermission}
              disabled={isLoading}
              className="px-3 py-1.5 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {isLoading ? 'Yuklanmoqda...' : 'Yoqish'}
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="px-3 py-1.5 text-primary-700 text-sm hover:bg-primary-100 rounded-lg"
            >
              Keyinroq
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
