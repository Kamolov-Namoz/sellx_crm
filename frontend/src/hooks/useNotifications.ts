'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/services/api';

type PermissionState = 'default' | 'granted' | 'denied' | 'unsupported';

export function useNotifications() {
  const [permission, setPermission] = useState<PermissionState>('default');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if notifications are supported
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setPermission('unsupported');
      return;
    }

    setPermission(Notification.permission as PermissionState);
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (permission === 'unsupported') {
      return false;
    }

    setIsLoading(true);

    try {
      const result = await Notification.requestPermission();
      setPermission(result as PermissionState);

      if (result === 'granted') {
        // Register service worker and get FCM token
        await registerForPushNotifications();
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [permission]);

  const registerForPushNotifications = async (): Promise<void> => {
    try {
      // Register service worker if not already registered
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;

        // Subscribe to push notifications
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        });

        // Send subscription to backend
        await api.post('/notifications/subscribe', {
          deviceToken: JSON.stringify(subscription),
        });
      }
    } catch (error) {
      console.error('Failed to register for push notifications:', error);
    }
  };

  return {
    permission,
    isLoading,
    requestPermission,
    isSupported: permission !== 'unsupported',
    isGranted: permission === 'granted',
    isDenied: permission === 'denied',
  };
}
