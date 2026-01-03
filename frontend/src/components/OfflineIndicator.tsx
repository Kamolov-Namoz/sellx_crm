'use client';

import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useEffect, useState } from 'react';
import { offlineQueue } from '@/services/offlineQueue';

export default function OfflineIndicator() {
  const isOnline = useOnlineStatus();
  const [queueLength, setQueueLength] = useState(0);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  useEffect(() => {
    const updateQueueLength = async () => {
      const length = await offlineQueue.getQueueLength();
      setQueueLength(length);
    };

    updateQueueLength();
    const interval = setInterval(updateQueueLength, 5000);

    // Listen for sync complete event
    const handleSyncComplete = (event: CustomEvent<{ processed: number; failed: number }>) => {
      const { processed, failed } = event.detail;
      if (processed > 0) {
        setSyncMessage(`${processed} ta so'rov sinxronlandi`);
        setTimeout(() => setSyncMessage(null), 3000);
      }
      if (failed > 0) {
        setSyncMessage(`${failed} ta so'rov xato bilan tugadi`);
        setTimeout(() => setSyncMessage(null), 5000);
      }
      updateQueueLength();
    };

    window.addEventListener('offline-sync-complete', handleSyncComplete as EventListener);

    return () => {
      clearInterval(interval);
      window.removeEventListener('offline-sync-complete', handleSyncComplete as EventListener);
    };
  }, []);

  // Show sync message when coming back online
  if (syncMessage) {
    return (
      <div className="fixed top-0 left-0 right-0 bg-green-500 text-white text-center py-2 text-sm font-medium z-50 safe-top">
        <div className="flex items-center justify-center">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {syncMessage}
        </div>
      </div>
    );
  }

  if (isOnline && queueLength === 0) {
    return null;
  }

  // Show pending queue when online but has queued items
  if (isOnline && queueLength > 0) {
    return (
      <div className="fixed top-0 left-0 right-0 bg-blue-500 text-white text-center py-2 text-sm font-medium z-50 safe-top">
        <div className="flex items-center justify-center">
          <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          {queueLength} ta so'rov sinxronlanmoqda...
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white text-center py-2 text-sm font-medium z-50 safe-top">
      <div className="flex items-center justify-center">
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
        </svg>
        Oflayn rejim {queueLength > 0 ? `- ${queueLength} ta so'rov kutmoqda` : ''}
      </div>
    </div>
  );
}
