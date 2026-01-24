import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppHeader } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { constructorService } from '@/services/constructorService';
import { ConstructorOrder, FurnitureType, Detail, Drawing } from '@/types/constructor';
import { DimensionsForm, MaterialsForm } from '@/components/constructor';
import {
  ArrowLeft,
  Package,
  Ruler,
  FileImage,
  FileText,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  Upload,
  Eye,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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

export const ConstructorOrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [order, setOrder] = useState<ConstructorOrder | null>(null);
  const [furnitureTypes, setFurnitureTypes] = useState<FurnitureType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFurnitureType, setSelectedFurnitureType] = useState<FurnitureType | null>(null);
  const [activeTab, setActiveTab] = useState('furniture-types');

  // Modal states
  const [ftModalOpen, setFtModalOpen] = useState(false);
  const [ftEditId, setFtEditId] = useState<number | null>(null);
  const [ftName, setFtName] = useState('');
  const [ftSaving, setFtSaving] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Drawing upload states
  const [drawingModalOpen, setDrawingModalOpen] = useState(false);
  const [drawingFile, setDrawingFile] = useState<File | null>(null);
  const [drawingDescription, setDrawingDescription] = useState('');
  const [uploadingDrawing, setUploadingDrawing] = useState(false);
  const [drawingFtId, setDrawingFtId] = useState<number | null>(null);

  // Detail states
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailFtId, setDetailFtId] = useState<number | null>(null);

  const loadOrder = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const orderData = await constructorService.getOrderById(Number(id));
      setOrder(orderData);

      // Load furniture types for this order
      const allFurnitureTypes = await constructorService.getFurnitureTypes();
      const orderFurnitureTypes = allFurnitureTypes.filter(
        ft => ft.constructorId === Number(user?.id) || orderData.furnitureTypes?.some(oft => oft.id === ft.id)
      );
      setFurnitureTypes(orderFurnitureTypes);
    } catch (error: any) {
      console.error('Failed to load order:', error);
      toast({
        title: 'Xatolik',
        description: 'Buyurtmani yuklashda xatolik',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [id, toast, user]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  // Furniture Type CRUD
  const handleCreateFT = async () => {
    if (!ftName.trim() || !id) return;
    setFtSaving(true);
    try {
      await constructorService.createFurnitureType({ name: ftName, orderId: Number(id) });
      toast({ title: 'Muvaffaqiyat', description: 'Mebel turi yaratildi' });
      setFtModalOpen(false);
      setFtName('');
      loadOrder();
    } catch (error: any) {
      toast({
        title: 'Xatolik',
        description: error?.response?.data?.message || 'Mebel turini yaratishda xatolik',
        variant: 'destructive',
      });
    } finally {
      setFtSaving(false);
    }
  };

  const handleUpdateFT = async () => {
    if (!ftName.trim() || !ftEditId) return;
    setFtSaving(true);
    try {
      await constructorService.updateFurnitureType(ftEditId, { name: ftName });
      toast({ title: 'Muvaffaqiyat', description: 'Mebel turi yangilandi' });
      setFtModalOpen(false);
      setFtEditId(null);
      setFtName('');
      loadOrder();
    } catch (error: any) {
      toast({
        title: 'Xatolik',
        description: error?.response?.data?.message || 'Mebel turini yangilashda xatolik',
        variant: 'destructive',
      });
    } finally {
      setFtSaving(false);
    }
  };

  const handleDeleteFT = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await constructorService.deleteFurnitureType(deleteId);
      toast({ title: 'Muvaffaqiyat', description: "Mebel turi o'chirildi" });
      setDeleteModalOpen(false);
      setDeleteId(null);
      loadOrder();
    } catch (error: any) {
      toast({
        title: 'Xatolik',
        description: error?.response?.data?.message || "Mebel turini o'chirishda xatolik",
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  const openEditFTModal = (ft: FurnitureType) => {
    setFtEditId(ft.id);
    setFtName(ft.name);
    setFtModalOpen(true);
  };

  const openDeleteModal = (ftId: number) => {
    setDeleteId(ftId);
    setDeleteModalOpen(true);
  };

  // Drawing upload
  const handleUploadDrawing = async () => {
    if (!drawingFile || !drawingFtId) return;
    setUploadingDrawing(true);
    try {
      await constructorService.uploadDrawing(drawingFtId, drawingFile, drawingDescription);
      toast({ title: 'Muvaffaqiyat', description: 'Chizma yuklandi' });
      setDrawingModalOpen(false);
      setDrawingFile(null);
      setDrawingDescription('');
      setDrawingFtId(null);
      loadOrder();
    } catch (error: any) {
      toast({
        title: 'Xatolik',
        description: error?.response?.data?.message || 'Chizma yuklashda xatolik',
        variant: 'destructive',
      });
    } finally {
      setUploadingDrawing(false);
    }
  };

  const openDrawingModal = (ftId: number) => {
    setDrawingFtId(ftId);
    setDrawingModalOpen(true);
  };

  // Complete furniture type
  const handleComplete = async (ftId: number) => {
    try {
      await constructorService.completeFurnitureType(ftId);
      toast({ title: 'Muvaffaqiyat', description: 'Ishlab chiqarishga yuborildi' });
      loadOrder();
    } catch (error: any) {
      toast({
        title: 'Xatolik',
        description: error?.response?.data?.message || 'Yuborishda xatolik',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader title="Yuklanyapti..." description="" />
        <div className="p-6 space-y-6">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader title="Buyurtma topilmadi" description="" />
        <div className="p-6">
          <Button variant="outline" onClick={() => navigate('/constructor/orders')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Orqaga
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        title={`Buyurtma #${order.orderNumber?.split('-').pop() || order.id}`}
        description={order.customerName}
      />

      <div className="p-6 space-y-6">
        {/* Back button and order info */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => navigate('/constructor/orders')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Orqaga
          </Button>
          <Badge variant={order.status === 'Completed' ? 'default' : 'secondary'}>
            {order.status === 'Completed' ? 'Tugallangan' : order.status === 'InProgress' ? 'Jarayonda' : 'Kutilmoqda'}
          </Badge>
        </div>

        {/* Order Summary Card */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Buyurtma raqami</p>
                <p className="font-semibold">{order.orderNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Shartnoma</p>
                <p className="font-semibold">{order.contractNumber || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Mijoz</p>
                <p className="font-semibold">{order.customerName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Summa</p>
                <p className="font-semibold">${order.totalAmount?.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for Furniture Types, Details, Drawings */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="furniture-types" className="gap-2">
              <Package className="h-4 w-4" />
              Mebel turlari
            </TabsTrigger>
            <TabsTrigger value="details" className="gap-2">
              <Ruler className="h-4 w-4" />
              Detallar
            </TabsTrigger>
            <TabsTrigger value="drawings" className="gap-2">
              <FileImage className="h-4 w-4" />
              Chizmalar
            </TabsTrigger>
          </TabsList>

          {/* Furniture Types Tab */}
          <TabsContent value="furniture-types" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Mebel turlari</h3>
              <Button onClick={() => { setFtEditId(null); setFtName(''); setFtModalOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Yangi mebel turi
              </Button>
            </div>

            {furnitureTypes.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <div className="flex flex-col items-center text-muted-foreground">
                    <Package className="h-12 w-12 mb-4 opacity-50" />
                    <p>Hali mebel turi qo'shilmagan</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {furnitureTypes.map(ft => (
                  <Card key={ft.id} className="hover:shadow-sm transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Package className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{ft.name}</h4>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>{ft.details?.length || 0} detal</span>
                              <span>{ft.drawings?.length || 0} chizma</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {ft.isCompleted ? (
                            <Badge variant="default" className="bg-success">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Tugallangan
                            </Badge>
                          ) : (
                            <>
                              <Button size="sm" variant="outline" onClick={() => openEditFTModal(ft)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline" className="text-destructive" onClick={() => openDeleteModal(ft.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                              <Button size="sm" onClick={() => handleComplete(ft.id)}>
                                Ishlab chiqarishga yuborish
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-4">
            <h3 className="text-lg font-semibold">Detallar</h3>
            {furnitureTypes.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <div className="flex flex-col items-center text-muted-foreground">
                    <Ruler className="h-12 w-12 mb-4 opacity-50" />
                    <p>Avval mebel turi qo'shing</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {furnitureTypes.map(ft => (
                  <Card key={ft.id}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        {ft.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DimensionsForm furnitureTypeId={ft.id} onSave={loadOrder} />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Drawings Tab */}
          <TabsContent value="drawings" className="space-y-4">
            <h3 className="text-lg font-semibold">Chizmalar</h3>
            {furnitureTypes.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <div className="flex flex-col items-center text-muted-foreground">
                    <FileImage className="h-12 w-12 mb-4 opacity-50" />
                    <p>Avval mebel turi qo'shing</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {furnitureTypes.map(ft => (
                  <Card key={ft.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Package className="h-4 w-4" />
                          {ft.name}
                        </CardTitle>
                        <Button size="sm" variant="outline" onClick={() => openDrawingModal(ft.id)}>
                          <Upload className="h-4 w-4 mr-2" />
                          Chizma yuklash
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {ft.drawings && ft.drawings.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {ft.drawings.map(drawing => (
                            <Card key={drawing.id} className="overflow-hidden">
                              <div className="aspect-square bg-muted flex items-center justify-center">
                                {drawing.fileUrl ? (
                                  <img 
                                    src={drawing.fileUrl} 
                                    alt={drawing.fileName}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <FileImage className="h-12 w-12 text-muted-foreground" />
                                )}
                              </div>
                              <CardContent className="p-3">
                                <p className="text-sm font-medium truncate">{drawing.fileName}</p>
                                {drawing.description && (
                                  <p className="text-xs text-muted-foreground truncate">{drawing.description}</p>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          Hali chizma yuklanmagan
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Furniture Type Modal */}
      <Dialog open={ftModalOpen} onOpenChange={setFtModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{ftEditId ? "Mebel turini tahrirlash" : "Yangi mebel turi"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nomi</Label>
              <Input
                value={ftName}
                onChange={(e) => setFtName(e.target.value)}
                placeholder="Mebel turi nomi"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFtModalOpen(false)}>
              Bekor qilish
            </Button>
            <Button onClick={ftEditId ? handleUpdateFT : handleCreateFT} disabled={ftSaving}>
              {ftSaving ? 'Saqlanmoqda...' : ftEditId ? 'Saqlash' : 'Yaratish'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mebel turini o'chirish</AlertDialogTitle>
            <AlertDialogDescription>
              Bu amalni qaytarib bo'lmaydi. Barcha detallar va chizmalar ham o'chiriladi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteFT} disabled={deleting}>
              {deleting ? "O'chirilmoqda..." : "O'chirish"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Drawing Upload Modal */}
      <Dialog open={drawingModalOpen} onOpenChange={setDrawingModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chizma yuklash</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Fayl</Label>
              <Input
                type="file"
                accept="image/*,.pdf,.dwg"
                onChange={(e) => setDrawingFile(e.target.files?.[0] || null)}
              />
            </div>
            <div>
              <Label>Tavsif (ixtiyoriy)</Label>
              <Textarea
                value={drawingDescription}
                onChange={(e) => setDrawingDescription(e.target.value)}
                placeholder="Chizma haqida qisqacha ma'lumot"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDrawingModalOpen(false)}>
              Bekor qilish
            </Button>
            <Button onClick={handleUploadDrawing} disabled={uploadingDrawing || !drawingFile}>
              {uploadingDrawing ? 'Yuklanmoqda...' : 'Yuklash'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
