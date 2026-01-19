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
  // GET /api/Contracts - List with pagination, filters, search, sort
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

  // GET /api/Contracts/stats - Get statistics for cards
  async getStats(): Promise<ContractStats> {
    const response = await apiClient.get<ApiResponse<ContractStats>>(`${BASE_URL}/stats`);
    return response.data.data;
  },

  // GET /api/Contracts/{id} - Get single contract by ID
  async getById(id: string): Promise<Contract> {
    const response = await apiClient.get<ApiResponse<Contract>>(`${BASE_URL}/${id}`);
    return response.data.data;
  },

  // POST /api/Contracts - Create new contract
  async create(data: ContractCreateRequest): Promise<Contract> {
    const response = await apiClient.post<ApiResponse<Contract>>(BASE_URL, data);
    return response.data.data;
  },

  // PUT /api/Contracts/{id} - Update contract
  async update(id: string, data: ContractUpdateRequest): Promise<Contract> {
    const response = await apiClient.put<ApiResponse<Contract>>(`${BASE_URL}/${id}`, data);
    return response.data.data;
  },

  // DELETE /api/Contracts/{id} - Delete contract
  async delete(id: string): Promise<void> {
    await apiClient.delete(`${BASE_URL}/${id}`);
  },

  // PUT /api/Contracts/{id}/status - Update contract status
  async updateStatus(id: string, data: ContractStatusUpdateRequest): Promise<Contract> {
    const response = await apiClient.put<ApiResponse<Contract>>(`${BASE_URL}/${id}/status`, data);
    return response.data.data;
  },
};
