import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { FileText, ShoppingCart, CheckSquare, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StatCardData } from '@/types/seller';

interface StatCardProps {
  data: StatCardData;
  className?: string;
}

const iconMap = {
  document: FileText,
  cart: ShoppingCart,
  checkmark: CheckSquare,
  chart: TrendingUp,
};

const colorStyles = {
  blue: {
    icon: 'bg-info/10 text-info',
    subtext: 'text-info',
  },
  orange: {
    icon: 'bg-warning/10 text-warning',
    subtext: 'text-warning',
  },
  green: {
    icon: 'bg-success/10 text-success',
    subtext: 'text-success',
  },
  gray: {
    icon: 'bg-muted text-muted-foreground',
    subtext: 'text-success',
  },
};

export const StatCard: React.FC<StatCardProps> = ({ data, className }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const Icon = iconMap[data.icon];
  const colors = colorStyles[data.color];

  const handleClick = () => {
    if (data.navigateTo) {
      navigate(data.navigateTo);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (data.navigateTo && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      navigate(data.navigateTo);
    }
  };

  return (
    <div
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={data.navigateTo ? 0 : undefined}
      role={data.navigateTo ? 'button' : undefined}
      aria-label={data.navigateTo ? t(data.titleKey) : undefined}
      className={cn(
        'group relative overflow-hidden bg-card rounded-xl border border-border/50 p-5 transition-all duration-300',
        data.navigateTo && 'cursor-pointer hover:shadow-elevated hover:border-primary/20 focus:outline-none focus:ring-2 focus:ring-primary/50',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{t(data.titleKey)}</p>
          <p className="text-3xl font-bold tracking-tight text-foreground">{data.value}</p>
          {data.subtext && (
            <p className={cn('text-xs font-medium', colors.subtext)}>
              {data.subtext}
            </p>
          )}
        </div>
        <div className={cn('rounded-xl p-3', colors.icon)}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-border to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
};
