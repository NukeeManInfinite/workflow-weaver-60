import React from 'react';
import { AppHeader } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, AlertTriangle, ArrowUpDown, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const mockInventory = [
  { id: '1', materialName: 'Steel Sheets 2mm', sku: 'STL-002', quantity: 150, unit: 'pcs', minStockLevel: 50, location: 'A-01', isLowStock: false },
  { id: '2', materialName: 'Aluminum Profiles', sku: 'ALU-001', quantity: 25, unit: 'm', minStockLevel: 100, location: 'B-03', isLowStock: true },
  { id: '3', materialName: 'Welding Wire', sku: 'WLD-005', quantity: 80, unit: 'kg', minStockLevel: 20, location: 'C-02', isLowStock: false },
  { id: '4', materialName: 'Rivets M6', sku: 'RVT-M6', quantity: 2500, unit: 'pcs', minStockLevel: 500, location: 'D-01', isLowStock: false },
  { id: '5', materialName: 'Paint Primer', sku: 'PNT-001', quantity: 8, unit: 'L', minStockLevel: 15, location: 'E-04', isLowStock: true },
];

export const InventoryPage: React.FC = () => (
  <div className="min-h-screen">
    <AppHeader title="Inventory" description="Manage warehouse inventory" />
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><div className="text-2xl font-bold">1,234</div><div className="text-sm text-muted-foreground">Total Items</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-2xl font-bold text-destructive">12</div><div className="text-sm text-muted-foreground">Low Stock</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-2xl font-bold text-info">8</div><div className="text-sm text-muted-foreground">Pending Requests</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-2xl font-bold text-success">$89,500</div><div className="text-sm text-muted-foreground">Stock Value</div></CardContent></Card>
      </div>
      <div className="flex gap-4 justify-between">
        <div className="relative max-w-md flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search inventory..." className="pl-9" /></div>
        <Button><Plus className="mr-2 h-4 w-4" />Add Item</Button>
      </div>
      <Card>
        <CardHeader><CardTitle>Inventory Items</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Material</TableHead><TableHead>SKU</TableHead><TableHead>Quantity</TableHead><TableHead>Min Level</TableHead><TableHead>Location</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {mockInventory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.materialName}</TableCell>
                  <TableCell>{item.sku}</TableCell>
                  <TableCell>{item.quantity} {item.unit}</TableCell>
                  <TableCell>{item.minStockLevel}</TableCell>
                  <TableCell>{item.location}</TableCell>
                  <TableCell>{item.isLowStock ? <Badge variant="destructive"><AlertTriangle className="mr-1 h-3 w-3" />Low Stock</Badge> : <Badge variant="outline" className="text-success">In Stock</Badge>}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  </div>
);

export const StockManagementPage: React.FC = () => (
  <div className="min-h-screen">
    <AppHeader title="Stock Management" description="Manage stock in/out transactions" />
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="cursor-pointer hover:border-success transition-colors"><CardContent className="p-6 flex items-center gap-4"><div className="p-4 rounded-lg bg-success/10"><Package className="h-8 w-8 text-success" /></div><div><h3 className="text-lg font-semibold">Stock In</h3><p className="text-muted-foreground">Record incoming materials</p></div></CardContent></Card>
        <Card className="cursor-pointer hover:border-warning transition-colors"><CardContent className="p-6 flex items-center gap-4"><div className="p-4 rounded-lg bg-warning/10"><ArrowUpDown className="h-8 w-8 text-warning" /></div><div><h3 className="text-lg font-semibold">Stock Out</h3><p className="text-muted-foreground">Assign materials to teams</p></div></CardContent></Card>
      </div>
      <Card>
        <CardHeader><CardTitle>Recent Transactions</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[{ type: 'In', material: 'Steel Sheets', qty: 100, by: 'Admin', time: '2 hours ago' },{ type: 'Out', material: 'Welding Wire', qty: 20, by: 'Team A', time: '4 hours ago' },{ type: 'In', material: 'Rivets M6', qty: 500, by: 'Admin', time: 'Yesterday' }].map((t, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3"><Badge variant={t.type === 'In' ? 'default' : 'secondary'}>{t.type}</Badge><span>{t.material}</span><span className="text-muted-foreground">×{t.qty}</span></div>
                <div className="text-sm text-muted-foreground">{t.by} • {t.time}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);
