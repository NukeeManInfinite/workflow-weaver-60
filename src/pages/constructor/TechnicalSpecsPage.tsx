import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppHeader } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { constructorService } from '@/services/constructorService';
import { FurnitureType, CreateTechnicalSpecDto } from '@/types/constructor';
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  FileText,
  Ruler,
  FileImage,
  AlertTriangle,
  Save,
  Send,
} from 'lucide-react';

export const TechnicalSpecsPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { user } = useAuth();

  const [furnitureType, setFurnitureType] = useState<FurnitureType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [specifications, setSpecifications] = useState('');
  const [materialList, setMaterialList] = useState('');
  const [assemblyInstructions, setAssemblyInstructions] = useState('');
  const [qualityNotes, setQualityNotes] = useState('');

  // Modal states
  const [completeModalOpen, setCompleteModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    try {
      const data = await constructorService.getFurnitureTypeById(Number(id));
      setFurnitureType(data);

      // Load existing technical spec if available
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

  const isOwner = furnitureType?.constructorId === Number(user?.id);

  const canComplete = () => {
    if (!furnitureType) return false;
    // Must have details and drawings
    const hasDetails = (furnitureType.details?.length || 0) > 0;
    const hasDrawings = (furnitureType.drawings?.length || 0) > 0;
    // Must have technical specifications filled
    const hasSpecs = specifications.trim().length > 0 && materialList.trim().length > 0;
    return hasDetails && hasDrawings && hasSpecs;
  };

  const handleSave = async () => {
    if (!furnitureType) return;

    setSaving(true);
    try {
      const dto: CreateTechnicalSpecDto = {
        furnitureTypeId: furnitureType.id,
        specifications,
        materialList,
        assemblyInstructions,
        qualityNotes,
      };

      if (furnitureType.technicalSpecification) {
        await constructorService.updateTechnicalSpec(furnitureType.technicalSpecification.id, {
          specifications,
          materialList,
          assemblyInstructions,
          qualityNotes,
        });
      } else {
        await constructorService.createTechnicalSpec(dto);
      }

      toast({
        title: 'Muvaffaqiyat',
        description: 'Texnik xususiyatlar saqlandi',
      });
      loadData();
    } catch (error: any) {
      toast({
        title: 'Xatolik',
        description: error.message || 'Saqlashda xatolik yuz berdi',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async () => {
    if (!furnitureType) return;

    setSaving(true);
    try {
      // First save the spec
      await handleSave();
      // Then mark as complete
      await constructorService.completeFurnitureType(furnitureType.id);
      toast({
        title: 'Muvaffaqiyat',
        description: 'Mebel turi tugallandi',
      });
      setCompleteModalOpen(false);
      navigate('/constructor/furniture-types');
    } catch (error: any) {
      toast({
        title: 'Xatolik',
        description: error.message || 'Tugallashda xatolik yuz berdi',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <AppHeader title="Texnik xususiyatlar" description="Yuklanmoqda..." />
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
        <AppHeader title="Topilmadi" description="" />
        <div className="p-6">
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              Mebel turi topilmadi
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
        description="Texnik xususiyatlarni to'ldiring"
      />

      <div className="p-6 space-y-6 animate-fade-in">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Orqaga
        </Button>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-info/10">
                  <Ruler className="h-5 w-5 text-info" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{furnitureType.details?.length || 0}</div>
                  <div className="text-sm text-muted-foreground">Detallar</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-warning/10">
                  <FileImage className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{furnitureType.drawings?.length || 0}</div>
                  <div className="text-sm text-muted-foreground">Chizmalar</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  {furnitureType.technicalSpecification ? (
                    <Badge className="bg-success/10 text-success">Mavjud</Badge>
                  ) : (
                    <Badge variant="outline">Yo'q</Badge>
                  )}
                  <div className="text-sm text-muted-foreground">Texnik xususiyat</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${furnitureType.isCompleted ? 'bg-success/10' : 'bg-warning/10'}`}>
                  {furnitureType.isCompleted ? (
                    <CheckCircle className="h-5 w-5 text-success" />
                  ) : (
                    <Clock className="h-5 w-5 text-warning" />
                  )}
                </div>
                <div>
                  {furnitureType.isCompleted ? (
                    <Badge className="bg-success/10 text-success">Tugallangan</Badge>
                  ) : (
                    <Badge className="bg-warning/10 text-warning">Jarayonda</Badge>
                  )}
                  <div className="text-sm text-muted-foreground">Holat</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Requirements Warning */}
        {!canComplete() && !furnitureType.isCompleted && (
          <Card className="border-warning/50 bg-warning/5">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
                <div className="space-y-1">
                  <p className="font-medium text-warning">Tugallash uchun quyidagilar talab qilinadi:</p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside">
                    {(furnitureType.details?.length || 0) === 0 && (
                      <li>Kamida 1 ta detal qo'shilishi kerak</li>
                    )}
                    {(furnitureType.drawings?.length || 0) === 0 && (
                      <li>Kamida 1 ta chizma yuklanishi kerak</li>
                    )}
                    {(!specifications.trim() || !materialList.trim()) && (
                      <li>Texnik xususiyatlar va material ro'yxati to'ldirilishi kerak</li>
                    )}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Technical Specifications Form */}
        <Card>
          <CardHeader>
            <CardTitle>Texnik xususiyatlar</CardTitle>
            <CardDescription>
              Mebel uchun texnik hujjatlarni to'ldiring
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="specifications">Texnik xususiyatlar *</Label>
              <Textarea
                id="specifications"
                value={specifications}
                onChange={(e) => setSpecifications(e.target.value)}
                placeholder="Mebel texnik parametrlari, o'lchamlari, xususiyatlari..."
                rows={4}
                disabled={!isOwner || furnitureType.isCompleted}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="materialList">Material ro'yxati *</Label>
              <Textarea
                id="materialList"
                value={materialList}
                onChange={(e) => setMaterialList(e.target.value)}
                placeholder="Kerakli materiallar, miqdorlari va xususiyatlari..."
                rows={4}
                disabled={!isOwner || furnitureType.isCompleted}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="assemblyInstructions">Yig'ish ko'rsatmalari</Label>
              <Textarea
                id="assemblyInstructions"
                value={assemblyInstructions}
                onChange={(e) => setAssemblyInstructions(e.target.value)}
                placeholder="Mebelni yig'ish tartibi va ko'rsatmalari..."
                rows={4}
                disabled={!isOwner || furnitureType.isCompleted}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="qualityNotes">Sifat nazorati eslatmalari</Label>
              <Textarea
                id="qualityNotes"
                value={qualityNotes}
                onChange={(e) => setQualityNotes(e.target.value)}
                placeholder="Sifat nazorati bo'yicha muhim eslatmalar..."
                rows={3}
                disabled={!isOwner || furnitureType.isCompleted}
              />
            </div>

            {isOwner && !furnitureType.isCompleted && (
              <div className="flex gap-4 pt-4">
                <Button variant="outline" onClick={handleSave} disabled={saving}>
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? 'Saqlanmoqda...' : 'Saqlash'}
                </Button>
                <Button
                  onClick={() => setCompleteModalOpen(true)}
                  disabled={!canComplete() || saving}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Tugallash va yuborish
                </Button>
              </div>
            )}

            {!isOwner && (
              <p className="text-sm text-muted-foreground italic">
                Bu mebel turini faqat ko'rish mumkin. Tahrirlash huquqi yo'q.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Complete Confirmation */}
      <AlertDialog open={completeModalOpen} onOpenChange={setCompleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mebel turini tugallash</AlertDialogTitle>
            <AlertDialogDescription>
              "{furnitureType?.name}" mebel turini tugallamoqchimisiz? 
              Tugallangandan so'ng, texnik xususiyatlarni o'zgartirish mumkin bo'lmaydi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
            <AlertDialogAction onClick={handleComplete} disabled={saving}>
              {saving ? 'Tugallanmoqda...' : 'Tugallash'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
