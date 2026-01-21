import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { constructorService } from '@/services/constructorService';
import { TechnicalSpecification } from '@/types/constructor';
import { Save, Loader2, CheckCircle2, Warehouse } from 'lucide-react';

interface MaterialsFormProps {
  furnitureTypeId: number;
  onSave: () => void;
  disabled?: boolean;
}

export const MaterialsForm: React.FC<MaterialsFormProps> = ({
  furnitureTypeId,
  onSave,
  disabled = false,
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [techSpec, setTechSpec] = useState<TechnicalSpecification | null>(null);
  const [formData, setFormData] = useState({
    specifications: '',
    materialList: '',
    assemblyInstructions: '',
    qualityNotes: '',
  });

  useEffect(() => {
    loadTechSpec();
  }, [furnitureTypeId]);

  const loadTechSpec = async () => {
    setLoading(true);
    try {
      const data = await constructorService.getTechnicalSpec(furnitureTypeId);
      if (data) {
        setTechSpec(data);
        setFormData({
          specifications: data.specifications || '',
          materialList: data.materialList || '',
          assemblyInstructions: data.assemblyInstructions || '',
          qualityNotes: data.qualityNotes || '',
        });
      }
    } catch (error) {
      console.error('Failed to load tech spec:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.specifications.trim() || !formData.materialList.trim()) {
      toast({
        title: 'Xatolik',
        description: 'Texnik xususiyatlar va materiallar ro\'yxati talab qilinadi',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      if (techSpec?.id) {
        await constructorService.updateTechnicalSpec(techSpec.id, formData);
      } else {
        await constructorService.createTechnicalSpec({
          furnitureTypeId,
          ...formData,
        });
      }

      toast({
        title: 'Saqlandi',
        description: 'Materiallar muvaffaqiyatli saqlandi',
      });
      
      await loadTechSpec();
      onSave();
    } catch (error) {
      toast({
        title: 'Xatolik',
        description: 'Materiallarni saqlashda xatolik',
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

  const isSentToWarehouse = techSpec?.isComplete;

  return (
    <div className="space-y-4">
      {isSentToWarehouse && (
        <Badge className="bg-success/10 text-success w-full justify-center py-2">
          <Warehouse className="mr-2 h-4 w-4" />
          Omborga yuborilgan
        </Badge>
      )}

      <div>
        <Label className="text-sm font-medium">Texnik xususiyatlar *</Label>
        <Textarea
          value={formData.specifications}
          onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
          placeholder="Mebel texnik xususiyatlarini kiriting..."
          disabled={disabled || isSentToWarehouse}
          className="mt-1.5 min-h-[80px]"
        />
      </div>

      <div>
        <Label className="text-sm font-medium">Materiallar ro'yxati *</Label>
        <Textarea
          value={formData.materialList}
          onChange={(e) => setFormData({ ...formData, materialList: e.target.value })}
          placeholder="Kerakli materiallar ro'yxati..."
          disabled={disabled || isSentToWarehouse}
          className="mt-1.5 min-h-[80px]"
        />
      </div>

      <div>
        <Label className="text-sm font-medium">Yig'ish ko'rsatmalari</Label>
        <Textarea
          value={formData.assemblyInstructions}
          onChange={(e) => setFormData({ ...formData, assemblyInstructions: e.target.value })}
          placeholder="Yig'ish bo'yicha ko'rsatmalar..."
          disabled={disabled || isSentToWarehouse}
          className="mt-1.5 min-h-[60px]"
        />
      </div>

      <div>
        <Label className="text-sm font-medium">Sifat eslatmalari</Label>
        <Textarea
          value={formData.qualityNotes}
          onChange={(e) => setFormData({ ...formData, qualityNotes: e.target.value })}
          placeholder="Sifat nazorati uchun eslatmalar..."
          disabled={disabled || isSentToWarehouse}
          className="mt-1.5 min-h-[60px]"
        />
      </div>

      {!disabled && !isSentToWarehouse && (
        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full"
        >
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Saqlash
        </Button>
      )}

      {techSpec && !isSentToWarehouse && (
        <p className="text-xs text-muted-foreground text-center">
          <CheckCircle2 className="inline h-3 w-3 mr-1 text-success" />
          Oxirgi saqlangan
        </p>
      )}
    </div>
  );
};
