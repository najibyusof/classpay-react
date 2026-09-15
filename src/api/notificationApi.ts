import { apiClient } from './client';
import type { AppNotification, NotificationListResponse } from '../types/notification';
import type { PaginatedResponse } from '../types/student';

export const notificationApi = {
  getNotifications: async (page = 1): Promise<PaginatedResponse<AppNotification>> => {
    const { data } = await apiClient.get<NotificationListResponse>('/notifications', {
      params: { page },
    });
    return { data: data.data.notifications, meta: data.data.pagination };
  },
  getUnreadCount: async (): Promise<number> => {
    const { data } = await apiClient.get<{ count: number } | { data: { count: number } }>(
      '/notifications/unread-count',
    );
    return 'data' in data ? data.data.count : data.count;
  },
  getNotification: async (notificationId: number | string): Promise<AppNotification> => {
    const { data } = await apiClient.get<AppNotification | { data: AppNotification }>(
      `/notifications/${notificationId}`,
    );
    return 'data' in data ? data.data : data;
  },
  markAsRead: async (notificationId: number | string): Promise<void> => {
    await apiClient.post(`/notifications/${notificationId}/read`);
  },
  markAsUnread: async (notificationId: number | string): Promise<void> => {
    await apiClient.post(`/notifications/${notificationId}/unread`);
  },
  markAllAsRead: async (): Promise<void> => {
    await apiClient.post('/notifications/read-all');
  },
};
