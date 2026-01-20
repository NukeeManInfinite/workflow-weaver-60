import { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Category, ContractWizardData } from '@/types/contract';
import { categoryService } from '@/services/categoryService';
import { Loader2, Package, Plus, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CategoryStepProps {
  data: ContractWizardData;
  onChange: (data: Partial<ContractWizardData>) => void;
}

export function CategoryStep({ data, onChange }: CategoryStepProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const result = await categoryService.getAll();
      setCategories(result);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryToggle = (categoryId: string, checked: boolean) => {
    const newCategoryIds = checked
      ? [...data.categoryIds, categoryId]
      : data.categoryIds.filter((id) => id !== categoryId);
    onChange({ categoryIds: newCategoryIds });
  };

  const handleRemoveCategory = (categoryId: string) => {
    onChange({
      categoryIds: data.categoryIds.filter((id) => id !== categoryId),
    });
  };

  const selectedCategories = categories.filter((c) => data.categoryIds.includes(c.id));

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Mahsulot / Kategoriya</h3>
        <p className="text-sm text-muted-foreground">
          Bir yoki bir nechta kategoriyani tanlang
        </p>
      </div>

      {/* Selected Categories */}
      {selectedCategories.length > 0 && (
        <div className="space-y-2">
          <Label>Tanlangan kategoriyalar</Label>
          <div className="flex flex-wrap gap-2">
            {selectedCategories.map((category) => (
              <Badge
                key={category.id}
                variant="secondary"
                className="flex items-center gap-1 px-3 py-1"
              >
                {category.name}
                <button
                  type="button"
                  onClick={() => handleRemoveCategory(category.id)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Category Selection */}
      <div className="space-y-4">
        <Label>Kategoriyalar ro'yxati</Label>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Yuklanmoqda...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto p-1">
            {categories.map((category) => {
              const isSelected = data.categoryIds.includes(category.id);
              return (
                <div
                  key={category.id}
                  className={`flex items-start gap-3 p-3 border rounded-lg transition-all cursor-pointer hover:border-primary/50 ${
                    isSelected ? 'border-primary bg-primary/5' : ''
                  }`}
                  onClick={() => handleCategoryToggle(category.id, !isSelected)}
                >
                  <Checkbox
                    id={`category-${category.id}`}
                    checked={isSelected}
                    onCheckedChange={(checked) =>
                      handleCategoryToggle(category.id, checked as boolean)
                    }
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor={`category-${category.id}`}
                      className="font-medium cursor-pointer"
                    >
                      {category.name}
                    </Label>
                    {category.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {category.description}
                      </p>
                    )}
                  </div>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Product Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Mahsulot tavsifi (ixtiyoriy)</Label>
        <Textarea
          id="description"
          placeholder="Mahsulot haqida qo'shimcha ma'lumot..."
          value={data.description || ''}
          onChange={(e) => onChange({ description: e.target.value })}
          rows={3}
        />
      </div>

      {/* Summary */}
      {selectedCategories.length > 0 && (
        <div className="p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2 text-sm">
            <Package className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">Jami tanlangan:</span>
            <span className="font-medium">{selectedCategories.length} ta kategoriya</span>
          </div>
        </div>
      )}
    </div>
  );
}
