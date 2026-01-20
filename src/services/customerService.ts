import apiClient from '@/lib/api';
import { Customer, ApiResponse } from '@/types/contract';

const BASE_URL = '/Customers';

export const customerService = {
  /**
   * GET /api/Customers
   * Load all customers for dropdown
   */
  async getAll(): Promise<Customer[]> {
    const response = await apiClient.get<ApiResponse<Customer[]>>(BASE_URL);
    return response.data.data;
  },

  /**
   * GET /api/Customers/{id}
   * Get single customer by ID
   */
  async getById(id: string): Promise<Customer> {
    const response = await apiClient.get<ApiResponse<Customer>>(`${BASE_URL}/${id}`);
    return response.data.data;
  },

  /**
   * POST /api/Customers
   * Create new customer
   */
  async create(data: Omit<Customer, 'id'>): Promise<Customer> {
    const response = await apiClient.post<ApiResponse<Customer>>(BASE_URL, data);
    return response.data.data;
  },
};
