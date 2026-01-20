import React from 'react';
import { ActivityItem } from '@/types/seller';
import { cn } from '@/lib/utils';
import { formatDate, isValidDate } from '@/lib/dateUtils';
import { FileText, ShoppingCart, Clock } from 'lucide-react';

interface RecentActivityProps {
  activities: ActivityItem[];
  className?: string;
}

const getActivityIcon = (type?: string) => {
  if (!type) return Clock;
  switch (type) {
    case 'Order':
      return ShoppingCart;
    case 'Contract':
      return FileText;
    default:
      return Clock;
  }
};

const getActionText = (activity: ActivityItem): string => {
  // Defensive: handle missing or null fields
  const typeLabel = activity?.type === 'Order' ? 'Order' : activity?.type === 'Contract' ? 'Contract' : 'Item';
  const refNumber = activity?.referenceNumber || 'Unknown';
  const action = activity?.action;
  
  if (!action) {
    return `${typeLabel} ${refNumber}`;
  }
  
  // Safely convert to lowercase
  const actionLower = String(action).toLowerCase();
  
  switch (actionLower) {
    case 'created':
    case 'order_created':
      return `${typeLabel} ${refNumber} created`;
    case 'updated':
      return `${typeLabel} ${refNumber} updated`;
    case 'pending':
      return `${typeLabel} ${refNumber} pending`;
    case 'completed':
      return `${typeLabel} ${refNumber} completed`;
    case 'contract_created':
      return `Contract ${refNumber} created`;
    default:
      return `${typeLabel} ${refNumber} ${action}`;
  }
};

export const RecentActivity: React.FC<RecentActivityProps> = ({
  activities,
  className,
}) => {
  const hasActivities = activities && activities.length > 0;

  return (
    <div className={cn('bg-card rounded-lg border border-border p-6', className)}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
        <p className="text-sm text-muted-foreground">Your latest actions and updates</p>
      </div>

      {!hasActivities ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Clock className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground">No recent activity</p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {activities.map((activity, index) => {
            // Defensive: ensure activity exists
            if (!activity) return null;
            
            const Icon = getActivityIcon(activity?.type);
            const formattedDate = activity?.createdAt && isValidDate(activity.createdAt) 
              ? formatDate(activity.createdAt) 
              : '';

            return (
              <div
                key={activity.id || `activity-${index}`}
                className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-muted p-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-foreground">{getActionText(activity)}</p>
                </div>
                {formattedDate && (
                  <span className="text-sm text-muted-foreground whitespace-nowrap ml-4">
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
