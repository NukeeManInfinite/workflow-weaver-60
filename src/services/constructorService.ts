import apiClient from '@/lib/api';
import {
  ConstructorOrder,
  FurnitureType,
  Detail,
  Drawing,
  TechnicalSpecification,
  CreateFurnitureTypeDto,
  UpdateFurnitureTypeDto,
  CreateDetailDto,
  UpdateDetailDto,
  CreateTechnicalSpecDto,
  UpdateTechnicalSpecDto,
  ConstructorStats,
} from '@/types/constructor';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: string[] | null;
}

// Helper to extract data from API response
const extractData = <T>(response: { data: ApiResponse<T> | T }): T => {
  const data = response.data;
  if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
    return (data as ApiResponse<T>).data;
  }
  return data as T;
};

// Normalize order data from various API field naming conventions
const normalizeOrder = (data: any): ConstructorOrder => {
  // Handle nested customer object or direct fields
  const customer = data.customer || data.Customer || {};
  
  return {
    id: data.id ?? data.Id,
    orderNumber: data.orderNumber ?? data.OrderNumber ?? '',
    contractNumber: data.contractNumber ?? data.ContractNumber ?? data.contract?.contractNumber ?? data.Contract?.ContractNumber,
    customerName: data.customerName ?? data.CustomerName ?? customer.fullName ?? customer.FullName ?? customer.name ?? customer.Name ?? '',
    customerPhone: data.customerPhone ?? data.CustomerPhone ?? customer.phoneNumber ?? customer.PhoneNumber ?? customer.phone ?? customer.Phone ?? '',
    customerAddress: data.customerAddress ?? data.CustomerAddress ?? customer.address ?? customer.Address ?? '',
    categoryName: data.categoryName ?? data.CategoryName,
    categoryNames: data.categoryNames ?? data.CategoryNames,
    categories: data.categories ?? data.Categories,
    orderCategories: data.orderCategories ?? data.OrderCategories,
    categoryIds: data.categoryIds ?? data.CategoryIds,
    contract: data.contract ?? data.Contract,
    status: data.status ?? data.Status ?? 'Created',
    statusText: data.statusText ?? data.StatusText,
    totalAmount: data.totalAmount ?? data.TotalAmount ?? 0,
    deadline: data.deadline ?? data.Deadline ?? data.contract?.deadline ?? data.Contract?.Deadline,
    createdAt: data.createdAt ?? data.CreatedAt ?? '',
    updatedAt: data.updatedAt ?? data.UpdatedAt,
    assignedAt: data.assignedAt ?? data.AssignedAt,
    assignedConstructorId: data.assignedConstructorId ?? data.AssignedConstructorId,
    constructorId: data.constructorId ?? data.ConstructorId,
    constructorName: data.constructorName ?? data.ConstructorName,
    furnitureTypes: data.furnitureTypes ?? data.FurnitureTypes,
    furnitureTypesCount: data.furnitureTypesCount ?? data.FurnitureTypesCount,
    imagesCount: data.imagesCount ?? data.ImagesCount,
  };
};

