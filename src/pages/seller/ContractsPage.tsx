import React from 'react';
import { AppHeader } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Search, Filter, Eye, Edit, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Mock data
const mockContracts = [
  { id: '1', contractNumber: 'CTR-2024-001', customerName: 'ABC Manufacturing', totalAmount: 45000, status: 'Active', createdAt: '2024-01-15', sellerName: 'John Smith' },
  { id: '2', contractNumber: 'CTR-2024-002', customerName: 'XYZ Industries', totalAmount: 78000, status: 'Active', createdAt: '2024-01-18', sellerName: 'John Smith' },
  { id: '3', contractNumber: 'CTR-2024-003', customerName: 'Tech Solutions Inc', totalAmount: 32000, status: 'Completed', createdAt: '2024-01-10', sellerName: 'Jane Doe' },
  { id: '4', contractNumber: 'CTR-2024-004', customerName: 'Global Trade Co', totalAmount: 125000, status: 'Draft', createdAt: '2024-01-20', sellerName: 'John Smith' },
  { id: '5', contractNumber: 'CTR-2024-005', customerName: 'Prime Products', totalAmount: 56000, status: 'Active', createdAt: '2024-01-22', sellerName: 'Jane Doe' },
];

const getStatusBadge = (status: string) => {
  const variants: Record<string, string> = {
    Active: 'status-badge status-active',
    Completed: 'status-badge status-completed',
    Draft: 'status-badge status-pending',
    Cancelled: 'status-badge status-error',
  };
  return <span className={variants[status] || 'status-badge'}>{status}</span>;
};

export const ContractsPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <AppHeader 
        title="Contracts"
        description="Manage your customer contracts"
      />

      <div className="p-6 space-y-6 animate-fade-in">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">24</div>
              <div className="text-sm text-muted-foreground">Total Contracts</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-info">12</div>
              <div className="text-sm text-muted-foreground">Active</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-success">8</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-warning">4</div>
              <div className="text-sm text-muted-foreground">Draft</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search contracts..." className="pl-9" />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Contract
          </Button>
        </div>

        {/* Contracts Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Contracts</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contract #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Seller</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockContracts.map((contract) => (
                  <TableRow key={contract.id}>
                    <TableCell className="font-medium">{contract.contractNumber}</TableCell>
                    <TableCell>{contract.customerName}</TableCell>
                    <TableCell>${contract.totalAmount.toLocaleString()}</TableCell>
                    <TableCell>{getStatusBadge(contract.status)}</TableCell>
                    <TableCell>{new Date(contract.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>{contract.sellerName}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
