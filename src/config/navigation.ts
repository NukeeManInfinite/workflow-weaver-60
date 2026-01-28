import { UserRole } from '@/types/auth';
import { 
  LayoutDashboard, 
  FileText, 
  ShoppingCart, 
  Ruler, 
  Users, 
  ClipboardList, 
  CheckSquare, 
  BarChart3, 
  Package, 
  Warehouse,
  Bell,
  Settings,
  Layers,
  LucideIcon
} from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  roles: UserRole[];
  children?: NavItem[];
}

export const navigationConfig: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['Seller', 'Director', 'Constructor', 'ProductionManager', 'TeamLeader', 'Employee', 'WarehouseManager'],
  },
  // Seller & Director
  {
    title: 'Contracts',
    href: '/contracts',
    icon: FileText,
    roles: ['Seller', 'Director'],
  },
  {
    title: 'Orders',
    href: '/orders',
    icon: ShoppingCart,
    roles: ['Seller', 'Director', 'ProductionManager'],
  },
  // Constructor
  {
    title: 'Buyurtmalar',
    href: '/constructor/orders',
    icon: ShoppingCart,
    roles: ['Constructor'],
  },
  // Production Manager
  {
    title: 'Employees',
    href: '/employees',
    icon: Users,
    roles: ['ProductionManager', 'Director'],
  },
  {
    title: 'Assignments',
    href: '/assignments',
    icon: ClipboardList,
    roles: ['ProductionManager'],
  },
  {
    title: 'Templates',
    href: '/templates',
    icon: Layers,
    roles: ['ProductionManager', 'Director'],
  },
  // Team Leader
  {
    title: 'Tasks',
    href: '/tasks',
    icon: ClipboardList,
    roles: ['TeamLeader'],
  },
  {
    title: 'Team Tasks',
    href: '/team-tasks',
    icon: CheckSquare,
    roles: ['TeamLeader'],
  },
  // Employee
  {
    title: 'My Tasks',
    href: '/my-tasks',
    icon: CheckSquare,
    roles: ['Employee'],
  },
  {
    title: 'My KPI',
    href: '/my-kpi',
    icon: BarChart3,
    roles: ['Employee'],
  },
  // Warehouse Manager
  {
    title: 'Inventory',
    href: '/inventory',
    icon: Package,
    roles: ['WarehouseManager'],
  },
  {
    title: 'Stock Management',
    href: '/stock-management',
    icon: Warehouse,
    roles: ['WarehouseManager'],
  },
  // Director KPI
  {
    title: 'KPI Dashboard',
    href: '/kpi-dashboard',
    icon: BarChart3,
    roles: ['Director', 'ProductionManager'],
  },
  // Common
  {
    title: 'Notifications',
    href: '/notifications',
    icon: Bell,
    roles: ['Seller', 'Director', 'Constructor', 'ProductionManager', 'TeamLeader', 'Employee', 'WarehouseManager'],
  },
];

export const getNavigationForRole = (role: UserRole): NavItem[] => {
  return navigationConfig.filter((item) => item.roles.includes(role));
};

export const getRoleDisplayName = (role: UserRole): string => {
  const roleNames: Record<UserRole, string> = {
    Seller: 'Seller',
    Director: 'Director',
    Constructor: 'Constructor',
    ProductionManager: 'Production Manager',
    TeamLeader: 'Team Leader',
    Employee: 'Employee',
    WarehouseManager: 'Warehouse Manager',
  };
  return roleNames[role];
};

export const getRoleColor = (role: UserRole): string => {
  const colors: Record<UserRole, string> = {
    Seller: 'bg-info/10 text-info',
    Director: 'bg-warning/10 text-warning',
    Constructor: 'bg-success/10 text-success',
    ProductionManager: 'bg-primary/10 text-primary',
    TeamLeader: 'bg-accent text-accent-foreground',
    Employee: 'bg-secondary text-secondary-foreground',
    WarehouseManager: 'bg-muted text-muted-foreground',
  };
  return colors[role];
};
