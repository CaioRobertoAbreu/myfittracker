import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import { ArrowLeft, Plus, Trash2, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { dietService } from "@/services/dietService";
import { UpdateDietRequest } from "@/types/diet";
import { cn } from "@/lib/utils";

interface DietFood {
  foodName: string;
  quantity: string;
  protein: number;
  carbs: number;
  fat: number;
}

interface DietMealForm {
  name: string;
  orderNumber: number;
  foods: DietFood[];
}

const EditDiet = () => {
  const { dietId } = useParams<{ dietId: string }>();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [meals, setMeals] = useState<DietMealForm[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (dietId) {
      loadDiet();
    }
  }, [dietId]);

  const loadDiet = async () => {
    if (!dietId) return;

    try {
      const diet = await dietService.getDietById(dietId);
      if (!diet) {
        toast({
          title: "Erro",
          description: "Dieta não encontrada",
          variant: "destructive",
        });
        navigate("/dietas");
        return;
      }

      setName(diet.name);
      setDescription(diet.description || "");
      setStartDate(diet.startDate ? new Date(diet.startDate) : undefined);
      setMeals(diet.meals.map(meal => ({
        name: meal.name,
        orderNumber: meal.orderNumber,
        foods: meal.foods.map(food => ({
          foodName: food.foodName,
          quantity: food.quantity,
          protein: food.protein,
          carbs: food.carbs,
          fat: food.fat,
        }))
      })));
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar dieta",
        variant: "destructive",
      });
    } finally {
      setInitialLoading(false);
    }
  };

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
      protein: "" as any,
      carbs: "" as any,
      fat: "" as any
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
    if (!name.trim() || !dietId) {
      toast({
        title: "Erro",
        description: "Nome da dieta é obrigatório",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const request: UpdateDietRequest = {
        id: dietId,
        name: name.trim(),
        description: description.trim() || undefined,
        startDate: startDate ? format(startDate, "yyyy-MM-dd") : undefined,
        meals: meals.map(meal => ({
          name: meal.name,
          orderNumber: meal.orderNumber,
          foods: meal.foods
            .filter(food => food.foodName.trim() !== "")
            .map(food => ({
              foodName: food.foodName.trim(),
              quantity: food.quantity.trim(),
              protein: Number(food.protein) || 0,
              carbs: Number(food.carbs) || 0,
              fat: Number(food.fat) || 0,
            }))
        }))
      };

      await dietService.updateDiet(request);
      toast({
        title: "Sucesso",
        description: "Dieta atualizada com sucesso",
      });
      navigate("/dietas");
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar dieta",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-8">Carregando...</div>
        </div>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold">Editar Dieta</h1>
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
              <div>
                <Label htmlFor="startDate">Data de Início</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "dd/MM/yyyy") : <span>Selecionar data</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
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
                        <div className="grid grid-cols-6 gap-2 text-xs font-medium text-muted-foreground mb-2 px-3">
                          <span>Alimento</span>
                          <span>Quantidade</span>
                          <span>Proteína (g)</span>
                          <span>Carboidratos g</span>
                          <span>Gorduras g</span>
                          <span></span>
                        </div>
                        {meal.foods.map((food, foodIndex) => (
                          <div key={foodIndex} className="grid grid-cols-6 gap-2 items-center p-3 border rounded">
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
                              placeholder="0"
                              value={food.protein}
                              onChange={(e) => updateFood(mealIndex, foodIndex, "protein", e.target.value === "" ? "" : Number(e.target.value) || 0)}
                            />
                            <Input
                              type="number"
                              step="0.1"
                              placeholder="0"
                              value={food.carbs}
                              onChange={(e) => updateFood(mealIndex, foodIndex, "carbs", e.target.value === "" ? "" : Number(e.target.value) || 0)}
                            />
                            <Input
                              type="number"
                              step="0.1"
                              placeholder="0"
                              value={food.fat}
                              onChange={(e) => updateFood(mealIndex, foodIndex, "fat", e.target.value === "" ? "" : Number(e.target.value) || 0)}
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
                        
                        {/* Resumo nutricional da refeição */}
                        {meal.foods.length > 0 && (
                          <div className="mt-3 p-3 bg-muted/50 rounded border-t">
                            <div className="text-sm font-medium mb-2">Resumo da Refeição:</div>
                            <div className="grid grid-cols-4 gap-4 text-xs">
                              <div>
                                <span className="text-muted-foreground">Proteína: </span>
                                <span className="font-medium">
                                  {(meal.foods.reduce((sum, food) => sum + (Number(food.protein) || 0), 0)).toFixed(1)}g
                                </span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Carboidratos: </span>
                                <span className="font-medium">
                                  {(meal.foods.reduce((sum, food) => sum + (Number(food.carbs) || 0), 0)).toFixed(1)}g
                                </span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Gorduras: </span>
                                <span className="font-medium">
                                  {(meal.foods.reduce((sum, food) => sum + (Number(food.fat) || 0), 0)).toFixed(1)}g
                                </span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Calorias: </span>
                                <span className="font-medium">
                                  {Math.round(
                                    meal.foods.reduce((sum, food) => 
                                      sum + (((Number(food.protein) || 0) + (Number(food.carbs) || 0)) * 4) + ((Number(food.fat) || 0) * 9), 0
                                    )
                                  )} kcal
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          {/* Resumo nutricional total */}
          {meals.some(meal => meal.foods.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle>Resumo Nutricional Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-primary/10 rounded">
                    <div className="text-2xl font-bold text-primary">
                      {Math.round(
                        meals.reduce((mealSum, meal) =>
                          mealSum + meal.foods.reduce((foodSum, food) =>
                            foodSum + (((Number(food.protein) || 0) + (Number(food.carbs) || 0)) * 4) + ((Number(food.fat) || 0) * 9), 0
                          ), 0
                        )
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">Calorias</div>
                  </div>
                  <div className="text-center p-4 bg-secondary/10 rounded">
                    <div className="text-2xl font-bold text-secondary">
                      {(meals.reduce((mealSum, meal) =>
                        mealSum + meal.foods.reduce((foodSum, food) =>
                          foodSum + (Number(food.protein) || 0), 0
                        ), 0
                      )).toFixed(1)}g
                    </div>
                    <div className="text-sm text-muted-foreground">Proteína</div>
                  </div>
                  <div className="text-center p-4 bg-accent/10 rounded">
                    <div className="text-2xl font-bold text-accent">
                      {(meals.reduce((mealSum, meal) =>
                        mealSum + meal.foods.reduce((foodSum, food) =>
                          foodSum + (Number(food.carbs) || 0), 0
                        ), 0
                      )).toFixed(1)}g
                    </div>
                    <div className="text-sm text-muted-foreground">Carboidratos</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded">
                    <div className="text-2xl font-bold">
                      {(meals.reduce((mealSum, meal) =>
                        mealSum + meal.foods.reduce((foodSum, food) =>
                          foodSum + (Number(food.fat) || 0), 0
                        ), 0
                      )).toFixed(1)}g
                    </div>
                    <div className="text-sm text-muted-foreground">Gorduras</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

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
              {loading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDiet;