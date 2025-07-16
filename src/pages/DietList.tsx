import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Plus, Edit, Trash2, ArrowLeft, Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { dietService } from "@/services/dietService";
import { Diet } from "@/types/diet";
import AuthGuard from "@/components/AuthGuard";

const DietList = () => {
  const [diets, setDiets] = useState<Diet[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadDiets();
  }, []);

  const loadDiets = async () => {
    try {
      const data = await dietService.getAllDiets();
      setDiets(data);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar dietas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDiet = async (id: string) => {
    try {
      await dietService.deleteDiet(id);
      toast({
        title: "Sucesso",
        description: "Dieta excluída com sucesso",
      });
      loadDiets();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir dieta",
        variant: "destructive",
      });
    }
  };

  const handleToggleExpired = async (diet: Diet) => {
    try {
      if (diet.isExpired) {
        await dietService.markDietAsActive(diet.id);
        toast({
          title: "Sucesso",
          description: "Dieta marcada como ativa",
        });
      } else {
        await dietService.markDietAsExpired(diet.id);
        toast({
          title: "Sucesso",
          description: "Dieta marcada como vencida",
        });
      }
      loadDiets();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar status da dieta",
        variant: "destructive",
      });
    }
  };

  const getNutritionSummary = (diet: Diet) => {
    return dietService.calculateNutritionSummary(diet);
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

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate("/")}
                className="p-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-3xl font-bold">Minhas Dietas</h1>
            </div>
            <Button onClick={() => navigate("/dietas/nova")}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Dieta
            </Button>
          </div>

          {diets.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground mb-4">Nenhuma dieta encontrada</p>
                <Button onClick={() => navigate("/dietas/nova")}>
                  <Plus className="mr-2 h-4 w-4" />
                  Criar primeira dieta
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {diets.map((diet) => {
                const summary = getNutritionSummary(diet);
                return (
                  <Card 
                    key={diet.id} 
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => navigate(`/dietas/${diet.id}`)}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="truncate">{diet.name}</span>
                          {diet.isExpired && (
                            <Badge variant="destructive" className="text-xs">
                              Vencida
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleExpired(diet)}
                            title={diet.isExpired ? "Marcar como ativa" : "Marcar como vencida"}
                          >
                            <Clock className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/dietas/${diet.id}/editar`)}
                            title="Editar dieta"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Excluir Dieta</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir esta dieta? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeleteDiet(diet.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </CardTitle>
                      {diet.description && (
                        <p className="text-sm text-muted-foreground">{diet.description}</p>
                      )}
                      {diet.startDate && (
                        <div className="flex items-center gap-1 mt-2">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            Iniciada em {format(new Date(diet.startDate), "dd/MM/yyyy")}
                          </span>
                        </div>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Calorias:</span>
                          <span className="font-medium">{Math.round(summary.totalCalories)} kcal</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Proteína:</span>
                          <span className="font-medium">
                            {(summary.totalProteinAnimal + summary.totalProteinVegetable).toFixed(1)}g 
                            ({summary.proteinPercentage.toFixed(0)}%)
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Carboidratos:</span>
                          <span className="font-medium">
                            {summary.totalCarbs.toFixed(1)}g ({summary.carbsPercentage.toFixed(0)}%)
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Gorduras:</span>
                          <span className="font-medium">
                            {summary.totalFat.toFixed(1)}g ({summary.fatPercentage.toFixed(0)}%)
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-3">
                          {diet.meals.length} refeições
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
};

export default DietList;