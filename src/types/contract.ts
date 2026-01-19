// Contract API Types - Strictly matching backend schema

export interface Contract {
  id: string;
  contractNumber: string;
  customerId: string;
  customerName: string;
  categoryId?: string;
  categoryName?: string;
  description?: string;
  totalAmount: number;
  advancePaymentPercentage?: number;
  deadline?: string;
  signedDate?: string;
  paymentStatus?: 'Pending' | 'PartiallyPaid' | 'Paid';
  terms?: string;
  notes?: string;
  status: 'Draft' | 'Active' | 'Completed' | 'Cancelled';
  createdAt: string;
  updatedAt: string;
  sellerId: string;
  sellerName: string;
}

export interface ContractCreateRequest {
  customerId: string;
  categoryId?: string;
  description?: string;
  totalAmount: number;
  advancePaymentPercentage?: number;
  deadline?: string;
  signedDate?: string;
  paymentStatus?: string;
  terms?: string;
  notes?: string;
}

export interface ContractUpdateRequest extends Partial<ContractCreateRequest> {}

export interface ContractStatusUpdateRequest {
  status: 'Draft' | 'Active' | 'Completed' | 'Cancelled';
}

export interface ContractStats {
  totalContracts: number;
  activeContracts: number;
  completedContracts: number;
  draftContracts: number;
}

export interface ContractsQueryParams {
  Status?: string;
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

export interface PaginatedResponse<T> {
  items: T[];
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
