import { UserRole } from '@/types/auth';

/**
 * Returns the default dashboard path based on user role
 */
export const getRoleDashboardPath = (role: UserRole): string => {
  const roleRoutes: Record<UserRole, string> = {
    Constructor: '/constructor',
    Seller: '/dashboard',
    Director: '/dashboard',
    ProductionManager: '/employees',
    TeamLeader: '/tasks',
    Employee: '/my-tasks',
    WarehouseManager: '/inventory',
  };

  return roleRoutes[role] || '/dashboard';
};
