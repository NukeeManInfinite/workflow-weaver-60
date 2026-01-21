import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ContractStatus } from '@/types/contract';
import { Badge } from '@/components/ui/badge';

interface ContractStatusDropdownProps {
  value: ContractStatus | number | string;
  onChange: (status: ContractStatus) => void;
  disabled?: boolean;
}

// Map numeric status to string status
const statusMap: Record<number, ContractStatus> = {
  0: 'Draft',
  1: 'Active',
  2: 'Completed',
  3: 'Cancelled',
};

// Map string status variations to normalized status
const normalizeStatus = (status: ContractStatus | number | string): ContractStatus => {
  // If it's a number, map it
  if (typeof status === 'number') {
    return statusMap[status] || 'Draft';
  }
  
  // If it's a string that looks like a number
  if (typeof status === 'string' && !isNaN(Number(status))) {
    return statusMap[Number(status)] || 'Draft';
  }
  
  // Normalize string status (handle case variations)
  const statusLower = String(status).toLowerCase();
  if (statusLower === 'draft' || statusLower === 'qoralama') return 'Draft';
  if (statusLower === 'active' || statusLower === 'faol') return 'Active';
  if (statusLower === 'completed' || statusLower === 'tugatilgan') return 'Completed';
  if (statusLower === 'cancelled' || statusLower === 'bekor qilingan') return 'Cancelled';
  
  // Return as-is if it's already a valid ContractStatus
  if (['Draft', 'Active', 'Completed', 'Cancelled'].includes(status as string)) {
    return status as ContractStatus;
  }
  
  return 'Draft';
};

const statusOptions: { value: ContractStatus; label: string; color: string }[] = [
  { value: 'Draft', label: 'Qoralama', color: 'bg-slate-100 text-slate-700 hover:bg-slate-200' },
  { value: 'Active', label: 'Faol', color: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
  { value: 'Completed', label: 'Tugatilgan', color: 'bg-green-100 text-green-700 hover:bg-green-200' },
  { value: 'Cancelled', label: 'Bekor qilingan', color: 'bg-red-100 text-red-700 hover:bg-red-200' },
];

const getStatusColor = (status: ContractStatus): string => {
  const option = statusOptions.find(opt => opt.value === status);
  return option?.color || 'bg-slate-100 text-slate-700';
};

const getStatusLabel = (status: ContractStatus): string => {
  const option = statusOptions.find(opt => opt.value === status);
  return option?.label || status;
};

export const ContractStatusDropdown: React.FC<ContractStatusDropdownProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const normalizedValue = normalizeStatus(value);
  
  return (
    <Select
      value={normalizedValue}
      onValueChange={(val) => onChange(val as ContractStatus)}
      disabled={disabled}
    >
      <SelectTrigger className="w-[140px] h-8 text-xs border-0 bg-transparent p-0 focus:ring-0 [&>svg]:hidden">
        <Badge className={`${getStatusColor(normalizedValue)} font-medium text-xs px-2 py-1`}>
          {getStatusLabel(normalizedValue)}
        </Badge>
      </SelectTrigger>
      <SelectContent className="bg-background border shadow-lg z-50">
        {statusOptions.map((option) => (
          <SelectItem 
            key={option.value} 
            value={option.value}
            className="cursor-pointer"
          >
            <Badge className={`${option.color} font-medium text-xs`}>
              {option.label}
            </Badge>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
