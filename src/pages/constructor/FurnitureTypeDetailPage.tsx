import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppHeader } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { constructorService } from '@/services/constructorService';
import { FurnitureType, Detail, Drawing, CreateDetailDto, UpdateDetailDto, CreateTechnicalSpecDto } from '@/types/constructor';
import { formatDate } from '@/lib/dateUtils';
import {
  ArrowLeft,
  Package,
  Ruler,
  FileImage,
  FileText,
  CheckCircle,
  Clock,
  Plus,
  Pencil,
  Trash2,
  Download,
  Eye,
  Upload,
  Save,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export const FurnitureTypeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [furnitureType, setFurnitureType] = useState<FurnitureType | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Detail modal state
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editingDetail, setEditingDetail] = useState<Detail | null>(null);
  const [detailForm, setDetailForm] = useState<Partial<CreateDetailDto>>({});
  const [savingDetail, setSavingDetail] = useState(false);
  const [deleteDetailId, setDeleteDetailId] = useState<number | null>(null);

  // Drawing upload state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [deleteDrawingId, setDeleteDrawingId] = useState<number | null>(null);

  // Technical spec state
  const [specifications, setSpecifications] = useState('');
  const [materialList, setMaterialList] = useState('');
  const [assemblyInstructions, setAssemblyInstructions] = useState('');
  const [qualityNotes, setQualityNotes] = useState('');
  const [savingSpec, setSavingSpec] = useState(false);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [completing, setCompleting] = useState(false);

  const isOwner = furnitureType?.constructorId === Number(user?.id);

  const loadData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await constructorService.getFurnitureTypeById(Number(id));
      setFurnitureType(data);

      // Load technical spec data
      if (data.technicalSpecification) {
        setSpecifications(data.technicalSpecification.specifications || '');
        setMaterialList(data.technicalSpecification.materialList || '');
        setAssemblyInstructions(data.technicalSpecification.assemblyInstructions || '');
        setQualityNotes(data.technicalSpecification.qualityNotes || '');
      }
    } catch (error: any) {
      console.error('Failed to load furniture type:', error);
      toast({
        title: 'Xatolik',
        description: 'Ma\'lumotlarni yuklashda xatolik yuz berdi',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Detail handlers
  const resetDetailForm = () => {
    setDetailForm({});
    setEditingDetail(null);
    setDetailModalOpen(false);
  };

  const openEditDetail = (detail: Detail) => {
    setEditingDetail(detail);
    setDetailForm({
      furnitureTypeId: detail.furnitureTypeId,
      name: detail.name,
      material: detail.material,
      width: detail.width,
      height: detail.height,
      depth: detail.depth,
      quantity: detail.quantity,
      unit: detail.unit,
      notes: detail.notes,
    });
    setDetailModalOpen(true);
  };

  const handleSaveDetail = async () => {
    if (!detailForm.name || !detailForm.material) {
      toast({ title: 'Xatolik', description: 'Nomni va materialni kiriting', variant: 'destructive' });
      return;
    }
    setSavingDetail(true);
    try {
      if (editingDetail) {
        await constructorService.updateDetail(editingDetail.id, detailForm as UpdateDetailDto);
        toast({ title: 'Muvaffaqiyat', description: 'Detal yangilandi' });
      } else {
        await constructorService.createDetail({
          ...detailForm,
          furnitureTypeId: Number(id),
        } as CreateDetailDto);
        toast({ title: 'Muvaffaqiyat', description: 'Detal qo\'shildi' });
      }
      resetDetailForm();
      loadData();
    } catch (error: any) {
      toast({ title: 'Xatolik', description: error.message || 'Saqlashda xatolik', variant: 'destructive' });
    } finally {
      setSavingDetail(false);
    }
  };

  const handleDeleteDetail = async () => {
    if (!deleteDetailId) return;
    try {
      await constructorService.deleteDetail(deleteDetailId);
      toast({ title: 'Muvaffaqiyat', description: 'Detal o\'chirildi' });
      setDeleteDetailId(null);
      loadData();
    } catch (error: any) {
      toast({ title: 'Xatolik', description: error.message || 'O\'chirishda xatolik', variant: 'destructive' });
    }
  };

  // Drawing handlers
  const handleUploadDrawing = async () => {
    if (!uploadFile) {
      toast({ title: 'Xatolik', description: 'Fayl tanlang', variant: 'destructive' });
      return;
    }
    setUploading(true);
    try {
      await constructorService.uploadDrawing(Number(id), uploadFile, uploadDescription);
      toast({ title: 'Muvaffaqiyat', description: 'Chizma yuklandi' });
      setUploadModalOpen(false);
      setUploadFile(null);
      setUploadDescription('');
      loadData();
    } catch (error: any) {
      toast({ title: 'Xatolik', description: error.message || 'Yuklashda xatolik', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDrawing = async () => {
    if (!deleteDrawingId) return;
    try {
      await constructorService.deleteDrawing(deleteDrawingId);
      toast({ title: 'Muvaffaqiyat', description: 'Chizma o\'chirildi' });
      setDeleteDrawingId(null);
      loadData();
    } catch (error: any) {
      toast({ title: 'Xatolik', description: error.message || 'O\'chirishda xatolik', variant: 'destructive' });
    }
  };

  // Technical spec handlers
  const handleSaveSpec = async () => {
    if (!specifications.trim() || !materialList.trim()) {
      toast({ title: 'Xatolik', description: 'Texnik xususiyatlar va materiallar ro\'yxati majburiy', variant: 'destructive' });
      return;
    }
    setSavingSpec(true);
    try {
      const dto: CreateTechnicalSpecDto = {
        furnitureTypeId: Number(id),
        specifications,
        materialList,
        assemblyInstructions,
        qualityNotes,
      };

      if (furnitureType?.technicalSpecification?.id) {
        await constructorService.updateTechnicalSpec(furnitureType.technicalSpecification.id, dto);
      } else {
        await constructorService.createTechnicalSpec(dto);
      }
      toast({ title: 'Muvaffaqiyat', description: 'Texnik xususiyatlar saqlandi' });
      loadData();
    } catch (error: any) {
      toast({ title: 'Xatolik', description: error.message || 'Saqlashda xatolik', variant: 'destructive' });
    } finally {
      setSavingSpec(false);
    }
  };

  const canComplete = () => {
    return (
      (furnitureType?.details?.length || 0) > 0 &&
      (furnitureType?.drawings?.length || 0) > 0 &&
      specifications.trim() !== '' &&
      materialList.trim() !== ''
    );
  };

  const handleComplete = async () => {
    setCompleting(true);
    try {
      // Save spec first
      await handleSaveSpec();
      // Then mark complete
      await constructorService.completeFurnitureType(Number(id));
      toast({ title: 'Muvaffaqiyat', description: 'Mebel turi tugallandi!' });
      setCompleteModalOpen(false);
      navigate('/constructor/furniture-types');
    } catch (error: any) {
      toast({ title: 'Xatolik', description: error.message || 'Tugallashda xatolik', variant: 'destructive' });
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <AppHeader title="Mebel turi" description="Yuklanmoqda..." />
        <div className="p-6 space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!furnitureType) {
    return (
      <div className="min-h-screen">
        <AppHeader title="Xatolik" description="Mebel turi topilmadi" />
        <div className="p-6">
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg mb-4">Mebel turi topilmadi</p>
              <Button onClick={() => navigate('/constructor/furniture-types')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Orqaga
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AppHeader
        title={furnitureType.name}
        description={furnitureType.description || 'Mebel turi tafsilotlari'}
      />

      <div className="p-6 space-y-6 animate-fade-in">
        {/* Header with back button and status */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Button variant="ghost" onClick={() => navigate('/constructor/furniture-types')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Mebel turlari
          </Button>

          <div className="flex items-center gap-3">
            <Badge className={furnitureType.isCompleted ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}>
              {furnitureType.isCompleted ? (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Tugallangan
                </>
              ) : (
                <>
                  <Clock className="h-3 w-3 mr-1" />
                  Jarayonda
                </>
              )}
            </Badge>

            {isOwner && !furnitureType.isCompleted && (
              <Button
                onClick={() => setCompleteModalOpen(true)}
                disabled={!canComplete()}
                className="bg-success hover:bg-success/90"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Tugallash
              </Button>
            )}
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-bold">{furnitureType.details?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Detallar</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-info/10 text-info">
                <FileImage className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-bold">{furnitureType.drawings?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Chizmalar</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10 text-warning">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-bold">{furnitureType.technicalSpecification ? 1 : 0}</div>
                <div className="text-sm text-muted-foreground">Texnik spec</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10 text-success">
                <Ruler className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {furnitureType.details?.reduce((sum, d) => sum + d.quantity, 0) || 0}
                </div>
                <div className="text-sm text-muted-foreground">Jami miqdor</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Completion warning */}
        {isOwner && !furnitureType.isCompleted && !canComplete() && (
          <Card className="border-warning/50 bg-warning/5">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-warning mt-0.5" />
                <div>
                  <p className="font-medium">Tugallash uchun quyidagilar kerak:</p>
                  <ul className="text-sm text-muted-foreground mt-1 list-disc list-inside">
                    {(furnitureType.details?.length || 0) === 0 && <li>Kamida 1 ta detal</li>}
                    {(furnitureType.drawings?.length || 0) === 0 && <li>Kamida 1 ta chizma</li>}
                    {!specifications.trim() && <li>Texnik xususiyatlar</li>}
                    {!materialList.trim() && <li>Materiallar ro'yxati</li>}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Umumiy</TabsTrigger>
            <TabsTrigger value="details">
              Detallar ({furnitureType.details?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="drawings">
              Chizmalar ({furnitureType.drawings?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="specs">Texnik spec</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Umumiy ma'lumotlar</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Nomi</Label>
                    <p className="font-medium">{furnitureType.name}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Konstruktor</Label>
                    <p className="font-medium">{furnitureType.constructorName || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Yaratilgan sana</Label>
                    <p className="font-medium">{formatDate(furnitureType.createdAt)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Oxirgi yangilanish</Label>
                    <p className="font-medium">{furnitureType.updatedAt ? formatDate(furnitureType.updatedAt) : '-'}</p>
                  </div>
                </div>
                {furnitureType.description && (
                  <div>
                    <Label className="text-muted-foreground">Tavsif</Label>
                    <p className="mt-1">{furnitureType.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Detallar</CardTitle>
                  <CardDescription>O'lchamlari va materiallari bilan</CardDescription>
                </div>
                {isOwner && !furnitureType.isCompleted && (
                  <Button onClick={() => {
                    setEditingDetail(null);
                    setDetailForm({ furnitureTypeId: Number(id), quantity: 1, unit: 'dona' });
                    setDetailModalOpen(true);
                  }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Qo'shish
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {(furnitureType.details?.length || 0) === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Ruler className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    <p>Hozircha detallar yo'q</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nomi</TableHead>
                        <TableHead>Material</TableHead>
                        <TableHead>O'lchamlari (mm)</TableHead>
                        <TableHead>Miqdor</TableHead>
                        <TableHead className="text-right">Amallar</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {furnitureType.details?.map((detail) => (
                        <TableRow key={detail.id}>
                          <TableCell className="font-medium">{detail.name}</TableCell>
                          <TableCell>{detail.material}</TableCell>
                          <TableCell>
                            {detail.width} × {detail.height} × {detail.depth}
                          </TableCell>
                          <TableCell>
                            {detail.quantity} {detail.unit}
                          </TableCell>
                          <TableCell className="text-right">
                            {isOwner && !furnitureType.isCompleted && (
                              <div className="flex justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openEditDetail(detail)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setDeleteDetailId(detail.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Drawings Tab */}
          <TabsContent value="drawings" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Chizmalar</CardTitle>
                  <CardDescription>Texnik chizmalar va hujjatlar</CardDescription>
                </div>
                {isOwner && !furnitureType.isCompleted && (
                  <Button onClick={() => setUploadModalOpen(true)}>
                    <Upload className="h-4 w-4 mr-2" />
                    Yuklash
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {(furnitureType.drawings?.length || 0) === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileImage className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    <p>Hozircha chizmalar yo'q</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {furnitureType.drawings?.map((drawing) => (
                      <Card key={drawing.id} className="overflow-hidden">
                        <div className="aspect-video bg-muted flex items-center justify-center">
                          {drawing.fileName.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                            <img
                              src={drawing.fileUrl}
                              alt={drawing.fileName}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <FileImage className="h-12 w-12 text-muted-foreground" />
                          )}
                        </div>
                        <CardContent className="p-3">
                          <p className="font-medium text-sm truncate">{drawing.fileName}</p>
                          {drawing.description && (
                            <p className="text-xs text-muted-foreground truncate">{drawing.description}</p>
                          )}
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-muted-foreground">
                              {(drawing.fileSize / 1024).toFixed(1)} KB
                            </span>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" asChild>
                                <a href={drawing.fileUrl} target="_blank" rel="noopener noreferrer">
                                  <Eye className="h-4 w-4" />
                                </a>
                              </Button>
                              <Button variant="ghost" size="icon" asChild>
                                <a href={drawing.fileUrl} download={drawing.fileName}>
                                  <Download className="h-4 w-4" />
                                </a>
                              </Button>
                              {isOwner && !furnitureType.isCompleted && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setDeleteDrawingId(drawing.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Technical Specs Tab */}
          <TabsContent value="specs" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Texnik xususiyatlar</CardTitle>
                  <CardDescription>Ishlab chiqarish uchun batafsil ma'lumotlar</CardDescription>
                </div>
                {isOwner && !furnitureType.isCompleted && (
                  <Button onClick={handleSaveSpec} disabled={savingSpec}>
                    <Save className="h-4 w-4 mr-2" />
                    {savingSpec ? 'Saqlanmoqda...' : 'Saqlash'}
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="specifications">Texnik xususiyatlar *</Label>
                    <Textarea
                      id="specifications"
                      value={specifications}
                      onChange={(e) => setSpecifications(e.target.value)}
                      placeholder="Mebel turiga tegishli texnik xususiyatlarni kiriting..."
                      className="min-h-[150px] mt-1"
                      disabled={!isOwner || furnitureType.isCompleted}
                    />
                  </div>
                  <div>
                    <Label htmlFor="materialList">Materiallar ro'yxati *</Label>
                    <Textarea
                      id="materialList"
                      value={materialList}
                      onChange={(e) => setMaterialList(e.target.value)}
                      placeholder="Kerakli materiallar ro'yxati..."
                      className="min-h-[150px] mt-1"
                      disabled={!isOwner || furnitureType.isCompleted}
                    />
                  </div>
                  <div>
                    <Label htmlFor="assemblyInstructions">Yig'ish ko'rsatmalari</Label>
                    <Textarea
                      id="assemblyInstructions"
                      value={assemblyInstructions}
                      onChange={(e) => setAssemblyInstructions(e.target.value)}
                      placeholder="Yig'ish tartibi va ko'rsatmalari..."
                      className="min-h-[150px] mt-1"
                      disabled={!isOwner || furnitureType.isCompleted}
                    />
                  </div>
                  <div>
                    <Label htmlFor="qualityNotes">Sifat eslatmalari</Label>
                    <Textarea
                      id="qualityNotes"
                      value={qualityNotes}
                      onChange={(e) => setQualityNotes(e.target.value)}
                      placeholder="Sifat tekshiruvi uchun muhim eslatmalar..."
                      className="min-h-[150px] mt-1"
                      disabled={!isOwner || furnitureType.isCompleted}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Detail Modal */}
      <AlertDialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {editingDetail ? 'Detalni tahrirlash' : 'Yangi detal'}
            </AlertDialogTitle>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Nomi *</Label>
              <Input
                value={detailForm.name || ''}
                onChange={(e) => setDetailForm({ ...detailForm, name: e.target.value })}
                placeholder="Detal nomi"
              />
            </div>
            <div>
              <Label>Material *</Label>
              <Input
                value={detailForm.material || ''}
                onChange={(e) => setDetailForm({ ...detailForm, material: e.target.value })}
                placeholder="Material turi"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label>Eni (mm)</Label>
                <Input
                  type="number"
                  value={detailForm.width || ''}
                  onChange={(e) => setDetailForm({ ...detailForm, width: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Bo'yi (mm)</Label>
                <Input
                  type="number"
                  value={detailForm.height || ''}
                  onChange={(e) => setDetailForm({ ...detailForm, height: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Qalinligi (mm)</Label>
                <Input
                  type="number"
                  value={detailForm.depth || ''}
                  onChange={(e) => setDetailForm({ ...detailForm, depth: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Miqdor</Label>
                <Input
                  type="number"
                  value={detailForm.quantity || 1}
                  onChange={(e) => setDetailForm({ ...detailForm, quantity: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Birlik</Label>
                <Input
                  value={detailForm.unit || 'dona'}
                  onChange={(e) => setDetailForm({ ...detailForm, unit: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Eslatma</Label>
              <Textarea
                value={detailForm.notes || ''}
                onChange={(e) => setDetailForm({ ...detailForm, notes: e.target.value })}
                placeholder="Qo'shimcha ma'lumotlar..."
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={resetDetailForm}>Bekor qilish</AlertDialogCancel>
            <AlertDialogAction onClick={handleSaveDetail} disabled={savingDetail}>
              {savingDetail ? 'Saqlanmoqda...' : 'Saqlash'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Detail Confirmation */}
      <AlertDialog open={!!deleteDetailId} onOpenChange={() => setDeleteDetailId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Detalni o'chirish</AlertDialogTitle>
            <AlertDialogDescription>
              Bu amalni ortga qaytarib bo'lmaydi. Haqiqatan ham o'chirmoqchimisiz?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteDetail} className="bg-destructive hover:bg-destructive/90">
              O'chirish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Upload Drawing Modal */}
      <AlertDialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Chizma yuklash</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Fayl *</Label>
              <Input
                type="file"
                accept=".pdf,.dwg,.dxf,.png,.jpg,.jpeg"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                PDF, DWG, DXF, PNG, JPG formatlarida
              </p>
            </div>
            <div>
              <Label>Tavsif</Label>
              <Textarea
                value={uploadDescription}
                onChange={(e) => setUploadDescription(e.target.value)}
                placeholder="Chizma haqida qisqacha ma'lumot..."
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
            <AlertDialogAction onClick={handleUploadDrawing} disabled={uploading || !uploadFile}>
              {uploading ? 'Yuklanmoqda...' : 'Yuklash'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Drawing Confirmation */}
      <AlertDialog open={!!deleteDrawingId} onOpenChange={() => setDeleteDrawingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Chizmani o'chirish</AlertDialogTitle>
            <AlertDialogDescription>
              Bu amalni ortga qaytarib bo'lmaydi. Haqiqatan ham o'chirmoqchimisiz?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteDrawing} className="bg-destructive hover:bg-destructive/90">
              O'chirish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Complete Confirmation */}
      <AlertDialog open={completeModalOpen} onOpenChange={setCompleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mebel turini tugallash</AlertDialogTitle>
            <AlertDialogDescription>
              Tugallagandan so'ng tahrirlash imkoniyati yo'qoladi. Davom etishni xohlaysizmi?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleComplete}
              disabled={completing}
              className="bg-success hover:bg-success/90"
            >
              {completing ? 'Tugallanmoqda...' : 'Ha, tugallash'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
