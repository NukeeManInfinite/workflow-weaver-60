export * from './auth';

// Contract & Order types
export interface Contract {
  id: string;
  contractNumber: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  totalAmount: number;
  status: 'Draft' | 'Active' | 'Completed' | 'Cancelled';
  createdAt: string;
  updatedAt: string;
  sellerId: string;
  sellerName: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  contractId: string;
  contractNumber: string;
  customerName: string;
  status: 'Created' | 'InProgress' | 'Completed' | 'Cancelled';
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  categories: ProductCategory[];
}

export interface ProductCategory {
  id: string;
  name: string;
  orderId: string;
  status: 'Pending' | 'DimensionsSet' | 'InProduction' | 'Completed';
  dimensions: Dimension[];
  materialRequirements: MaterialRequirement[];
  assignedTeamLeaderId?: string;
  assignedTeamLeaderName?: string;
}

export interface Dimension {
  id: string;
  categoryId: string;
  name: string;
  width: number;
  height: number;
  depth: number;
  quantity: number;
  notes?: string;
}

export interface MaterialRequirement {
  id: string;
  categoryId: string;
  materialName: string;
  quantity: number;
  unit: string;
  status: 'Requested' | 'Approved' | 'InStock' | 'Assigned' | 'Used';
}

// Employee & Department types
export interface Department {
  id: string;
  name: string;
  description?: string;
  managerId?: string;
}

export interface Employee {
  id: number;
  userId: number;
  fullName: string;
  phone: string;
  positionId: number;
  positionName?: string;
  departmentId: number;
  departmentName?: string;
  isActive: boolean;
  activeTasks: number;
  completedTasks: number;
  onTimePercent: number | null;
  createdAt: string;
  updatedAt: string | null;
}

// Task types
export interface Task {
  id: string;
  title: string;
  description?: string;
  categoryId: string;
  categoryName: string;
  orderId: string;
  orderNumber: string;
  assignedEmployeeId?: string;
  assignedEmployeeName?: string;
  assignedByTeamLeaderId: string;
  status: 'Created' | 'Assigned' | 'InProgress' | 'Done' | 'Transferred';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  estimatedTime?: number;
  actualTime?: number;
  createdAt: string;
  completedAt?: string;
  sequence: number;
}

// KPI types
export interface KPIRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  taskId: string;
  taskTitle: string;
  timeSpent: number;
  productivity: number;
  qualityScore: number;
  recordedAt: string;
}

export interface EmployeeKPISummary {
  employeeId: string;
  employeeName: string;
  totalTasksCompleted: number;
  averageTimePerTask: number;
  averageProductivity: number;
  averageQualityScore: number;
  period: string;
}

// Warehouse types
export interface InventoryItem {
  id: string;
  materialName: string;
  sku: string;
  quantity: number;
  unit: string;
  minStockLevel: number;
  location: string;
  lastUpdated: string;
  isLowStock: boolean;
}

export interface StockTransaction {
  id: string;
  inventoryItemId: string;
  materialName: string;
  transactionType: 'In' | 'Out' | 'Adjustment';
  quantity: number;
  reason?: string;
  assignedToEmployeeId?: string;
  assignedToTeamId?: string;
  createdAt: string;
  createdById: string;
  createdByName: string;
}

// Notification types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'Info' | 'Warning' | 'Success' | 'Error';
  isRead: boolean;
  createdAt: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
}
