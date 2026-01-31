import apiClient from '@/lib/api';
import { ApiResponse } from '@/types/order';

// Types for OrderCategories Many-to-Many relationship
export interface OrderCategory {
  id: number;
  orderId: number;
  orderNumber?: string;
  categoryId: number;
  categoryName: string;
  category?: {
    id: number;
    name: string;
    description?: string;
  };
  createdAt: string;
}

export interface AddOrderCategoryDto {
  orderId: number;
  categoryId: number;
}

export interface BulkUpdateOrderCategoriesDto {
  orderId: number;
  categoryIds: number[];
}

const BASE_URL = '/order-categories';

export const orderCategoriesService = {
  /**
   * GET /api/order-categories/order/{orderId}
   * Get all categories for an order
   */
  async getCategoriesByOrderId(orderId: number): Promise<OrderCategory[]> {
    const response = await apiClient.get<ApiResponse<OrderCategory[]>>(
      `${BASE_URL}/order/${orderId}`
    );
    return response.data.data || [];
  },

  /**
   * GET /api/order-categories/category/{categoryId}
   * Get all orders for a category
   */
  async getOrdersByCategoryId(categoryId: number): Promise<OrderCategory[]> {
    const response = await apiClient.get<ApiResponse<OrderCategory[]>>(
      `${BASE_URL}/category/${categoryId}`
    );
    return response.data.data || [];
  },

  /**
   * GET /api/order-categories/{id}
   * Get order-category by ID
   */
  async getById(id: number): Promise<OrderCategory> {
    const response = await apiClient.get<ApiResponse<OrderCategory>>(
      `${BASE_URL}/${id}`
    );
    return response.data.data;
  },

  /**
   * POST /api/order-categories
   * Add category to order
   */
  async addCategoryToOrder(dto: AddOrderCategoryDto): Promise<OrderCategory> {
    const response = await apiClient.post<ApiResponse<OrderCategory>>(
      BASE_URL,
      dto
    );
    return response.data.data;
  },

  /**
   * PUT /api/order-categories/bulk
   * Set all categories for order (replaces existing)
   */
  async bulkUpdateCategories(dto: BulkUpdateOrderCategoriesDto): Promise<OrderCategory[]> {
    const response = await apiClient.put<ApiResponse<OrderCategory[]>>(
      `${BASE_URL}/bulk`,
      dto
    );
    return response.data.data || [];
  },

  /**
   * DELETE /api/order-categories/order/{orderId}/category/{categoryId}
   * Remove category from order
   */
  async removeCategoryFromOrder(orderId: number, categoryId: number): Promise<void> {
    await apiClient.delete(`${BASE_URL}/order/${orderId}/category/${categoryId}`);
  },

  /**
   * DELETE /api/order-categories/{id}
   * Delete by ID
   */
  async deleteById(id: number): Promise<void> {
    await apiClient.delete(`${BASE_URL}/${id}`);
  },
};
