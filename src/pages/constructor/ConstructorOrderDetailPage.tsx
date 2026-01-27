import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppHeader } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { constructorService } from '@/services/constructorService';
import { ConstructorOrder, FurnitureType, Detail } from '@/types/constructor';
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Calendar,
  Layers,
  Ruler,
  Tag,
  Plus,
  Trash2,
  ChevronDown,
  History,
  ImagePlus,
  Check,
  X,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { format, parseISO, differenceInDays } from 'date-fns';

// Detail entry with multiple dimensions
interface DetailEntry {
  id?: number;
  name: string;
  dimensions: DimensionRow[];
  materials: string[];
  notes: string;
  steps: number;
  isNew?: boolean;
}

interface DimensionRow {
  id?: number;
  width: number;
  height: number;
  thickness: number;
  isNew?: boolean;
}

interface CategoryState {
  id: number;
  name: string;
  isOpen: boolean;
  details: DetailEntry[];
  detailsCount: number;
  dimensionsCount: number;
}

const AVAILABLE_MATERIALS = [
  'DSP 18mm Sut rangi',
  'MDF 16mm Oq',
  'DSP 16mm Qora',
  'Shisha 4mm',
  'Oyna 6mm',
  'Metall profil',
  'PVC qirrasi',
];

const DETAIL_NAMES = [
  'Yon bakkasi',
  'Yuqori qopqoq',
  'Pastki qopqoq',
  'Orqa devor',
  'Tokcha',
  'Eshik',
  'Polka',
];

