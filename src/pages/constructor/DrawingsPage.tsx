import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { Drawing, FurnitureType } from '@/types/constructor';
import {
  Search,
  Plus,
  MoreHorizontal,
  Trash2,
  FileImage,
  RefreshCw,
  Package,
  Upload,
  Download,
  ExternalLink,
} from 'lucide-react';
import { formatDate } from '@/lib/dateUtils';

export const DrawingsPage: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [furnitureTypes, setFurnitureTypes] = useState<FurnitureType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Drawing | null>(null);
  const [selectedFurnitureTypeId, setSelectedFurnitureTypeId] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [drawingsData, ftData] = await Promise.all([
        constructorService.getDrawings(),
        constructorService.getFurnitureTypes(),
      ]);
      setDrawings(drawingsData || []);
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

  const filteredItems = drawings.filter(item => {
    const search = searchTerm.toLowerCase();
    return (
      item.fileName?.toLowerCase().includes(search) ||
      item.description?.toLowerCase().includes(search)
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
  const isOwner = (drawing: Drawing) => {
    const ft = furnitureTypes.find(f => f.id === drawing.furnitureTypeId);
    return ft !== undefined;
  };

  // All furniture types from /users/furniture-types are owned by current user
  const ownedFurnitureTypes = furnitureTypes;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedFurnitureTypeId) {
      toast({
        title: 'Xatolik',
        description: 'Fayl va mebel turini tanlang',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      await constructorService.uploadDrawing(selectedFurnitureTypeId, selectedFile, description);
      toast({
        title: 'Muvaffaqiyat',
        description: 'Chizma yuklandi',
      });
      setUploadModalOpen(false);
      resetForm();
      loadData();
    } catch (error: any) {
      toast({
        title: 'Xatolik',
        description: error.message || 'Yuklashda xatolik yuz berdi',
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
      await constructorService.deleteDrawing(selectedItem.id);
      toast({
        title: 'Muvaffaqiyat',
        description: 'Chizma o\'chirildi',
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
    setSelectedFurnitureTypeId(0);
    setDescription('');
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openDeleteModal = (item: Drawing) => {
    setSelectedItem(item);
    setDeleteModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  return (
    <div className="min-h-screen">
      <AppHeader
        title="Chizmalar"
        description="Mebel chizmalarini boshqarish"
      />

      <div className="p-6 space-y-6 animate-fade-in">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{drawings.length}</div>
              <div className="text-sm text-muted-foreground">Jami chizmalar</div>
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
                placeholder="Chizma qidirish..."
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
              onClick={() => setUploadModalOpen(true)}
              disabled={ownedFurnitureTypes.length === 0}
            >
              <Upload className="mr-2 h-4 w-4" />
              Chizma yuklash
            </Button>
          </div>
        </div>

        {ownedFurnitureTypes.length === 0 && !loading && (
          <Card className="border-warning/50 bg-warning/5">
            <CardContent className="p-4">
              <p className="text-sm text-warning">
                Chizma yuklash uchun avval mebel turini yarating.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Chizmalar ro'yxati</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fayl nomi</TableHead>
                  <TableHead>Mebel turi</TableHead>
                  <TableHead>Tavsif</TableHead>
                  <TableHead>Hajmi</TableHead>
                  <TableHead>Yuklangan</TableHead>
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
                        <FileImage className="h-10 w-10 mb-2 opacity-50" />
                        <p>Chizmalar topilmadi</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <FileImage className="h-4 w-4 text-info" />
                          {item.fileName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          <Package className="h-3 w-3 mr-1" />
                          {getFurnitureTypeName(item.furnitureTypeId)}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {item.description || '-'}
                      </TableCell>
                      <TableCell>{formatFileSize(item.fileSize)}</TableCell>
                      <TableCell>{formatDate(item.uploadedAt)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {item.fileUrl && (
                              <>
                                <DropdownMenuItem asChild>
                                  <a href={item.fileUrl} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    Ko'rish
                                  </a>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <a href={item.fileUrl} download>
                                    <Download className="mr-2 h-4 w-4" />
                                    Yuklab olish
                                  </a>
                                </DropdownMenuItem>
                              </>
                            )}
                            {isOwner(item) && (
                              <DropdownMenuItem
                                onClick={() => openDeleteModal(item)}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                O'chirish
                              </DropdownMenuItem>
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

      {/* Upload Modal */}
      <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chizma yuklash</DialogTitle>
            <DialogDescription>
              Mebel turi uchun chizma faylini yuklang
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Mebel turi *</Label>
              <Select
                value={selectedFurnitureTypeId ? String(selectedFurnitureTypeId) : ''}
                onValueChange={(val) => setSelectedFurnitureTypeId(Number(val))}
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
            <div className="space-y-2">
              <Label>Fayl *</Label>
              <div className="border-2 border-dashed rounded-lg p-4 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.dwg,.dxf,.png,.jpg,.jpeg"
                  onChange={handleFileChange}
                  className="hidden"
                  id="drawing-file"
                />
                <label
                  htmlFor="drawing-file"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  {selectedFile ? (
                    <span className="text-sm font-medium">{selectedFile.name}</span>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      Fayl tanlash uchun bosing
                    </span>
                  )}
                </label>
              </div>
              <p className="text-xs text-muted-foreground">
                Ruxsat etilgan formatlar: PDF, DWG, DXF, PNG, JPG
              </p>
            </div>
            <div className="space-y-2">
              <Label>Tavsif</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Chizma haqida qo'shimcha ma'lumot"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setUploadModalOpen(false); resetForm(); }}>
              Bekor qilish
            </Button>
            <Button onClick={handleUpload} disabled={submitting || !selectedFile}>
              {submitting ? 'Yuklanmoqda...' : 'Yuklash'}
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
              "{selectedItem?.fileName}" chizmani o'chirmoqchimisiz?
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
