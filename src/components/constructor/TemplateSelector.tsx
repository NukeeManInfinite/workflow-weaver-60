import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { templateService } from '@/services/templateService';
import { FurnitureTypeTemplate } from '@/types/template';
import { Check, LayoutTemplate, X } from 'lucide-react';

interface TemplateSelectorProps {
  categoryId: number;
  onSelect: (template: FurnitureTypeTemplate | null) => void;
  selectedTemplateId?: number | null;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  categoryId,
  onSelect,
  selectedTemplateId,
}) => {
  const [templates, setTemplates] = useState<FurnitureTypeTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTemplates = async () => {
      if (!categoryId) {
        setTemplates([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const data = await templateService.getActiveByCategoryId(categoryId);
        setTemplates(data);
      } catch (err: any) {
        console.error('Failed to load templates:', err);
        setError(err?.response?.data?.message || 'Shablonlarni yuklashda xatolik');
        setTemplates([]);
      } finally {
        setLoading(false);
      }
    };

    loadTemplates();
  }, [categoryId]);

  if (loading) {
    return (
      <div className="space-y-3">
        <p className="text-sm font-medium text-muted-foreground">Shablonlar yuklanmoqda...</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground border rounded-lg border-dashed">
        <LayoutTemplate className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Bu kategoriya uchun shablonlar mavjud emas</p>
        <p className="text-xs mt-1">Yangi mebel turini qo'lda yarating</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Shablon tanlang (ixtiyoriy)</p>
        {selectedTemplateId && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSelect(null)}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Bekor qilish
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {templates.map((template) => {
          const isSelected = selectedTemplateId === template.id;
          return (
            <Card
              key={template.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                isSelected
                  ? 'ring-2 ring-primary border-primary bg-primary/5'
                  : 'hover:border-primary/50'
              }`}
              onClick={() => onSelect(isSelected ? null : template)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{template.name}</h4>
                    {template.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {template.description}
                      </p>
                    )}
                    {template.defaultMaterial && (
                      <Badge variant="secondary" className="mt-2 text-xs">
                        {template.defaultMaterial}
                      </Badge>
                    )}
                  </div>
                  {isSelected && (
                    <div className="ml-2 p-1 rounded-full bg-primary text-primary-foreground">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={() => onSelect(null)}
      >
        <LayoutTemplate className="h-4 w-4 mr-2" />
        Shablonsiz yaratish
      </Button>
    </div>
  );
};
