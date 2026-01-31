import React, { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { categoryService } from '@/services/categoryService';
import { Category } from '@/types/contract';

interface CategoryMultiSelectProps {
  value: number[];
  onChange: (categoryIds: number[], categories: Category[]) => void;
  disabled?: boolean;
  error?: string;
  placeholder?: string;
}

export const CategoryMultiSelect: React.FC<CategoryMultiSelectProps> = ({
  value,
  onChange,
  disabled,
  error,
  placeholder = 'Select categories...',
}) => {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const data = await categoryService.getAll();
        setCategories(data || []);
      } catch (err) {
        console.error('Failed to load categories:', err);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const selectedCategories = categories.filter((cat) =>
    value.includes(Number(cat.id))
  );

  const handleSelect = (categoryId: number) => {
    let newValue: number[];
    if (value.includes(categoryId)) {
      newValue = value.filter((id) => id !== categoryId);
    } else {
      newValue = [...value, categoryId];
    }
    const selectedCats = categories.filter((cat) =>
      newValue.includes(Number(cat.id))
    );
    onChange(newValue, selectedCats);
  };

  const handleRemove = (categoryId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newValue = value.filter((id) => id !== categoryId);
    const selectedCats = categories.filter((cat) =>
      newValue.includes(Number(cat.id))
    );
    onChange(newValue, selectedCats);
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([], []);
  };

  if (loading) {
    return (
      <Button
        variant="outline"
        className="w-full justify-between"
        disabled
      >
        <span className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading categories...
        </span>
      </Button>
    );
  }

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              'w-full justify-between min-h-[40px] h-auto',
              error && 'border-destructive',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            disabled={disabled}
          >
            <div className="flex flex-wrap gap-1 flex-1 text-left">
              {selectedCategories.length === 0 ? (
                <span className="text-muted-foreground">{placeholder}</span>
              ) : (
                selectedCategories.map((cat) => (
                  <Badge
                    key={cat.id}
                    variant="secondary"
                    className="mr-1 mb-1"
                  >
                    {cat.name}
                    <button
                      className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={(e) => handleRemove(Number(cat.id), e)}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))
              )}
            </div>
            <div className="flex items-center gap-1 ml-2">
              {selectedCategories.length > 0 && (
                <button
                  className="p-1 hover:bg-muted rounded"
                  onClick={handleClearAll}
                  onMouseDown={(e) => e.preventDefault()}
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
              <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full min-w-[300px] p-0 bg-background border shadow-lg z-50">
          <Command>
            <CommandInput placeholder="Search categories..." />
            <CommandList>
              <CommandEmpty>No categories found.</CommandEmpty>
              <CommandGroup>
                {categories.map((category) => {
                  const isSelected = value.includes(Number(category.id));
                  return (
                    <CommandItem
                      key={category.id}
                      value={category.name}
                      onSelect={() => handleSelect(Number(category.id))}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          isSelected ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      <div className="flex flex-col">
                        <span>{category.name}</span>
                        {category.description && (
                          <span className="text-xs text-muted-foreground">
                            {category.description}
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
};
