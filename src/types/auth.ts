export type UserRole = 
  | 'Seller'
  | 'Director'
  | 'Constructor'
  | 'ProductionManager'
  | 'TeamLeader'
  | 'Employee'
  | 'WarehouseManager';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  departmentId?: string;
  departmentName?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
