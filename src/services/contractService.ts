import apiClient from '@/lib/api';
import {
  Contract,
  ContractCreateRequest,
  ContractUpdateRequest,
  ContractStatusUpdateRequest,
  ContractStats,
  ContractsQueryParams,
  PaginatedResponse,
  ApiResponse,
} from '@/types/contract';

const BASE_URL = '/Contracts';

export const contractService = {
  /**
   * GET /api/Contracts
   * Load contracts list with pagination, search, filters, sorting
   */
  async getContracts(params?: ContractsQueryParams): Promise<PaginatedResponse<Contract>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Contract>>>(BASE_URL, {
      params: {
        Status: params?.Status,
        CustomerId: params?.CustomerId,
        CategoryId: params?.CategoryId,
        FromDate: params?.FromDate,
        ToDate: params?.ToDate,
        SearchTerm: params?.SearchTerm,
        PageNumber: params?.PageNumber ?? 1,
        PageSize: params?.PageSize ?? 10,
        SortBy: params?.SortBy,
        SortDescending: params?.SortDescending,
      },
    });
    return response.data.data;
  },

  /**
   * GET /api/Contracts/stats
   * Load dashboard statistics
   */
  async getStats(): Promise<ContractStats> {
    const response = await apiClient.get<ApiResponse<ContractStats>>(`${BASE_URL}/stats`);
    return response.data.data;
  },

  /**
   * GET /api/Contracts/{id}
   * Get single contract by ID for viewing/editing
   */
  async getById(id: string): Promise<Contract> {
    const response = await apiClient.get<ApiResponse<Contract>>(`${BASE_URL}/${id}`);
    return response.data.data;
  },

  /**
   * POST /api/Contracts
   * Create new contract - does NOT send contractNumber
   */
  async create(data: ContractCreateRequest): Promise<Contract> {
    const response = await apiClient.post<ApiResponse<Contract>>(BASE_URL, data);
    return response.data.data;
  },

  /**
   * PUT /api/Contracts/{id}
   * Update existing contract
   */
  async update(id: string, data: ContractUpdateRequest): Promise<Contract> {
    const response = await apiClient.put<ApiResponse<Contract>>(`${BASE_URL}/${id}`, data);
    return response.data.data;
  },

  /**
   * DELETE /api/Contracts/{id}
   * Delete contract
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`${BASE_URL}/${id}`);
  },

  /**
   * PUT /api/Contracts/{id}/status
   * Update contract status inline
   * Backend expects numeric status: 0=Draft, 1=Active, 2=Completed, 3=Cancelled
   */
  async updateStatus(id: string, data: ContractStatusUpdateRequest): Promise<Contract> {
    // Map string status to numeric value for backend
    const statusToNumber: Record<string, number> = {
      'Draft': 0,
      'Active': 1,
      'Completed': 2,
      'Cancelled': 3,
    };
    
    const numericStatus = typeof data.status === 'string' 
      ? statusToNumber[data.status] ?? 0 
      : data.status;
    
    const response = await apiClient.put<ApiResponse<Contract>>(
      `${BASE_URL}/${id}/status`, 
      { status: numericStatus }
    );
    return response.data.data;
  },
};
