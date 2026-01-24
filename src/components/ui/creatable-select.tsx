import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export interface SelectOption {
  id: number;
  name: string;
}

interface CreatableSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  onAddClick: () => void;
  addButtonLabel?: string;
  disabled?: boolean;
  error?: boolean;
  loading?: boolean;
}

export const CreatableSelect: React.FC<CreatableSelectProps> = ({
  value,
  onValueChange,
  options,
  placeholder = 'Select...',
  onAddClick,
  addButtonLabel = 'Add new',
  disabled = false,
  error = false,
  loading = false,
}) => {
  return (
    <div className="flex gap-2">
      <Select value={value} onValueChange={onValueChange} disabled={disabled || loading}>
        <SelectTrigger className={`flex-1 ${error ? 'border-destructive' : ''}`}>
          <SelectValue placeholder={loading ? 'Loading...' : placeholder} />
        </SelectTrigger>
        <SelectContent className="bg-background border shadow-lg z-50">
          {options.map((option) => (
            <SelectItem key={option.id} value={option.id.toString()}>
              {option.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={onAddClick}
        disabled={disabled || loading}
        title={addButtonLabel}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
};
