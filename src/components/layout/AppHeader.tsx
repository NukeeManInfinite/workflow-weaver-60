import React from 'react';
import { NotificationsDropdown } from '@/components/notifications';

interface AppHeaderProps {
  title: string;
  description?: string;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ title, description }) => {
  return (
    <header className="sticky top-0 z-30 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="flex h-16 items-center justify-between px-6">
        <div>
          <h1 className="text-xl font-semibold text-foreground">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>

        <div className="flex items-center gap-4">
          <NotificationsDropdown />
        </div>
      </div>
    </header>
  );
};
