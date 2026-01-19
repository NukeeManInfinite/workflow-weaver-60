// Contract Types - Matching Backend Schema Exactly

// Contract Status Enum
export type ContractStatus = 'Draft' | 'Active' | 'Completed' | 'Cancelled';

// Payment Status Enum
export type PaymentStatus = 'Pending' | 'PartiallyPaid' | 'Paid';

// Contract Entity - matches backend response
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
  paymentStatus?: PaymentStatus;
  terms?: string;
  notes?: string;
  status: ContractStatus;
  createdAt: string;
  updatedAt: string;
  sellerId: string;
  sellerName: string;
}

// POST /api/Contracts - Create Request
export interface ContractCreateRequest {
  customerId: string;
  categoryId?: string;
  description?: string;
  totalAmount: number;
  advancePaymentPercentage?: number;
  deadline?: string;
  signedDate?: string;
  paymentStatus?: PaymentStatus;
  terms?: string;
  notes?: string;
}

// PUT /api/Contracts/{id} - Update Request
export interface ContractUpdateRequest {
  customerId?: string;
  categoryId?: string;
  description?: string;
  totalAmount?: number;
  advancePaymentPercentage?: number;
  deadline?: string;
  signedDate?: string;
  paymentStatus?: PaymentStatus;
  terms?: string;
  notes?: string;
}

// PUT /api/Contracts/{id}/status - Status Update Request
export interface ContractStatusUpdateRequest {
  status: ContractStatus;
}

// GET /api/Contracts/stats - Statistics Response
export interface ContractStats {
  totalContracts: number;
  activeContracts: number;
  completedContracts: number;
  draftContracts: number;
}

// Query Parameters for GET /api/Contracts
export interface ContractsQueryParams {
  Status?: ContractStatus;
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

// Paginated Response wrapper
export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

// Standard API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: string[] | null;
}
