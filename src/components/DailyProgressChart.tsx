import { DailyProgress } from "@/types/diet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface DailyProgressChartProps {
  progress: DailyProgress;
  selectedDate: string;
}

export const DailyProgressChart = ({ progress, selectedDate }: DailyProgressChartProps) => {
  const progressPercentage = Math.round(progress.progressPercentage);
  
  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-600";
    if (percentage >= 50) return "bg-yellow-600";
    return "bg-orange-600";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Progresso Diário</CardTitle>
          <Badge variant="outline" className="text-xs">
            {selectedDate}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Progresso Macros */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Calorias */}
            <div className="text-center p-4 bg-muted/50 rounded-lg border">
              <div className="text-sm font-medium text-foreground mb-1">Calorias</div>
              <div className="space-y-1">
                <div className="text-lg font-bold text-foreground">
                  {Math.round(progress.consumedCalories)} kcal
                </div>
                <div className="text-xs text-muted-foreground">
                  consumidas de {Math.round(progress.totalCalories)}
                </div>
                <div className="text-xs font-medium text-destructive">
                  Faltam: {Math.round(progress.totalCalories - progress.consumedCalories)} kcal
                </div>
              </div>
            </div>
            
            {/* Proteína */}
            <div className="text-center p-4 bg-muted/50 rounded-lg border">
              <div className="text-sm font-medium text-foreground mb-1">Proteína</div>
              <div className="space-y-1">
                <div className="text-lg font-bold text-foreground">
                  {(progress.consumedProteinAnimal + progress.consumedProteinVegetable).toFixed(1)}g
                </div>
                <div className="text-xs text-muted-foreground">
                  consumidas de {(progress.totalProteinAnimal + progress.totalProteinVegetable).toFixed(1)}g
                </div>
                <div className="text-xs font-medium text-destructive">
                  Faltam: {((progress.totalProteinAnimal + progress.totalProteinVegetable) - (progress.consumedProteinAnimal + progress.consumedProteinVegetable)).toFixed(1)}g
                </div>
              </div>
            </div>
            
            {/* Carboidratos */}
            <div className="text-center p-4 bg-muted/50 rounded-lg border">
              <div className="text-sm font-medium text-foreground mb-1">Carboidratos</div>
              <div className="space-y-1">
                <div className="text-lg font-bold text-foreground">
                  {progress.consumedCarbs.toFixed(1)}g
                </div>
                <div className="text-xs text-muted-foreground">
                  consumidos de {progress.totalCarbs.toFixed(1)}g
                </div>
                <div className="text-xs font-medium text-destructive">
                  Faltam: {(progress.totalCarbs - progress.consumedCarbs).toFixed(1)}g
                </div>
              </div>
            </div>
            
            {/* Gorduras */}
            <div className="text-center p-4 bg-muted/50 rounded-lg border">
              <div className="text-sm font-medium text-foreground mb-1">Gorduras</div>
              <div className="space-y-1">
                <div className="text-lg font-bold text-foreground">
                  {progress.consumedFat.toFixed(1)}g
                </div>
                <div className="text-xs text-muted-foreground">
                  consumidas de {progress.totalFat.toFixed(1)}g
                </div>
                <div className="text-xs font-medium text-destructive">
                  Faltam: {(progress.totalFat - progress.consumedFat).toFixed(1)}g
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};