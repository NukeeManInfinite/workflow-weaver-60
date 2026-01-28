import apiClient from '@/lib/api';
import {
  FurnitureTypeTemplate,
  CreateFurnitureTypeTemplateDto,
  UpdateFurnitureTypeTemplateDto,
  ApiResponse,
} from '@/types/template';

export const templateService = {
  // Get all templates (Production Manager/Director only)
  getAll: async (): Promise<FurnitureTypeTemplate[]> => {
    const response = await apiClient.get<ApiResponse<FurnitureTypeTemplate[]>>(
      '/FurnitureTypeTemplates'
    );
    return response.data.data || [];
  },

  // Get template by ID
  getById: async (id: number): Promise<FurnitureTypeTemplate> => {
    const response = await apiClient.get<ApiResponse<FurnitureTypeTemplate>>(
      `/FurnitureTypeTemplates/${id}`
    );
    return response.data.data;
  },

  // Get templates by category (Production Manager/Director only)
  getByCategory: async (categoryId: number): Promise<FurnitureTypeTemplate[]> => {
    const response = await apiClient.get<ApiResponse<FurnitureTypeTemplate[]>>(
      `/FurnitureTypeTemplates/category/${categoryId}`
    );
    return response.data.data || [];
  },

  // Get active templates by category (Constructor/Production Manager/Director)
  getActiveByCategoryId: async (categoryId: number): Promise<FurnitureTypeTemplate[]> => {
    const response = await apiClient.get<ApiResponse<FurnitureTypeTemplate[]>>(
      `/FurnitureTypeTemplates/category/${categoryId}/active`
    );
    return response.data.data || [];
  },

  // Create template (Production Manager/Director only)
  create: async (data: CreateFurnitureTypeTemplateDto): Promise<FurnitureTypeTemplate> => {
    const response = await apiClient.post<ApiResponse<FurnitureTypeTemplate>>(
      '/FurnitureTypeTemplates',
      data
    );
    return response.data.data;
  },

  // Update template (Production Manager/Director only)
  update: async (
    id: number,
    data: UpdateFurnitureTypeTemplateDto
  ): Promise<FurnitureTypeTemplate> => {
    const response = await apiClient.put<ApiResponse<FurnitureTypeTemplate>>(
      `/FurnitureTypeTemplates/${id}`,
      data
    );
    return response.data.data;
  },

  // Delete template (Production Manager/Director only)
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/FurnitureTypeTemplates/${id}`);
  },

  // Toggle active status (Production Manager/Director only)
  toggleActive: async (id: number): Promise<FurnitureTypeTemplate> => {
    const response = await apiClient.patch<ApiResponse<FurnitureTypeTemplate>>(
      `/FurnitureTypeTemplates/${id}/toggle-active`
    );
    return response.data.data;
  },
};
