import apiClient from '@/lib/api';
import { InventoryItem, StockTransaction, MaterialRequirement } from '@/types';

export const inventoryService = {
  async getAll(): Promise<InventoryItem[]> {
    const response = await apiClient.get<InventoryItem[]>('/inventory');
    return response.data;
  },

  async getById(id: string): Promise<InventoryItem> {
    const response = await apiClient.get<InventoryItem>(`/inventory/${id}`);
    return response.data;
  },

  async getLowStock(): Promise<InventoryItem[]> {
    const response = await apiClient.get<InventoryItem[]>('/inventory/low-stock');
    return response.data;
  },

  async create(item: Partial<InventoryItem>): Promise<InventoryItem> {
    const response = await apiClient.post<InventoryItem>('/inventory', item);
    return response.data;
  },

  async update(id: string, item: Partial<InventoryItem>): Promise<InventoryItem> {
    const response = await apiClient.put<InventoryItem>(`/inventory/${id}`, item);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/inventory/${id}`);
  },
};

export const stockTransactionService = {
  async getAll(): Promise<StockTransaction[]> {
    const response = await apiClient.get<StockTransaction[]>('/stock-transactions');
    return response.data;
  },

  async getByInventoryItem(itemId: string): Promise<StockTransaction[]> {
    const response = await apiClient.get<StockTransaction[]>(`/inventory/${itemId}/transactions`);
    return response.data;
  },

  async stockIn(data: {
    inventoryItemId: string;
    quantity: number;
    reason?: string;
  }): Promise<StockTransaction> {
    const response = await apiClient.post<StockTransaction>('/stock-transactions/in', data);
    return response.data;
  },

  async stockOut(data: {
    inventoryItemId: string;
    quantity: number;
    reason?: string;
    assignedToEmployeeId?: string;
    assignedToTeamId?: string;
  }): Promise<StockTransaction> {
    const response = await apiClient.post<StockTransaction>('/stock-transactions/out', data);
    return response.data;
  },

  async adjust(data: {
    inventoryItemId: string;
    quantity: number;
    reason: string;
  }): Promise<StockTransaction> {
    const response = await apiClient.post<StockTransaction>('/stock-transactions/adjust', data);
    return response.data;
  },
};

export const materialRequestService = {
  async getPendingRequests(): Promise<MaterialRequirement[]> {
    const response = await apiClient.get<MaterialRequirement[]>('/material-requests/pending');
    return response.data;
  },

  async approveRequest(id: string): Promise<MaterialRequirement> {
    const response = await apiClient.post<MaterialRequirement>(`/material-requests/${id}/approve`);
    return response.data;
  },

  async assignMaterial(id: string, data: {
    assignedToEmployeeId?: string;
    assignedToTeamId?: string;
  }): Promise<MaterialRequirement> {
    const response = await apiClient.post<MaterialRequirement>(`/material-requests/${id}/assign`, data);
    return response.data;
  },

  async markAsUsed(id: string): Promise<MaterialRequirement> {
    const response = await apiClient.post<MaterialRequirement>(`/material-requests/${id}/used`);
    return response.data;
  },
};
