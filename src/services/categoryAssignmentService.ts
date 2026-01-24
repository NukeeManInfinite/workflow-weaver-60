import { apiClient } from '@/lib/api';

// Types for Category Assignments
export interface CategoryAssignment {
  id: number;
  categoryId: number;
  categoryName: string;
  orderId: number;
  orderNumber: string;
  customerName: string;
  teamLeaderId: number | null;
  teamLeaderName: string | null;
  status: 'Pending' | 'InProgress' | 'Completed' | 'Cancelled';
  assignedAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

export interface CreateAssignmentDto {
  categoryId: number;
  teamLeaderId: number;
}

export interface UpdateAssignmentStatusDto {
  status: 'Pending' | 'InProgress' | 'Completed' | 'Cancelled';
}

export interface AssignmentStats {
  pendingAssignments: number;
  inProgressAssignments: number;
  completedAssignments: number;
  totalAssignments: number;
  teamLeadersCount: number;
}

export interface TeamLeader {
  id: number;
  fullName: string;
  department: string;
  activeAssignments: number;
  phone?: string;
}

export interface CategoryForAssignment {
  id: number;
  name: string;
  orderId: number;
  orderNumber: string;
  customerName: string;
  isAssigned: boolean;
}

// Order for assignment (from /api/Orders)
export interface OrderForAssignment {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone?: string;
  status: string;
  totalAmount: number;
  categoryNames?: string[] | string;
  createdAt: string;
  constructorName?: string;
  productionManagerName?: string;
}

export interface CreateOrderAssignmentDto {
  orderId: number;
  teamLeaderId: number;
}

export const categoryAssignmentService = {
  // Get all category assignments
  async getAll(): Promise<CategoryAssignment[]> {
    try {
      const response = await apiClient.get<{ success: boolean; data: CategoryAssignment[] }>('/category-assignments');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching category assignments:', error);
      return [];
    }
  },

  // Get single assignment by ID
  async getById(id: number): Promise<CategoryAssignment | null> {
    try {
      const response = await apiClient.get<{ success: boolean; data: CategoryAssignment }>(`/category-assignments/${id}`);
      return response.data.data || null;
    } catch (error) {
      console.error('Error fetching assignment:', error);
      return null;
    }
  },

  // Create new assignment (Production Manager only)
  async create(dto: CreateAssignmentDto): Promise<CategoryAssignment | null> {
    try {
      const response = await apiClient.post<{ success: boolean; data: CategoryAssignment }>('/category-assignments', dto);
      return response.data.data || null;
    } catch (error) {
      console.error('Error creating assignment:', error);
      throw error;
    }
  },

  // Delete assignment (Production Manager only)
  async delete(id: number): Promise<boolean> {
    try {
      await apiClient.delete(`/category-assignments/${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting assignment:', error);
      throw error;
    }
  },

  // Get assignments by team leader
  async getByTeamLeader(teamLeaderId: number): Promise<CategoryAssignment[]> {
    try {
      const response = await apiClient.get<{ success: boolean; data: CategoryAssignment[] }>(
        `/category-assignments/team-leader/${teamLeaderId}`
      );
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching team leader assignments:', error);
      return [];
    }
  },

  // Get assignments by order
  async getByOrder(orderId: number): Promise<CategoryAssignment[]> {
    try {
      const response = await apiClient.get<{ success: boolean; data: CategoryAssignment[] }>(
        `/category-assignments/order/${orderId}`
      );
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching order assignments:', error);
      return [];
    }
  },

  // Update assignment status
  async updateStatus(id: number, status: UpdateAssignmentStatusDto['status']): Promise<boolean> {
    try {
      await apiClient.put(`/category-assignments/${id}/status`, { status });
      return true;
    } catch (error) {
      console.error('Error updating assignment status:', error);
      throw error;
    }
  },

  // Start assignment
  async start(id: number): Promise<boolean> {
    try {
      await apiClient.put(`/category-assignments/${id}/start`);
      return true;
    } catch (error) {
      console.error('Error starting assignment:', error);
      throw error;
    }
  },

  // Complete assignment
  async complete(id: number): Promise<boolean> {
    try {
      await apiClient.put(`/category-assignments/${id}/complete`);
      return true;
    } catch (error) {
      console.error('Error completing assignment:', error);
      throw error;
    }
  },

  // Get team leaders
  async getTeamLeaders(): Promise<TeamLeader[]> {
    try {
      const response = await apiClient.get<{ success: boolean; data: TeamLeader[] }>('/Users/team-leaders');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching team leaders:', error);
      return [];
    }
  },

  // Get categories available for assignment
  async getCategoriesForAssignment(): Promise<CategoryForAssignment[]> {
    try {
      const response = await apiClient.get<{ success: boolean; data: CategoryForAssignment[] }>('/Categories/for-assignment');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching categories for assignment:', error);
      return [];
    }
  },

  // Get orders for assignment (from /api/Orders)
  async getOrdersForAssignment(): Promise<OrderForAssignment[]> {
    try {
      const response = await apiClient.get<{ success: boolean; data: { items: OrderForAssignment[] } }>('/Orders');
      return response.data.data?.items || [];
    } catch (error) {
      console.error('Error fetching orders for assignment:', error);
      return [];
    }
  },

  // Create assignment for order
  async createOrderAssignment(dto: CreateOrderAssignmentDto): Promise<CategoryAssignment | null> {
    try {
      const response = await apiClient.post<{ success: boolean; data: CategoryAssignment }>('/category-assignments', dto);
      return response.data.data || null;
    } catch (error) {
      console.error('Error creating order assignment:', error);
      throw error;
    }
  },

  // Calculate stats from assignments
  calculateStats(assignments: CategoryAssignment[], teamLeaders: TeamLeader[]): AssignmentStats {
    return {
      pendingAssignments: assignments.filter(a => a.status === 'Pending').length,
      inProgressAssignments: assignments.filter(a => a.status === 'InProgress').length,
      completedAssignments: assignments.filter(a => a.status === 'Completed').length,
      totalAssignments: assignments.length,
      teamLeadersCount: teamLeaders.length,
    };
  },
};
