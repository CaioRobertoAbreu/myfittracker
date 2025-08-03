import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface AddFoodFormProps {
  onSubmit: (food: {
    foodName: string;
    quantity: string;
    protein: number;
    carbs: number;
    fat: number;
  }) => Promise<void>;
  onCancel: () => void;
}

export const AddFoodForm = ({ onSubmit, onCancel }: AddFoodFormProps) => {
  const [formData, setFormData] = useState({
    foodName: "",
    quantity: "",
    protein: "",
    carbs: "",
    fat: "",
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.foodName.trim() || !formData.quantity.trim()) {
      toast({
        title: "Erro",
        description: "Nome do alimento e quantidade são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        foodName: formData.foodName.trim(),
        quantity: formData.quantity.trim(),
        protein: parseFloat(formData.protein) || 0,
        carbs: parseFloat(formData.carbs) || 0,
        fat: parseFloat(formData.fat) || 0,
      });
      
      // Reset form
      setFormData({
        foodName: "",
        quantity: "",
        protein: "",
        carbs: "",
        fat: "",
      });
    } catch (error) {
      console.error("Error adding food:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="foodName">Nome do Alimento *</Label>
          <Input
            id="foodName"
            value={formData.foodName}
            onChange={(e) => handleInputChange("foodName", e.target.value)}
            placeholder="Ex: Peito de frango"
            required
          />
        </div>
        <div>
          <Label htmlFor="quantity">Quantidade *</Label>
          <Input
            id="quantity"
            value={formData.quantity}
            onChange={(e) => handleInputChange("quantity", e.target.value)}
            placeholder="Ex: 200g"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="protein">Proteína (g)</Label>
          <Input
            id="protein"
            type="number"
            step="0.1"
            min="0"
            value={formData.protein}
            onChange={(e) => handleInputChange("protein", e.target.value)}
            placeholder="0"
          />
        </div>
        <div>
          <Label htmlFor="carbs">Carboidratos (g)</Label>
          <Input
            id="carbs"
            type="number"
            step="0.1"
            min="0"
            value={formData.carbs}
            onChange={(e) => handleInputChange("carbs", e.target.value)}
            placeholder="0"
          />
        </div>
        <div>
          <Label htmlFor="fat">Gorduras (g)</Label>
          <Input
            id="fat"
            type="number"
            step="0.1"
            min="0"
            value={formData.fat}
            onChange={(e) => handleInputChange("fat", e.target.value)}
            placeholder="0"
          />
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button 
          type="submit" 
          disabled={loading}
        >
          {loading ? "Adicionando..." : "Adicionar Alimento"}
        </Button>
      </div>
    </form>
  );
};