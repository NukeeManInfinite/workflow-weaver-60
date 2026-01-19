import React, { useState, useEffect, useCallback } from 'react';
import { AppHeader } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Plus, Search, Filter, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

import { contractService } from '@/services/contractService';
import { Contract, ContractStats, ContractsQueryParams, ContractCreateRequest } from '@/types/contract';
import { ContractsTable, ContractFormModal, DeleteConfirmModal } from '@/components/contracts';

export const ContractsPage: React.FC = () => {
  // Data state
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [stats, setStats] = useState<ContractStats | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  // UI state
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Query params
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);

  // Modal state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch contracts
  const fetchContracts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: ContractsQueryParams = {
        PageNumber: pageNumber,
        PageSize: pageSize,
        SearchTerm: searchTerm || undefined,
        Status: statusFilter || undefined,
      };

      const response = await contractService.getContracts(params);
      setContracts(response.items || []);
      setTotalCount(response.totalCount || 0);
    } catch (err: any) {
      console.error('Failed to fetch contracts:', err);
      setError(err.response?.data?.message || 'Failed to load contracts');
      setContracts([]);
    } finally {
      setLoading(false);
    }
  }, [pageNumber, pageSize, searchTerm, statusFilter]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const statsData = await contractService.getStats();
      setStats(statsData);
    } catch (err: any) {
      console.error('Failed to fetch stats:', err);
      // Don't show error for stats, just use defaults
      setStats({
        totalContracts: 0,
        activeContracts: 0,
        completedContracts: 0,
        draftContracts: 0,
      });
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContracts();
    fetchStats();
  }, [fetchContracts, fetchStats]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (pageNumber !== 1) {
        setPageNumber(1);
      } else {
        fetchContracts();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handle status filter change
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value === 'all' ? '' : value);
    setPageNumber(1);
  };

  // Handle view contract
  const handleView = (contract: Contract) => {
    setSelectedContract(contract);
    setFormModalOpen(true);
  };

  // Handle edit contract
  const handleEdit = (contract: Contract) => {
    setSelectedContract(contract);
    setFormModalOpen(true);
  };

  // Handle delete click
  const handleDeleteClick = (contract: Contract) => {
    setSelectedContract(contract);
    setDeleteModalOpen(true);
  };

  // Handle status change
  const handleStatusChange = async (contract: Contract, newStatus: string) => {
    try {
      await contractService.updateStatus(contract.id, {
        status: newStatus as 'Draft' | 'Active' | 'Completed' | 'Cancelled',
      });
      toast.success('Contract status updated');
      fetchContracts();
      fetchStats();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  // Handle form submit (create/update)
  const handleFormSubmit = async (data: ContractCreateRequest) => {
    try {
      setFormLoading(true);
      if (selectedContract) {
        await contractService.update(selectedContract.id, data);
        toast.success('Contract updated successfully');
      } else {
        await contractService.create(data);
        toast.success('Contract created successfully');
      }
      setFormModalOpen(false);
      setSelectedContract(null);
      fetchContracts();
      fetchStats();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save contract');
    } finally {
      setFormLoading(false);
    }
  };

  // Handle delete confirm
  const handleDeleteConfirm = async () => {
    if (!selectedContract) return;

    try {
      setDeleteLoading(true);
      await contractService.delete(selectedContract.id);
      toast.success('Contract deleted successfully');
      setDeleteModalOpen(false);
      setSelectedContract(null);
      fetchContracts();
      fetchStats();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete contract');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Handle new contract
  const handleNewContract = () => {
    setSelectedContract(null);
    setFormModalOpen(true);
  };

  // Pagination
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="min-h-screen">
      <AppHeader title="Contracts" description="Manage your customer contracts" />

      <div className="p-6 space-y-6 animate-fade-in">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {statsLoading ? (
            [1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-5 w-24" />
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{stats?.totalContracts ?? 0}</div>
                  <div className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary text-primary-foreground">
                    Total Contracts
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-info">{stats?.activeContracts ?? 0}</div>
                  <div className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-info text-info-foreground">
                    Active
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-success">{stats?.completedContracts ?? 0}</div>
                  <div className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-success text-success-foreground">
                    Completed
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-warning">{stats?.draftContracts ?? 0}</div>
                  <div className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-warning text-warning-foreground">
                    Draft
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search contracts..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64" align="end">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={statusFilter || 'all'} onValueChange={handleStatusFilterChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="All statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="Draft">Draft</SelectItem>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <Button onClick={handleNewContract}>
            <Plus className="mr-2 h-4 w-4" />
            New Contract
          </Button>
        </div>

        {/* Error State */}
        {error && (
          <Card className="border-destructive">
            <CardContent className="p-4 flex items-center gap-3 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
              <Button variant="outline" size="sm" className="ml-auto" onClick={fetchContracts}>
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Contracts Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Contracts</CardTitle>
          </CardHeader>
          <CardContent>
            <ContractsTable
              contracts={contracts}
              loading={loading}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              onStatusChange={handleStatusChange}
            />

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Showing {(pageNumber - 1) * pageSize + 1} to{' '}
                  {Math.min(pageNumber * pageSize, totalCount)} of {totalCount} contracts
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                    disabled={pageNumber === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {pageNumber} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPageNumber((p) => Math.min(totalPages, p + 1))}
                    disabled={pageNumber === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Form Modal */}
      <ContractFormModal
        open={formModalOpen}
        onClose={() => {
          setFormModalOpen(false);
          setSelectedContract(null);
        }}
        onSubmit={handleFormSubmit}
        contract={selectedContract}
        loading={formLoading}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedContract(null);
        }}
        onConfirm={handleDeleteConfirm}
        contract={selectedContract}
        loading={deleteLoading}
      />
    </div>
  );
};
