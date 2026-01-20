import apiClient from '@/lib/api';
import { 
  SellerDashboardStats, 
  ActivityItem, 
  PendingItem, 
  StatCardData 
} from '@/types/seller';
import { Contract } from '@/types';

// API Response wrapper type (backend envelope)
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: string[] | null;
}

// Contract stats response from API
interface ContractStatsResponse {
  totalContracts: number;
  activeContracts: number;
  completedContracts: number;
  draftContracts: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number;
}

export const sellerService = {
  // ==================== Dashboard Stats ====================
  async getDashboardStats(): Promise<SellerDashboardStats> {
    const response = await apiClient.get<ApiResponse<ContractStatsResponse>>('/seller/dashboard/stats');
    const stats = response.data.data;
    
    return {
      activeContracts: stats.activeContracts,
      activeContractsChange: '',
      pendingOrders: stats.pendingOrders,
      pendingOrdersChange: '',
      completedOrders: stats.completedOrders,
      totalRevenue: stats.totalRevenue,
      revenueChange: '',
    };
  },

  // ==================== Activities ====================
  async getRecentActivities(limit: number = 10): Promise<ActivityItem[]> {
    const response = await apiClient.get<ApiResponse<ActivityItem[]>>(`/seller/activities?limit=${limit}`);
    return response.data.data || [];
  },

  // ==================== Pending Items ====================
  async getPendingItems(): Promise<PendingItem[]> {
    const response = await apiClient.get<ApiResponse<PendingItem[]>>('/seller/pending-items');
    return response.data.data || [];
  },

  // ==================== Contracts ====================
  async getContracts(): Promise<Contract[]> {
    const response = await apiClient.get<ApiResponse<Contract[]>>('/contracts');
    return response.data.data;
  },

  async getContractById(id: string): Promise<Contract> {
    const response = await apiClient.get<ApiResponse<Contract>>(`/contracts/${id}`);
    return response.data.data;
  },

  async createContract(contract: Partial<Contract>): Promise<Contract> {
    const response = await apiClient.post<ApiResponse<Contract>>('/contracts', contract);
    return response.data.data;
  },

  async updateContract(id: string, contract: Partial<Contract>): Promise<Contract> {
    const response = await apiClient.put<ApiResponse<Contract>>(`/contracts/${id}`, contract);
    return response.data.data;
  },

  async deleteContract(id: string): Promise<void> {
    await apiClient.delete(`/contracts/${id}`);
  },

  // ==================== Contract Stats ====================
  async getContractStats(): Promise<ContractStatsResponse> {
    const response = await apiClient.get<ApiResponse<ContractStatsResponse>>('/contracts/stats');
    return response.data.data;
  },

  // ==================== Helper Functions ====================
  transformStatsToCards(stats: SellerDashboardStats): StatCardData[] {
    // Format revenue with Uzbek locale
    const formattedRevenue = new Intl.NumberFormat('uz-UZ', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(stats.totalRevenue) + " so'm";

    return [
      {
        id: 'active-contracts',
        titleKey: 'stats.activeContracts',
        value: stats.activeContracts,
        subtext: stats.activeContractsChange || undefined,
        icon: 'document',
        color: 'blue',
        navigateTo: '/seller/contracts',
      },
      {
        id: 'pending-orders',
        titleKey: 'stats.pendingOrders',
        value: stats.pendingOrders,
        subtext: stats.pendingOrdersChange || undefined,
        icon: 'cart',
        color: 'orange',
        navigateTo: '/seller/orders',
      },
      {
        id: 'completed-orders',
        titleKey: 'stats.completedOrders',
        value: stats.completedOrders,
        icon: 'checkmark',
        color: 'green',
        navigateTo: '/seller/orders',
      },
      {
        id: 'total-revenue',
        titleKey: 'stats.totalRevenue',
        value: formattedRevenue,
        subtext: stats.revenueChange || undefined,
        icon: 'chart',
        color: 'gray',
      },
    ];
  },
};
