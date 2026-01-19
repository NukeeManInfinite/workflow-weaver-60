import apiClient from '@/lib/api';
import { AuthResponse, LoginCredentials, User, UserRole } from '@/types/auth';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: string[] | null;
}

const normalizeRole = (rawRole: unknown): UserRole | null => {
  if (typeof rawRole !== 'string') return null;

  // Normalize common backend formats: "Sales Person", "sales_person", "Seller", etc.
  const key = rawRole.trim().toLowerCase().replace(/[_\s-]+/g, '');

  // NOTE: "constructor" key conflicts with JS object prototype typing in TS, handle explicitly.
  if (key === 'constructor') return 'Constructor';

  const map: Record<string, UserRole> = {
    seller: 'Seller',
    sales: 'Seller',
    salesperson: 'Seller',

    director: 'Director',

    productionmanager: 'ProductionManager',
    production: 'ProductionManager',

    teamleader: 'TeamLeader',
    teamlead: 'TeamLeader',

    employee: 'Employee',

    warehousemanager: 'WarehouseManager',
    warehouse: 'WarehouseManager',
  };

  return map[key] ?? null;
};

const normalizeUser = (user: User): User => {
  const normalizedRole = normalizeRole((user as any).role);
  return {
    ...user,
    role: normalizedRole ?? user.role,
  };
};

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    // Backend returns { success, message, data: { token, user }, errors }
    const data = response.data.data;
    return {
      ...data,
      user: normalizeUser(data.user),
    };
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    }
  },

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me');
    return normalizeUser(response.data.data);
  },

  async refreshToken(): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/refresh');
    const data = response.data.data;
    return {
      ...data,
      user: normalizeUser(data.user),
    };
  },

  getStoredToken(): string | null {
    return localStorage.getItem('auth_token');
  },

  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const parsed = JSON.parse(userStr);
        return normalizeUser(parsed);
      } catch {
        return null;
      }
    }
    return null;
  },

  storeAuth(token: string, user: User): void {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user', JSON.stringify(normalizeUser(user)));
  },

  clearAuth(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  },
};
