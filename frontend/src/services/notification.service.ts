import api from './api';

export const notificationService = {
  async subscribe(deviceToken: string): Promise<void> {
    await api.post('/notifications/subscribe', { deviceToken });
  },

  async unsubscribe(deviceToken: string): Promise<void> {
    await api.delete('/notifications/unsubscribe', { data: { deviceToken } });
  },

  // Register service worker
  async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      return registration;
    } catch (error) {
      console.error('Service worker registration failed:', error);
      return null;
    }
  },

  // Check if push notifications are supported
  isSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      'Notification' in window &&
      'serviceWorker' in navigator &&
      'PushManager' in window
    );
  },

  // Get current permission status
  getPermissionStatus(): NotificationPermission | 'unsupported' {
    if (!this.isSupported()) {
      return 'unsupported';
    }
    return Notification.permission;
  },
};

export default notificationService;
