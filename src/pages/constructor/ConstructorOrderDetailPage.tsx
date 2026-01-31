import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { templateService } from '@/services/templateService';
import { orderCategoriesService } from '@/services/orderCategoriesService';
import { ConstructorOrder, FurnitureType } from '@/types/constructor';
import { FurnitureTypeTemplate } from '@/types/template';
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Calendar,
  Layers,
  Tag,
  Plus,
  Trash2,
  ChevronDown,
  History,
  ImagePlus,
  Check,
  X,
  LayoutTemplate,
  Sofa,
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

// Mebel (Furniture type) under a category
interface MebelState {
  id: number;
  name: string;
  categoryId: number;
  isOpen: boolean;
  details: DetailEntry[];
  detailsCount: number;
  dimensionsCount: number;
}

// Category from order - contains mebel (furniture types)
interface OrderCategoryState {
  id: number;
  name: string;
  description?: string;
  isOpen: boolean;
  mebellar: MebelState[]; // Furniture types under this category
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
  const [orderCategories, setOrderCategories] = useState<OrderCategoryState[]>([]);
  const [loading, setLoading] = useState(true);
  const [activityOpen, setActivityOpen] = useState(false);

  // Mebel (furniture type) modal state
  const [mebelModalOpen, setMebelModalOpen] = useState(false);
  const [selectedCategoryForMebel, setSelectedCategoryForMebel] = useState<OrderCategoryState | null>(null);
  const [newMebelName, setNewMebelName] = useState('');
  const [savingMebel, setSavingMebel] = useState(false);
  const [availableTemplates, setAvailableTemplates] = useState<FurnitureTypeTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<FurnitureTypeTemplate | null>(null);
  const [templatesLoading, setTemplatesLoading] = useState(false);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'mebel' | 'detail'; id: number } | null>(null);
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

      // 1. Load categories from order (from OrderCategories junction table)
      let categoriesFromOrder: Array<{ id: number; name: string; description?: string }> = [];
      
      // Try order.categories first
      if (orderData.categories && Array.isArray(orderData.categories) && orderData.categories.length > 0) {
        categoriesFromOrder = orderData.categories.map(c => ({
          id: Number(c.id),
          name: c.name,
          description: c.description,
        }));
      } 
      // Fallback: fetch from orderCategoriesService
      else if (orderData.orderCategories && Array.isArray(orderData.orderCategories) && orderData.orderCategories.length > 0) {
        categoriesFromOrder = orderData.orderCategories.map(oc => ({
          id: oc.categoryId,
          name: oc.category?.name || `Kategoriya #${oc.categoryId}`,
          description: oc.category?.description,
        }));
      } else {
        // Try to fetch from API
        try {
          const orderCats = await orderCategoriesService.getCategoriesByOrderId(Number(id));
          if (orderCats && orderCats.length > 0) {
            categoriesFromOrder = orderCats.map(oc => ({
              id: oc.categoryId,
              name: oc.category?.name || oc.categoryName || `Kategoriya #${oc.categoryId}`,
              description: oc.category?.description,
            }));
          }
        } catch (err) {
          console.warn('Failed to fetch order categories:', err);
        }
      }

      // 2. Load all furniture types for this order
      // Use dedicated method that handles order-specific endpoint or fallback
      const orderFurnitureTypes = await constructorService.getFurnitureTypesByOrderId(Number(id));
      
      console.log('Order furniture types:', orderFurnitureTypes);
      console.log('Categories from order:', categoriesFromOrder);

      // 3. Build category states with their mebellar (furniture types)
      const categoryStates: OrderCategoryState[] = await Promise.all(
        categoriesFromOrder.map(async (cat) => {
          // Find furniture types linked to this category
          // If categoryId is null/undefined, show under the first category
          const categoryMebellar = orderFurnitureTypes.filter(ft => {
            const ftCatId = Number((ft as any).categoryId ?? (ft as any).CategoryId ?? 0);
            // Match exact categoryId or put orphaned furniture types under first category
            return ftCatId === cat.id || (ftCatId === 0 && categoriesFromOrder.indexOf(cat) === 0);
          });
          console.log(`Category ${cat.id} (${cat.name}) mebellar:`, categoryMebellar);

          // Load details for each mebel
          const mebelStates: MebelState[] = await Promise.all(
            categoryMebellar.map(async (ft) => {
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
                  categoryId: cat.id,
                  isOpen: false,
                  details,
                  detailsCount: details.length,
                  dimensionsCount,
                };
              } catch {
                return {
                  id: ft.id,
                  name: ft.name,
                  categoryId: cat.id,
                  isOpen: false,
                  details: [],
                  detailsCount: 0,
                  dimensionsCount: 0,
                };
              }
            })
          );

          return {
            id: cat.id,
            name: cat.name,
            description: cat.description,
            isOpen: true, // Open by default to show mebellar
            mebellar: mebelStates,
          };
        })
      );

      setOrderCategories(categoryStates);
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

  const toggleCategory = (catIndex: number) => {
    setOrderCategories(prev => prev.map((cat, i) => 
      i === catIndex ? { ...cat, isOpen: !cat.isOpen } : cat
    ));
  };

  const toggleMebel = (catIndex: number, mebelIndex: number) => {
    setOrderCategories(prev => prev.map((cat, ci) => {
      if (ci !== catIndex) return cat;
      return {
        ...cat,
        mebellar: cat.mebellar.map((m, mi) => 
          mi === mebelIndex ? { ...m, isOpen: !m.isOpen } : m
        ),
      };
    }));
  };

  // Load templates when modal opens
  const loadTemplates = useCallback(async (categoryId: number) => {
    setTemplatesLoading(true);
    try {
      const templates = await templateService.getActiveByCategoryId(categoryId);
      setAvailableTemplates(templates);
    } catch (error) {
      console.error('Failed to load templates:', error);
      setAvailableTemplates([]);
    } finally {
      setTemplatesLoading(false);
    }
  }, []);

  const handleOpenMebelModal = (category: OrderCategoryState) => {
    setSelectedCategoryForMebel(category);
    setNewMebelName('');
    setSelectedTemplate(null);
    setMebelModalOpen(true);
    loadTemplates(category.id);
  };

  const handleSelectTemplate = (template: FurnitureTypeTemplate) => {
    setSelectedTemplate(template);
    setNewMebelName(template.name);
  };

  // Add new mebel (furniture type) to category
  const handleAddMebel = async () => {
    if (!newMebelName.trim() || !id || !selectedCategoryForMebel) return;
    setSavingMebel(true);
    try {
      const createdFurnitureType = await constructorService.createFurnitureType({ 
        name: newMebelName, 
        orderId: Number(id),
        categoryId: selectedCategoryForMebel.id,
      });
      
      console.log('Created furniture type:', createdFurnitureType);
      
      // Immediately update UI with new mebel
      const newMebel: MebelState = {
        id: createdFurnitureType.id,
        name: createdFurnitureType.name,
        categoryId: selectedCategoryForMebel.id,
        isOpen: false,
        details: [],
        detailsCount: 0,
        dimensionsCount: 0,
      };
      
      setOrderCategories(prev => prev.map(cat => {
        if (cat.id === selectedCategoryForMebel.id) {
          return {
            ...cat,
            mebellar: [...cat.mebellar, newMebel],
          };
        }
        return cat;
      }));
      
      toast({ title: 'Muvaffaqiyat', description: 'Mebel qo\'shildi' });
      setMebelModalOpen(false);
      setNewMebelName('');
      setSelectedTemplate(null);
      setSelectedCategoryForMebel(null);
    } catch (error: any) {
      console.error('Failed to create furniture type:', error);
      toast({
        title: 'Xatolik',
        description: error?.response?.data?.message || 'Mebel qo\'shishda xatolik',
        variant: 'destructive',
      });
    } finally {
      setSavingMebel(false);
    }
  };

  // Add new detail to mebel
  const handleAddDetail = (catIndex: number, mebelIndex: number, detailName: string) => {
    if (!detailName.trim()) return;
    
    setOrderCategories(prev => prev.map((cat, ci) => {
      if (ci !== catIndex) return cat;
      return {
        ...cat,
        mebellar: cat.mebellar.map((mebel, mi) => {
          if (mi !== mebelIndex) return mebel;
          
          const existingDetail = mebel.details.find(d => d.name === detailName);
          if (existingDetail) {
            toast({ title: 'Bu detal allaqachon mavjud', variant: 'destructive' });
            return mebel;
          }
          
          return {
            ...mebel,
            details: [
              ...mebel.details,
              {
                name: detailName,
                dimensions: [{ width: 0, height: 0, thickness: 18, isNew: true }],
                materials: [],
                notes: '',
                steps: 2,
                isNew: true,
              },
            ],
            detailsCount: mebel.detailsCount + 1,
            dimensionsCount: mebel.dimensionsCount + 1,
          };
        }),
      };
    }));
  };

  // Add dimension row to detail
  const handleAddDimension = (catIndex: number, mebelIndex: number, detailIndex: number) => {
    setOrderCategories(prev => prev.map((cat, ci) => {
      if (ci !== catIndex) return cat;
      return {
        ...cat,
        mebellar: cat.mebellar.map((mebel, mi) => {
          if (mi !== mebelIndex) return mebel;
          return {
            ...mebel,
            details: mebel.details.map((det, di) => {
              if (di !== detailIndex) return det;
              return {
                ...det,
                dimensions: [...det.dimensions, { width: 0, height: 0, thickness: 18, isNew: true }],
              };
            }),
            dimensionsCount: mebel.dimensionsCount + 1,
          };
        }),
      };
    }));
  };

  // Update dimension
  const handleUpdateDimension = (
    catIndex: number,
    mebelIndex: number,
    detailIndex: number, 
    dimIndex: number, 
    field: keyof DimensionRow, 
    value: number
  ) => {
    setOrderCategories(prev => prev.map((cat, ci) => {
      if (ci !== catIndex) return cat;
      return {
        ...cat,
        mebellar: cat.mebellar.map((mebel, mi) => {
          if (mi !== mebelIndex) return mebel;
          return {
            ...mebel,
            details: mebel.details.map((det, di) => {
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
        }),
      };
    }));
  };

  // Remove dimension
  const handleRemoveDimension = (catIndex: number, mebelIndex: number, detailIndex: number, dimIndex: number) => {
    setOrderCategories(prev => prev.map((cat, ci) => {
      if (ci !== catIndex) return cat;
      return {
        ...cat,
        mebellar: cat.mebellar.map((mebel, mi) => {
          if (mi !== mebelIndex) return mebel;
          const detail = mebel.details[detailIndex];
          if (detail.dimensions.length <= 1) {
            return {
              ...mebel,
              details: mebel.details.filter((_, di) => di !== detailIndex),
              detailsCount: mebel.detailsCount - 1,
              dimensionsCount: mebel.dimensionsCount - 1,
            };
          }
          return {
            ...mebel,
            details: mebel.details.map((det, di) => {
              if (di !== detailIndex) return det;
              return {
                ...det,
                dimensions: det.dimensions.filter((_, dmi) => dmi !== dimIndex),
              };
            }),
            dimensionsCount: mebel.dimensionsCount - 1,
          };
        }),
      };
    }));
  };

  // Toggle material
  const handleToggleMaterial = (catIndex: number, mebelIndex: number, detailIndex: number, material: string) => {
    setOrderCategories(prev => prev.map((cat, ci) => {
      if (ci !== catIndex) return cat;
      return {
        ...cat,
        mebellar: cat.mebellar.map((mebel, mi) => {
          if (mi !== mebelIndex) return mebel;
          return {
            ...mebel,
            details: mebel.details.map((det, di) => {
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
        }),
      };
    }));
  };

  // Update notes
  const handleUpdateNotes = (catIndex: number, mebelIndex: number, detailIndex: number, notes: string) => {
    setOrderCategories(prev => prev.map((cat, ci) => {
      if (ci !== catIndex) return cat;
      return {
        ...cat,
        mebellar: cat.mebellar.map((mebel, mi) => {
          if (mi !== mebelIndex) return mebel;
          return {
            ...mebel,
            details: mebel.details.map((det, di) => {
              if (di !== detailIndex) return det;
              return { ...det, notes };
            }),
          };
        }),
      };
    }));
  };

  // Save detail to backend
  const handleSaveDetail = async (catIndex: number, mebelIndex: number, detailIndex: number) => {
    const mebel = orderCategories[catIndex]?.mebellar[mebelIndex];
    if (!mebel) return;
    const detail = mebel.details[detailIndex];

    for (const dim of detail.dimensions) {
      if (dim.width <= 0 || dim.height <= 0 || dim.thickness <= 0) {
        toast({ title: 'Xatolik', description: 'Barcha o\'lchamlarni to\'ldiring', variant: 'destructive' });
        return;
      }
    }

    try {
      const savedDimensions: DimensionRow[] = [];
      
      for (const dim of detail.dimensions) {
        if (dim.isNew || !dim.id) {
          const created = await constructorService.createDetail({
            furnitureTypeId: mebel.id,
            name: detail.name,
            material: detail.materials.join(', ') || 'Noma\'lum',
            width: dim.width,
            height: dim.height,
            thickness: dim.thickness,
            quantity: 1,
            notes: detail.notes,
          });
          savedDimensions.push({
            id: created.id,
            width: dim.width,
            height: dim.height,
            thickness: dim.thickness,
            isNew: false,
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
          savedDimensions.push({
            id: dim.id,
            width: dim.width,
            height: dim.height,
            thickness: dim.thickness,
            isNew: false,
          });
        }
      }

      // Optimistic UI update - mark dimensions as saved (not new)
      setOrderCategories(prev => prev.map((cat, ci) => {
        if (ci !== catIndex) return cat;
        return {
          ...cat,
          mebellar: cat.mebellar.map((m, mi) => {
            if (mi !== mebelIndex) return m;
            return {
              ...m,
              details: m.details.map((d, di) => {
                if (di !== detailIndex) return d;
                return {
                  ...d,
                  dimensions: savedDimensions,
                  isNew: false,
                };
              }),
            };
          }),
        };
      }));

      toast({ title: 'Saqlandi', description: 'Detal muvaffaqiyatli saqlandi' });
    } catch (error: any) {
      toast({
        title: 'Xatolik',
        description: error?.response?.data?.message || 'Saqlashda xatolik',
        variant: 'destructive',
      });
    }
  };

  // Delete mebel (furniture type)
  const handleDeleteMebel = async () => {
    if (!deleteTarget || deleteTarget.type !== 'mebel') return;
    setDeleting(true);
    try {
      await constructorService.deleteFurnitureType(deleteTarget.id);
      toast({ title: 'O\'chirildi', description: 'Mebel o\'chirildi' });
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

  // Complete order
  const handleCompleteOrder = async () => {
    for (const cat of orderCategories) {
      for (const mebel of cat.mebellar) {
        try {
          const detailsPayload = mebel.details.flatMap(detail => 
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

          const allNotes = mebel.details
            .map(d => d.notes)
            .filter(Boolean)
            .join('\n') || 'Texnik xususiyatlar';

          await constructorService.completeFurnitureTypeWithData(mebel.id, {
            details: detailsPayload,
            notes: allNotes,
          });
        } catch (error) {
          console.error('Failed to complete mebel:', mebel.id, error);
          toast({
            title: 'Xatolik',
            description: `Mebel ${mebel.name} ni saqlashda xatolik`,
            variant: 'destructive',
          });
          return;
        }
      }
    }
    toast({ title: 'Muvaffaqiyat', description: 'Razmerlar tayyor!' });
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
  const totalMebellar = orderCategories.reduce((acc, c) => acc + c.mebellar.length, 0);
  const totalDetails = orderCategories.reduce((acc, c) => 
    acc + c.mebellar.reduce((a, m) => a + m.detailsCount, 0), 0);
  const totalDimensions = orderCategories.reduce((acc, c) => 
    acc + c.mebellar.reduce((a, m) => a + m.dimensionsCount, 0), 0);

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
              {orderCategories.length} kategoriya • {totalMebellar} mebel • {totalDetails} detal • {totalDimensions} razmer
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
                <p className="font-medium">{order.customerName || 'Noma\'lum'}</p>
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
                  <Sofa className="h-3 w-3 inline mr-1" /> {totalMebellar} mebel
                </span>
                <span className="text-sm text-muted-foreground">
                  <Layers className="h-3 w-3 inline mr-1" /> {totalDetails} detal
                </span>
                <span className="text-sm text-muted-foreground">
                  <Tag className="h-3 w-3 inline mr-1" /> {totalDimensions} razmer
                </span>
              </div>
            </div>

            {/* Category List - loaded from order */}
            <div className="space-y-3">
              {orderCategories.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Layers className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Bu buyurtmada kategoriya yo'q</p>
                  <p className="text-xs mt-1">Kategoriyalar shartnoma orqali belgilanadi</p>
                </div>
              ) : (
                orderCategories.map((category, catIndex) => (
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
                                <Sofa className="h-3 w-3 mr-1" /> {category.mebellar.length} mebel
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="default" 
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenMebelModal(category);
                                }}
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Mebel
                              </Button>
                              <ChevronDown className={`h-4 w-4 transition-transform ${category.isOpen ? 'rotate-180' : ''}`} />
                            </div>
                          </div>
                        </CardContent>
                      </CollapsibleTrigger>

                      <CollapsibleContent>
                        <div className="border-t p-4 space-y-3 bg-muted/20">
                          {category.mebellar.length === 0 ? (
                            <div className="text-center py-4 text-muted-foreground">
                              <Sofa className="h-8 w-8 mx-auto mb-2 opacity-50" />
                              <p className="text-sm">Hali mebel qo'shilmagan</p>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="mt-2"
                                onClick={() => handleOpenMebelModal(category)}
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Mebel qo'shish
                              </Button>
                            </div>
                          ) : (
                            category.mebellar.map((mebel, mebelIndex) => (
                              <Collapsible
                                key={mebel.id}
                                open={mebel.isOpen}
                                onOpenChange={() => toggleMebel(catIndex, mebelIndex)}
                              >
                                <Card className="border-2 border-dashed">
                                  <CollapsibleTrigger asChild>
                                    <CardContent className="p-3 cursor-pointer hover:bg-muted/30 transition-colors">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                          <Sofa className="h-4 w-4 text-primary" />
                                          <span className="font-medium">{mebel.name}</span>
                                          <Badge variant="secondary" className="text-xs">
                                            {mebel.detailsCount} detal
                                          </Badge>
                                          <Badge variant="secondary" className="text-xs">
                                            {mebel.dimensionsCount} razmer
                                          </Badge>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Button 
                                            variant="ghost" 
                                            size="icon"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setDeleteTarget({ type: 'mebel', id: mebel.id });
                                              setDeleteModalOpen(true);
                                            }}
                                          >
                                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                                          </Button>
                                          <ChevronDown className={`h-4 w-4 transition-transform ${mebel.isOpen ? 'rotate-180' : ''}`} />
                                        </div>
                                      </div>
                                    </CardContent>
                                  </CollapsibleTrigger>

                                  <CollapsibleContent>
                                    <div className="border-t p-4 space-y-4 bg-background">
                                      {/* Add Detail Section */}
                                      <div className="space-y-2">
                                        <Label className="text-sm font-medium">Detal qo'shish</Label>
                                        <div className="flex gap-2">
                                          <Select onValueChange={(v) => handleAddDetail(catIndex, mebelIndex, v)}>
                                            <SelectTrigger className="flex-1">
                                              <SelectValue placeholder="Detal nomini tanlang..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {DETAIL_NAMES.filter(n => !mebel.details.some(d => d.name === n)).map(name => (
                                                <SelectItem key={name} value={name}>{name}</SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                          <Button variant="default" onClick={() => {
                                            const customName = prompt('Yangi detal nomi:');
                                            if (customName) handleAddDetail(catIndex, mebelIndex, customName);
                                          }}>
                                            <Plus className="h-4 w-4 mr-1" />
                                            Yangi
                                          </Button>
                                        </div>
                                      </div>

                                      {/* Details List */}
                                      {mebel.details.map((detail, detIndex) => (
                                        <Card key={`${detail.name}-${detIndex}`} className="border">
                                          <CardContent className="p-4 space-y-4">
                                            {/* Detail Header */}
                                            <div className="flex items-center justify-between">
                                              <div className="flex items-center gap-2">
                                                <span className="h-5 w-5 rounded bg-muted text-muted-foreground text-xs font-medium flex items-center justify-center">
                                                  {detIndex + 1}
                                                </span>
                                                <span className="font-medium">{detail.name}</span>
                                                <span className="text-sm text-muted-foreground">{detail.dimensions.length} razmer</span>
                                              </div>
                                              <div className="flex items-center gap-2">
                                                <Button
                                                  variant="default"
                                                  size="sm"
                                                  onClick={() => handleSaveDetail(catIndex, mebelIndex, detIndex)}
                                                >
                                                  <Check className="h-4 w-4 mr-1" />
                                                  Saqlash
                                                </Button>
                                                <Button
                                                  variant="ghost"
                                                  size="icon"
                                                  onClick={() => {
                                                    setOrderCategories(prev => prev.map((cat, ci) => {
                                                      if (ci !== catIndex) return cat;
                                                      return {
                                                        ...cat,
                                                        mebellar: cat.mebellar.map((m, mi) => {
                                                          if (mi !== mebelIndex) return m;
                                                          return {
                                                            ...m,
                                                            details: m.details.filter((_, di) => di !== detIndex),
                                                            detailsCount: m.detailsCount - 1,
                                                            dimensionsCount: m.dimensionsCount - detail.dimensions.length,
                                                          };
                                                        }),
                                                      };
                                                    }));
                                                  }}
                                                >
                                                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                                                </Button>
                                              </div>
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
                                                    onChange={(e) => handleUpdateDimension(catIndex, mebelIndex, detIndex, dimIndex, 'width', Number(e.target.value))}
                                                    placeholder="Eni"
                                                    className="w-24 h-8 text-sm"
                                                  />
                                                  <span className="text-muted-foreground">x</span>
                                                  <Input
                                                    type="number"
                                                    value={dim.height || ''}
                                                    onChange={(e) => handleUpdateDimension(catIndex, mebelIndex, detIndex, dimIndex, 'height', Number(e.target.value))}
                                                    placeholder="Bo'yi"
                                                    className="w-24 h-8 text-sm"
                                                  />
                                                  <span className="text-muted-foreground">x</span>
                                                  <Input
                                                    type="number"
                                                    value={dim.thickness || ''}
                                                    onChange={(e) => handleUpdateDimension(catIndex, mebelIndex, detIndex, dimIndex, 'thickness', Number(e.target.value))}
                                                    placeholder="Qalinligi"
                                                    className="w-20 h-8 text-sm"
                                                  />
                                                  <span className="text-xs text-muted-foreground">mm</span>
                                                  <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => handleRemoveDimension(catIndex, mebelIndex, detIndex, dimIndex)}
                                                  >
                                                    <X className="h-4 w-4 text-muted-foreground" />
                                                  </Button>
                                                </div>
                                              ))}
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleAddDimension(catIndex, mebelIndex, detIndex)}
                                              >
                                                <Plus className="h-4 w-4 mr-1" />
                                                Razmer qo'shish
                                              </Button>
                                            </div>

                                            {/* Materials */}
                                            <div className="space-y-2">
                                              <Label className="text-xs text-muted-foreground uppercase">Materiallar</Label>
                                              <div className="flex flex-wrap gap-2">
                                                {AVAILABLE_MATERIALS.map((mat) => (
                                                  <Badge
                                                    key={mat}
                                                    variant={detail.materials.includes(mat) ? 'default' : 'outline'}
                                                    className="cursor-pointer"
                                                    onClick={() => handleToggleMaterial(catIndex, mebelIndex, detIndex, mat)}
                                                  >
                                                    {mat}
                                                  </Badge>
                                                ))}
                                              </div>
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
          <Button onClick={handleCompleteOrder} className="bg-success hover:bg-success/90">
            <Check className="h-4 w-4 mr-2" />
            Razmer tayyor
          </Button>
        </div>
      </div>

      {/* Add Mebel Modal */}
      <Dialog open={mebelModalOpen} onOpenChange={setMebelModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              Yangi mebel qo'shish
              {selectedCategoryForMebel && (
                <span className="text-muted-foreground font-normal ml-2">
                  ({selectedCategoryForMebel.name})
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Template Selection */}
            {templatesLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground py-4">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <span className="text-sm">Shablonlar yuklanmoqda...</span>
              </div>
            ) : availableTemplates.length > 0 ? (
              <div className="space-y-3">
                <Label className="text-sm">Shablon tanlang (ixtiyoriy)</Label>
                <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto">
                  {availableTemplates.map((template) => (
                    <div
                      key={template.id}
                      onClick={() => handleSelectTemplate(template)}
                      className={`p-3 border rounded-lg cursor-pointer transition-all hover:border-primary/50 ${
                        selectedTemplate?.id === template.id
                          ? 'border-primary bg-primary/5 ring-1 ring-primary'
                          : 'hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{template.name}</p>
                          {template.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {template.description}
                            </p>
                          )}
                        </div>
                        {selectedTemplate?.id === template.id && (
                          <Check className="h-4 w-4 text-primary shrink-0 ml-2" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setSelectedTemplate(null);
                    setNewMebelName('');
                  }}
                >
                  <LayoutTemplate className="h-4 w-4 mr-2" />
                  Shablonsiz yaratish
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 py-2 text-muted-foreground text-sm">
                <LayoutTemplate className="h-4 w-4" />
                <span>Mavjud shablonlar yo'q - qo'lda nom kiriting</span>
              </div>
            )}

            {/* Mebel Name Input */}
            <div>
              <Label>Mebel nomi</Label>
              <Input
                value={newMebelName}
                onChange={(e) => {
                  setNewMebelName(e.target.value);
                  if (selectedTemplate && e.target.value !== selectedTemplate.name) {
                    setSelectedTemplate(null);
                  }
                }}
                placeholder="Masalan: Shkaf-kupe, Krovat, Stol..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMebelModalOpen(false)}>
              Bekor qilish
            </Button>
            <Button onClick={handleAddMebel} disabled={savingMebel || !newMebelName.trim()}>
              {savingMebel ? 'Saqlanmoqda...' : 'Qo\'shish'}
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
              Bu amalni qaytarib bo'lmaydi. Barcha detallar ham o'chiriladi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteMebel} disabled={deleting}>
              {deleting ? "O'chirilmoqda..." : "O'chirish"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
