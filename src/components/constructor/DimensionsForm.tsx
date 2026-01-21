import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { constructorService } from '@/services/constructorService';
import { Detail } from '@/types/constructor';
import { Plus, Save, Trash2, Loader2 } from 'lucide-react';

interface DimensionsFormProps {
  furnitureTypeId: number;
  onSave: () => void;
  disabled?: boolean;
}

interface DimensionRow {
  id?: number;
  name: string;
  material: string;
  width: number;
  height: number;
  depth: number;
  quantity: number;
  unit: string;
  isNew?: boolean;
  isEditing?: boolean;
}

const UNITS = ['mm', 'cm', 'm', 'dona'];
const MATERIALS = ['MDF', 'DSP', 'Yog\'och', 'Metall', 'Shisha', 'Plastik'];

export const DimensionsForm: React.FC<DimensionsFormProps> = ({
  furnitureTypeId,
  onSave,
  disabled = false,
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [details, setDetails] = useState<DimensionRow[]>([]);

  useEffect(() => {
    loadDetails();
  }, [furnitureTypeId]);

  const loadDetails = async () => {
    setLoading(true);
    try {
      const data = await constructorService.getDetailsByFurnitureType(furnitureTypeId);
      setDetails(
        data.map((d) => ({
          id: d.id,
          name: d.name,
          material: d.material,
          width: d.width,
          height: d.height,
          depth: d.depth,
          quantity: d.quantity,
          unit: d.unit,
        }))
      );
    } catch (error) {
      console.error('Failed to load details:', error);
    } finally {
      setLoading(false);
    }
  };

  const addNewRow = () => {
    setDetails([
      ...details,
      {
        name: '',
        material: 'MDF',
        width: 0,
        height: 0,
        depth: 0,
        quantity: 1,
        unit: 'mm',
        isNew: true,
        isEditing: true,
      },
    ]);
  };

  const updateRow = (index: number, field: keyof DimensionRow, value: any) => {
    const updated = [...details];
    updated[index] = { ...updated[index], [field]: value, isEditing: true };
    setDetails(updated);
  };

  const removeRow = async (index: number) => {
    const detail = details[index];
    if (detail.id) {
      try {
        await constructorService.deleteDetail(detail.id);
        toast({
          title: "O'chirildi",
          description: "Detal muvaffaqiyatli o'chirildi",
        });
      } catch (error) {
        toast({
          title: 'Xatolik',
          description: "Detalni o'chirishda xatolik",
          variant: 'destructive',
        });
        return;
      }
    }
    setDetails(details.filter((_, i) => i !== index));
    onSave();
  };

  const saveRow = async (index: number) => {
    const detail = details[index];
    
    // Validation
    if (!detail.name.trim()) {
      toast({
        title: 'Xatolik',
        description: 'Detal nomini kiriting',
        variant: 'destructive',
      });
      return;
    }
    
    if (detail.width <= 0 || detail.height <= 0 || detail.depth <= 0) {
      toast({
        title: 'Xatolik',
        description: "O'lchamlar 0 dan katta bo'lishi kerak",
        variant: 'destructive',
      });
      return;
    }

    if (detail.quantity <= 0) {
      toast({
        title: 'Xatolik',
        description: "Miqdor 0 dan katta bo'lishi kerak",
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      if (detail.isNew || !detail.id) {
        await constructorService.createDetail({
          furnitureTypeId,
          name: detail.name,
          material: detail.material,
          width: detail.width,
          height: detail.height,
          depth: detail.depth,
          quantity: detail.quantity,
          unit: detail.unit,
        });
      } else {
        await constructorService.updateDetail(detail.id, {
          name: detail.name,
          material: detail.material,
          width: detail.width,
          height: detail.height,
          depth: detail.depth,
          quantity: detail.quantity,
          unit: detail.unit,
        });
      }

      toast({
        title: 'Saqlandi',
        description: 'Detal muvaffaqiyatli saqlandi',
      });
      
      await loadDetails();
      onSave();
    } catch (error) {
      toast({
        title: 'Xatolik',
        description: 'Detalni saqlashda xatolik',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {details.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground">
          <p className="mb-4">Hali detallar qo'shilmagan</p>
        </div>
      ) : (
        <div className="space-y-3">
          {details.map((detail, index) => (
            <div
              key={detail.id || `new-${index}`}
              className="p-3 border rounded-lg bg-muted/30 space-y-3"
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="col-span-2">
                  <Label className="text-xs">Nomi</Label>
                  <Input
                    value={detail.name}
                    onChange={(e) => updateRow(index, 'name', e.target.value)}
                    placeholder="Detal nomi"
                    disabled={disabled}
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Material</Label>
                  <Select
                    value={detail.material}
                    onValueChange={(v) => updateRow(index, 'material', v)}
                    disabled={disabled}
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MATERIALS.map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Miqdor</Label>
                  <Input
                    type="number"
                    value={detail.quantity}
                    onChange={(e) => updateRow(index, 'quantity', Number(e.target.value))}
                    min={1}
                    disabled={disabled}
                    className="h-8 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div>
                  <Label className="text-xs">Eni (W)</Label>
                  <Input
                    type="number"
                    value={detail.width}
                    onChange={(e) => updateRow(index, 'width', Number(e.target.value))}
                    min={0}
                    disabled={disabled}
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Bo'yi (H)</Label>
                  <Input
                    type="number"
                    value={detail.height}
                    onChange={(e) => updateRow(index, 'height', Number(e.target.value))}
                    min={0}
                    disabled={disabled}
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Chuqurligi (D)</Label>
                  <Input
                    type="number"
                    value={detail.depth}
                    onChange={(e) => updateRow(index, 'depth', Number(e.target.value))}
                    min={0}
                    disabled={disabled}
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Birlik</Label>
                  <Select
                    value={detail.unit}
                    onValueChange={(v) => updateRow(index, 'unit', v)}
                    disabled={disabled}
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {UNITS.map((u) => (
                        <SelectItem key={u} value={u}>
                          {u}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {!disabled && (
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeRow(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  {detail.isEditing && (
                    <Button
                      size="sm"
                      onClick={() => saveRow(index)}
                      disabled={saving}
                    >
                      {saving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      <span className="ml-1">Saqlash</span>
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!disabled && (
        <Button
          variant="outline"
          size="sm"
          onClick={addNewRow}
          className="w-full"
        >
          <Plus className="mr-2 h-4 w-4" />
          Yangi detal qo'shish
        </Button>
      )}
    </div>
  );
};
