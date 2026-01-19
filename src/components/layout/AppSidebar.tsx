import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getNavigationForRole, getRoleDisplayName, getRoleColor } from '@/config/navigation';
import { LogOut, ChevronLeft, ChevronRight, Factory } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({ collapsed, onToggle }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const navItems = getNavigationForRole(user.role);

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen border-r border-sidebar-border bg-sidebar transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <Factory className="h-6 w-6 text-sidebar-primary" />
              <span className="text-lg font-semibold text-sidebar-foreground">
                ProductionMS
              </span>
            </div>
          )}
          {collapsed && (
            <Factory className="mx-auto h-6 w-6 text-sidebar-primary" />
          )}
        </div>

        {/* User Info */}
        <div className={cn('border-b border-sidebar-border p-4', collapsed && 'px-2')}>
          {!collapsed ? (
            <div className="space-y-1">
              <p className="font-medium text-sidebar-foreground">
                {user.firstName} {user.lastName}
              </p>
              <div className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', getRoleColor(user.role))}>
                {getRoleDisplayName(user.role)}
              </div>
            </div>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={cn('mx-auto flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium', getRoleColor(user.role))}>
                  {user.firstName[0]}{user.lastName[0]}
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{user.firstName} {user.lastName}</p>
                <p className="text-xs text-muted-foreground">{getRoleDisplayName(user.role)}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-4">
          <nav className="space-y-1 px-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;

              if (collapsed) {
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>
                      <NavLink
                        to={item.href}
                        className={cn(
                          'flex h-10 w-full items-center justify-center rounded-md transition-colors',
                          isActive
                            ? 'bg-sidebar-accent text-sidebar-primary'
                            : 'text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground'
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </NavLink>
                    </TooltipTrigger>
                    <TooltipContent side="right">{item.title}</TooltipContent>
                  </Tooltip>
                );
              }

              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                    isActive
                      ? 'bg-sidebar-accent font-medium text-sidebar-primary'
                      : 'text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </NavLink>
              );
            })}
          </nav>
        </ScrollArea>

        <Separator className="bg-sidebar-border" />

        {/* Footer */}
        <div className="p-2">
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={logout}
                  className="w-full text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Logout</TooltipContent>
            </Tooltip>
          ) : (
            <Button
              variant="ghost"
              onClick={logout}
              className="w-full justify-start gap-3 text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </Button>
          )}
        </div>

        {/* Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="absolute -right-3 top-20 z-50 h-6 w-6 rounded-full border border-sidebar-border bg-sidebar text-sidebar-muted shadow-md hover:bg-sidebar-accent hover:text-sidebar-foreground"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>
    </aside>
  );
};
