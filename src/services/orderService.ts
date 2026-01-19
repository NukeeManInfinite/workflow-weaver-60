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

export const orderService = {
  async getAll(): Promise<Order[]> {
    const response = await apiClient.get<Order[]>('/orders');
    return response.data;
  },

  async getByContractId(contractId: string): Promise<Order[]> {
    const response = await apiClient.get<Order[]>(`/contracts/${contractId}/orders`);
    return response.data;
  },

  async getById(id: string): Promise<Order> {
    const response = await apiClient.get<Order>(`/orders/${id}`);
    return response.data;
  },

  async create(order: Partial<Order>): Promise<Order> {
    const response = await apiClient.post<Order>('/orders', order);
    return response.data;
  },

  async update(id: string, order: Partial<Order>): Promise<Order> {
    const response = await apiClient.put<Order>(`/orders/${id}`, order);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/orders/${id}`);
  },
};

export const categoryService = {
  async getByOrderId(orderId: string): Promise<ProductCategory[]> {
    const response = await apiClient.get<ProductCategory[]>(`/orders/${orderId}/categories`);
    return response.data;
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
