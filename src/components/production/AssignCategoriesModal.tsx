import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Loader2, 
  Package, 
  User, 
  CheckCircle2, 
  AlertCircle,
  Folder
} from 'lucide-react';
import { Order, ProductCategory } from '@/types';
import { TeamLeader, categoryAssignmentService } from '@/services/categoryAssignmentService';
import { categoryService } from '@/services/orderService';
import { notificationService } from '@/services/notificationService';
import { toast } from '@/hooks/use-toast';

interface AssignCategoriesModalProps {
  open: boolean;
  onClose: () => void;
  order: Order | null;
  teamLeaders: TeamLeader[];
  onSuccess: () => void;
}

export const AssignCategoriesModal: React.FC<AssignCategoriesModalProps> = ({
  open,
  onClose,
  order,
  teamLeaders,
  onSuccess,
}) => {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  // Use string | number for categoryIds to handle both types from API
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<(string | number)[]>([]);
  const [selectedTeamLeaderId, setSelectedTeamLeaderId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch categories when modal opens with an order
  useEffect(() => {
    if (open && order) {
      fetchCategories();
    }
    if (!open) {
      // Reset state when modal closes
      setCategories([]);
      setSelectedCategoryIds([]);
      setSelectedTeamLeaderId(null);
    }
  }, [open, order]);

  const fetchCategories = async () => {
    if (!order?.id) return;
    
    setLoadingCategories(true);
    try {
      // Try to get categories from the order object first
      if (order.categories && Array.isArray(order.categories) && order.categories.length > 0) {
        // Filter out already assigned categories
        const unassignedCategories = order.categories.filter(
          cat => !cat.assignedTeamLeaderId
        );
        setCategories(unassignedCategories);
      } else {
        // Fetch from API
        try {
          const data = await categoryService.getByOrderId(order.id);
          // Filter out already assigned categories
          const unassignedCategories = (data || []).filter(
            cat => !cat.assignedTeamLeaderId
          );
          setCategories(unassignedCategories);
        } catch (apiError) {
          console.error('Error fetching categories from API:', apiError);
          setCategories([]);
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  // Get unique key for category (handles both id and categoryId from API)
  const getCategoryKey = (category: ProductCategory): string | number => {
    // API might return categoryId (number) or id (string)
    return (category as any).categoryId ?? category.id;
  };

  const handleCategoryToggle = (categoryKey: string | number) => {
    setSelectedCategoryIds(prev => 
      prev.includes(categoryKey)
        ? prev.filter(id => id !== categoryKey)
        : [...prev, categoryKey]
    );
  };

  const handleSelectAllCategories = () => {
    if (selectedCategoryIds.length === categories.length) {
      setSelectedCategoryIds([]);
    } else {
      setSelectedCategoryIds(categories.map(c => getCategoryKey(c)));
    }
  };

  const handleTeamLeaderSelect = (leaderId: number) => {
    setSelectedTeamLeaderId(prev => prev === leaderId ? null : leaderId);
  };

  const canSubmit = useMemo(() => {
    return selectedCategoryIds.length > 0 && selectedTeamLeaderId !== null && !submitting;
  }, [selectedCategoryIds, selectedTeamLeaderId, submitting]);

  const handleSubmit = async () => {
    if (!canSubmit || !selectedTeamLeaderId) return;

    setSubmitting(true);
    try {
      // Create assignments for each selected category
      const promises = selectedCategoryIds.map(categoryId => {
        // Convert to number for API
        const numericId = typeof categoryId === 'string' ? parseInt(categoryId, 10) : categoryId;
        return categoryAssignmentService.create({
          categoryId: numericId,
          teamLeaderId: selectedTeamLeaderId,
        });
      });

      await Promise.all(promises);

      // Send notification to the Team Leader
      try {
        await notificationService.sendAssignmentNotification(
          selectedTeamLeaderId,
          [order?.orderNumber || 'Buyurtma']
        );
      } catch (notifyError) {
        // Log but don't block the success - notification is non-critical
        console.error('Failed to send notification:', notifyError);
      }

      toast({
        title: 'Muvaffaqiyat',
        description: `${selectedCategoryIds.length} ta kategoriya muvaffaqiyatli tayinlandi`,
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        title: 'Xatolik',
        description: error?.response?.data?.message || 'Kategoriyalarni tayinlashda xatolik yuz berdi',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Folder className="h-5 w-5 text-primary" />
            Kategoriyalarni Tayinlash
          </DialogTitle>
          <DialogDescription>
            Buyurtma kategoriyalarini jamoa rahbariga tayinlang
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden space-y-4">
          {/* Order Info (Read-only) */}
          <div className="p-3 bg-muted rounded-md">
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Buyurtma</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Raqam: </span>
                <span className="font-medium">{order?.orderNumber || '-'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Mijoz: </span>
                <span className="font-medium">{order?.customerName || '-'}</span>
              </div>
            </div>
          </div>

          {/* Categories Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Kategoriyalar *</Label>
              {categories.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleSelectAllCategories}
                  disabled={submitting}
                >
                  {selectedCategoryIds.length === categories.length ? 'Barchasini bekor qilish' : 'Barchasini tanlash'}
                </Button>
              )}
            </div>
            
            <ScrollArea className="h-[120px] border rounded-md p-2">
              {loadingCategories ? (
                <div className="space-y-2">
                  {Array(3).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-full" />
                  ))}
                </div>
              ) : categories.length === 0 ? (
                <div className="h-full flex items-center justify-center text-center p-4">
                  <div>
                    <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Bu buyurtmada tayinlash uchun kategoriyalar yo'q
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {categories.map((category, index) => {
                    const categoryKey = getCategoryKey(category);
                    const categoryName = (category as any).categoryName ?? category.name ?? 'Noma\'lum';
                    const categoryStatus = category.status ?? 'Pending';
                    
                    return (
                      <div 
                        key={`category-${categoryKey}-${index}`}
                        className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors ${
                          selectedCategoryIds.includes(categoryKey) 
                            ? 'bg-primary/10 border border-primary/20' 
                            : 'hover:bg-muted'
                        }`}
                        onClick={() => handleCategoryToggle(categoryKey)}
                      >
                        <Checkbox 
                          checked={selectedCategoryIds.includes(categoryKey)}
                          disabled={submitting}
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{categoryName}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {categoryStatus}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
            {selectedCategoryIds.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {selectedCategoryIds.length} ta kategoriya tanlandi
              </p>
            )}
          </div>

          {/* Team Leader Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Jamoa Rahbari *</Label>
            <ScrollArea className="h-[140px] border rounded-md p-2">
              {teamLeaders.length === 0 ? (
                <div className="h-full flex items-center justify-center text-center p-4">
                  <div>
                    <User className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Jamoa rahbarlari topilmadi
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {teamLeaders.map((leader) => (
                    <div 
                      key={leader.id}
                      className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors ${
                        selectedTeamLeaderId === leader.id 
                          ? 'bg-primary/10 border border-primary/20' 
                          : 'hover:bg-muted'
                      }`}
                      onClick={() => handleTeamLeaderSelect(leader.id)}
                    >
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        selectedTeamLeaderId === leader.id ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      }`}>
                        {selectedTeamLeaderId === leader.id ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <User className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{leader.fullName}</p>
                        <p className="text-xs text-muted-foreground">{leader.department || '-'}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {leader.activeAssignments || 0} aktiv
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleClose} 
            disabled={submitting}
          >
            Bekor qilish
          </Button>
          <Button 
            type="button" 
            onClick={handleSubmit} 
            disabled={!canSubmit}
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Tayinlanmoqda...
              </>
            ) : (
              'Tayinlash'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
