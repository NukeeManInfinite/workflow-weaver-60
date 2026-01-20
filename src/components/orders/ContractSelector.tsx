import React, { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, User, Phone, MapPin, Tag, DollarSign } from 'lucide-react';
import { contractService } from '@/services/contractService';
import { Contract } from '@/types/contract';
import { ContractSummary } from '@/types/order';

interface ContractSelectorProps {
  value: string;
  onChange: (contractId: string, contract: ContractSummary | null) => void;
  disabled?: boolean;
  error?: string;
}

export const ContractSelector: React.FC<ContractSelectorProps> = ({
  value,
  onChange,
  disabled,
  error,
}) => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContract, setSelectedContract] = useState<ContractSummary | null>(null);

  useEffect(() => {
    const fetchContracts = async () => {
      setLoading(true);
      try {
        const response = await contractService.getContracts({ PageSize: 100 });
        setContracts(response.items || []);
      } catch (error) {
        console.error('Failed to load contracts:', error);
        setContracts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchContracts();
  }, []);

  // Build contract summary from contract data
  const buildContractSummary = (contract: Contract): ContractSummary => {
    return {
      id: String(contract.id),
      contractNumber: contract.contractNumber,
      customerId: contract.customerId ? String(contract.customerId) : '',
      customerName: contract.customerName,
      customerPhone: contract.customerPhone,
      customerAddress: contract.customerAddress,
      categoryNames: Array.isArray(contract.categoryNames)
        ? contract.categoryNames
        : typeof contract.categoryNames === 'string'
        ? [contract.categoryNames]
        : [],
      totalAmount: contract.totalAmount,
      status: contract.status,
      isApproved: contract.status === 'Active' || contract.status === 'Completed',
    };
  };

  // Update selected contract when value or contracts change
  useEffect(() => {
    if (value && contracts.length > 0) {
      // Compare as strings to handle both number and string IDs from backend
      const contract = contracts.find((c) => String(c.id) === String(value));
      if (contract) {
        setSelectedContract(buildContractSummary(contract));
      } else {
        setSelectedContract(null);
      }
    } else {
      setSelectedContract(null);
    }
  }, [value, contracts]);

  const handleSelect = (contractIdStr: string) => {
    console.log('Contract selected:', contractIdStr);
    
    // Find contract by comparing as strings
    const contract = contracts.find((c) => String(c.id) === contractIdStr);
    
    if (contract) {
      const summary = buildContractSummary(contract);
      console.log('Contract found:', summary);
      setSelectedContract(summary);
      onChange(contractIdStr, summary);
    } else {
      console.error('Contract not found for ID:', contractIdStr);
      setSelectedContract(null);
      onChange('', null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Select
          value={value || undefined}
          onValueChange={handleSelect}
          disabled={disabled}
        >
          <SelectTrigger className={error ? 'border-destructive' : ''}>
            <SelectValue placeholder="Select a contract" />
          </SelectTrigger>
          <SelectContent className="bg-background border shadow-lg z-50">
            {contracts.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                No contracts available
              </div>
            ) : (
              contracts.map((contract) => {
                const idStr = String(contract.id);
                return (
                  <SelectItem 
                    key={idStr} 
                    value={idStr}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{contract.contractNumber}</span>
                      <span className="text-muted-foreground">-</span>
                      <span>{contract.customerName}</span>
                      <Badge
                        variant={
                          contract.status === 'Active'
                            ? 'default'
                            : contract.status === 'Draft'
                            ? 'secondary'
                            : 'outline'
                        }
                        className="ml-2 text-xs"
                      >
                        {contract.status}
                      </Badge>
                    </div>
                  </SelectItem>
                );
              })
            )}
          </SelectContent>
        </Select>
        {error && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {error}
          </p>
        )}
      </div>

      {selectedContract && (
        <Card className="bg-muted/50">
          <CardContent className="pt-4">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="font-semibold text-lg">
                  Contract: {selectedContract.contractNumber}
                </h4>
                <Badge
                  variant={selectedContract.isApproved ? 'default' : 'secondary'}
                  className="mt-1"
                >
                  {selectedContract.isApproved ? (
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                  ) : (
                    <AlertCircle className="mr-1 h-3 w-3" />
                  )}
                  {selectedContract.status}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Customer:</span>
                <span className="font-medium">{selectedContract.customerName}</span>
              </div>

              {selectedContract.customerPhone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Phone:</span>
                  <span className="font-medium">{selectedContract.customerPhone}</span>
                </div>
              )}

              {selectedContract.customerAddress && (
                <div className="flex items-center gap-2 md:col-span-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Address:</span>
                  <span className="font-medium">{selectedContract.customerAddress}</span>
                </div>
              )}

              {selectedContract.categoryNames && selectedContract.categoryNames.length > 0 && (
                <div className="flex items-center gap-2 md:col-span-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Categories:</span>
                  <span className="font-medium">
                    {selectedContract.categoryNames.join(', ')}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-medium">{formatCurrency(selectedContract.totalAmount)}</span>
              </div>
            </div>

            {!selectedContract.isApproved && (
              <div className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded-md">
                <p className="text-sm text-warning flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  This contract is not yet approved. Order creation may be restricted.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};