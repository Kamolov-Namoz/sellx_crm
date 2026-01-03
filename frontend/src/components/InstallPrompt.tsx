'use client';

import { useState } from 'react';
import { usePWAInstall } from '@/hooks/usePWAInstall';

export default function InstallPrompt() {
  const { isInstallable, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  if (!isInstallable || dismissed) {
    return null;
  }

  const handleInstall = async () => {
    setIsInstalling(true);
    await install();
    setIsInstalling(false);
  };

  return (
    <div className="fixed bottom-20 left-4 right-4 bg-white rounded-xl shadow-lg border border-gray-200 p-4 z-40">
      <div className="flex items-start">
        <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mr-3 flex-shrink-0">
          <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="font-medium text-gray-900">Ilovani o'rnating</p>
          <p className="text-sm text-gray-600 mt-1">
            Tezroq kirish uchun bosh ekranga qo'shing
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleInstall}
              disabled={isInstalling}
              className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {isInstalling ? 'O\'rnatilmoqda...' : 'O\'rnatish'}
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="px-4 py-2 text-gray-600 text-sm hover:bg-gray-100 rounded-lg"
            >
              Keyinroq
            </button>
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-gray-400 hover:text-gray-600"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
