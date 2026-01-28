import React, { useState, useEffect, useCallback } from 'react';
import { AppHeader } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { useToast } from '@/hooks/use-toast';
import { templateService } from '@/services/templateService';
import { categoryService } from '@/services/categoryService';
import {
  FurnitureTypeTemplate,
  CreateFurnitureTypeTemplateDto,
  UpdateFurnitureTypeTemplateDto,
} from '@/types/template';
import { Category } from '@/types/contract';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  MoreHorizontal,
  Loader2,
  LayoutTemplate,
  Power,
  PowerOff,
  Layers,
} from 'lucide-react';
export const TemplatesPage: React.FC = () => {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<FurnitureTypeTemplate[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Modal states
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<FurnitureTypeTemplate | null>(null);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // Form state
  const [formData, setFormData] = useState<CreateFurnitureTypeTemplateDto>({
    name: '',
    categoryId: 0,
    description: '',
    defaultMaterial: '',
    defaultNotes: '',
    isActive: true,
    displayOrder: 0,
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [templatesData, categoriesData] = await Promise.all([
        templateService.getAll(),
        categoryService.getAll(),
      ]);
      setTemplates(templatesData);
      setCategories(categoriesData);
    } catch (error: any) {
      console.error('Failed to load data:', error);
      toast({
        title: 'Xatolik',
        description: error?.response?.data?.message || 'Ma\'lumotlarni yuklashda xatolik',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const resetForm = () => {
    setFormData({
      name: '',
      categoryId: Number(categories[0]?.id) || 0,
      description: '',
      defaultMaterial: '',
      defaultNotes: '',
      isActive: true,
      displayOrder: 0,
    });
    setSelectedTemplate(null);
  };

  const handleAdd = () => {
    resetForm();
    setFormModalOpen(true);
  };

  const handleEdit = (template: FurnitureTypeTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      categoryId: template.categoryId,
      description: template.description || '',
      defaultMaterial: template.defaultMaterial || '',
      defaultNotes: template.defaultNotes || '',
      isActive: template.isActive,
      displayOrder: template.displayOrder,
    });
    setFormModalOpen(true);
  };

  const handleDelete = (template: FurnitureTypeTemplate) => {
    setSelectedTemplate(template);
    setDeleteModalOpen(true);
  };

  const handleToggleActive = async (template: FurnitureTypeTemplate) => {
    try {
      setActionLoading(template.id);
      await templateService.toggleActive(template.id);
      toast({
        title: 'Muvaffaqiyat',
        description: `Shablon ${template.isActive ? 'o\'chirildi' : 'yoqildi'}`,
      });
      loadData();
    } catch (error: any) {
      toast({
        title: 'Xatolik',
        description: error?.response?.data?.message || 'Statusni o\'zgartirishda xatolik',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast({ title: 'Xatolik', description: 'Nom kiritilishi shart', variant: 'destructive' });
      return;
    }
    if (!formData.categoryId) {
      toast({ title: 'Xatolik', description: 'Kategoriya tanlanishi shart', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      if (selectedTemplate) {
        // Update
        const updateData: UpdateFurnitureTypeTemplateDto = {
          name: formData.name,
          description: formData.description,
          defaultMaterial: formData.defaultMaterial,
          defaultNotes: formData.defaultNotes,
          isActive: formData.isActive ?? true,
          displayOrder: formData.displayOrder ?? 0,
        };
        await templateService.update(selectedTemplate.id, updateData);
        toast({ title: 'Muvaffaqiyat', description: 'Shablon yangilandi' });
      } else {
        // Create
        await templateService.create(formData);
        toast({ title: 'Muvaffaqiyat', description: 'Shablon yaratildi' });
      }
      setFormModalOpen(false);
      resetForm();
      loadData();
    } catch (error: any) {
      toast({
        title: 'Xatolik',
        description: error?.response?.data?.message || 'Saqlashda xatolik',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedTemplate) return;

    try {
      await templateService.delete(selectedTemplate.id);
      toast({ title: 'Muvaffaqiyat', description: 'Shablon o\'chirildi' });
      setDeleteModalOpen(false);
      setSelectedTemplate(null);
      loadData();
    } catch (error: any) {
      toast({
        title: 'Xatolik',
        description: error?.response?.data?.message || 'O\'chirishda xatolik',
        variant: 'destructive',
      });
    }
  };

  // Filter templates
  const filteredTemplates = templates.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.categoryName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || t.categoryId === Number(filterCategory);
    return matchesSearch && matchesCategory;
  });

  // Group by category for display
  const groupedTemplates = filteredTemplates.reduce(
    (acc, t) => {
      const key = t.categoryName || `Kategoriya ${t.categoryId}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(t);
      return acc;
    },
    {} as Record<string, FurnitureTypeTemplate[]>
  );

  const stats = {
    total: templates.length,
    active: templates.filter((t) => t.isActive).length,
    inactive: templates.filter((t) => !t.isActive).length,
    categories: [...new Set(templates.map((t) => t.categoryId))].length,
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader title="Shablon boshqaruvi" description="Mebel turi shablonlarini boshqaring" />

      <div className="p-6 space-y-6 animate-fade-in">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card className="border border-border/50">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Jami shablonlar</p>
                  <p className="text-3xl font-bold">{stats.total}</p>
                </div>
                <div className="p-3 rounded-xl bg-primary/10">
                  <LayoutTemplate className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-border/50">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Faol</p>
                  <p className="text-3xl font-bold text-success">{stats.active}</p>
                </div>
                <div className="p-3 rounded-xl bg-success/10">
                  <Power className="h-6 w-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-border/50">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Nofaol</p>
                  <p className="text-3xl font-bold text-muted-foreground">{stats.inactive}</p>
                </div>
                <div className="p-3 rounded-xl bg-muted">
                  <PowerOff className="h-6 w-6 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-border/50">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Kategoriyalar</p>
                  <p className="text-3xl font-bold text-info">{stats.categories}</p>
                </div>
                <div className="p-3 rounded-xl bg-info/10">
                  <Layers className="h-6 w-6 text-info" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-2 flex-1 max-w-lg">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Shablon qidirish..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Kategoriya" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Barchasi</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={String(cat.id)}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Yangi shablon
          </Button>
        </div>

        {/* Templates Table */}
        <Card className="border border-border/50">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Barcha shablonlar</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <LayoutTemplate className="h-12 w-12 mb-4 opacity-50" />
                <p>Shablonlar topilmadi</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nomi</TableHead>
                    <TableHead>Kategoriya</TableHead>
                    <TableHead>Material</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tartib</TableHead>
                    <TableHead className="w-[80px]">Amallar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTemplates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell className="font-medium">
                        <div>
                          <p>{template.name}</p>
                          {template.description && (
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {template.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{template.categoryName}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {template.defaultMaterial || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={template.isActive ? 'default' : 'secondary'}>
                          {template.isActive ? 'Faol' : 'Nofaol'}
                        </Badge>
                      </TableCell>
                      <TableCell>{template.displayOrder}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={actionLoading === template.id}
                            >
                              {actionLoading === template.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <MoreHorizontal className="h-4 w-4" />
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(template)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Tahrirlash
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleActive(template)}>
                              {template.isActive ? (
                                <>
                                  <PowerOff className="mr-2 h-4 w-4" />
                                  O'chirish
                                </>
                              ) : (
                                <>
                                  <Power className="mr-2 h-4 w-4" />
                                  Yoqish
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(template)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              O'chirish
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={formModalOpen} onOpenChange={setFormModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {selectedTemplate ? 'Shablonni tahrirlash' : 'Yangi shablon yaratish'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nomi *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Masalan: 2 eshikli shkaf"
                maxLength={200}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoryId">Kategoriya *</Label>
              <Select
                value={String(formData.categoryId)}
                onValueChange={(val) =>
                  setFormData((prev) => ({ ...prev, categoryId: Number(val) }))
                }
                disabled={!!selectedTemplate}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kategoriya tanlang" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedTemplate && (
                <p className="text-xs text-muted-foreground">
                  Kategoriya o'zgartirib bo'lmaydi
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Tavsif</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Shablon haqida qisqacha ma'lumot"
                maxLength={1000}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="defaultMaterial">Standart material</Label>
              <Input
                id="defaultMaterial"
                value={formData.defaultMaterial}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, defaultMaterial: e.target.value }))
                }
                placeholder="Masalan: LDSP 18mm"
                maxLength={200}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="defaultNotes">Standart izohlar</Label>
              <Textarea
                id="defaultNotes"
                value={formData.defaultNotes}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, defaultNotes: e.target.value }))
                }
                placeholder="Standart hinges, handles va h.k."
                maxLength={2000}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="displayOrder">Tartib raqami</Label>
                <Input
                  id="displayOrder"
                  type="number"
                  min={0}
                  value={formData.displayOrder}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, displayOrder: Number(e.target.value) }))
                  }
                />
              </div>

              <div className="flex items-center space-x-2 pt-6">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, isActive: checked }))
                  }
                />
                <Label htmlFor="isActive">Faol</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormModalOpen(false)}>
              Bekor qilish
            </Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {selectedTemplate ? 'Saqlash' : 'Yaratish'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Shablonni o'chirish</AlertDialogTitle>
            <AlertDialogDescription>
              "{selectedTemplate?.name}" shablonini o'chirishni xohlaysizmi? Bu amalni qaytarib
              bo'lmaydi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              O'chirish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
