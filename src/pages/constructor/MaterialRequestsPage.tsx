import React from 'react';
import { AppHeader } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Search, Eye, Clock, CheckCircle, XCircle } from 'lucide-react';

// Mock data
const mockMaterialRequests = [
  { id: '1', materialName: 'Steel Sheets 2mm', quantity: 50, unit: 'pcs', categoryName: 'Steel Frames', orderNumber: 'ORD-2024-001', status: 'Requested', requestedAt: '2024-01-20' },
  { id: '2', materialName: 'Aluminum Profiles', quantity: 100, unit: 'm', categoryName: 'Aluminum Panels', orderNumber: 'ORD-2024-001', status: 'Approved', requestedAt: '2024-01-19' },
  { id: '3', materialName: 'Welding Wire', quantity: 20, unit: 'kg', categoryName: 'Steel Frames', orderNumber: 'ORD-2024-001', status: 'InStock', requestedAt: '2024-01-18' },
  { id: '4', materialName: 'Rivets M6', quantity: 500, unit: 'pcs', categoryName: 'Custom Enclosures', orderNumber: 'ORD-2024-002', status: 'Requested', requestedAt: '2024-01-21' },
  { id: '5', materialName: 'Paint Primer', quantity: 10, unit: 'L', categoryName: 'Aluminum Panels', orderNumber: 'ORD-2024-001', status: 'Assigned', requestedAt: '2024-01-17' },
];

const getStatusBadge = (status: string) => {
  const config: Record<string, { className: string; icon: React.ElementType }> = {
    Requested: { className: 'status-badge status-pending', icon: Clock },
    Approved: { className: 'status-badge status-active', icon: CheckCircle },
    InStock: { className: 'status-badge status-active', icon: CheckCircle },
    Assigned: { className: 'status-badge status-completed', icon: CheckCircle },
    Used: { className: 'status-badge status-completed', icon: CheckCircle },
  };
  const { className, icon: Icon } = config[status] || { className: 'status-badge', icon: Clock };
  return (
    <span className={className}>
      <Icon className="mr-1 h-3 w-3" />
      {status}
    </span>
  );
};

export const MaterialRequestsPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <AppHeader 
        title="Material Requests"
        description="Track material requirements for orders"
      />

      <div className="p-6 space-y-6 animate-fade-in">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">24</div>
              <div className="text-sm text-muted-foreground">Total Requests</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-warning">8</div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-info">10</div>
              <div className="text-sm text-muted-foreground">Approved</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-success">6</div>
              <div className="text-sm text-muted-foreground">Assigned</div>
            </CardContent>
          </Card>
        </div>

        {/* Search & Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search requests..." className="pl-9" />
            </div>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Request
          </Button>
        </div>

        {/* Requests Table */}
        <Card>
          <CardHeader>
            <CardTitle>Material Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Material</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Order #</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockMaterialRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.materialName}</TableCell>
                    <TableCell>{request.quantity} {request.unit}</TableCell>
                    <TableCell>{request.categoryName}</TableCell>
                    <TableCell className="text-muted-foreground">{request.orderNumber}</TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>{new Date(request.requestedAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
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
