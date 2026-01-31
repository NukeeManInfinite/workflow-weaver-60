// Constructor-specific types for furniture management

export interface FurnitureType {
  id: number;
  name: string;
  description?: string;
  orderId?: number;
  orderNumber?: string;
  categoryId?: number;
  orderCategoryId?: number; // Junction table ID from OrderCategories
  categoryName?: string;
  constructorId: number;
  constructorName?: string;
  createdAt: string;
  updatedAt?: string;
  isCompleted: boolean;
  details: Detail[];
  drawings: Drawing[];
  technicalSpecification?: TechnicalSpecification;
}

export interface Detail {
  id: number;
  furnitureTypeId: number;
  name: string;
  material: string;
  width: number;
  height: number;
  thickness: number;
  quantity: number;
  unit?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Drawing {
  id: number;
  furnitureTypeId: number;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  description?: string;
  uploadedAt: string;
  uploadedBy: number;
}

export interface TechnicalSpecification {
  id: number;
  furnitureTypeId: number;
  specifications: string;
  materialList: string;
  assemblyInstructions?: string;
  qualityNotes?: string;
  createdAt: string;
  updatedAt?: string;
  isComplete: boolean;
}

export interface ConstructorOrder {
  id: number;
  orderNumber: string;
  contractNumber?: string;
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  categoryName?: string;
  categoryNames?: string[] | string;
  // Categories from backend - array of {id, name}
  categories?: Array<{
    id: number;
    name: string;
    description?: string;
  }>;
  // OrderCategories from junction table
  orderCategories?: Array<{
    id?: number;
    orderId?: number;
    categoryId: number;
    category?: {
      id?: number;
      name: string;
      description?: string;
    };
  }>;
  // Category IDs for resolution via map
  categoryIds?: number[];
  // Contract with categoryIds
  contract?: {
    id?: number;
    categoryIds?: string | number[];
  };
  status: string;
  statusText?: string;
  totalAmount: number;
  deadline?: string;
  createdAt: string;
  updatedAt?: string;
  assignedAt?: string;
  assignedConstructorId?: number;
  constructorId?: number;
  constructorName?: string;
  furnitureTypes?: FurnitureTypeSummary[];
  furnitureTypesCount?: number;
  imagesCount?: number;
}

export interface OrderCategory {
  id: number;
  name: string;
  detailsCount: number;
  dimensionsCount: number;
  status: 'pending' | 'inProgress' | 'completed';
  details?: CategoryDetail[];
}

export interface CategoryDetail {
  id: number;
  name: string;
  dimensions: DimensionEntry[];
  materials: string[];
  notes?: string;
}

export interface DimensionEntry {
  id: number;
  width: number;
  height: number;
  thickness: number;
}

export interface FurnitureTypeSummary {
  id: number;
  name: string;
  isCompleted: boolean;
  detailsCount: number;
  drawingsCount: number;
  hasTechnicalSpec: boolean;
}

// DTOs for create/update operations
export interface CreateFurnitureTypeDto {
  name: string;
  orderId: number;
  categoryId?: number;
}

export interface UpdateFurnitureTypeDto {
  name?: string;
  description?: string;
}

export interface CreateDetailDto {
  furnitureTypeId: number;
  name: string;
  material: string;
  width: number;
  height: number;
  thickness: number;
  quantity: number;
  notes?: string;
}

export interface UpdateDetailDto {
  name?: string;
  material?: string;
  width?: number;
  height?: number;
  thickness?: number;
  quantity?: number;
  notes?: string;
}

export interface CreateDrawingDto {
  furnitureTypeId: number;
  file: File;
  description?: string;
}

export interface CreateTechnicalSpecDto {
  furnitureTypeId: number;
  specifications: string;
  materialList: string;
  assemblyInstructions?: string;
  qualityNotes?: string;
}

export interface UpdateTechnicalSpecDto {
  specifications?: string;
  materialList?: string;
  assemblyInstructions?: string;
  qualityNotes?: string;
}

// Stats
export interface ConstructorStats {
  totalOrders: number;
  activeOrders: number;
  completedOrders: number;
  totalFurnitureTypes: number;
  completedFurnitureTypes: number;
  pendingFurnitureTypes: number;
  totalDetails: number;
  totalDrawings: number;
}
