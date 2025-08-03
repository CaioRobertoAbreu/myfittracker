import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AddFoodForm } from "./AddFoodForm";

interface AddFoodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mealName: string;
  onSubmit: (food: {
    foodName: string;
    quantity: string;
    proteinAnimal: number;
    proteinVegetable: number;
    carbs: number;
    fat: number;
  }) => Promise<void>;
}

export const AddFoodDialog = ({ open, onOpenChange, mealName, onSubmit }: AddFoodDialogProps) => {
  const handleSubmit = async (food: {
    foodName: string;
    quantity: string;
    proteinAnimal: number;
    proteinVegetable: number;
    carbs: number;
    fat: number;
  }) => {
    await onSubmit(food);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Adicionar Alimento - {mealName}</DialogTitle>
        </DialogHeader>
        <AddFoodForm 
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};