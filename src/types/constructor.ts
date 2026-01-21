// Constructor-specific types for furniture management

export interface FurnitureType {
  id: number;
  name: string;
  description?: string;
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
  depth: number;
  quantity: number;
  unit: string;
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
  status: string;
  statusText?: string;
  totalAmount: number;
  createdAt: string;
  updatedAt?: string;
  assignedAt?: string;
  constructorId: number;
  constructorName?: string;
  furnitureTypes: FurnitureTypeSummary[];
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
  description?: string;
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
  depth: number;
  quantity: number;
  unit: string;
  notes?: string;
}

export interface UpdateDetailDto {
  name?: string;
  material?: string;
  width?: number;
  height?: number;
  depth?: number;
  quantity?: number;
  unit?: string;
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
