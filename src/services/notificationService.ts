import apiClient from '@/lib/api';
import { Notification } from '@/types';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: string[] | null;
}

export const notificationService = {
  async getAll(): Promise<Notification[]> {
    const response = await apiClient.get<ApiResponse<Notification[]>>('/Notifications');
    return response.data.data || [];
  },

  async markAsRead(id: string): Promise<void> {
    await apiClient.put(`/Notifications/${id}/read`);
  },

  async markAllAsRead(): Promise<void> {
    await apiClient.put('/Notifications/read-all');
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/Notifications/${id}`);
  },
};
