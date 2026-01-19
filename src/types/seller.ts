// Seller Dashboard Types

export interface StatCardData {
  id: string;
  title: string;
  value: string | number;
  subtext?: string;
  icon: 'document' | 'cart' | 'checkmark' | 'chart';
  color: 'blue' | 'orange' | 'green' | 'gray';
  trend?: 'up' | 'down';
}

export interface ActivityItem {
  id: string;
  message: string;
  timestamp: string;
  type: 'order' | 'dimension' | 'task' | 'material';
}

export interface PendingItem {
  id: string;
  title: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
}

export interface SellerDashboardStats {
  activeContracts: number;
  activeContractsChange: string;
  pendingOrders: number;
  pendingOrdersChange: string;
  completedOrders: number;
  totalRevenue: number;
  revenueChange: string;
}
