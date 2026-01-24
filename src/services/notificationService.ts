import apiClient from '@/lib/api';
import { Notification } from '@/types';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: string[] | null;
}

export interface CreateNotificationDto {
  userId: number;
  title: string;
  message: string;
  type?: 'Info' | 'Warning' | 'Success' | 'Error';
  relatedEntityType?: string;
  relatedEntityId?: number;
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

  // Create notification for a user
  async create(dto: CreateNotificationDto): Promise<void> {
    await apiClient.post('/Notifications', dto);
  },

  // Send assignment notification to team leader
  async sendAssignmentNotification(teamLeaderId: number, orderNumbers: string[]): Promise<void> {
    try {
      const orderList = orderNumbers.join(', ');
      await this.create({
        userId: teamLeaderId,
        title: 'Yangi Tayinlov',
        message: `Sizga yangi buyurtmalar tayinlandi: ${orderList}`,
        type: 'Info',
        relatedEntityType: 'Assignment',
      });
    } catch (error) {
      console.error('Error sending assignment notification:', error);
      // Don't throw - notification failure shouldn't block assignment
    }
  },
};
