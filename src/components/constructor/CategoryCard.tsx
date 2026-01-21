import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FurnitureTypeSummary } from '@/types/constructor';
import {
  CheckCircle2,
  Clock,
  Ruler,
  Image,
  FileText,
  Send,
} from 'lucide-react';
import { DimensionsForm } from './DimensionsForm';
import { MaterialsForm } from './MaterialsForm';

interface CategoryCardProps {
  category: FurnitureTypeSummary;
  orderId: number;
  onComplete: () => void;
  onRefresh: () => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  orderId,
  onComplete,
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState('dimensions');
  const [isSendingToProduction, setIsSendingToProduction] = useState(false);

  const isCompleted = category.isCompleted;
  const hasDetails = category.detailsCount > 0;
  const hasDrawings = category.drawingsCount > 0;
  const hasTechSpec = category.hasTechnicalSpec;
  
  // Can complete only if has details and technical spec
  const canComplete = hasDetails && hasTechSpec && !isCompleted;

  const handleSendToProduction = async () => {
    setIsSendingToProduction(true);
    try {
      onComplete();
    } finally {
      setIsSendingToProduction(false);
    }
  };

  return (
    <Card className={`border-l-4 ${isCompleted ? 'border-l-success' : 'border-l-warning'}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base font-medium">{category.name}</CardTitle>
            <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Ruler className="h-3.5 w-3.5" />
                {category.detailsCount} detallar
              </span>
              <span className="flex items-center gap-1">
                <Image className="h-3.5 w-3.5" />
                {category.drawingsCount} chizmalar
              </span>
              {hasTechSpec && (
                <span className="flex items-center gap-1 text-success">
                  <FileText className="h-3.5 w-3.5" />
                  Texnik xususiyat
                </span>
              )}
            </div>
          </div>
          
          <Badge
            variant={isCompleted ? 'default' : 'secondary'}
            className={isCompleted ? 'bg-success text-success-foreground' : ''}
          >
            {isCompleted ? (
              <>
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Tugatilgan
              </>
            ) : (
              <>
                <Clock className="mr-1 h-3 w-3" />
                Jarayonda
              </>
            )}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        {!isCompleted ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="dimensions" className="text-xs sm:text-sm">
                <Ruler className="mr-1.5 h-3.5 w-3.5" />
                O'lchamlar
              </TabsTrigger>
              <TabsTrigger value="materials" className="text-xs sm:text-sm">
                <FileText className="mr-1.5 h-3.5 w-3.5" />
                Materiallar
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dimensions" className="mt-0">
              <DimensionsForm
                furnitureTypeId={category.id}
                onSave={onRefresh}
                disabled={isCompleted}
              />
            </TabsContent>

            <TabsContent value="materials" className="mt-0">
              <MaterialsForm
                furnitureTypeId={category.id}
                onSave={onRefresh}
                disabled={isCompleted}
              />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="py-4 text-center text-muted-foreground">
            <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-success" />
            <p>Bu kategoriya tugatilgan</p>
          </div>
        )}

        {/* Send to Production Button */}
        {canComplete && (
          <div className="mt-4 pt-4 border-t">
            <Button
              onClick={handleSendToProduction}
              disabled={isSendingToProduction}
              className="w-full bg-success hover:bg-success/90"
            >
              <Send className="mr-2 h-4 w-4" />
              {isSendingToProduction ? 'Yuborilmoqda...' : 'Ishlab chiqarishga yuborish'}
            </Button>
          </div>
        )}

        {!isCompleted && !canComplete && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-xs text-muted-foreground text-center">
              {!hasDetails && "O'lchamlar kiriting"}
              {hasDetails && !hasTechSpec && "Texnik xususiyatlarni kiriting"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
