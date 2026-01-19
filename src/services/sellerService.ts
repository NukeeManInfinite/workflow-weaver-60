import apiClient from '@/lib/api';
import { 
  SellerDashboardStats, 
  ActivityItem, 
  PendingItem, 
  StatCardData 
} from '@/types/seller';

// Mock data for development - replace with real API calls
const mockStats: SellerDashboardStats = {
  activeContracts: 12,
  activeContractsChange: '+2 this week',
  pendingOrders: 8,
  pendingOrdersChange: '+3 today',
  completedOrders: 45,
  totalRevenue: 125400,
  revenueChange: '+15%',
};

const mockActivities: ActivityItem[] = [
  {
    id: '1',
    message: 'Order #ORD-2024-015 created',
    timestamp: '5 minutes ago',
    type: 'order',
  },
  {
    id: '2',
    message: 'Dimensions updated for Category A',
    timestamp: '1 hour ago',
    type: 'dimension',
  },
  {
    id: '3',
    message: 'Task assigned to John Doe',
    timestamp: '2 hours ago',
    type: 'task',
  },
  {
    id: '4',
    message: 'Material request approved',
    timestamp: '3 hours ago',
    type: 'material',
  },
];

const mockPendingItems: PendingItem[] = [
  {
    id: '1',
    title: 'Review order dimensions',
    dueDate: 'Today',
    priority: 'high',
  },
  {
    id: '2',
    title: 'Approve material request',
    dueDate: 'Tomorrow',
    priority: 'medium',
  },
  {
    id: '3',
    title: 'Assign tasks to team',
    dueDate: 'This week',
    priority: 'medium',
  },
  {
    id: '4',
    title: 'Update inventory count',
    dueDate: 'This week',
    priority: 'low',
  },
];

export const sellerService = {
  async getDashboardStats(): Promise<SellerDashboardStats> {
    // TODO: Replace with real API call
    // const response = await apiClient.get<{ data: SellerDashboardStats }>('/seller/dashboard/stats');
    // return response.data.data;
    
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    return mockStats;
  },

  async getRecentActivities(): Promise<ActivityItem[]> {
    // TODO: Replace with real API call
    // const response = await apiClient.get<{ data: ActivityItem[] }>('/seller/activities');
    // return response.data.data;
    
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockActivities;
  },

  async getPendingItems(): Promise<PendingItem[]> {
    // TODO: Replace with real API call
    // const response = await apiClient.get<{ data: PendingItem[] }>('/seller/pending-items');
    // return response.data.data;
    
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockPendingItems;
  },

  transformStatsToCards(stats: SellerDashboardStats): StatCardData[] {
    return [
      {
        id: 'active-contracts',
        title: 'Active Contracts',
        value: stats.activeContracts,
        subtext: stats.activeContractsChange,
        icon: 'document',
        color: 'blue',
      },
      {
        id: 'pending-orders',
        title: 'Pending Orders',
        value: stats.pendingOrders,
        subtext: stats.pendingOrdersChange,
        icon: 'cart',
        color: 'orange',
      },
      {
        id: 'completed-orders',
        title: 'Completed Orders',
        value: stats.completedOrders,
        icon: 'checkmark',
        color: 'green',
      },
      {
        id: 'total-revenue',
        title: 'Total Revenue',
        value: `$${stats.totalRevenue.toLocaleString()}`,
        subtext: stats.revenueChange,
        icon: 'chart',
        color: 'gray',
      },
    ];
  },
};
