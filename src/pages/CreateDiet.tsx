import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { dietService } from "@/services/dietService";
import { CreateDietRequest } from "@/types/diet";

interface DietFood {
  foodName: string;
  quantity: string;
  proteinAnimal: number;
  proteinVegetable: number;
  carbs: number;
  fat: number;
}

interface DietMealForm {
  name: string;
  orderNumber: number;
  foods: DietFood[];
}

const CreateDiet = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [meals, setMeals] = useState<DietMealForm[]>([
    { name: "Café da Manhã", orderNumber: 1, foods: [] }
  ]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const addMeal = () => {
    const newMeal: DietMealForm = {
      name: "",
      orderNumber: meals.length + 1,
      foods: []
    };
    setMeals([...meals, newMeal]);
  };

  const removeMeal = (index: number) => {
    if (meals.length > 1) {
      const newMeals = meals.filter((_, i) => i !== index);
      // Reorder the remaining meals
      newMeals.forEach((meal, i) => {
        meal.orderNumber = i + 1;
      });
      setMeals(newMeals);
    }
  };

  const updateMeal = (index: number, field: keyof DietMealForm, value: any) => {
    const newMeals = [...meals];
    newMeals[index] = { ...newMeals[index], [field]: value };
    setMeals(newMeals);
  };

  const addFood = (mealIndex: number) => {
    const newFood: DietFood = {
      foodName: "",
      quantity: "",
      proteinAnimal: 0,
      proteinVegetable: 0,
      carbs: 0,
      fat: 0
    };
    const newMeals = [...meals];
    newMeals[mealIndex].foods.push(newFood);
    setMeals(newMeals);
  };

  const removeFood = (mealIndex: number, foodIndex: number) => {
    const newMeals = [...meals];
    newMeals[mealIndex].foods = newMeals[mealIndex].foods.filter((_, i) => i !== foodIndex);
    setMeals(newMeals);
  };

  const updateFood = (mealIndex: number, foodIndex: number, field: keyof DietFood, value: any) => {
    const newMeals = [...meals];
    newMeals[mealIndex].foods[foodIndex] = {
      ...newMeals[mealIndex].foods[foodIndex],
      [field]: value
    };
    setMeals(newMeals);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({
        title: "Erro",
        description: "Nome da dieta é obrigatório",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const request: CreateDietRequest = {
        name: name.trim(),
        description: description.trim() || undefined,
        meals: meals.map(meal => ({
          name: meal.name,
          orderNumber: meal.orderNumber,
          foods: meal.foods.filter(food => food.foodName.trim() !== "")
        }))
      };

      await dietService.createDiet(request);
      toast({
        title: "Sucesso",
        description: "Dieta criada com sucesso",
      });
      navigate("/dietas");
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar dieta",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/dietas")}
            className="p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Nova Dieta</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Nome da Dieta *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Dieta Low Fat Masculina"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descrição opcional da dieta"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Refeições</CardTitle>
                <Button type="button" onClick={addMeal} size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Refeição
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {meals.map((meal, mealIndex) => (
                <Card key={mealIndex} className="mb-4">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <Input
                          value={meal.name}
                          onChange={(e) => updateMeal(mealIndex, "name", e.target.value)}
                          placeholder="Nome da refeição"
                          className="font-medium"
                        />
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          type="button"
                          onClick={() => addFood(mealIndex)}
                          size="sm"
                          variant="outline"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        {meals.length > 1 && (
                          <Button
                            type="button"
                            onClick={() => removeMeal(mealIndex)}
                            size="sm"
                            variant="destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {meal.foods.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">
                        Nenhum alimento adicionado
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {meal.foods.map((food, foodIndex) => (
                          <div key={foodIndex} className="grid grid-cols-7 gap-2 items-center p-3 border rounded">
                            <Input
                              placeholder="Alimento"
                              value={food.foodName}
                              onChange={(e) => updateFood(mealIndex, foodIndex, "foodName", e.target.value)}
                            />
                            <Input
                              placeholder="Qtd"
                              value={food.quantity}
                              onChange={(e) => updateFood(mealIndex, foodIndex, "quantity", e.target.value)}
                            />
                            <Input
                              type="number"
                              step="0.1"
                              placeholder="Ptn (A)"
                              value={food.proteinAnimal}
                              onChange={(e) => updateFood(mealIndex, foodIndex, "proteinAnimal", Number(e.target.value) || 0)}
                            />
                            <Input
                              type="number"
                              step="0.1"
                              placeholder="Ptn (V)"
                              value={food.proteinVegetable}
                              onChange={(e) => updateFood(mealIndex, foodIndex, "proteinVegetable", Number(e.target.value) || 0)}
                            />
                            <Input
                              type="number"
                              step="0.1"
                              placeholder="Carb"
                              value={food.carbs}
                              onChange={(e) => updateFood(mealIndex, foodIndex, "carbs", Number(e.target.value) || 0)}
                            />
                            <Input
                              type="number"
                              step="0.1"
                              placeholder="Fat"
                              value={food.fat}
                              onChange={(e) => updateFood(mealIndex, foodIndex, "fat", Number(e.target.value) || 0)}
                            />
                            <Button
                              type="button"
                              onClick={() => removeFood(mealIndex, foodIndex)}
                              size="sm"
                              variant="destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/dietas")}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Criando..." : "Criar Dieta"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateDiet;