'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { notificationService } from '@/services/notification.service';

interface NotificationContextType {
  isSupported: boolean;
  isPermissionGranted: boolean;
  requestPermission: () => Promise<boolean>;
  showReminder: (clientName: string, message?: string) => void;
  showNewOrder: (orderTitle: string, clientName: string) => void;
  showInfo: (title: string, body: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [isSupported, setIsSupported] = useState(false);
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);

  useEffect(() => {
    const init = async () => {
      const supported = notificationService.isSupported();
      setIsSupported(supported);

      if (supported) {
        const granted = await notificationService.init();
        setIsPermissionGranted(granted);
      }
    };

    init();
  }, []);

  const requestPermission = useCallback(async () => {
    const granted = await notificationService.requestPermission();
    setIsPermissionGranted(granted);
    return granted;
  }, []);

  const showReminder = useCallback((clientName: string, message?: string) => {
    notificationService.showReminder(clientName, message);
  }, []);

  const showNewOrder = useCallback((orderTitle: string, clientName: string) => {
    notificationService.showNewOrder(orderTitle, clientName);
  }, []);

  const showInfo = useCallback((title: string, body: string) => {
    notificationService.showInfo(title, body);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        isSupported,
        isPermissionGranted,
        requestPermission,
        showReminder,
        showNewOrder,
        showInfo,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification(): NotificationContextType {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
