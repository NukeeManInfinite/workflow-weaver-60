import apiClient from '@/lib/api';
import { Notification } from '@/types';

export const notificationService = {
  async getAll(): Promise<Notification[]> {
    const response = await apiClient.get<Notification[]>('/notifications');
    return response.data;
  },

  async getUnread(): Promise<Notification[]> {
    const response = await apiClient.get<Notification[]>('/notifications/unread');
    return response.data;
  },

  async markAsRead(id: string): Promise<void> {
    await apiClient.post(`/notifications/${id}/read`);
  },

  async markAllAsRead(): Promise<void> {
    await apiClient.post('/notifications/read-all');
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/notifications/${id}`);
  },

  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get<{ count: number }>('/notifications/unread/count');
    return response.data.count;
  },
};
