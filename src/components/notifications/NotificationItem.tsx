import React from 'react';
import { Trash2, FileText, ShoppingCart, Bell, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Notification } from '@/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

const getTypeIcon = (type: Notification['type']) => {
  switch (type) {
    case 'Success':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'Warning':
      return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    case 'Error':
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    default:
      return <Info className="h-5 w-5 text-blue-500" />;
  }
};

const getEntityIcon = (entityType?: string) => {
  switch (entityType) {
    case 'Order':
      return <ShoppingCart className="h-4 w-4" />;
    case 'Contract':
      return <FileText className="h-4 w-4" />;
    default:
      return <Bell className="h-4 w-4" />;
  }
};

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
  isDeleting,
}) => {
  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        'flex items-start gap-4 p-4 rounded-lg border transition-all cursor-pointer',
        notification.isRead
          ? 'bg-background border-border hover:bg-muted/50'
          : 'bg-primary/5 border-primary/20 hover:bg-primary/10'
      )}
    >
      {/* Unread indicator */}
      <div className="flex-shrink-0 pt-1">
        {!notification.isRead && (
          <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
        )}
        {notification.isRead && (
          <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
        )}
      </div>

      {/* Type icon */}
      <div className="flex-shrink-0 pt-0.5">
        {getTypeIcon(notification.type)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h4 className={cn(
              'text-sm',
              notification.isRead ? 'font-medium text-foreground' : 'font-semibold text-foreground'
            )}>
              {notification.title}
            </h4>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {notification.message}
            </p>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            className="flex-shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(notification.id);
            }}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Meta info */}
        <div className="flex items-center gap-3 mt-2">
          {notification.relatedEntityType && (
            <Badge variant="outline" className="text-xs gap-1">
              {getEntityIcon(notification.relatedEntityType)}
              {notification.relatedEntityType}
            </Badge>
          )}
          <span className="text-xs text-muted-foreground">
            {format(new Date(notification.createdAt), 'MMM dd, yyyy • HH:mm')}
          </span>
          {!notification.isRead && (
            <Badge variant="secondary" className="text-xs">
              Unread
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};
