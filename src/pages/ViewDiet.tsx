import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import { ArrowLeft, Edit, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { dietService } from "@/services/dietService";
import { Diet } from "@/types/diet";

const ViewDiet = () => {
  const { dietId } = useParams<{ dietId: string }>();
  const [diet, setDiet] = useState<Diet | null>(null);
  const [loading, setLoading] = useState(true);
  const [consumedFoods, setConsumedFoods] = useState<Set<string>>(new Set());
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (dietId) {
      loadDiet();
      loadConsumedFoods();
    }
  }, [dietId]);

  const loadDiet = async () => {
    if (!dietId) return;

    try {
      const dietData = await dietService.getDietById(dietId);
      if (!dietData) {
        toast({
          title: "Erro",
          description: "Dieta não encontrada",
          variant: "destructive",
        });
        navigate("/dietas");
        return;
      }

      setDiet(dietData);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar dieta",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadConsumedFoods = () => {
    if (!dietId) return;
    const stored = localStorage.getItem(`consumed-foods-${dietId}`);
    if (stored) {
      setConsumedFoods(new Set(JSON.parse(stored)));
    }
  };

  const saveConsumedFoods = (foods: Set<string>) => {
    if (dietId) {
      localStorage.setItem(`consumed-foods-${dietId}`, JSON.stringify([...foods]));
    }
  };

  const toggleFoodConsumption = (foodId: string) => {
    const newConsumedFoods = new Set(consumedFoods);
    if (newConsumedFoods.has(foodId)) {
      newConsumedFoods.delete(foodId);
    } else {
      newConsumedFoods.add(foodId);
    }
    setConsumedFoods(newConsumedFoods);
    saveConsumedFoods(newConsumedFoods);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-8">Carregando...</div>
        </div>
      </div>
    );
  }

  if (!diet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-8">Dieta não encontrada</div>
        </div>
      </div>
    );
  }

  const summary = dietService.calculateNutritionSummary(diet);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 space-y-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/dietas")}
              className="p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-bold">{diet.name}</h1>
                {diet.isExpired && (
                  <Badge variant="destructive" className="text-sm">
                    Vencida
                  </Badge>
                )}
              </div>
              {diet.description && (
                <p className="text-muted-foreground mt-1 text-sm md:text-base">{diet.description}</p>
              )}
              {diet.startDate && (
                <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span className="text-xs md:text-sm">
                    Iniciada em {format(new Date(diet.startDate), "dd/MM/yyyy")}
                  </span>
                </div>
              )}
            </div>
          </div>
          <Button onClick={() => navigate(`/dietas/${diet.id}/editar`)} className="w-full md:w-auto">
            <Edit className="mr-2 h-4 w-4" />
            Editar Dieta
          </Button>
        </div>

        {/* Resumo nutricional total */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Resumo Nutricional Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              <div className="text-center p-3 md:p-4 bg-primary/10 rounded">
                <div className="text-xl md:text-2xl font-bold text-primary">
                  {Math.round(summary.totalCalories)}
                </div>
                <div className="text-xs md:text-sm text-muted-foreground">Calorias</div>
              </div>
              <div className="text-center p-3 md:p-4 bg-secondary/10 rounded">
                <div className="text-xl md:text-2xl font-bold text-secondary">
                  {(summary.totalProteinAnimal + summary.totalProteinVegetable).toFixed(1)}g
                </div>
                <div className="text-xs md:text-sm text-muted-foreground">
                  Proteína ({summary.proteinPercentage.toFixed(0)}%)
                </div>
              </div>
              <div className="text-center p-3 md:p-4 bg-accent/10 rounded">
                <div className="text-xl md:text-2xl font-bold text-accent">
                  {summary.totalCarbs.toFixed(1)}g
                </div>
                <div className="text-xs md:text-sm text-muted-foreground">
                  Carboidratos ({summary.carbsPercentage.toFixed(0)}%)
                </div>
              </div>
              <div className="text-center p-3 md:p-4 bg-muted/50 rounded">
                <div className="text-xl md:text-2xl font-bold">
                  {summary.totalFat.toFixed(1)}g
                </div>
                <div className="text-xs md:text-sm text-muted-foreground">
                  Gorduras ({summary.fatPercentage.toFixed(0)}%)
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Refeições */}
        <div className="space-y-6">
          {diet.meals.map((meal, mealIndex) => (
            <Card key={meal.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{meal.name}</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    {meal.foods.length} alimentos
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {meal.foods.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    Nenhum alimento nesta refeição
                  </p>
                ) : (
                  <div className="space-y-4">
                    {/* Lista de alimentos - Desktop */}
                    <div className="hidden md:block space-y-2">
                      <div className="grid grid-cols-7 gap-2 text-xs font-medium text-muted-foreground pb-2 border-b">
                        <span>Consumido</span>
                        <span>Alimento</span>
                        <span>Quantidade</span>
                        <span>Proteína (g)</span>
                        <span>Carboidratos (g)</span>
                        <span>Gorduras (g)</span>
                        <span>Calorias</span>
                      </div>
                      {meal.foods.map((food, foodIndex) => {
                        const totalProtein = food.proteinAnimal + food.proteinVegetable;
                        const calories = Math.round((totalProtein + food.carbs) * 4 + food.fat * 9);
                        const isConsumed = consumedFoods.has(food.id);
                        
                        return (
                          <div 
                            key={food.id} 
                            className={`grid grid-cols-7 gap-2 text-sm py-2 border-b border-border/50 ${
                              isConsumed ? 'bg-green-50 dark:bg-green-950/20' : ''
                            }`}
                          >
                            <div className="flex items-center justify-center">
                              <Checkbox 
                                checked={isConsumed}
                                onCheckedChange={() => toggleFoodConsumption(food.id)}
                                className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                              />
                            </div>
                            <span className={`font-medium ${isConsumed ? 'line-through text-muted-foreground' : ''}`}>
                              {food.foodName}
                            </span>
                            <span className={isConsumed ? 'line-through text-muted-foreground' : ''}>
                              {food.quantity}
                            </span>
                            <span className={isConsumed ? 'line-through text-muted-foreground' : ''}>
                              {totalProtein.toFixed(1)}
                              {food.proteinAnimal > 0 && food.proteinVegetable > 0 && (
                                <span className="text-xs text-muted-foreground ml-1">
                                  (A:{food.proteinAnimal.toFixed(1)} V:{food.proteinVegetable.toFixed(1)})
                                </span>
                              )}
                            </span>
                            <span className={isConsumed ? 'line-through text-muted-foreground' : ''}>
                              {food.carbs.toFixed(1)}
                            </span>
                            <span className={isConsumed ? 'line-through text-muted-foreground' : ''}>
                              {food.fat.toFixed(1)}
                            </span>
                            <span className={`font-medium ${isConsumed ? 'line-through text-muted-foreground' : ''}`}>
                              {calories}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Lista de alimentos - Mobile */}
                    <div className="md:hidden space-y-3">
                      {meal.foods.map((food, foodIndex) => {
                        const totalProtein = food.proteinAnimal + food.proteinVegetable;
                        const calories = Math.round((totalProtein + food.carbs) * 4 + food.fat * 9);
                        const isConsumed = consumedFoods.has(food.id);
                        
                        return (
                          <div 
                            key={food.id} 
                            className={`p-3 border rounded-lg space-y-2 ${
                              isConsumed ? 'bg-green-50 dark:bg-green-950/20' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <h4 className={`font-medium text-sm ${isConsumed ? 'line-through text-muted-foreground' : ''}`}>
                                {food.foodName}
                              </h4>
                              <Checkbox 
                                checked={isConsumed}
                                onCheckedChange={() => toggleFoodConsumption(food.id)}
                                className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                              />
                            </div>
                            <div className={`text-xs ${isConsumed ? 'line-through text-muted-foreground' : 'text-muted-foreground'}`}>
                              <strong>Quantidade:</strong> {food.quantity}
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className={isConsumed ? 'line-through text-muted-foreground' : ''}>
                                <strong>Proteína:</strong> {totalProtein.toFixed(1)}g
                                {food.proteinAnimal > 0 && food.proteinVegetable > 0 && (
                                  <div className="text-xs text-muted-foreground">
                                    (A:{food.proteinAnimal.toFixed(1)} V:{food.proteinVegetable.toFixed(1)})
                                  </div>
                                )}
                              </div>
                              <div className={isConsumed ? 'line-through text-muted-foreground' : ''}>
                                <strong>Carboidratos:</strong> {food.carbs.toFixed(1)}g
                              </div>
                              <div className={isConsumed ? 'line-through text-muted-foreground' : ''}>
                                <strong>Gorduras:</strong> {food.fat.toFixed(1)}g
                              </div>
                              <div className={`font-medium ${isConsumed ? 'line-through text-muted-foreground' : ''}`}>
                                <strong>Calorias:</strong> {calories} kcal
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Resumo nutricional da refeição */}
                    <div className="p-3 bg-muted/50 rounded">
                      <div className="text-sm font-medium mb-2">Resumo da Refeição:</div>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4 text-xs">
                        <div>
                          <span className="text-muted-foreground">Proteína: </span>
                          <span className="font-medium">
                            {(meal.foods.reduce((sum, food) => sum + food.proteinAnimal + food.proteinVegetable, 0)).toFixed(1)}g
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Carboidratos: </span>
                          <span className="font-medium">
                            {(meal.foods.reduce((sum, food) => sum + food.carbs, 0)).toFixed(1)}g
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Gorduras: </span>
                          <span className="font-medium">
                            {(meal.foods.reduce((sum, food) => sum + food.fat, 0)).toFixed(1)}g
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Calorias: </span>
                          <span className="font-medium">
                            {Math.round(
                              meal.foods.reduce((sum, food) => 
                                sum + ((food.proteinAnimal + food.proteinVegetable + food.carbs) * 4) + (food.fat * 9), 0
                              )
                            )} kcal
                          </span>
                        </div>
                      </div>
                      
                      {/* Progresso da refeição */}
                      <div className="mt-3 pt-2 border-t">
                        <div className="text-xs text-muted-foreground">
                          Progresso: {meal.foods.filter(food => consumedFoods.has(food.id)).length} de {meal.foods.length} alimentos consumidos
                        </div>
                        <div className="w-full bg-muted rounded-full h-2 mt-1">
                          <div 
                            className="bg-green-600 h-2 rounded-full transition-all" 
                            style={{ 
                              width: `${meal.foods.length > 0 ? (meal.foods.filter(food => consumedFoods.has(food.id)).length / meal.foods.length) * 100 : 0}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ViewDiet;