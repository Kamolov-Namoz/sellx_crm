// Browser Web Notifications Service (Firebase'siz)

class NotificationService {
  private permission: NotificationPermission = 'default';

  async init(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('Bu brauzer notification qo\'llab-quvvatlamaydi');
      return false;
    }

    this.permission = Notification.permission;

    if (this.permission === 'default') {
      this.permission = await Notification.requestPermission();
    }

    return this.permission === 'granted';
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      return false;
    }

    const permission = await Notification.requestPermission();
    this.permission = permission;
    return permission === 'granted';
  }

  isSupported(): boolean {
    return 'Notification' in window;
  }

  isPermissionGranted(): boolean {
    return this.permission === 'granted';
  }

  show(title: string, options?: NotificationOptions): Notification | null {
    if (this.permission !== 'granted') {
      console.warn('Notification ruxsati berilmagan');
      return null;
    }

    const defaultOptions: NotificationOptions = {
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      ...options,
    };

    const notification = new Notification(title, defaultOptions);

    // Click handler
    notification.onclick = () => {
      window.focus();
      notification.close();
      if (options?.data?.url) {
        window.location.href = options.data.url;
      }
    };

    return notification;
  }

  // Reminder notification
  showReminder(clientName: string, message?: string): Notification | null {
    return this.show(`Eslatma: ${clientName}`, {
      body: message || 'Mijoz bilan bog\'lanish vaqti keldi',
      tag: 'reminder',
      requireInteraction: true,
      data: { url: '/clients' },
    });
  }

  // New order notification
  showNewOrder(orderTitle: string, clientName: string): Notification | null {
    return this.show('Yangi zakaz', {
      body: `${orderTitle} - ${clientName}`,
      tag: 'new-order',
      data: { url: '/orders' },
    });
  }

  // Status change notification
  showStatusChange(title: string, newStatus: string): Notification | null {
    return this.show('Status yangilandi', {
      body: `${title}: ${newStatus}`,
      tag: 'status-change',
    });
  }

  // General notification
  showInfo(title: string, body: string): Notification | null {
    return this.show(title, {
      body,
      tag: 'info',
    });
  }
}

export const notificationService = new NotificationService();
export default notificationService;
