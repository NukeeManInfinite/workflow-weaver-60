import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ContractsTable,
  DeleteConfirmModal,
  CreateContractWizard,
  ContractViewModal,
  ContractEditModal,
} from '@/components/contracts';
import {
  Contract,
  ContractStatus,
  ContractStats,
  ContractsQueryParams,
} from '@/types/contract';
import { contractService } from '@/services/contractService';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  Search,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export default function ContractsPage() {
  // State
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [stats, setStats] = useState<ContractStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ContractStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDesc, setSortDesc] = useState(true);

  // Pagination
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modals
  const [wizardOpen, setWizardOpen] = useState(false);
  const [viewContract, setViewContract] = useState<Contract | null>(null);
  const [editContract, setEditContract] = useState<Contract | null>(null);
  const [deleteContract, setDeleteContract] = useState<Contract | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { toast } = useToast();

  // Load data
  const loadContracts = useCallback(async () => {
    setLoading(true);
    try {
      const params: ContractsQueryParams = {
        PageNumber: pageNumber,
        PageSize: pageSize,
        SearchTerm: searchTerm || undefined,
        Status: statusFilter !== 'all' ? statusFilter : undefined,
        SortBy: sortBy,
        SortDescending: sortDesc,
      };
      const result = await contractService.getContracts(params);
      setContracts(result.items);
      setTotalPages(result.totalPages);
      setTotalCount(result.totalCount);
    } catch (error: any) {
      toast({
        title: 'Xatolik',
        description: error.response?.data?.message || 'Shartnomalarni yuklashda xatolik',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [pageNumber, pageSize, searchTerm, statusFilter, sortBy, sortDesc, toast]);

  // Calculate stats from local contracts data as fallback
  const calculateStatsFromContracts = useCallback((contractsList: Contract[]): ContractStats => {
    const normalizeStatus = (status: unknown): string => {
      if (typeof status === 'number') {
        const map: Record<number, string> = { 0: 'Draft', 1: 'Active', 2: 'Completed', 3: 'Cancelled' };
        return map[status] || 'Draft';
      }
      return String(status);
    };
    
    return {
      totalContracts: contractsList.length,
      activeContracts: contractsList.filter(c => normalizeStatus(c.status) === 'Active').length,
      completedContracts: contractsList.filter(c => normalizeStatus(c.status) === 'Completed').length,
      draftContracts: contractsList.filter(c => normalizeStatus(c.status) === 'Draft').length,
    };
  }, []);

  const loadStats = async () => {
    setStatsLoading(true);
    try {
      const result = await contractService.getStats();
      console.log('Stats loaded:', result);
      // Check if stats are actually populated (not all zeros when we have data)
      if (result.totalContracts > 0 || contracts.length === 0) {
        setStats(result);
      } else if (contracts.length > 0) {
        // API returned zeros but we have data - use fallback
        console.log('Stats API returned zeros, using fallback calculation');
        setStats(calculateStatsFromContracts(contracts));
      } else {
        setStats(result);
      }
    } catch (error: any) {
      console.error('Failed to load stats:', error);
      // If stats API fails, calculate from contracts data as fallback
      if (contracts.length > 0) {
        console.log('Stats API failed, using fallback calculation');
        setStats(calculateStatsFromContracts(contracts));
      } else {
        setStats({ totalContracts: 0, activeContracts: 0, completedContracts: 0, draftContracts: 0 });
      }
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    loadContracts();
  }, [loadContracts]);

  // Reload stats when contracts change (for fallback calculation)
  useEffect(() => {
    loadStats();
  }, [contracts.length]);

  // Handlers
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPageNumber(1);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value as ContractStatus | 'all');
    setPageNumber(1);
  };

  const handleStatusChange = async (contract: Contract, newStatus: ContractStatus): Promise<void> => {
    try {
      await contractService.updateStatus(contract.id, { status: newStatus });
      // Update local state optimistically
      setContracts((prev) =>
        prev.map((c) => (c.id === contract.id ? { ...c, status: newStatus } : c))
      );
      toast({
        title: 'Muvaffaqiyat',
        description: `Status "${newStatus}" ga o'zgartirildi`,
      });
      // Refresh stats in background
      loadStats();
    } catch (error: any) {
      // Show detailed error from backend - handle errors as string or array
      let errorMessage = 'Statusni yangilashda xatolik yuz berdi';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        errorMessage = Array.isArray(errors) ? errors.join(', ') : String(errors);
      }
      toast({
        title: 'Status yangilanmadi',
        description: errorMessage,
        variant: 'destructive',
      });
      // Re-throw to let table know it failed (for reverting UI if needed)
      throw error;
    }
  };

  const handleDelete = async () => {
    if (!deleteContract) return;
    setDeleteLoading(true);
    try {
      await contractService.delete(deleteContract.id);
      toast({
        title: 'Muvaffaqiyat',
        description: 'Shartnoma o\'chirildi',
      });
      setDeleteContract(null);
      loadContracts();
      loadStats();
    } catch (error: any) {
      toast({
        title: 'Xatolik',
        description: error.response?.data?.message || 'Shartnomani o\'chirishda xatolik',
        variant: 'destructive',
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleView = (contract: Contract) => {
    setViewContract(contract);
  };

  const handleEdit = (contract: Contract) => {
    setEditContract(contract);
  };

  const handleEditSuccess = () => {
    loadContracts();
    loadStats();
  };

  const handleWizardSuccess = () => {
    loadContracts();
    loadStats();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <header className="sticky top-0 z-30 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="flex h-16 items-center justify-between px-6">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Shartnomalar</h1>
            <p className="text-sm text-muted-foreground">Mijozlar shartnomalarini boshqarish</p>
          </div>
          <Button onClick={() => setWizardOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Yangi shartnoma
          </Button>
        </div>
      </header>

      <div className="p-6 space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Jami shartnomalar
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <p className="text-2xl font-bold">{stats?.totalContracts || 0}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Faol shartnomalar
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <p className="text-2xl font-bold text-primary">{stats?.activeContracts || 0}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tugatilgan
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <p className="text-2xl font-bold">{stats?.completedContracts || 0}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Qoralamalar
            </CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <p className="text-2xl font-bold">{stats?.draftContracts || 0}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Qidirish..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={handleStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Barchasi</SelectItem>
            <SelectItem value="Draft">Qoralama</SelectItem>
            <SelectItem value="Active">Faol</SelectItem>
            <SelectItem value="Completed">Tugatilgan</SelectItem>
            <SelectItem value="Cancelled">Bekor qilingan</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Saralash" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">Sana bo'yicha</SelectItem>
            <SelectItem value="totalAmount">Summa bo'yicha</SelectItem>
            <SelectItem value="contractNumber">Raqam bo'yicha</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" onClick={() => loadContracts()}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Table */}
      <ContractsTable
        contracts={contracts}
        loading={loading}
        onStatusChange={handleStatusChange}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={(contract) => setDeleteContract(contract)}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Jami: {totalCount} ta shartnoma
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
              disabled={pageNumber === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              {pageNumber} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPageNumber((p) => Math.min(totalPages, p + 1))}
              disabled={pageNumber === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Wizard Modal */}
      <CreateContractWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onSuccess={handleWizardSuccess}
      />

      {/* View Modal */}
      <ContractViewModal
        contract={viewContract}
        open={!!viewContract}
        onClose={() => setViewContract(null)}
      />

      {/* Edit Modal */}
      <ContractEditModal
        contract={editContract}
        open={!!editContract}
        onClose={() => setEditContract(null)}
        onSuccess={handleEditSuccess}
      />

      {/* Delete Modal */}
      <DeleteConfirmModal
        contract={deleteContract}
        open={!!deleteContract}
        onClose={() => setDeleteContract(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
      />
      </div>
    </div>
  );
}

export { ContractsPage };
