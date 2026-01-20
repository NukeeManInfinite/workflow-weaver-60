// Seller Dashboard Types

export interface StatCardData {
  id: string;
  titleKey: string; // i18n key for translation
  value: string | number;
  subtext?: string;
  icon: 'document' | 'cart' | 'checkmark' | 'chart';
  color: 'blue' | 'orange' | 'green' | 'gray';
  trend?: 'up' | 'down';
  navigateTo?: string; // Route to navigate on click
}

// Backend may return varied field names - handle all possible shapes
export interface ActivityItem {
  id?: string | number;
  entityId?: number;
  type?: 'Order' | 'Contract' | string;
  entityType?: 'Order' | 'Contract' | string;
  referenceNumber?: string;
  reference?: string;
  action?: string;
  message?: string;
  createdAt?: string;
}

// Backend pending item structure - handle varied field names
export interface PendingItem {
  id?: string | number;
  entityId?: number;
  type?: 'Order' | 'Contract' | string;
  entityType?: 'Order' | 'Contract' | string;
  itemType?: 'RequiresFollowUp' | 'PendingApproval' | 'PendingReview' | string;
  referenceNumber?: string;
  reference?: string;
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
