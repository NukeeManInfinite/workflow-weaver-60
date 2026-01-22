import { apiClient } from '@/lib/api';

// Types for Production Manager
export interface CategoryAssignment {
  id: number;
  categoryName: string;
  orderNumber: string;
  customerName: string;
  status: string;
  assignedTeamLeaderId: number | null;
  assignedTeamLeaderName: string | null;
}

export interface TeamLeader {
  id: number;
  fullName: string;
  department: string;
  activeAssignments: number;
  phone?: string;
}

export interface AssignmentStats {
  pendingAssignments: number;
  assignedCategories: number;
  teamLeadersCount: number;
}

export interface ProductionKPI {
  totalOrders: number;
  ordersInProduction: number;
  productionOutput: number;
  employeeProductivity: number;
  ordersChange: number;
  outputChange: number;
  productivityChange: number;
}

export interface ProductionChartData {
  month: string;
  orders: number;
  completed: number;
}

export interface CategoryProductionData {
  category: string;
  completed: number;
  inProgress: number;
  pending: number;
}

export interface StatusDistribution {
  name: string;
  value: number;
  color: string;
}

export interface ProductionDashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  teamLeaders: number;
  departments: number;
  pendingAssignments: number;
  assignedCategories: number;
}

export const productionManagerService = {
  // Get categories ready for assignment
  async getCategoriesToAssign(): Promise<CategoryAssignment[]> {
    try {
      const response = await apiClient.get<{ success: boolean; data: CategoryAssignment[] }>('/Categories/for-assignment');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching categories for assignment:', error);
      return [];
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

  // Assign category to team leader
  async assignCategoryToTeamLeader(categoryId: number, teamLeaderId: number): Promise<boolean> {
    try {
      await apiClient.post(`/Categories/${categoryId}/assign`, { teamLeaderId });
      return true;
    } catch (error) {
      console.error('Error assigning category:', error);
      throw error;
    }
  },

  // Get assignment stats
  async getAssignmentStats(): Promise<AssignmentStats> {
    try {
      const response = await apiClient.get<{ success: boolean; data: AssignmentStats }>('/ProductionManager/assignment-stats');
      return response.data.data || { pendingAssignments: 0, assignedCategories: 0, teamLeadersCount: 0 };
    } catch (error) {
      console.error('Error fetching assignment stats:', error);
      return { pendingAssignments: 0, assignedCategories: 0, teamLeadersCount: 0 };
    }
  },

  // Get production KPIs
  async getProductionKPI(): Promise<ProductionKPI> {
    try {
      const response = await apiClient.get<{ success: boolean; data: ProductionKPI }>('/ProductionManager/kpi');
      return response.data.data || {
        totalOrders: 0,
        ordersInProduction: 0,
        productionOutput: 0,
        employeeProductivity: 0,
        ordersChange: 0,
        outputChange: 0,
        productivityChange: 0,
      };
    } catch (error) {
      console.error('Error fetching production KPI:', error);
      return {
        totalOrders: 0,
        ordersInProduction: 0,
        productionOutput: 0,
        employeeProductivity: 0,
        ordersChange: 0,
        outputChange: 0,
        productivityChange: 0,
      };
    }
  },

  // Get production chart data
  async getProductionChartData(): Promise<ProductionChartData[]> {
    try {
      const response = await apiClient.get<{ success: boolean; data: ProductionChartData[] }>('/ProductionManager/production-chart');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching production chart data:', error);
      return [];
    }
  },

  // Get category production data
  async getCategoryProductionData(): Promise<CategoryProductionData[]> {
    try {
      const response = await apiClient.get<{ success: boolean; data: CategoryProductionData[] }>('/ProductionManager/category-production');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching category production data:', error);
      return [];
    }
  },

  // Get status distribution
  async getStatusDistribution(): Promise<StatusDistribution[]> {
    try {
      const response = await apiClient.get<{ success: boolean; data: StatusDistribution[] }>('/ProductionManager/status-distribution');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching status distribution:', error);
      return [];
    }
  },

  // Get dashboard stats for Production Manager
  async getDashboardStats(): Promise<ProductionDashboardStats> {
    try {
      const response = await apiClient.get<{ success: boolean; data: ProductionDashboardStats }>('/ProductionManager/dashboard-stats');
      return response.data.data || {
        totalEmployees: 0,
        activeEmployees: 0,
        teamLeaders: 0,
        departments: 0,
        pendingAssignments: 0,
        assignedCategories: 0,
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        totalEmployees: 0,
        activeEmployees: 0,
        teamLeaders: 0,
        departments: 0,
        pendingAssignments: 0,
        assignedCategories: 0,
      };
    }
  },
};