export const ConstructorOrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [order, setOrder] = useState<ConstructorOrder | null>(null);
  const [categories, setCategories] = useState<CategoryState[]>([]);
  const [loading, setLoading] = useState(true);
  const [activityOpen, setActivityOpen] = useState(false);

  // Category modal state
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [savingCategory, setSavingCategory] = useState(false);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'category' | 'detail'; id: number; catIndex?: number } | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Room images
  const [roomImages, setRoomImages] = useState<string[]>([]);
  const [designImages, setDesignImages] = useState<string[]>([]);
  const roomInputRef = useRef<HTMLInputElement>(null);
  const designInputRef = useRef<HTMLInputElement>(null);

  const loadOrder = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const orderData = await constructorService.getOrderById(Number(id));
      setOrder(orderData);

      // Load furniture types for this order (categories)
      const allFurnitureTypes = await constructorService.getFurnitureTypes();
      
      // Map furniture types to categories with their details
      const categoryStates: CategoryState[] = await Promise.all(
        allFurnitureTypes.map(async (ft) => {
          try {
            const ftDetails = await constructorService.getDetailsByFurnitureType(ft.id);
            
            // Group details by name
            const groupedDetails: Record<string, DetailEntry> = {};
            ftDetails.forEach((d) => {
              if (!groupedDetails[d.name]) {
                groupedDetails[d.name] = {
                  id: d.id,
                  name: d.name,
                  dimensions: [],
                  materials: d.material ? [d.material] : [],
                  notes: d.notes || '',
                  steps: 0,
                };
              }
              groupedDetails[d.name].dimensions.push({
                id: d.id,
                width: d.width,
                height: d.height,
                thickness: d.thickness,
              });
            });

            const details = Object.values(groupedDetails);
            const dimensionsCount = details.reduce((acc, d) => acc + d.dimensions.length, 0);

            return {
              id: ft.id,
              name: ft.name,
              isOpen: false,
              details,
              detailsCount: details.length,
              dimensionsCount,
            };
          } catch {
            return {
              id: ft.id,
              name: ft.name,
              isOpen: false,
              details: [],
              detailsCount: 0,
              dimensionsCount: 0,
            };
          }
        })
      );

      setCategories(categoryStates);
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
  }, [id, toast]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const toggleCategory = (index: number) => {
    setCategories(prev => prev.map((cat, i) => 
      i === index ? { ...cat, isOpen: !cat.isOpen } : cat
    ));
  };

  // Add new category (furniture type)
  const handleAddCategory = async () => {
    if (!newCategoryName.trim() || !id) return;
    setSavingCategory(true);
    try {
      await constructorService.createFurnitureType({ name: newCategoryName, orderId: Number(id) });
      toast({ title: 'Muvaffaqiyat', description: 'Kategoriya qo\'shildi' });
      setCategoryModalOpen(false);
      setNewCategoryName('');
      loadOrder();
    } catch (error: any) {
      toast({
        title: 'Xatolik',
        description: error?.response?.data?.message || 'Kategoriya qo\'shishda xatolik',
        variant: 'destructive',
      });
    } finally {
      setSavingCategory(false);
    }
  };

  // Add new detail to category
  const handleAddDetail = (categoryIndex: number, detailName: string) => {
    if (!detailName.trim()) return;
    
    setCategories(prev => prev.map((cat, i) => {
      if (i !== categoryIndex) return cat;
      
      const existingDetail = cat.details.find(d => d.name === detailName);
      if (existingDetail) {
        toast({ title: 'Bu detal allaqachon mavjud', variant: 'destructive' });
        return cat;
      }
      
      return {
        ...cat,
        details: [
          ...cat.details,
          {
            name: detailName,
            dimensions: [{ width: 0, height: 0, thickness: 18, isNew: true }],
            materials: [],
            notes: '',
            steps: 2,
            isNew: true,
          },
        ],
        detailsCount: cat.detailsCount + 1,
        dimensionsCount: cat.dimensionsCount + 1,
      };
    }));
  };

  // Add dimension row to detail
  const handleAddDimension = (categoryIndex: number, detailIndex: number) => {
    setCategories(prev => prev.map((cat, i) => {
      if (i !== categoryIndex) return cat;
      return {
        ...cat,
        details: cat.details.map((det, di) => {
          if (di !== detailIndex) return det;
          return {
            ...det,
            dimensions: [...det.dimensions, { width: 0, height: 0, thickness: 18, isNew: true }],
          };
        }),
        dimensionsCount: cat.dimensionsCount + 1,
      };
    }));
  };

  // Update dimension
  const handleUpdateDimension = (
    categoryIndex: number, 
    detailIndex: number, 
    dimIndex: number, 
    field: keyof DimensionRow, 
    value: number
  ) => {
    setCategories(prev => prev.map((cat, i) => {
      if (i !== categoryIndex) return cat;
      return {
        ...cat,
        details: cat.details.map((det, di) => {
          if (di !== detailIndex) return det;
          return {
            ...det,
            dimensions: det.dimensions.map((dim, dmi) => {
              if (dmi !== dimIndex) return dim;
              return { ...dim, [field]: value };
            }),
          };
        }),
      };
    }));
  };

  // Remove dimension
  const handleRemoveDimension = (categoryIndex: number, detailIndex: number, dimIndex: number) => {
    setCategories(prev => prev.map((cat, i) => {
      if (i !== categoryIndex) return cat;
      const detail = cat.details[detailIndex];
      if (detail.dimensions.length <= 1) {
        // If only one dimension left, remove the entire detail
        return {
          ...cat,
          details: cat.details.filter((_, di) => di !== detailIndex),
          detailsCount: cat.detailsCount - 1,
          dimensionsCount: cat.dimensionsCount - 1,
        };
      }
      return {
        ...cat,
        details: cat.details.map((det, di) => {
          if (di !== detailIndex) return det;
          return {
            ...det,
            dimensions: det.dimensions.filter((_, dmi) => dmi !== dimIndex),
          };
        }),
        dimensionsCount: cat.dimensionsCount - 1,
      };
    }));
  };

  // Toggle material
  const handleToggleMaterial = (categoryIndex: number, detailIndex: number, material: string) => {
    setCategories(prev => prev.map((cat, i) => {
      if (i !== categoryIndex) return cat;
      return {
        ...cat,
        details: cat.details.map((det, di) => {
          if (di !== detailIndex) return det;
          const hasMaterial = det.materials.includes(material);
          return {
            ...det,
            materials: hasMaterial 
              ? det.materials.filter(m => m !== material)
              : [...det.materials, material],
          };
        }),
      };
    }));
  };

  // Update notes
  const handleUpdateNotes = (categoryIndex: number, detailIndex: number, notes: string) => {
    setCategories(prev => prev.map((cat, i) => {
      if (i !== categoryIndex) return cat;
      return {
        ...cat,
        details: cat.details.map((det, di) => {
          if (di !== detailIndex) return det;
          return { ...det, notes };
        }),
      };
    }));
  };

  // Save detail to backend
  const handleSaveDetail = async (categoryIndex: number, detailIndex: number) => {
    const category = categories[categoryIndex];
    const detail = category.details[detailIndex];

    for (const dim of detail.dimensions) {
      if (dim.width <= 0 || dim.height <= 0 || dim.thickness <= 0) {
        toast({ title: 'Xatolik', description: 'Barcha o\'lchamlarni to\'ldiring', variant: 'destructive' });
        return;
      }
    }

    try {
      // Save each dimension as a separate detail entry
      for (const dim of detail.dimensions) {
        if (dim.isNew || !dim.id) {
          await constructorService.createDetail({
            furnitureTypeId: category.id,
            name: detail.name,
            material: detail.materials.join(', ') || 'Noma\'lum',
            width: dim.width,
            height: dim.height,
            thickness: dim.thickness,
            quantity: 1,
            notes: detail.notes,
          });
        } else {
          await constructorService.updateDetail(dim.id, {
            name: detail.name,
            material: detail.materials.join(', ') || 'Noma\'lum',
            width: dim.width,
            height: dim.height,
            thickness: dim.thickness,
            quantity: 1,
            notes: detail.notes,
          });
        }
      }

      toast({ title: 'Saqlandi', description: 'Detal muvaffaqiyatli saqlandi' });
      loadOrder();
    } catch (error: any) {
      toast({
        title: 'Xatolik',
        description: error?.response?.data?.message || 'Saqlashda xatolik',
        variant: 'destructive',
      });
    }
  };

  // Delete category
  const handleDeleteCategory = async () => {
    if (!deleteTarget || deleteTarget.type !== 'category') return;
    setDeleting(true);
    try {
      await constructorService.deleteFurnitureType(deleteTarget.id);
      toast({ title: 'O\'chirildi', description: 'Kategoriya o\'chirildi' });
      setDeleteModalOpen(false);
      setDeleteTarget(null);
      loadOrder();
    } catch (error: any) {
      toast({
        title: 'Xatolik',
        description: error?.response?.data?.message || 'O\'chirishda xatolik',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  // Handle image upload
  const handleImageUpload = (type: 'room' | 'design', files: FileList | null) => {
    if (!files) return;
    const newImages = Array.from(files).map(file => URL.createObjectURL(file));
    if (type === 'room') {
      setRoomImages(prev => [...prev, ...newImages]);
    } else {
      setDesignImages(prev => [...prev, ...newImages]);
    }
  };

  // Complete order - use the new completeFurnitureTypeWithData endpoint
  const handleCompleteOrder = async () => {
    // For each category, collect all details and send to backend
    for (const cat of categories) {
      try {
        // Convert details to the format expected by the backend
        const detailsPayload = cat.details.flatMap(detail => 
          detail.dimensions.map(dim => ({
            name: detail.name,
            width: dim.width,
            height: dim.height,
            thickness: dim.thickness,
            quantity: 1,
            material: detail.materials.join(', ') || 'MDF',
            notes: detail.notes || '',
          }))
        );

        // Collect all notes from details
        const allNotes = cat.details
          .map(d => d.notes)
          .filter(Boolean)
          .join('\n') || 'Texnik xususiyatlar';

        await constructorService.completeFurnitureTypeWithData(cat.id, {
          details: detailsPayload,
          notes: allNotes,
        });
      } catch (error) {
        console.error('Failed to complete category:', cat.id, error);
        toast({
          title: 'Xatolik',
          description: `Kategoriya ${cat.name} ni saqlashda xatolik`,
          variant: 'destructive',
        });
        return; // Stop if any category fails
      }
    }
    toast({ title: 'Muvaffaqiyat', description: 'Mebel turi to\'ldirildi!' });
    navigate('/constructor/orders');
  };

  const getDeadlineInfo = (deadline?: string) => {
    if (!deadline) return null;
    try {
      const deadlineDate = parseISO(deadline);
      const daysLeft = differenceInDays(deadlineDate, new Date());
      if (daysLeft < 0) {
        return { text: `${Math.abs(daysLeft)} kun kechikdi`, isDelayed: true };
      }
      return { text: format(deadlineDate, 'd-MMMM, yyyy'), isDelayed: false };
    } catch {
      return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
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
        <div className="p-6">
          <Button variant="outline" onClick={() => navigate('/constructor/orders')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Orqaga
          </Button>
          <p className="mt-4 text-muted-foreground">Buyurtma topilmadi</p>
        </div>
      </div>
    );
  }

  const deadlineInfo = getDeadlineInfo(order.deadline);
  const totalDetails = categories.reduce((acc, c) => acc + c.detailsCount, 0);
  const totalDimensions = categories.reduce((acc, c) => acc + c.dimensionsCount, 0);

  // Get category name
  const categoryName = Array.isArray(order.categoryNames) 
    ? order.categoryNames[0] 
    : (order.categoryName || order.furnitureTypes?.[0]?.name || '');

  return (
    <div className="min-h-screen bg-background">
      {/* Header with back button */}
      <div className="border-b bg-card px-6 py-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/constructor/orders')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">
              Buyurtma #{order.orderNumber?.split('-').pop() || order.id}
            </h1>
            <p className="text-sm text-muted-foreground">
              {categoryName && `${categoryName} • `}
              {categories.length} kategoriya • {totalDetails} detal • {totalDimensions} razmer
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Customer Info Card */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4 text-muted-foreground">
              <User className="h-4 w-4" />
              <span className="text-sm font-medium">Mijoz ma'lumotlari</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Mijoz nomi</p>
                <p className="font-medium">{order.customerName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Telefon</p>
                <p className="font-medium flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {order.customerPhone || '+998 -- --- -- --'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Manzil</p>
                <p className="font-medium flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {order.customerAddress || 'Kiritilmagan'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Deadline</p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  <span className="font-medium">{deadlineInfo?.text || 'Belgilanmagan'}</span>
                  {deadlineInfo?.isDelayed && (
                    <Badge variant="destructive" className="text-xs px-1.5 py-0">
                      {deadlineInfo.text}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Categories Section */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Layers className="h-4 w-4" />
                <span className="text-sm font-medium">Kategoriyalar</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  <Layers className="h-3 w-3 inline mr-1" /> {totalDetails} detal
                </span>
                <span className="text-sm text-muted-foreground">
                  <Tag className="h-3 w-3 inline mr-1" /> {totalDimensions} razmer
                </span>
                <Button size="sm" onClick={() => setCategoryModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Kategoriya
                </Button>
              </div>
            </div>

            {/* Category List */}
            <div className="space-y-3">
              {categories.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Layers className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Hali kategoriya qo'shilmagan</p>
                </div>
              ) : (
                categories.map((category, catIndex) => (
                  <Collapsible
                    key={category.id}
                    open={category.isOpen}
                    onOpenChange={() => toggleCategory(catIndex)}
                  >
                    <Card className="border">
                      <CollapsibleTrigger asChild>
                        <CardContent className="p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="h-6 w-6 rounded bg-primary text-primary-foreground text-xs font-medium flex items-center justify-center">
                                {catIndex + 1}
                              </span>
                              <span className="font-medium">{category.name}</span>
                              <Badge variant="outline" className="text-xs">
                                <Layers className="h-3 w-3 mr-1" /> {category.detailsCount} detal
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                <Tag className="h-3 w-3 mr-1" /> {category.dimensionsCount} razmer
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteTarget({ type: 'category', id: category.id });
                                  setDeleteModalOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-muted-foreground" />
                              </Button>
                              <ChevronDown className={`h-4 w-4 transition-transform ${category.isOpen ? 'rotate-180' : ''}`} />
                            </div>
                          </div>
                        </CardContent>
                      </CollapsibleTrigger>

                      <CollapsibleContent>
                        <div className="border-t p-4 space-y-4 bg-muted/20">
                          {/* Add Detail Section */}
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Detal qo'shish</Label>
                            <div className="flex gap-2">
                              <Select onValueChange={(v) => handleAddDetail(catIndex, v)}>
                                <SelectTrigger className="flex-1">
                                  <SelectValue placeholder="Detal nomini tanlang..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {DETAIL_NAMES.filter(n => !category.details.some(d => d.name === n)).map(name => (
                                    <SelectItem key={name} value={name}>{name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Button variant="default" onClick={() => {
                                const customName = prompt('Yangi detal nomi:');
                                if (customName) handleAddDetail(catIndex, customName);
                              }}>
                                <Plus className="h-4 w-4 mr-1" />
                                Yangi detal nomi
                              </Button>
                            </div>
                          </div>

                          {/* Details List */}
                          {category.details.map((detail, detIndex) => (
                            <Card key={`${detail.name}-${detIndex}`} className="border-2 border-dashed">
                              <CardContent className="p-4 space-y-4">
                                {/* Detail Header */}
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="h-5 w-5 rounded bg-muted text-muted-foreground text-xs font-medium flex items-center justify-center">
                                      {detIndex + 1}
                                    </span>
                                    <span className="font-medium">{detail.name}</span>
                                    <span className="text-sm text-muted-foreground">{detail.dimensions.length} razmer</span>
                                    {detail.steps > 0 && (
                                      <Badge variant="secondary" className="text-xs">{detail.steps} bosqich</Badge>
                                    )}
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      setCategories(prev => prev.map((cat, i) => {
                                        if (i !== catIndex) return cat;
                                        return {
                                          ...cat,
                                          details: cat.details.filter((_, di) => di !== detIndex),
                                          detailsCount: cat.detailsCount - 1,
                                          dimensionsCount: cat.dimensionsCount - detail.dimensions.length,
                                        };
                                      }));
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                                  </Button>
                                </div>

                                {/* Dimensions */}
                                <div className="space-y-2">
                                  <Label className="text-xs text-muted-foreground uppercase">Razmerlar</Label>
                                  {detail.dimensions.map((dim, dimIndex) => (
                                    <div key={dimIndex} className="flex items-center gap-2">
                                      <span className="h-6 w-6 rounded bg-primary/10 text-primary text-xs font-medium flex items-center justify-center">
                                        {dimIndex + 1}
                                      </span>
                                      <Input
                                        type="number"
                                        value={dim.width || ''}
                                        onChange={(e) => handleUpdateDimension(catIndex, detIndex, dimIndex, 'width', Number(e.target.value))}
                                        placeholder="Eni"
                                        className="w-24 h-8 text-sm"
                                      />
                                      <span className="text-muted-foreground">mm</span>
                                      <span className="text-muted-foreground">x</span>
                                      <Input
                                        type="number"
                                        value={dim.height || ''}
                                        onChange={(e) => handleUpdateDimension(catIndex, detIndex, dimIndex, 'height', Number(e.target.value))}
                                        placeholder="Bo'yi"
                                        className="w-24 h-8 text-sm"
                                      />
                                      <span className="text-muted-foreground">mm</span>
                                      <span className="text-muted-foreground">x</span>
                                      <Input
                                        type="number"
                                        value={dim.thickness || ''}
                                        onChange={(e) => handleUpdateDimension(catIndex, detIndex, dimIndex, 'thickness', Number(e.target.value))}
                                        placeholder="Qalinligi"
                                        className="w-20 h-8 text-sm"
                                      />
                                      <span className="text-muted-foreground">mm</span>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => handleRemoveDimension(catIndex, detIndex, dimIndex)}
                                      >
                                        <X className="h-4 w-4 text-muted-foreground" />
                                      </Button>
                                    </div>
                                  ))}
                                  
                                  {/* Add dimension input */}
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Input
                                      placeholder="300mm x 150mm yoki 300 x 150 x 18 mm"
                                      className="flex-1 h-8 text-sm"
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          handleAddDimension(catIndex, detIndex);
                                        }
                                      }}
                                    />
                                    <Button
                                      variant="secondary"
                                      size="sm"
                                      onClick={() => handleAddDimension(catIndex, detIndex)}
                                    >
                                      <Plus className="h-4 w-4 mr-1" />
                                      Razmer
                                    </Button>
                                  </div>
                                </div>

                                {/* Materials */}
                                <div className="space-y-2">
                                  <Label className="text-xs text-muted-foreground uppercase">Materiallar</Label>
                                  <div className="flex flex-wrap gap-2">
                                    {detail.materials.map((mat, mi) => (
                                      <Badge 
                                        key={mi} 
                                        variant="secondary"
                                        className="cursor-pointer"
                                        onClick={() => handleToggleMaterial(catIndex, detIndex, mat)}
                                      >
                                        {mat}
                                        <X className="h-3 w-3 ml-1" />
                                      </Badge>
                                    ))}
                                    <Select onValueChange={(v) => handleToggleMaterial(catIndex, detIndex, v)}>
                                      <SelectTrigger className="w-[160px] h-7 text-xs">
                                        <SelectValue placeholder="Material qo'shish..." />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {AVAILABLE_MATERIALS.filter(m => !detail.materials.includes(m)).map(mat => (
                                          <SelectItem key={mat} value={mat} className="text-xs">{mat}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>

                                {/* Notes */}
                                <div className="space-y-2">
                                  <Label className="text-xs text-muted-foreground uppercase">Texnik izohlar</Label>
                                  <Textarea
                                    value={detail.notes}
                                    onChange={(e) => handleUpdateNotes(catIndex, detIndex, e.target.value)}
                                    placeholder="Ko'zgu bilan, ichki yorug'lik..."
                                    className="text-sm min-h-[60px]"
                                  />
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Images Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Room Images */}
          <Card>
            <CardContent className="p-5">
              <Label className="text-sm font-medium mb-3 block">Xona rasmlari</Label>
              <div
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => roomInputRef.current?.click()}
              >
                {roomImages.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {roomImages.map((img, i) => (
                      <img key={i} src={img} alt={`Room ${i + 1}`} className="w-full h-20 object-cover rounded" />
                    ))}
                  </div>
                ) : (
                  <>
                    <ImagePlus className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-primary">Rasm yuklash</p>
                  </>
                )}
              </div>
              <input
                ref={roomInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleImageUpload('room', e.target.files)}
              />
            </CardContent>
          </Card>

          {/* Design Images */}
          <Card>
            <CardContent className="p-5">
              <Label className="text-sm font-medium mb-3 block">Dizayn namunalari</Label>
              <div
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => designInputRef.current?.click()}
              >
                {designImages.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {designImages.map((img, i) => (
                      <img key={i} src={img} alt={`Design ${i + 1}`} className="w-full h-20 object-cover rounded" />
                    ))}
                  </div>
                ) : (
                  <>
                    <ImagePlus className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-primary">Dizayn yuklash</p>
                  </>
                )}
              </div>
              <input
                ref={designInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleImageUpload('design', e.target.files)}
              />
            </CardContent>
          </Card>
        </div>

        {/* Activity History */}
        <Collapsible open={activityOpen} onOpenChange={setActivityOpen}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardContent className="p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <History className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Faoliyat tarixi</span>
                    <Badge variant="secondary">{1}</Badge>
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${activityOpen ? 'rotate-180' : ''}`} />
                </div>
              </CardContent>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="border-t p-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3 text-sm">
                    <div className="h-2 w-2 rounded-full bg-primary mt-1.5" />
                    <div>
                      <p>Buyurtma yaratildi</p>
                      <p className="text-xs text-muted-foreground">
                        {order.createdAt ? format(parseISO(order.createdAt), 'dd.MM.yyyy HH:mm') : '-'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => navigate('/constructor/orders')}>
            Bekor qilish
          </Button>
          <Button onClick={handleCompleteOrder} className="bg-green-500 hover:bg-green-600">
            <Check className="h-4 w-4 mr-2" />
            Razmer tayyor
          </Button>
        </div>
      </div>

      {/* Add Category Modal */}
      <Dialog open={categoryModalOpen} onOpenChange={setCategoryModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yangi kategoriya qo'shish</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Kategoriya nomi</Label>
              <Input
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Masalan: Shkaf-kupe"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCategoryModalOpen(false)}>
              Bekor qilish
            </Button>
            <Button onClick={handleAddCategory} disabled={savingCategory || !newCategoryName.trim()}>
              {savingCategory ? 'Saqlanmoqda...' : 'Qo\'shish'}
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
              Bu amalni qaytarib bo'lmaydi. {deleteTarget?.type === 'category' ? 'Barcha detallar ham o\'chiriladi.' : ''}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCategory} disabled={deleting}>
              {deleting ? "O'chirilmoqda..." : "O'chirish"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