export const constructorService = {
  // ============ ORDERS ============
  async getOrders(): Promise<ConstructorOrder[]> {
    const response = await apiClient.get('/Constructor/orders');
    const data = extractData<any[]>(response);
    return data.map(normalizeOrder);
  },

  async getOrderById(id: number): Promise<ConstructorOrder> {
    const response = await apiClient.get(`/Constructor/orders/${id}`);
    const data = extractData<any>(response);
    return normalizeOrder(data);
  },

  // ============ FURNITURE TYPES ============
  async getFurnitureTypes(): Promise<FurnitureType[]> {
    const response = await apiClient.get('/users/furniture-types');
    return extractData<FurnitureType[]>(response);
  },

  async getFurnitureTypesByOrderId(orderId: number): Promise<FurnitureType[]> {
    try {
      // Try order-specific endpoint first
      const response = await apiClient.get(`/Constructor/orders/${orderId}/furniture-types`);
      return extractData<FurnitureType[]>(response);
    } catch {
      // Fallback: get all and filter
      const all = await this.getFurnitureTypes();
      return all.filter(ft => {
        const ftOrderId = Number((ft as any).orderId ?? (ft as any).OrderId ?? 0);
        return ftOrderId === orderId;
      });
    }
  },

  async getFurnitureTypeById(id: number): Promise<FurnitureType> {
    const response = await apiClient.get(`/users/furniture-types/${id}`);
    return extractData<FurnitureType>(response);
  },

  async createFurnitureType(dto: CreateFurnitureTypeDto): Promise<FurnitureType> {
    const response = await apiClient.post('/Constructor/furniture-types', dto);
    return extractData<FurnitureType>(response);
  },

  async updateFurnitureType(id: number, dto: UpdateFurnitureTypeDto): Promise<FurnitureType> {
    const response = await apiClient.put(`/Constructor/furniture-types/${id}`, dto);
    return extractData<FurnitureType>(response);
  },

  async deleteFurnitureType(id: number): Promise<void> {
    await apiClient.delete(`/Constructor/furniture-types/${id}`);
  },

  async forceDeleteFurnitureType(id: number): Promise<void> {
    await apiClient.delete(`/Constructor/furniture-types/${id}/force`);
  },

  // ============ DETAILS (Parts) ============
  async getDetails(): Promise<Detail[]> {
    const response = await apiClient.get('/Constructor/details');
    return extractData<Detail[]>(response);
  },

  async getDetailsByFurnitureType(furnitureTypeId: number): Promise<Detail[]> {
    const response = await apiClient.get(`/Constructor/furniture-types/${furnitureTypeId}/details`);
    return extractData<Detail[]>(response);
  },

  async createDetail(dto: CreateDetailDto): Promise<Detail> {
    const response = await apiClient.post('/Constructor/details', dto);
    return extractData<Detail>(response);
  },

  async updateDetail(id: number, dto: UpdateDetailDto): Promise<Detail> {
    const response = await apiClient.put(`/Constructor/details/${id}`, dto);
    return extractData<Detail>(response);
  },

  async deleteDetail(id: number): Promise<void> {
    await apiClient.delete(`/Constructor/details/${id}`);
  },

  // ============ DRAWINGS ============
  async getDrawings(): Promise<Drawing[]> {
    const response = await apiClient.get('/Constructor/drawings');
    return extractData<Drawing[]>(response);
  },

  async getDrawingsByFurnitureType(furnitureTypeId: number): Promise<Drawing[]> {
    const response = await apiClient.get(`/Constructor/furniture-types/${furnitureTypeId}/drawings`);
    return extractData<Drawing[]>(response);
  },

  async uploadDrawing(furnitureTypeId: number, file: File, description?: string): Promise<Drawing> {
    const formData = new FormData();
    formData.append('furnitureTypeId', furnitureTypeId.toString());
    formData.append('file', file);
    if (description) {
      formData.append('description', description);
    }

    const response = await apiClient.post('/Constructor/drawings', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return extractData<Drawing>(response);
  },

  async deleteDrawing(id: number): Promise<void> {
    await apiClient.delete(`/Constructor/drawings/${id}`);
  },

  // ============ TECHNICAL SPECIFICATIONS ============
  async getTechnicalSpec(furnitureTypeId: number): Promise<TechnicalSpecification | null> {
    try {
      const response = await apiClient.get(`/Constructor/furniture-types/${furnitureTypeId}/technical-specification`);
      return extractData<TechnicalSpecification>(response);
    } catch {
      return null;
    }
  },

  async createTechnicalSpec(dto: CreateTechnicalSpecDto): Promise<TechnicalSpecification> {
    const response = await apiClient.post('/Constructor/technical-specifications', dto);
    return extractData<TechnicalSpecification>(response);
  },

  async updateTechnicalSpec(id: number, dto: UpdateTechnicalSpecDto): Promise<TechnicalSpecification> {
    const response = await apiClient.put(`/Constructor/technical-specifications/${id}`, dto);
    return extractData<TechnicalSpecification>(response);
  },

  async completeFurnitureType(furnitureTypeId: number): Promise<void> {
    await apiClient.post(`/Constructor/complete/${furnitureTypeId}`);
  },

  // Complete furniture type with data - saves details and notes, then marks complete
  async completeFurnitureTypeWithData(
    furnitureTypeId: number,
    data: {
      details: Array<{
        name: string;
        width: number;
        height: number;
        thickness: number;
        quantity: number;
        material: string;
        notes?: string;
      }>;
      notes: string;
    }
  ): Promise<void> {
    await apiClient.post(`/Constructor/complete-with-data/${furnitureTypeId}`, data);
  },

  // ============ ORDER IMAGES ============
  async uploadOrderImage(orderId: number, file: File, imageType: 'room' | 'design'): Promise<{ id: number; fileUrl: string }> {
    const formData = new FormData();
    formData.append('orderId', orderId.toString());
    formData.append('file', file);
    formData.append('imageType', imageType);

    const response = await apiClient.post('/Constructor/order-images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return extractData<{ id: number; fileUrl: string }>(response);
  },

  async getOrderImages(orderId: number): Promise<{ id: number; fileUrl: string; imageType: string }[]> {
    try {
      const response = await apiClient.get(`/Constructor/orders/${orderId}/images`);
      return extractData<{ id: number; fileUrl: string; imageType: string }[]>(response);
    } catch {
      return [];
    }
  },

  async deleteOrderImage(imageId: number): Promise<void> {
    await apiClient.delete(`/Constructor/order-images/${imageId}`);
  },

  // ============ STATS ============
  async getStats(): Promise<ConstructorStats> {
    try {
      const response = await apiClient.get('/Constructor/stats');
      return extractData<ConstructorStats>(response);
    } catch {
      // Return default stats if endpoint doesn't exist
      return {
        totalOrders: 0,
        activeOrders: 0,
        completedOrders: 0,
        totalFurnitureTypes: 0,
        completedFurnitureTypes: 0,
        pendingFurnitureTypes: 0,
        totalDetails: 0,
        totalDrawings: 0,
      };
    }
  },
};
