import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { constructorService } from '@/services/constructorService';
import { FurnitureType, CreateFurnitureTypeDto, UpdateFurnitureTypeDto, ConstructorOrder } from '@/types/constructor';
import {
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  Package,
  RefreshCw,
  CheckCircle,
  Clock,
  Ruler,
  FileImage,
  FileText,
} from 'lucide-react';
import { formatDate } from '@/lib/dateUtils';

export const FurnitureTypesPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [furnitureTypes, setFurnitureTypes] = useState<FurnitureType[]>([]);
  const [orders, setOrders] = useState<ConstructorOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<FurnitureType | null>(null);
  const [formData, setFormData] = useState<CreateFurnitureTypeDto>({ name: '', orderId: 0 });
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [furnitureData, ordersData] = await Promise.all([
        constructorService.getFurnitureTypes(),
        constructorService.getOrders(),
      ]);
      setFurnitureTypes(furnitureData || []);
      setOrders(ordersData || []);
    } catch (error: any) {
      console.error('Failed to load furniture types:', error);
      toast({
        title: 'Xatolik',
        description: 'Ma\'lumotlarni yuklashda xatolik yuz berdi',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredItems = furnitureTypes.filter(item => {
    const search = searchTerm.toLowerCase();
    return (
      item.name?.toLowerCase().includes(search) ||
      item.description?.toLowerCase().includes(search)
    );
  });

  const stats = {
    total: furnitureTypes.length,
    completed: furnitureTypes.filter(f => f.isCompleted).length,
    pending: furnitureTypes.filter(f => !f.isCompleted).length,
  };

  // Check if current user owns this furniture type
  const isOwner = (item: FurnitureType) => {
    return item.constructorId === Number(user?.id);
  };

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast({
        title: 'Xatolik',
        description: 'Nomni kiriting',
        variant: 'destructive',
      });
      return;
    }
    
    if (!formData.orderId || formData.orderId === 0) {
      toast({
        title: 'Xatolik',
        description: 'Buyurtmani tanlang',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      await constructorService.createFurnitureType(formData);
      toast({
        title: 'Muvaffaqiyat',
        description: 'Mebel turi yaratildi',
      });
      setCreateModalOpen(false);
      setFormData({ name: '', orderId: 0 });
      loadData();
    } catch (error: any) {
      toast({
        title: 'Xatolik',
        description: error.message || 'Yaratishda xatolik yuz berdi',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedItem || !formData.name.trim()) return;

    setSubmitting(true);
    try {
      await constructorService.updateFurnitureType(selectedItem.id, formData as UpdateFurnitureTypeDto);
      toast({
        title: 'Muvaffaqiyat',
        description: 'Mebel turi yangilandi',
      });
      setEditModalOpen(false);
      setSelectedItem(null);
      loadData();
    } catch (error: any) {
      toast({
        title: 'Xatolik',
        description: error.message || 'Yangilashda xatolik yuz berdi',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;

    setSubmitting(true);
    try {
      await constructorService.deleteFurnitureType(selectedItem.id);
      toast({
        title: 'Muvaffaqiyat',
        description: 'Mebel turi o\'chirildi',
      });
      setDeleteModalOpen(false);
      setSelectedItem(null);
      loadData();
    } catch (error: any) {
      toast({
        title: 'Xatolik',
        description: error.message || 'O\'chirishda xatolik yuz berdi',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (item: FurnitureType) => {
    setSelectedItem(item);
    setFormData({ name: item.name, orderId: 0 });
    setEditModalOpen(true);
  };

  const openDeleteModal = (item: FurnitureType) => {
    setSelectedItem(item);
    setDeleteModalOpen(true);
  };

  return (
    <div className="min-h-screen">
      <AppHeader
        title="Mebel turlari"
        description="Mebel turlarini boshqarish"
      />

      <div className="p-6 space-y-6 animate-fade-in">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Jami mebel turlari</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-warning">{stats.pending}</div>
              <div className="text-sm text-muted-foreground">Tugallanmagan</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-success">{stats.completed}</div>
              <div className="text-sm text-muted-foreground">Tugallangan</div>
            </CardContent>
          </Card>
        </div>

        {/* Search & Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Qidirish..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadData} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Yangilash
            </Button>
            <Button onClick={() => setCreateModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Yangi mebel turi
            </Button>
          </div>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Mebel turlari ro'yxati</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nomi</TableHead>
                  <TableHead>Tavsif</TableHead>
                  <TableHead>Detallar</TableHead>
                  <TableHead>Chizmalar</TableHead>
                  <TableHead>Texnik xususiyat</TableHead>
                  <TableHead>Holat</TableHead>
                  <TableHead>Yaratilgan</TableHead>
                  <TableHead className="text-right">Amallar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 8 }).map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10">
                      <div className="flex flex-col items-center text-muted-foreground">
                        <Package className="h-10 w-10 mb-2 opacity-50" />
                        <p>Mebel turlari topilmadi</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {item.description || '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Ruler className="h-4 w-4 text-muted-foreground" />
                          <span>{item.details?.length || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <FileImage className="h-4 w-4 text-muted-foreground" />
                          <span>{item.drawings?.length || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {item.technicalSpecification ? (
                          <Badge className="bg-success/10 text-success">
                            <FileText className="h-3 w-3 mr-1" />
                            Mavjud
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">
                            Yo'q
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {item.isCompleted ? (
                          <Badge className="bg-success/10 text-success">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Tugallangan
                          </Badge>
                        ) : (
                          <Badge className="bg-warning/10 text-warning">
                            <Clock className="h-3 w-3 mr-1" />
                            Jarayonda
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{formatDate(item.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => navigate(`/constructor/furniture-types/${item.id}`)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Ko'rish
                            </DropdownMenuItem>
                            {isOwner(item) && (
                              <>
                                <DropdownMenuItem onClick={() => openEditModal(item)}>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Tahrirlash
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => openDeleteModal(item)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  O'chirish
                                </DropdownMenuItem>
                              </>
                            )}
                            {!isOwner(item) && (
                              <DropdownMenuItem disabled className="text-muted-foreground text-xs">
                                Faqat ko'rish mumkin
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Create Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yangi mebel turi</DialogTitle>
            <DialogDescription>
              Yangi mebel turini yarating
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nomi *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Mebel turi nomi"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="orderId">Buyurtma *</Label>
              <Select
                value={formData.orderId ? formData.orderId.toString() : ''}
                onValueChange={(value) => setFormData({ ...formData, orderId: Number(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Buyurtmani tanlang" />
                </SelectTrigger>
                <SelectContent>
                  {orders.map((order) => (
                    <SelectItem key={order.id} value={order.id.toString()}>
                      {order.orderNumber} - {order.customerName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
              Bekor qilish
            </Button>
            <Button onClick={handleCreate} disabled={submitting}>
              {submitting ? 'Yaratilmoqda...' : 'Yaratish'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mebel turini tahrirlash</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nomi *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-orderId">Buyurtma</Label>
              <Select
                value={formData.orderId ? formData.orderId.toString() : ''}
                onValueChange={(value) => setFormData({ ...formData, orderId: Number(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Buyurtmani tanlang" />
                </SelectTrigger>
                <SelectContent>
                  {orders.map((order) => (
                    <SelectItem key={order.id} value={order.id.toString()}>
                      {order.orderNumber} - {order.customerName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>
              Bekor qilish
            </Button>
            <Button onClick={handleUpdate} disabled={submitting}>
              {submitting ? 'Saqlanmoqda...' : 'Saqlash'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>O'chirishni tasdiqlang</AlertDialogTitle>
            <AlertDialogDescription>
              "{selectedItem?.name}" mebel turini o'chirmoqchimisiz? 
              Bu amal qaytarib bo'lmaydi va barcha bog'liq detallar va chizmalar ham o'chiriladi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {submitting ? 'O\'chirilmoqda...' : 'O\'chirish'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
