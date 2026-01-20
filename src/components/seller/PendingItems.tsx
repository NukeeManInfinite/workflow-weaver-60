import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PendingItem } from '@/types/seller';
import { cn } from '@/lib/utils';
import { formatDate, isValidDate } from '@/lib/dateUtils';
import { AlertCircle, FileText, ShoppingCart, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PendingItemsProps {
  items: PendingItem[];
  className?: string;
}

const getTypeIcon = (type?: string) => {
  if (!type) return AlertCircle;
  const normalizedType = String(type).toLowerCase();
  switch (normalizedType) {
    case 'order':
      return ShoppingCart;
    case 'contract':
      return FileText;
    default:
      return AlertCircle;
  }
};

const getItemTypeKey = (itemType?: string): string => {
  if (!itemType) return 'pending.needsAttention';
  
  const normalizedType = String(itemType).toLowerCase().replace(/[\s_-]/g, '');
  
  if (normalizedType.includes('followup') || normalizedType === 'requiresfollowup') {
    return 'pending.requiresFollowUp';
  }
  if (normalizedType.includes('approval') || normalizedType === 'pendingapproval') {
    return 'pending.pendingApproval';
  }
  if (normalizedType.includes('review') || normalizedType === 'pendingreview') {
    return 'pending.pendingReview';
  }
  
  return 'pending.needsAttention';
};

const getEntityType = (item: PendingItem): 'Order' | 'Contract' | null => {
  const type = item?.type || item?.entityType;
  if (!type) return null;
  
  const normalizedType = String(type).toLowerCase();
  if (normalizedType === 'order') return 'Order';
  if (normalizedType === 'contract') return 'Contract';
  return null;
};

const getReferenceNumber = (item: PendingItem): string | null => {
  return item?.referenceNumber || item?.reference || null;
};

const getItemId = (item: PendingItem): string | number | null => {
  return item?.id || item?.entityId || null;
};

export const PendingItems: React.FC<PendingItemsProps> = ({
  items,
  className,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const hasItems = items && items.length > 0;

  const handleItemClick = (item: PendingItem) => {
    const entityType = getEntityType(item);
    const id = getItemId(item);
    
    if (!entityType || !id) return;
    
    if (entityType === 'Order') {
      navigate('/seller/orders');
    } else if (entityType === 'Contract') {
      navigate('/seller/contracts');
    }
  };

  return (
    <div className={cn('bg-card rounded-lg border border-border p-6', className)}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">{t('pending.title')}</h3>
        <p className="text-sm text-muted-foreground">{t('pending.subtitle')}</p>
      </div>

      {!hasItems ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <AlertCircle className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground">{t('pending.empty')}</p>
        </div>
      ) : (
        <div className="space-y-1 max-h-[350px] overflow-y-auto overflow-x-hidden">
          {items.map((item, index) => {
            // Defensive: ensure item exists
            if (!item) return null;
            
            const entityType = getEntityType(item);
            const Icon = getTypeIcon(entityType || undefined);
            const refNumber = getReferenceNumber(item);
            const itemTypeKey = getItemTypeKey(item?.itemType || item?.status);
            const formattedDate = item?.createdAt && isValidDate(item.createdAt) 
              ? formatDate(item.createdAt) 
              : '';
            
            const itemId = getItemId(item);
            const isClickable = entityType && itemId;

            return (
              <div
                key={itemId || `pending-${index}`}
                onClick={() => isClickable && handleItemClick(item)}
                className={cn(
                  'flex items-center justify-between py-3 px-3 -mx-3 rounded-md transition-colors',
                  isClickable && 'cursor-pointer hover:bg-muted/50 group'
                )}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="rounded-lg bg-warning/10 p-2 flex-shrink-0">
                    <Icon className="h-4 w-4 text-warning" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">
                      {entityType ? t(`pending.${entityType.toLowerCase()}`) : t('pending.order')}
                      {refNumber ? ` #${refNumber}` : ''}
                    </p>
                    <Badge 
                      variant="outline" 
                      className="text-xs mt-1 text-warning border-warning/30 max-w-full truncate"
                    >
                      {t(itemTypeKey)}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  {formattedDate && (
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formattedDate}
                    </span>
                  )}
                  {isClickable && (
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
