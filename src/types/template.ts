// FurnitureTypeTemplate types

export interface FurnitureTypeTemplate {
  id: number;
  name: string;
  categoryId: number;
  categoryName: string;
  description: string | null;
  defaultMaterial: string | null;
  defaultNotes: string | null;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateFurnitureTypeTemplateDto {
  name: string;
  categoryId: number;
  description?: string;
  defaultMaterial?: string;
  defaultNotes?: string;
  isActive?: boolean;
  displayOrder?: number;
}

export interface UpdateFurnitureTypeTemplateDto {
  name: string;
  description?: string;
  defaultMaterial?: string;
  defaultNotes?: string;
  isActive: boolean;
  displayOrder: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
}
