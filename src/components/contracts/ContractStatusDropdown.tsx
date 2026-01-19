import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ContractStatus } from '@/types/contract';

interface ContractStatusDropdownProps {
  value: ContractStatus;
  onChange: (status: ContractStatus) => void;
  disabled?: boolean;
}

const statusOptions: { value: ContractStatus; label: string }[] = [
  { value: 'Draft', label: 'Draft' },
  { value: 'Active', label: 'Active' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Cancelled', label: 'Cancelled' },
];

export const ContractStatusDropdown: React.FC<ContractStatusDropdownProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  return (
    <Select
      value={value}
      onValueChange={(val) => onChange(val as ContractStatus)}
      disabled={disabled}
    >
      <SelectTrigger className="w-[130px] h-8 text-xs">
        <SelectValue placeholder="Select status" />
      </SelectTrigger>
      <SelectContent>
        {statusOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
