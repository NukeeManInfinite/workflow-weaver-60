import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ActivityItem } from '@/types/seller';
import { cn } from '@/lib/utils';
import { formatDate, isValidDate } from '@/lib/dateUtils';
import { FileText, ShoppingCart, Clock, ChevronRight } from 'lucide-react';

interface RecentActivityProps {
  activities: ActivityItem[];
  className?: string;
}

const getActivityIcon = (entityType?: string | null) => {
  if (!entityType) return Clock;
  const normalized = String(entityType).toLowerCase();
  switch (normalized) {
    case 'order':
      return ShoppingCart;
    case 'contract':
      return FileText;
    default:
      return Clock;
  }
};

/**
 * Maps activity data to a human-readable i18n message key.
 * Combines entityType + action to create full sentence messages.
 */
const getActivityMessageKey = (activity: ActivityItem): string => {
  // Backend uses relatedEntityType, check multiple field names
  const entityType = activity?.relatedEntityType || activity?.entityType || activity?.type;
  const action = activity?.action || activity?.message || activity?.description;

  if (!action) return 'activity.messages.default';

  const normalizedAction = String(action).toLowerCase().replace(/[\s_-]/g, '');
  const normalizedEntity = entityType ? String(entityType).toLowerCase() : '';

  // Order-specific messages
  if (normalizedEntity === 'order') {
    if (normalizedAction.includes('created') || normalizedAction === 'created') {
      return 'activity.messages.orderCreated';
    }
    if (normalizedAction.includes('updated') || normalizedAction === 'updated') {
      return 'activity.messages.orderUpdated';
    }
    if (normalizedAction.includes('completed') || normalizedAction === 'completed') {
      return 'activity.messages.orderCompleted';
    }
    if (normalizedAction.includes('status') || normalizedAction === 'statuschanged') {
      return 'activity.messages.orderStatusChanged';
    }
  }

  // Contract-specific messages
  if (normalizedEntity === 'contract') {
    if (normalizedAction.includes('created') || normalizedAction === 'created') {
      return 'activity.messages.contractCreated';
    }
    if (normalizedAction.includes('updated') || normalizedAction === 'updated') {
      return 'activity.messages.contractUpdated';
    }
    if (normalizedAction.includes('completed') || normalizedAction === 'completed') {
      return 'activity.messages.contractCompleted';
    }
    if (normalizedAction.includes('status') || normalizedAction === 'statuschanged') {
      return 'activity.messages.contractStatusChanged';
    }
  }

  // Generic fallbacks (no entityType or unknown entity)
  if (normalizedAction.includes('created') || normalizedAction === 'created') {
    return 'activity.messages.created';
  }
  if (normalizedAction.includes('updated') || normalizedAction === 'updated') {
    return 'activity.messages.updated';
  }
  if (normalizedAction.includes('completed') || normalizedAction === 'completed') {
    return 'activity.messages.completed';
  }
  if (normalizedAction.includes('status') || normalizedAction === 'statuschanged') {
    return 'activity.messages.statusChanged';
  }

  return 'activity.messages.default';
};

const getEntityType = (activity: ActivityItem): 'Order' | 'Contract' | null => {
  // Backend uses relatedEntityType, but also check entityType and type as fallbacks
  const type = activity?.relatedEntityType || activity?.entityType || activity?.type;
  if (!type) return null;
  
  const normalizedType = String(type).toLowerCase();
  if (normalizedType === 'order') return 'Order';
  if (normalizedType === 'contract') return 'Contract';
  return null;
};

const getReferenceNumber = (activity: ActivityItem): string | null => {
  return activity?.reference || activity?.referenceNumber || activity?.description || null;
};

export const RecentActivity: React.FC<RecentActivityProps> = ({
  activities,
  className,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const hasActivities = activities && activities.length > 0;

  const handleActivityClick = (activity: ActivityItem) => {
    const entityType = getEntityType(activity);
    const id = activity?.entityId || activity?.id;
    
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
        <h3 className="text-lg font-semibold text-foreground">{t('activity.title')}</h3>
        <p className="text-sm text-muted-foreground">{t('activity.subtitle')}</p>
      </div>

      {!hasActivities ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Clock className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground">{t('activity.empty')}</p>
        </div>
      ) : (
        <div className="space-y-1 max-h-[350px] overflow-y-auto overflow-x-hidden">
          {activities.map((activity, index) => {
            if (!activity) return null;
            
            const entityType = getEntityType(activity);
            const Icon = getActivityIcon(entityType);
            const messageKey = getActivityMessageKey(activity);
            const refNumber = getReferenceNumber(activity);
            const formattedDate = activity?.createdAt && isValidDate(activity.createdAt) 
              ? formatDate(activity.createdAt) 
              : '';
            
            const id = activity?.entityId || activity?.id;
            const isClickable = entityType && id;

            return (
              <div
                key={id || `activity-${index}`}
                onClick={() => isClickable && handleActivityClick(activity)}
                className={cn(
                  'flex items-center justify-between py-3 px-3 -mx-3 rounded-md transition-colors',
                  isClickable && 'cursor-pointer hover:bg-muted/50 group'
                )}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className={cn(
                    'rounded-lg p-2 flex-shrink-0',
                    entityType === 'Order' ? 'bg-info/10' : 
                    entityType === 'Contract' ? 'bg-success/10' : 'bg-muted'
                  )}>
                    <Icon className={cn(
                      'h-4 w-4',
                      entityType === 'Order' ? 'text-info' : 
                      entityType === 'Contract' ? 'text-success' : 'text-muted-foreground'
                    )} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">
                      {t(messageKey)}
                    </p>
                    {refNumber && (
                      <p className="text-xs text-muted-foreground truncate">
                        {entityType ? t(`activity.${entityType.toLowerCase()}`) : ''} #{refNumber}
                      </p>
                    )}
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
