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

const getTypeIcon = (entityType?: string | null) => {
  if (!entityType) return AlertCircle;
  const normalized = String(entityType).toLowerCase();
  switch (normalized) {
    case 'order':
      return ShoppingCart;
    case 'contract':
      return FileText;
    default:
      return AlertCircle;
  }
};

/**
 * Normalizes status string for consistent matching.
 */
const normalizeStatus = (status?: string | null): string => {
  if (!status) return '';
  return String(status).toLowerCase().replace(/[\s_-]/g, '');
};

/**
 * Maps pending item to a full human-readable message key.
 * Combines entityType + status to create contextual sentences.
 */
const getPendingMessageKey = (
  entityType: 'Order' | 'Contract' | null,
  status?: string | null
): string => {
  const normalizedStatus = normalizeStatus(status);
  const entity = entityType?.toLowerCase() || '';

  // Build entity-specific message key
  if (entity === 'order') {
    if (normalizedStatus.includes('needsattention') || normalizedStatus.includes('attention')) {
      return 'pending.messages.orderNeedsAttention';
    }
    if (normalizedStatus.includes('pendingapproval') || normalizedStatus.includes('approval')) {
      return 'pending.messages.orderPendingApproval';
    }
    if (normalizedStatus.includes('followup') || normalizedStatus.includes('requiresfollowup')) {
      return 'pending.messages.orderRequiresFollowUp';
    }
    if (normalizedStatus.includes('review') || normalizedStatus.includes('pendingreview')) {
      return 'pending.messages.orderPendingReview';
    }
    return 'pending.messages.orderNeedsAttention';
  }

  if (entity === 'contract') {
    if (normalizedStatus.includes('needsattention') || normalizedStatus.includes('attention')) {
      return 'pending.messages.contractNeedsAttention';
    }
    if (normalizedStatus.includes('pendingapproval') || normalizedStatus.includes('approval')) {
      return 'pending.messages.contractPendingApproval';
    }
    if (normalizedStatus.includes('followup') || normalizedStatus.includes('requiresfollowup')) {
      return 'pending.messages.contractRequiresFollowUp';
    }
    if (normalizedStatus.includes('review') || normalizedStatus.includes('pendingreview')) {
      return 'pending.messages.contractPendingReview';
    }
    return 'pending.messages.contractNeedsAttention';
  }

  // Generic fallbacks
  if (normalizedStatus.includes('needsattention') || normalizedStatus.includes('attention')) {
    return 'pending.messages.needsAttention';
  }
  if (normalizedStatus.includes('pendingapproval') || normalizedStatus.includes('approval')) {
    return 'pending.messages.pendingApproval';
  }
  if (normalizedStatus.includes('followup') || normalizedStatus.includes('requiresfollowup')) {
    return 'pending.messages.requiresFollowUp';
  }
  if (normalizedStatus.includes('review') || normalizedStatus.includes('pendingreview')) {
    return 'pending.messages.pendingReview';
  }

  return 'pending.messages.default';
};

/**
 * Maps status to badge display text key.
 */
const getStatusBadgeKey = (status?: string | null): string => {
  const normalized = normalizeStatus(status);
  
  if (normalized.includes('needsattention') || normalized.includes('attention')) {
    return 'pending.statusBadge.needsAttention';
  }
  if (normalized.includes('pendingapproval') || normalized.includes('approval')) {
    return 'pending.statusBadge.pendingApproval';
  }
  if (normalized.includes('followup') || normalized.includes('requiresfollowup')) {
    return 'pending.statusBadge.requiresFollowUp';
  }
  if (normalized.includes('review') || normalized.includes('pendingreview')) {
    return 'pending.statusBadge.pendingReview';
  }
  
  return 'pending.statusBadge.default';
};

const getEntityType = (item: PendingItem): 'Order' | 'Contract' | null => {
  const type = item?.entityType || item?.type;
  if (!type) return null;
  
  const normalizedType = String(type).toLowerCase();
  if (normalizedType === 'order') return 'Order';
  if (normalizedType === 'contract') return 'Contract';
  return null;
};

const getReferenceNumber = (item: PendingItem): string => {
  return item?.reference || item?.referenceNumber || '';
};

const getItemId = (item: PendingItem): string | number | null => {
  return item?.entityId || item?.id || null;
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
            if (!item) return null;
            
            const entityType = getEntityType(item);
            const Icon = getTypeIcon(entityType);
            const refNumber = getReferenceNumber(item);
            const status = item?.status || item?.itemType;
            const messageKey = getPendingMessageKey(entityType, status);
            const statusBadgeKey = getStatusBadgeKey(status);
            const formattedDate = item?.createdAt && isValidDate(item.createdAt) 
              ? formatDate(item.createdAt) 
              : '';
            
            const itemId = getItemId(item);
            const isClickable = entityType && itemId;

            // Format reference for display (with # prefix if exists)
            const displayRef = refNumber ? `#${refNumber}` : '';

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
                      {t(messageKey, { reference: displayRef })}
                    </p>
                    <Badge 
                      variant="outline" 
                      className="text-xs mt-1 text-warning border-warning/30 max-w-full truncate"
                    >
                      {t(statusBadgeKey)}
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
