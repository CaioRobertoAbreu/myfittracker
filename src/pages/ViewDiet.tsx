import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { dietService } from "@/services/dietService";
import { Diet } from "@/types/diet";

const ViewDiet = () => {
  const { dietId } = useParams<{ dietId: string }>();
  const [diet, setDiet] = useState<Diet | null>(null);
  const [loading, setLoading] = useState(true);
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
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/dietas")}
              className="p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{diet.name}</h1>
              {diet.description && (
                <p className="text-muted-foreground mt-1">{diet.description}</p>
              )}
            </div>
          </div>
          <Button onClick={() => navigate(`/dietas/${diet.id}/editar`)}>
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-primary/10 rounded">
                <div className="text-2xl font-bold text-primary">
                  {Math.round(summary.totalCalories)}
                </div>
                <div className="text-sm text-muted-foreground">Calorias</div>
              </div>
              <div className="text-center p-4 bg-secondary/10 rounded">
                <div className="text-2xl font-bold text-secondary">
                  {(summary.totalProteinAnimal + summary.totalProteinVegetable).toFixed(1)}g
                </div>
                <div className="text-sm text-muted-foreground">
                  Proteína ({summary.proteinPercentage.toFixed(0)}%)
                </div>
              </div>
              <div className="text-center p-4 bg-accent/10 rounded">
                <div className="text-2xl font-bold text-accent">
                  {summary.totalCarbs.toFixed(1)}g
                </div>
                <div className="text-sm text-muted-foreground">
                  Carboidratos ({summary.carbsPercentage.toFixed(0)}%)
                </div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded">
                <div className="text-2xl font-bold">
                  {summary.totalFat.toFixed(1)}g
                </div>
                <div className="text-sm text-muted-foreground">
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
                    {/* Lista de alimentos */}
                    <div className="space-y-2">
                      <div className="grid grid-cols-6 gap-2 text-xs font-medium text-muted-foreground pb-2 border-b">
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
                        
                        return (
                          <div key={food.id} className="grid grid-cols-6 gap-2 text-sm py-2 border-b border-border/50">
                            <span className="font-medium">{food.foodName}</span>
                            <span>{food.quantity}</span>
                            <span>
                              {totalProtein.toFixed(1)}
                              {food.proteinAnimal > 0 && food.proteinVegetable > 0 && (
                                <span className="text-xs text-muted-foreground ml-1">
                                  (A:{food.proteinAnimal.toFixed(1)} V:{food.proteinVegetable.toFixed(1)})
                                </span>
                              )}
                            </span>
                            <span>{food.carbs.toFixed(1)}</span>
                            <span>{food.fat.toFixed(1)}</span>
                            <span className="font-medium">{calories}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Resumo nutricional da refeição */}
                    <div className="p-3 bg-muted/50 rounded">
                      <div className="text-sm font-medium mb-2">Resumo da Refeição:</div>
                      <div className="grid grid-cols-4 gap-4 text-xs">
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