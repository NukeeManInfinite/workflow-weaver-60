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

const getActivityIcon = (type?: string) => {
  if (!type) return Clock;
  const normalizedType = String(type).toLowerCase();
  switch (normalizedType) {
    case 'order':
      return ShoppingCart;
    case 'contract':
      return FileText;
    default:
      return Clock;
  }
};

const getActivityActionKey = (activity: ActivityItem): string => {
  // Try to get action from various possible field names
  const action = activity?.action || activity?.message;
  
  if (!action) {
    return 'activity.created';
  }
  
  // Normalize action to lowercase for matching
  const actionLower = String(action).toLowerCase().replace(/[\s_-]/g, '');
  
  // Map various action formats to i18n keys
  if (actionLower.includes('ordercreated') || actionLower === 'created') {
    return 'activity.orderCreated';
  }
  if (actionLower.includes('contractcreated')) {
    return 'activity.contractCreated';
  }
  if (actionLower.includes('statuschanged') || actionLower.includes('status')) {
    return 'activity.statusChanged';
  }
  if (actionLower.includes('updated')) {
    return 'activity.updated';
  }
  if (actionLower.includes('completed')) {
    return 'activity.completed';
  }
  if (actionLower.includes('pending')) {
    return 'activity.pending';
  }
  
  return 'common.systemActivity';
};

const getEntityType = (activity: ActivityItem): 'Order' | 'Contract' | null => {
  const type = activity?.type || activity?.entityType;
  if (!type) return null;
  
  const normalizedType = String(type).toLowerCase();
  if (normalizedType === 'order') return 'Order';
  if (normalizedType === 'contract') return 'Contract';
  return null;
};

const getReferenceNumber = (activity: ActivityItem): string | null => {
  return activity?.referenceNumber || activity?.reference || null;
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
    const id = activity?.id;
    
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
            // Defensive: ensure activity exists
            if (!activity) return null;
            
            const entityType = getEntityType(activity);
            const Icon = getActivityIcon(entityType || undefined);
            const actionKey = getActivityActionKey(activity);
            const refNumber = getReferenceNumber(activity);
            const formattedDate = activity?.createdAt && isValidDate(activity.createdAt) 
              ? formatDate(activity.createdAt) 
              : '';
            
            const isClickable = entityType && activity?.id;

            return (
              <div
                key={activity.id || `activity-${index}`}
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
                      {t(actionKey)}
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
