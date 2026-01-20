import React from 'react';
import { PendingItem } from '@/types/seller';
import { cn } from '@/lib/utils';
import { formatDate, isValidDate } from '@/lib/dateUtils';
import { AlertCircle, FileText, ShoppingCart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PendingItemsProps {
  items: PendingItem[];
  className?: string;
  onItemClick?: (item: PendingItem) => void;
}

const getTypeIcon = (type?: string) => {
  if (!type) return AlertCircle;
  switch (type) {
    case 'Order':
      return ShoppingCart;
    case 'Contract':
      return FileText;
    default:
      return AlertCircle;
  }
};

export const PendingItems: React.FC<PendingItemsProps> = ({
  items,
  className,
  onItemClick,
}) => {
  const hasItems = items && items.length > 0;

  return (
    <div className={cn('bg-card rounded-lg border border-border p-6', className)}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">Pending Items</h3>
        <p className="text-sm text-muted-foreground">Items requiring your attention</p>
      </div>

      {!hasItems ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <AlertCircle className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground">No pending items</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {items.map((item, index) => {
            // Defensive: ensure item exists
            if (!item) return null;
            
            const Icon = getTypeIcon(item?.type);
            const formattedDate = item?.createdAt && isValidDate(item.createdAt) 
              ? formatDate(item.createdAt) 
              : '';

            return (
              <div
                key={item.id || `pending-${index}`}
                onClick={() => onItemClick?.(item)}
                className={cn(
                  'flex items-center justify-between py-3 px-3 -mx-3 rounded-md transition-colors',
                  onItemClick && 'cursor-pointer hover:bg-muted/30'
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="rounded-lg bg-warning/10 p-2 flex-shrink-0">
                    <Icon className="h-4 w-4 text-warning" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {item?.type || 'Item'} #{item?.referenceNumber || 'Unknown'}
                    </p>
                    <Badge variant="outline" className="text-xs mt-1 text-warning border-warning/30">
                      {item?.status || 'Pending'}
                    </Badge>
                  </div>
                </div>
                {formattedDate && (
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-4 flex-shrink-0">
                    {formattedDate}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
