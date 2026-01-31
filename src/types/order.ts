// Order Types for Orders Management

// Category object in Order (Many-to-Many)
export interface OrderCategoryInfo {
  id: number;
  name: string;
  description?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  contractId: string;
  contractNumber?: string;
  customerId: string;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  // Many-to-Many: categories is now an array of objects
  categories?: OrderCategoryInfo[];
  // Legacy fields for backward compatibility
  categoryId?: string;
  categoryName?: string;
  categoryNames?: string[] | string;
  status: OrderStatus;
  totalAmount: number;
  constructorId?: string;
  constructorName?: string;
  productionManagerId?: string;
  productionManagerName?: string;
  description?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

// Contract summary for order creation
export interface ContractSummary {
  id: string;
  contractNumber: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  categoryNames?: string[];
  totalAmount: number;
  status: string;
  isApproved: boolean;
}

export type OrderStatus = 'Created' | 'InProgress' | 'Completed' | 'Cancelled';

export interface OrderStats {
  totalOrders: number;
  created: number;
  inProgress: number;
  completed: number;
}

export interface CreateOrderDto {
  contractId: number;
  description?: string;
  notes?: string;
}

export interface UpdateOrderDto {
  contractId?: string;
  customerId?: string;
  categoryId?: string;
  description?: string;
  totalAmount?: number;
  notes?: string;
}

export interface AssignConstructorDto {
  constructorId: number;
}

export interface AssignProductionManagerDto {
  productionManagerId: number;
}

export interface OrdersQueryParams {
  Status?: OrderStatus;
  CustomerId?: string;
  CategoryId?: string;
  FromDate?: string;
  ToDate?: string;
  SearchTerm?: string;
  PageNumber?: number;
  PageSize?: number;
  SortBy?: string;
  SortDescending?: boolean;
}

export interface PaginatedOrdersResponse {
  items: Order[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: string[] | null;
}
