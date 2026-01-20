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
  customerPhone?: string;
  customerAddress?: string;
  categoryId?: string;
  categoryName?: string;
  categoryNames?: string[] | string; // Backend may return array or comma-separated string
  description?: string;
  totalAmount: number;
  advancePaymentAmount?: number;
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
  productionDurationDays?: number;
  deliveryTerms?: string;
  penaltyTerms?: string;
}

// Customer Entity
export interface Customer {
  id: string;
  fullName: string;
  phoneNumber: string;
  address: string;
}

// Category Entity
export interface Category {
  id: string;
  name: string;
  description?: string;
}

// New Customer for wizard
export interface NewCustomerData {
  fullName: string;
  phoneNumber: string;
  address: string;
}

// Wizard Form Data
export interface ContractWizardData {
  // Step 1: Customer
  isNewCustomer: boolean;
  customerId?: string;
  newCustomer?: NewCustomerData;
  
  // Step 2: Categories
  categoryIds: string[];
  description?: string;
  
  // Step 3: Payment
  totalAmount: number;
  advancePaymentAmount: number;
  
  // Step 4: Terms
  productionDurationDays: number;
  deliveryTerms: string;
  penaltyTerms: string;
  additionalNotes?: string;
}

// POST /api/Contracts - Create Request
export interface ContractCreateRequest {
  customerId?: string;
  newCustomer?: NewCustomerData;
  categoryIds: string[];
  description?: string;
  totalAmount: number;
  advancePaymentAmount: number;
  productionDurationDays: number;
  deliveryTerms: string;
  penaltyTerms: string;
  additionalNotes?: string;
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
