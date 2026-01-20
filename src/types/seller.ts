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

// Backend may return partial/null fields - all marked optional for defensive coding
export interface ActivityItem {
  id?: string;
  type?: 'Order' | 'Contract' | string;
  referenceNumber?: string;
  action?: 'Created' | 'Updated' | 'Pending' | 'Completed' | string;
  createdAt?: string;
}

export interface PendingItem {
  id?: string;
  type?: 'Order' | 'Contract' | string;
  referenceNumber?: string;
  status?: string;
  createdAt?: string;
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
