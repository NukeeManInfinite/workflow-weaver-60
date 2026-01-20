import apiClient from '@/lib/api';
import { Category, ApiResponse } from '@/types/contract';

const BASE_URL = '/Categories';

export const categoryService = {
  /**
   * GET /api/Categories
   * Load all categories for selection
   */
  async getAll(): Promise<Category[]> {
    const response = await apiClient.get<ApiResponse<Category[]>>(BASE_URL);
    return response.data.data;
  },

  /**
   * GET /api/Categories/{id}
   * Get single category by ID
   */
  async getById(id: string): Promise<Category> {
    const response = await apiClient.get<ApiResponse<Category>>(`${BASE_URL}/${id}`);
    return response.data.data;
  },
};
