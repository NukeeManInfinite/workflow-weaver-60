import React, { useState, useEffect, useCallback } from 'react';
import { AppHeader } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
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
import {
  Plus,
  Search,
  Filter,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  FileText,
  CheckCircle,
  Clock,
  Activity,
} from 'lucide-react';
import { toast } from 'sonner';

import { contractService } from '@/services/contractService';
import {
  Contract,
  ContractStats,
  ContractsQueryParams,
  ContractCreateRequest,
  ContractStatus,
} from '@/types/contract';
import {
  ContractsTable,
  ContractFormModal,
  DeleteConfirmModal,
} from '@/components/contracts';

export const ContractsPage: React.FC = () => {
  // Data state
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [stats, setStats] = useState<ContractStats | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  // UI state
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Query params state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ContractStatus | ''>('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [sortDescending, setSortDescending] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);

  // Modal state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch contracts from API
  const fetchContracts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: ContractsQueryParams = {
        PageNumber: pageNumber,
        PageSize: pageSize,
        SearchTerm: searchTerm || undefined,
        Status: statusFilter || undefined,
        FromDate: fromDate || undefined,
        ToDate: toDate || undefined,
        SortBy: sortBy || undefined,
        SortDescending: sortDescending || undefined,
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
  }, [pageNumber, pageSize, searchTerm, statusFilter, fromDate, toDate, sortBy, sortDescending]);

  // Fetch stats from API
  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const statsData = await contractService.getStats();
      setStats(statsData);
    } catch (err: any) {
      console.error('Failed to fetch stats:', err);
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

  // Initial data load
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
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handle status filter change
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value === 'all' ? '' : (value as ContractStatus));
    setPageNumber(1);
  };

  // Handle sort change
  const handleSortChange = (value: string) => {
    if (value === 'none') {
      setSortBy('');
      setSortDescending(false);
    } else {
      const [field, direction] = value.split('-');
      setSortBy(field);
      setSortDescending(direction === 'desc');
    }
    setPageNumber(1);
  };

  // Apply filters
  const applyFilters = () => {
    setPageNumber(1);
    fetchContracts();
  };

  // Clear filters
  const clearFilters = () => {
    setStatusFilter('');
    setFromDate('');
    setToDate('');
    setSortBy('');
    setSortDescending(false);
    setPageNumber(1);
  };

  // Handle view contract
  const handleView = (contract: Contract) => {
    setSelectedContract(contract);
    setFormMode('view');
    setFormModalOpen(true);
  };

  // Handle edit contract
  const handleEdit = (contract: Contract) => {
    setSelectedContract(contract);
    setFormMode('edit');
    setFormModalOpen(true);
  };

  // Handle delete click
  const handleDeleteClick = (contract: Contract) => {
    setSelectedContract(contract);
    setDeleteModalOpen(true);
  };

  // Handle status change - PUT /api/Contracts/{id}/status
  const handleStatusChange = async (contract: Contract, newStatus: ContractStatus) => {
    try {
      await contractService.updateStatus(contract.id, { status: newStatus });
      toast.success('Contract status updated successfully');
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
      if (formMode === 'edit' && selectedContract) {
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

  // Handle delete confirm - DELETE /api/Contracts/{id}
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

  // Handle new contract button
  const handleNewContract = () => {
    setSelectedContract(null);
    setFormMode('create');
    setFormModalOpen(true);
  };

  // Pagination
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader title="Contracts" description="Manage customer contracts" />

      <div className="p-6 space-y-6">
        {/* Stats Cards - GET /api/Contracts/stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
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
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats?.totalContracts ?? 0}</div>
                    <div className="text-sm text-muted-foreground">Total Contracts</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-info/10">
                    <Activity className="h-6 w-6 text-info" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-info">{stats?.activeContracts ?? 0}</div>
                    <div className="text-sm text-muted-foreground">Active</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-success/10">
                    <CheckCircle className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-success">{stats?.completedContracts ?? 0}</div>
                    <div className="text-sm text-muted-foreground">Completed</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-warning/10">
                    <Clock className="h-6 w-6 text-warning" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-warning">{stats?.draftContracts ?? 0}</div>
                    <div className="text-sm text-muted-foreground">Draft</div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-2 flex-1 max-w-lg">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search contracts..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filter Popover */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 bg-popover" align="end">
                <div className="space-y-4">
                  <h4 className="font-medium">Filters</h4>

                  {/* Status Filter */}
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={statusFilter || 'all'} onValueChange={handleStatusFilterChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Statuses" />
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

                  {/* Date Range */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label>From Date</Label>
                      <Input
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>To Date</Label>
                      <Input
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Sort Options */}
                  <div className="space-y-2">
                    <Label>Sort By</Label>
                    <Select
                      value={sortBy ? `${sortBy}-${sortDescending ? 'desc' : 'asc'}` : 'none'}
                      onValueChange={handleSortChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="No sorting" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No sorting</SelectItem>
                        <SelectItem value="createdAt-desc">Created (Newest)</SelectItem>
                        <SelectItem value="createdAt-asc">Created (Oldest)</SelectItem>
                        <SelectItem value="totalAmount-desc">Amount (High to Low)</SelectItem>
                        <SelectItem value="totalAmount-asc">Amount (Low to High)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Filter Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={clearFilters}>
                      Clear
                    </Button>
                    <Button size="sm" className="flex-1" onClick={applyFilters}>
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* New Contract Button */}
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

      {/* Form Modal - POST/PUT /api/Contracts */}
      <ContractFormModal
        open={formModalOpen}
        onClose={() => {
          setFormModalOpen(false);
          setSelectedContract(null);
        }}
        onSubmit={handleFormSubmit}
        contract={selectedContract}
        loading={formLoading}
        mode={formMode}
      />

      {/* Delete Confirmation Modal - DELETE /api/Contracts/{id} */}
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
