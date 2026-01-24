import apiClient from '@/lib/api';
import { Contract, Order, ProductCategory, Dimension, MaterialRequirement } from '@/types';

export const contractService = {
  async getAll(): Promise<Contract[]> {
    const response = await apiClient.get<Contract[]>('/contracts');
    return response.data;
  },

  async getById(id: string): Promise<Contract> {
    const response = await apiClient.get<Contract>(`/contracts/${id}`);
    return response.data;
  },

  async create(contract: Partial<Contract>): Promise<Contract> {
    const response = await apiClient.post<Contract>('/contracts', contract);
    return response.data;
  },

  async update(id: string, contract: Partial<Contract>): Promise<Contract> {
    const response = await apiClient.put<Contract>(`/contracts/${id}`, contract);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/contracts/${id}`);
  },
};

// API response wrapper type
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: string[] | null;
}

export const orderService = {
  async getAll(): Promise<Order[]> {
    try {
      const response = await apiClient.get<ApiResponse<Order[]> | Order[]>('/orders');
      // Handle wrapped response { success, data, ... }
      if (response.data && typeof response.data === 'object' && 'data' in response.data && 'success' in response.data) {
        return (response.data as ApiResponse<Order[]>).data || [];
      }
      // Handle direct array response
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  },

  async getByContractId(contractId: string): Promise<Order[]> {
    try {
      const response = await apiClient.get<ApiResponse<Order[]> | Order[]>(`/contracts/${contractId}/orders`);
      if (response.data && typeof response.data === 'object' && 'data' in response.data && 'success' in response.data) {
        return (response.data as ApiResponse<Order[]>).data || [];
      }
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error fetching orders by contract:', error);
      return [];
    }
  },

  async getById(id: string): Promise<Order | null> {
    try {
      const response = await apiClient.get<ApiResponse<Order> | Order>(`/orders/${id}`);
      if (response.data && typeof response.data === 'object' && 'data' in response.data && 'success' in response.data) {
        return (response.data as ApiResponse<Order>).data || null;
      }
      return response.data as Order || null;
    } catch (error) {
      console.error('Error fetching order:', error);
      return null;
    }
  },

  async create(order: Partial<Order>): Promise<Order | null> {
    try {
      const response = await apiClient.post<ApiResponse<Order> | Order>('/orders', order);
      if (response.data && typeof response.data === 'object' && 'data' in response.data && 'success' in response.data) {
        return (response.data as ApiResponse<Order>).data || null;
      }
      return response.data as Order || null;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  async update(id: string, order: Partial<Order>): Promise<Order | null> {
    try {
      const response = await apiClient.put<ApiResponse<Order> | Order>(`/orders/${id}`, order);
      if (response.data && typeof response.data === 'object' && 'data' in response.data && 'success' in response.data) {
        return (response.data as ApiResponse<Order>).data || null;
      }
      return response.data as Order || null;
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/orders/${id}`);
  },
};

export const categoryService = {
  async getByOrderId(orderId: string | number): Promise<ProductCategory[]> {
    try {
      const response = await apiClient.get<ApiResponse<ProductCategory[]> | ProductCategory[]>(`/orders/${orderId}/categories`);
      // Handle wrapped response
      if (response.data && typeof response.data === 'object' && 'data' in response.data && 'success' in response.data) {
        return (response.data as ApiResponse<ProductCategory[]>).data || [];
      }
      // Handle direct array response
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error fetching categories by order:', error);
      return [];
    }
  },

  async getById(id: string): Promise<ProductCategory> {
    const response = await apiClient.get<ProductCategory>(`/categories/${id}`);
    return response.data;
  },

  async create(category: Partial<ProductCategory>): Promise<ProductCategory> {
    const response = await apiClient.post<ProductCategory>('/categories', category);
    return response.data;
  },

  async update(id: string, category: Partial<ProductCategory>): Promise<ProductCategory> {
    const response = await apiClient.put<ProductCategory>(`/categories/${id}`, category);
    return response.data;
  },

  async assignToTeamLeader(categoryId: string, teamLeaderId: string): Promise<void> {
    await apiClient.post(`/categories/${categoryId}/assign`, { teamLeaderId });
  },

  async notifyDimensionsComplete(categoryId: string): Promise<void> {
    await apiClient.post(`/categories/${categoryId}/notify-dimensions`);
  },
};

export const dimensionService = {
  async getByCategoryId(categoryId: string): Promise<Dimension[]> {
    const response = await apiClient.get<Dimension[]>(`/categories/${categoryId}/dimensions`);
    return response.data;
  },

  async create(dimension: Partial<Dimension>): Promise<Dimension> {
    const response = await apiClient.post<Dimension>('/dimensions', dimension);
    return response.data;
  },

  async update(id: string, dimension: Partial<Dimension>): Promise<Dimension> {
    const response = await apiClient.put<Dimension>(`/dimensions/${id}`, dimension);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/dimensions/${id}`);
  },
};

export const materialRequirementService = {
  async getByCategoryId(categoryId: string): Promise<MaterialRequirement[]> {
    const response = await apiClient.get<MaterialRequirement[]>(`/categories/${categoryId}/materials`);
    return response.data;
  },

  async create(requirement: Partial<MaterialRequirement>): Promise<MaterialRequirement> {
    const response = await apiClient.post<MaterialRequirement>('/material-requirements', requirement);
    return response.data;
  },

  async update(id: string, requirement: Partial<MaterialRequirement>): Promise<MaterialRequirement> {
    const response = await apiClient.put<MaterialRequirement>(`/material-requirements/${id}`, requirement);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/material-requirements/${id}`);
  },
};
