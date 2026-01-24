import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  change?: string;
  changeType?: 'up' | 'down' | 'neutral';
  icon?: React.ElementType;
  color?: string;
  loading?: boolean;
}

export const KPICard: React.FC<KPICardProps> = ({ 
  title, 
  value, 
  subtitle,
  change, 
  changeType = 'neutral', 
  icon: Icon, 
  color = 'bg-primary/10 text-primary',
  loading 
}) => (
  <Card className="border border-border/50">
    <CardContent className="p-5">
      {loading ? (
        <Skeleton className="h-20 w-full" />
      ) : (
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {change && (
              <div className={`flex items-center gap-1 text-xs font-medium ${
                changeType === 'up' ? 'text-success' : 
                changeType === 'down' ? 'text-destructive' : 
                'text-muted-foreground'
              }`}>
                {changeType === 'up' && <TrendingUp className="h-3 w-3" />}
                {changeType === 'down' && <TrendingDown className="h-3 w-3" />}
                {change}
              </div>
            )}
            {subtitle && !change && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          {Icon && (
            <div className={`p-3 rounded-xl ${color}`}>
              <Icon className="h-6 w-6" />
            </div>
          )}
        </div>
      )}
    </CardContent>
  </Card>
);

export default KPICard;
