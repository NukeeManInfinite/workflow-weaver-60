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
  onStatusChange: (contract: Contract, newStatus: ContractStatus) => void;
}

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
        <p className="text-lg font-medium">No contracts available</p>
        <p className="text-sm mt-1">Create your first contract to get started.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Contract #</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Seller</TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contracts.map((contract) => (
            <TableRow key={contract.id}>
              <TableCell className="font-medium">
                {contract.contractNumber || '-'}
              </TableCell>
              <TableCell>{contract.customerName || '-'}</TableCell>
              <TableCell>{contract.categoryName || '-'}</TableCell>
              <TableCell>{formatCurrency(contract.totalAmount)}</TableCell>
              <TableCell>
                <ContractStatusDropdown
                  value={contract.status}
                  onChange={(newStatus) => onStatusChange(contract, newStatus)}
                />
              </TableCell>
              <TableCell>{formatDate(contract.createdAt)}</TableCell>
              <TableCell>{contract.sellerName || '-'}</TableCell>
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
