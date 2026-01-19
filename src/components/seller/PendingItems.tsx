import React from 'react';
import { PendingItem } from '@/types/seller';
import { cn } from '@/lib/utils';

interface PendingItemsProps {
  items: PendingItem[];
  className?: string;
  onItemClick?: (item: PendingItem) => void;
}

const priorityColors = {
  high: 'bg-destructive',
  medium: 'bg-warning',
  low: 'bg-muted-foreground/40',
};

export const PendingItems: React.FC<PendingItemsProps> = ({
  items,
  className,
  onItemClick,
}) => {
  return (
    <div className={cn('bg-card rounded-lg border border-border p-6', className)}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">Pending Items</h3>
        <p className="text-sm text-muted-foreground">Items requiring your attention</p>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={`${item.id}-${index}`}
            onClick={() => onItemClick?.(item)}
            className={cn(
              'flex items-center justify-between py-2 cursor-pointer hover:bg-muted/30 -mx-2 px-2 rounded-md transition-colors'
            )}
          >
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  'h-2 w-2 rounded-full flex-shrink-0',
                  priorityColors[item.priority]
                )}
              />
              <p className="text-sm text-foreground">{item.title}</p>
            </div>
            <span className="text-sm text-muted-foreground whitespace-nowrap ml-4">
              {item.dueDate}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
