import React from 'react';
import { ActivityItem } from '@/types/seller';
import { cn } from '@/lib/utils';

interface RecentActivityProps {
  activities: ActivityItem[];
  className?: string;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({
  activities,
  className,
}) => {
  return (
    <div className={cn('bg-card rounded-lg border border-border p-6', className)}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
        <p className="text-sm text-muted-foreground">Your latest actions and updates</p>
      </div>

      <div className="divide-y divide-border">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
          >
            <p className="text-sm text-foreground">{activity.message}</p>
            <span className="text-sm text-muted-foreground whitespace-nowrap ml-4">
              {activity.timestamp}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
