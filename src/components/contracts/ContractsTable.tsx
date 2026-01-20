import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Contract, ContractStatus } from '@/types/contract';
import { ContractStatusDropdown } from './ContractStatusDropdown';
import { ContractActionsMenu } from './ContractActionsMenu';
import { format, parseISO, isValid } from 'date-fns';

interface ContractsTableProps {
  contracts: Contract[];
  loading: boolean;
  onView: (contract: Contract) => void;
  onEdit: (contract: Contract) => void;
  onDelete: (contract: Contract) => void;
  onStatusChange: (contract: Contract, newStatus: ContractStatus) => Promise<void>;
}

// Format category names - handles array or string from backend
const formatCategoryNames = (contract: Contract): string => {
  // First try categoryNames (array or string)
  if (contract.categoryNames) {
    if (Array.isArray(contract.categoryNames)) {
      return contract.categoryNames.length > 0 ? contract.categoryNames.join(', ') : '-';
    }
    // If it's a string, return as-is
    return contract.categoryNames || '-';
  }
  // Fallback to single categoryName
  return contract.categoryName || '-';
};

// Format seller name safely
const formatSellerName = (sellerName?: string): string => {
  return sellerName?.trim() || '-';
};

// Format date safely - filter out invalid dates like 0001-01-01
const formatDate = (dateString?: string): string => {
  if (!dateString) return '-';
  
  try {
    const date = parseISO(dateString);
    if (!isValid(date) || date.getFullYear() < 1900) {
      return '-';
    }
    return format(date, 'MMM dd, yyyy');
  } catch {
    return '-';
  }
};

// Format currency
const formatCurrency = (amount?: number): string => {
  if (amount === undefined || amount === null) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const ContractsTable: React.FC<ContractsTableProps> = ({
  contracts,
  loading,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  const [updatingStatusId, setUpdatingStatusId] = React.useState<string | null>(null);

  const handleStatusChange = async (contract: Contract, newStatus: ContractStatus) => {
    setUpdatingStatusId(contract.id);
    try {
      await onStatusChange(contract, newStatus);
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  // Empty state
  if (!contracts || contracts.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg font-medium">Shartnomalar mavjud emas</p>
        <p className="text-sm mt-1">Birinchi shartnomangizni yarating.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Shartnoma №</TableHead>
            <TableHead>Mijoz</TableHead>
            <TableHead>Kategoriya</TableHead>
            <TableHead>Summa</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Yaratilgan</TableHead>
            <TableHead>Sotuvchi</TableHead>
            <TableHead className="w-[80px]">Amallar</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contracts.map((contract) => (
            <TableRow key={contract.id}>
              <TableCell className="font-medium">
                {contract.contractNumber || '-'}
              </TableCell>
              <TableCell>{contract.customerName || '-'}</TableCell>
              <TableCell className="max-w-[200px] truncate" title={formatCategoryNames(contract)}>
                {formatCategoryNames(contract)}
              </TableCell>
              <TableCell>{formatCurrency(contract.totalAmount)}</TableCell>
              <TableCell>
                <ContractStatusDropdown
                  value={contract.status}
                  onChange={(newStatus) => handleStatusChange(contract, newStatus)}
                  disabled={updatingStatusId === contract.id}
                />
              </TableCell>
              <TableCell>{formatDate(contract.createdAt)}</TableCell>
              <TableCell>{formatSellerName(contract.sellerName)}</TableCell>
              <TableCell>
                <ContractActionsMenu
                  contract={contract}
                  onView={onView}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
