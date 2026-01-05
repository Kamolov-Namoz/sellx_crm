// Browser Web Notifications Service (Firebase'siz)
import api from './api';
import { ApiResponse } from '@/types';

export interface AppNotification {
  _id: string;
  userId: string;
  type: 'chat_message' | 'new_task' | 'task_completed' | 'project_update';
  title: string;
  message: string;
  data?: {
    projectId?: string;
    taskId?: string;
    senderId?: string;
    senderName?: string;
  };
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface NotificationsResponse {
  notifications: AppNotification[];
  total: number;
  unreadCount: number;
  page: number;
  totalPages: number;
}

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

    notification.onclick = () => {
      window.focus();
      notification.close();
      if (options?.data?.url) {
        window.location.href = options.data.url;
      }
    };

    return notification;
  }

  // API methods
  async getNotifications(page = 1): Promise<ApiResponse<NotificationsResponse>> {
    const response = await api.get<ApiResponse<NotificationsResponse>>(
      `/notifications?page=${page}`
    );
    return response.data;
  }

  async getUnreadCount(): Promise<ApiResponse<{ count: number }>> {
    const response = await api.get<ApiResponse<{ count: number }>>(
      '/notifications/unread-count'
    );
    return response.data;
  }

  async markAsRead(notificationId: string): Promise<ApiResponse<AppNotification>> {
    const response = await api.patch<ApiResponse<AppNotification>>(
      `/notifications/${notificationId}/read`
    );
    return response.data;
  }

  async markAllAsRead(): Promise<ApiResponse<{ message: string }>> {
    const response = await api.patch<ApiResponse<{ message: string }>>(
      '/notifications/read-all'
    );
    return response.data;
  }

  // Browser notifications
  showReminder(clientName: string, message?: string): Notification | null {
    return this.show(`Eslatma: ${clientName}`, {
      body: message || 'Mijoz bilan bog\'lanish vaqti keldi',
      tag: 'reminder',
      requireInteraction: true,
      data: { url: '/clients' },
    });
  }

  showNewOrder(orderTitle: string, clientName: string): Notification | null {
    return this.show('Yangi zakaz', {
      body: `${orderTitle} - ${clientName}`,
      tag: 'new-order',
      data: { url: '/orders' },
    });
  }

  showStatusChange(title: string, newStatus: string): Notification | null {
    return this.show('Status yangilandi', {
      body: `${title}: ${newStatus}`,
      tag: 'status-change',
    });
  }

  showChatMessage(senderName: string, projectTitle: string, projectId: string): Notification | null {
    return this.show(`${senderName} xabar yubordi`, {
      body: projectTitle,
      tag: `chat-${projectId}`,
      data: { url: `/developer/projects/${projectId}` },
    });
  }

  showNewTask(taskTitle: string, projectTitle: string, projectId: string): Notification | null {
    return this.show('Yangi vazifa', {
      body: `${projectTitle}: ${taskTitle}`,
      tag: `task-${projectId}`,
      data: { url: `/developer/projects/${projectId}` },
    });
  }

  showInfo(title: string, body: string): Notification | null {
    return this.show(title, {
      body,
      tag: 'info',
    });
  }
}

export const notificationService = new NotificationService();
export default notificationService;
