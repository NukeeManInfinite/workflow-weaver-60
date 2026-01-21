import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ConstructorOrder, FurnitureTypeSummary } from '@/types/constructor';
import { formatDate } from '@/lib/dateUtils';
import {
  ChevronDown,
  ChevronUp,
  User,
  FileText,
  Calendar,
  Package,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { CategoryCard } from './CategoryCard';

interface OrderCardProps {
  order: ConstructorOrder;
  onCategoryComplete: (furnitureTypeId: number) => void;
  onRefresh: () => void;
}

const getStatusConfig = (status: string) => {
  const configs: Record<string, { label: string; variant: string; icon: React.ReactNode }> = {
    Created: {
      label: 'Yaratilgan',
      variant: 'bg-muted text-muted-foreground',
      icon: <Clock className="h-3.5 w-3.5" />,
    },
    Assigned: {
      label: 'Tayinlangan',
      variant: 'bg-warning/10 text-warning',
      icon: <AlertCircle className="h-3.5 w-3.5" />,
    },
    InProgress: {
      label: 'Jarayonda',
      variant: 'bg-info/10 text-info',
      icon: <Clock className="h-3.5 w-3.5" />,
    },
    Completed: {
      label: 'Tugatilgan',
      variant: 'bg-success/10 text-success',
      icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    },
    Cancelled: {
      label: 'Bekor qilingan',
      variant: 'bg-destructive/10 text-destructive',
      icon: <AlertCircle className="h-3.5 w-3.5" />,
    },
  };
  return configs[status] || configs.Created;
};

export const OrderCard: React.FC<OrderCardProps> = ({ order, onCategoryComplete, onRefresh }) => {
  const [isOpen, setIsOpen] = useState(false);
  const statusConfig = getStatusConfig(order.status);

  const completedCategories = order.furnitureTypes?.filter(ft => ft.isCompleted).length || 0;
  const totalCategories = order.furnitureTypes?.length || 0;
  const progress = totalCategories > 0 ? Math.round((completedCategories / totalCategories) * 100) : 0;
  const isAllCompleted = completedCategories === totalCategories && totalCategories > 0;

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            {/* Customer & Order Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg truncate">{order.customerName}</h3>
                  <p className="text-sm text-muted-foreground">Mijoz</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Buyurtma:</span>
                  <span className="font-medium">{order.orderNumber}</span>
                </div>
                {order.contractNumber && (
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Shartnoma:</span>
                    <span className="font-medium">{order.contractNumber}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Sana:</span>
                  <span className="font-medium">{formatDate(order.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Status & Progress */}
            <div className="flex flex-col items-end gap-2">
              <Badge className={`${statusConfig.variant} flex items-center gap-1`}>
                {statusConfig.icon}
                {statusConfig.label}
              </Badge>
              
              <div className="text-right">
                <div className="text-sm font-medium">
                  {completedCategories} / {totalCategories}
                </div>
                <div className="text-xs text-muted-foreground">Kategoriyalar</div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground">Jarayon</span>
              <span className={`font-medium ${isAllCompleted ? 'text-success' : ''}`}>
                {progress}%
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  isAllCompleted ? 'bg-success' : 'bg-primary'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Expand/Collapse Button */}
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full mt-3">
              <Package className="mr-2 h-4 w-4" />
              {totalCategories} ta kategoriya
              {isOpen ? (
                <ChevronUp className="ml-auto h-4 w-4" />
              ) : (
                <ChevronDown className="ml-auto h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-4">
              {order.furnitureTypes && order.furnitureTypes.length > 0 ? (
                order.furnitureTypes.map((category) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    orderId={order.id}
                    onComplete={() => onCategoryComplete(category.id)}
                    onRefresh={onRefresh}
                  />
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Kategoriyalar topilmadi</p>
                </div>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
