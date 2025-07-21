import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { format, startOfDay, isToday, addDays, subDays } from "date-fns";
import { ArrowLeft, Edit, Calendar as CalendarIcon, ChevronDown, ChevronUp, RotateCcw, Calendar as CalendarIconAlt, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { dietService } from "@/services/dietService";
import { Diet } from "@/types/diet";
import { cn } from "@/lib/utils";

const ViewDiet = () => {
  const { dietId } = useParams<{ dietId: string }>();
  const [diet, setDiet] = useState<Diet | null>(null);
  const [loading, setLoading] = useState(true);
  const [consumedFoods, setConsumedFoods] = useState<Set<string>>(new Set());
  const [expandedMeals, setExpandedMeals] = useState<Set<string>>(new Set());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (dietId) {
      loadDiet();
      loadConsumedFoods();
    }
  }, [dietId, selectedDate]);

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
    const dateKey = format(startOfDay(selectedDate), "yyyy-MM-dd");
    const stored = localStorage.getItem(`consumed-foods-${dietId}-${dateKey}`);
    if (stored) {
      setConsumedFoods(new Set(JSON.parse(stored)));
    } else {
      setConsumedFoods(new Set());
    }
  };

  const saveConsumedFoods = (foods: Set<string>) => {
    if (dietId) {
      const dateKey = format(startOfDay(selectedDate), "yyyy-MM-dd");
      localStorage.setItem(`consumed-foods-${dietId}-${dateKey}`, JSON.stringify([...foods]));
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

  const toggleMealExpansion = (mealId: string) => {
    const newExpandedMeals = new Set(expandedMeals);
    if (newExpandedMeals.has(mealId)) {
      newExpandedMeals.delete(mealId);
    } else {
      newExpandedMeals.add(mealId);
    }
    setExpandedMeals(newExpandedMeals);
  };

  const resetDayProgress = () => {
    setConsumedFoods(new Set());
    if (dietId) {
      const dateKey = format(startOfDay(selectedDate), "yyyy-MM-dd");
      localStorage.removeItem(`consumed-foods-${dietId}-${dateKey}`);
    }
    toast({
      title: "Progresso resetado",
      description: `Progresso do dia ${format(selectedDate, "dd/MM/yyyy")} foi resetado`,
    });
  };

  const onDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const goToPreviousDay = () => {
    setSelectedDate(prev => subDays(prev, 1));
  };

  const goToNextDay = () => {
    setSelectedDate(prev => addDays(prev, 1));
  };

  const goToToday = () => {
    setSelectedDate(new Date());
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
                  <CalendarIcon className="h-4 w-4" />
                  <span className="text-xs md:text-sm">
                    Iniciada em {format(new Date(diet.startDate), "dd/MM/yyyy")}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Controles de data e ações */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {/* Navegação de datas */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousDay}
                className="p-2"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal min-w-[180px]",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIconAlt className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "dd/MM/yyyy") : <span>Selecionar data</span>}
                    {isToday(selectedDate) && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        Hoje
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={onDateChange}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>

              <Button
                variant="outline"
                size="sm"
                onClick={goToNextDay}
                className="p-2"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>

              {!isToday(selectedDate) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goToToday}
                  className="text-xs"
                >
                  Hoje
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={resetDayProgress}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Resetar Dia
              </Button>
              <Button onClick={() => navigate(`/dietas/${diet.id}/editar`)} className="flex-1 sm:flex-none">
                <Edit className="mr-2 h-4 w-4" />
                Editar Dieta
              </Button>
            </div>
          </div>
        </div>

        {/* Resumo nutricional total */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Resumo Nutricional Total</CardTitle>
              <Badge variant="outline" className="text-xs">
                {format(selectedDate, "dd/MM/yyyy")}
                {isToday(selectedDate) && " - Hoje"}
              </Badge>
            </div>
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
          {diet.meals.map((meal, mealIndex) => {
            const isExpanded = expandedMeals.has(meal.id);
            const consumedCount = meal.foods.filter(food => consumedFoods.has(food.id)).length;
            const totalCount = meal.foods.length;
            const progressPercentage = totalCount > 0 ? (consumedCount / totalCount) * 100 : 0;

            return (
              <Card key={meal.id} className="overflow-hidden">
                <Collapsible open={isExpanded} onOpenChange={() => toggleMealExpansion(meal.id)}>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span>{meal.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {consumedCount}/{totalCount}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="hidden sm:flex items-center gap-2">
                            <div className="w-20 bg-muted rounded-full h-2">
                              <div 
                                className="bg-green-600 h-2 rounded-full transition-all" 
                                style={{ width: `${progressPercentage}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {Math.round(progressPercentage)}%
                            </span>
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                      </CardTitle>
                      {/* Progresso móvel */}
                      <div className="sm:hidden">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                          <span>Progresso: {consumedCount} de {totalCount} alimentos</span>
                          <span>{Math.round(progressPercentage)}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full transition-all" 
                            style={{ width: `${progressPercentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent className="animate-accordion-down data-[state=closed]:animate-accordion-up">
                    <CardContent className="pt-0">
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
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ViewDiet;