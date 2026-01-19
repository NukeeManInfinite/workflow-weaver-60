import apiClient from '@/lib/api';
import {
  Order,
  OrderStats,
  CreateOrderDto,
  UpdateOrderDto,
  AssignOrderDto,
  OrdersQueryParams,
  PaginatedOrdersResponse,
  ApiResponse,
} from '@/types/order';

export const ordersApi = {
  // GET /api/Orders - Get orders with pagination, filters, search, sort
  async getOrders(params?: OrdersQueryParams): Promise<PaginatedOrdersResponse> {
    const response = await apiClient.get<ApiResponse<PaginatedOrdersResponse>>('/Orders', { params });
    return response.data.data;
  },

  // GET /api/Orders/stats - Get order statistics
  async getStats(): Promise<OrderStats> {
    const response = await apiClient.get<ApiResponse<OrderStats>>('/Orders/stats');
    return response.data.data;
  },

  // GET /api/Orders/{id} - Get order by ID
  async getById(id: string): Promise<Order> {
    const response = await apiClient.get<ApiResponse<Order>>(`/Orders/${id}`);
    return response.data.data;
  },

  // POST /api/Orders - Create new order
  async create(order: CreateOrderDto): Promise<Order> {
    const response = await apiClient.post<ApiResponse<Order>>('/Orders', order);
    return response.data.data;
  },

  // PUT /api/Orders/{id} - Update order
  async update(id: string, order: UpdateOrderDto): Promise<Order> {
    const response = await apiClient.put<ApiResponse<Order>>(`/Orders/${id}`, order);
    return response.data.data;
  },

  // DELETE /api/Orders/{id} - Delete order
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/Orders/${id}`);
  },

  // POST /api/Orders/{id}/assign-constructor - Assign constructor to order
  async assignConstructor(id: string, dto: AssignOrderDto): Promise<void> {
    await apiClient.post(`/Orders/${id}/assign-constructor`, dto);
  },

  // POST /api/Orders/{id}/assign-production-manager - Assign production manager
  async assignProductionManager(id: string, dto: AssignOrderDto): Promise<void> {
    await apiClient.post(`/Orders/${id}/assign-production-manager`, dto);
  },
};
