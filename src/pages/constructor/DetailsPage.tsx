import React, { useState, useEffect, useCallback } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { constructorService } from '@/services/constructorService';
import { Detail, FurnitureType, CreateDetailDto, UpdateDetailDto } from '@/types/constructor';
import {
  Search,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Ruler,
  RefreshCw,
  Package,
} from 'lucide-react';

export const DetailsPage: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  const [details, setDetails] = useState<Detail[]>([]);
  const [furnitureTypes, setFurnitureTypes] = useState<FurnitureType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Detail | null>(null);
  const [formData, setFormData] = useState<CreateDetailDto>({
    furnitureTypeId: 0,
    name: '',
    material: '',
    width: 0,
    height: 0,
    depth: 0,
    quantity: 1,
    unit: 'dona',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [detailsData, ftData] = await Promise.all([
        constructorService.getDetails(),
        constructorService.getFurnitureTypes(),
      ]);
      setDetails(detailsData || []);
      setFurnitureTypes(ftData || []);
    } catch (error: any) {
      console.error('Failed to load data:', error);
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

  const filteredItems = details.filter(item => {
    const search = searchTerm.toLowerCase();
    return (
      item.name?.toLowerCase().includes(search) ||
      item.material?.toLowerCase().includes(search)
    );
  });

  // Find furniture type name by ID
  const getFurnitureTypeName = (ftId: number) => {
    const ft = furnitureTypes.find(f => f.id === ftId);
    return ft?.name || '-';
  };

  // Check if user owns the furniture type
  // Since /users/furniture-types returns only the current user's furniture types,
  // we check if the furniture type exists in our list
  const isOwner = (detail: Detail) => {
    const ft = furnitureTypes.find(f => f.id === detail.furnitureTypeId);
    return ft !== undefined;
  };

  // All furniture types from /users/furniture-types are owned by current user
  const ownedFurnitureTypes = furnitureTypes;

  const handleCreate = async () => {
    if (!formData.name.trim() || !formData.furnitureTypeId) {
      toast({
        title: 'Xatolik',
        description: 'Barcha majburiy maydonlarni to\'ldiring',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      await constructorService.createDetail(formData);
      toast({
        title: 'Muvaffaqiyat',
        description: 'Detal yaratildi',
      });
      setCreateModalOpen(false);
      resetForm();
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
    if (!selectedItem) return;

    setSubmitting(true);
    try {
      const updateDto: UpdateDetailDto = {
        name: formData.name,
        material: formData.material,
        width: formData.width,
        height: formData.height,
        depth: formData.depth,
        quantity: formData.quantity,
        unit: formData.unit,
        notes: formData.notes,
      };
      await constructorService.updateDetail(selectedItem.id, updateDto);
      toast({
        title: 'Muvaffaqiyat',
        description: 'Detal yangilandi',
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
      await constructorService.deleteDetail(selectedItem.id);
      toast({
        title: 'Muvaffaqiyat',
        description: 'Detal o\'chirildi',
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

  const resetForm = () => {
    setFormData({
      furnitureTypeId: 0,
      name: '',
      material: '',
      width: 0,
      height: 0,
      depth: 0,
      quantity: 1,
      unit: 'dona',
      notes: '',
    });
  };

  const openEditModal = (item: Detail) => {
    setSelectedItem(item);
    setFormData({
      furnitureTypeId: item.furnitureTypeId,
      name: item.name,
      material: item.material,
      width: item.width,
      height: item.height,
      depth: item.depth,
      quantity: item.quantity,
      unit: item.unit,
      notes: item.notes || '',
    });
    setEditModalOpen(true);
  };

  const openDeleteModal = (item: Detail) => {
    setSelectedItem(item);
    setDeleteModalOpen(true);
  };

  return (
    <div className="min-h-screen">
      <AppHeader
        title="Detallar"
        description="Mebel detallarini boshqarish"
      />

      <div className="p-6 space-y-6 animate-fade-in">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{details.length}</div>
              <div className="text-sm text-muted-foreground">Jami detallar</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-info">{furnitureTypes.length}</div>
              <div className="text-sm text-muted-foreground">Mebel turlari</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-success">{ownedFurnitureTypes.length}</div>
              <div className="text-sm text-muted-foreground">Mening mebellarim</div>
            </CardContent>
          </Card>
        </div>

        {/* Search & Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Detal qidirish..."
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
            <Button 
              onClick={() => setCreateModalOpen(true)}
              disabled={ownedFurnitureTypes.length === 0}
            >
              <Plus className="mr-2 h-4 w-4" />
              Yangi detal
            </Button>
          </div>
        </div>

        {ownedFurnitureTypes.length === 0 && !loading && (
          <Card className="border-warning/50 bg-warning/5">
            <CardContent className="p-4">
              <p className="text-sm text-warning">
                Detal qo'shish uchun avval mebel turini yarating.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Detallar ro'yxati</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nomi</TableHead>
                  <TableHead>Mebel turi</TableHead>
                  <TableHead>Material</TableHead>
                  <TableHead>O'lchamlari (Kx Bx C)</TableHead>
                  <TableHead>Miqdori</TableHead>
                  <TableHead className="text-right">Amallar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10">
                      <div className="flex flex-col items-center text-muted-foreground">
                        <Ruler className="h-10 w-10 mb-2 opacity-50" />
                        <p>Detallar topilmadi</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          <Package className="h-3 w-3 mr-1" />
                          {getFurnitureTypeName(item.furnitureTypeId)}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.material || '-'}</TableCell>
                      <TableCell>
                        {item.width} x {item.height} x {item.depth} mm
                      </TableCell>
                      <TableCell>{item.quantity} {item.unit}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {isOwner(item) ? (
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
                            ) : (
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Yangi detal</DialogTitle>
            <DialogDescription>
              Mebel uchun yangi detal qo'shing
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Mebel turi *</Label>
              <Select
                value={formData.furnitureTypeId ? String(formData.furnitureTypeId) : ''}
                onValueChange={(val) => setFormData({ ...formData, furnitureTypeId: Number(val) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Mebel turini tanlang" />
                </SelectTrigger>
                <SelectContent>
                  {ownedFurnitureTypes.map(ft => (
                    <SelectItem key={ft.id} value={String(ft.id)}>
                      {ft.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Detal nomi *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Masalan: Yon panel"
                />
              </div>
              <div className="space-y-2">
                <Label>Material</Label>
                <Input
                  value={formData.material}
                  onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                  placeholder="Masalan: MDF 18mm"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Kenglik (mm)</Label>
                <Input
                  type="number"
                  value={formData.width}
                  onChange={(e) => setFormData({ ...formData, width: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Balandlik (mm)</Label>
                <Input
                  type="number"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Chuqurlik (mm)</Label>
                <Input
                  type="number"
                  value={formData.depth}
                  onChange={(e) => setFormData({ ...formData, depth: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Miqdori</Label>
                <Input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                  min={1}
                />
              </div>
              <div className="space-y-2">
                <Label>Birlik</Label>
                <Select
                  value={formData.unit}
                  onValueChange={(val) => setFormData({ ...formData, unit: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dona">dona</SelectItem>
                    <SelectItem value="m">metr</SelectItem>
                    <SelectItem value="m2">m²</SelectItem>
                    <SelectItem value="kg">kg</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Izoh</Label>
              <Textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Qo'shimcha ma'lumot"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setCreateModalOpen(false); resetForm(); }}>
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalni tahrirlash</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Detal nomi *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Material</Label>
                <Input
                  value={formData.material}
                  onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Kenglik (mm)</Label>
                <Input
                  type="number"
                  value={formData.width}
                  onChange={(e) => setFormData({ ...formData, width: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Balandlik (mm)</Label>
                <Input
                  type="number"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Chuqurlik (mm)</Label>
                <Input
                  type="number"
                  value={formData.depth}
                  onChange={(e) => setFormData({ ...formData, depth: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Miqdori</Label>
                <Input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                  min={1}
                />
              </div>
              <div className="space-y-2">
                <Label>Birlik</Label>
                <Select
                  value={formData.unit}
                  onValueChange={(val) => setFormData({ ...formData, unit: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dona">dona</SelectItem>
                    <SelectItem value="m">metr</SelectItem>
                    <SelectItem value="m2">m²</SelectItem>
                    <SelectItem value="kg">kg</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Izoh</Label>
              <Textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
              />
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
              "{selectedItem?.name}" detalni o'chirmoqchimisiz?
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
