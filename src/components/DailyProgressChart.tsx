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
          {/* Progresso geral */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso Total</span>
              <span className="font-medium">{progressPercentage}%</span>
            </div>
            <Progress 
              value={progressPercentage} 
              className="h-3"
            />
          </div>

          {/* Progresso Macros */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Calorias */}
            <div className="text-center p-4 bg-primary/10 rounded-lg border">
              <div className="text-sm font-medium text-white mb-1">Calorias</div>
              <div className="space-y-1">
                <div className="text-lg font-bold text-white">
                  {Math.round(progress.consumedCalories)} kcal
                </div>
                <div className="text-xs text-white/70">
                  consumidas de {Math.round(progress.totalCalories)}
                </div>
                <div className="text-xs font-medium text-destructive">
                  Faltam: {Math.round(progress.totalCalories - progress.consumedCalories)} kcal
                </div>
              </div>
            </div>
            
            {/* Proteína */}
            <div className="text-center p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
              <div className="text-sm font-medium text-white mb-1">Proteína</div>
              <div className="space-y-1">
                <div className="text-lg font-bold text-white">
                  {(progress.consumedProteinAnimal + progress.consumedProteinVegetable).toFixed(1)}g
                </div>
                <div className="text-xs text-white/70">
                  consumidas de {(progress.totalProteinAnimal + progress.totalProteinVegetable).toFixed(1)}g
                </div>
                <div className="text-xs font-medium text-destructive">
                  Faltam: {((progress.totalProteinAnimal + progress.totalProteinVegetable) - (progress.consumedProteinAnimal + progress.consumedProteinVegetable)).toFixed(1)}g
                </div>
              </div>
            </div>
            
            {/* Carboidratos */}
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="text-sm font-medium text-white mb-1">Carboidratos</div>
              <div className="space-y-1">
                <div className="text-lg font-bold text-white">
                  {progress.consumedCarbs.toFixed(1)}g
                </div>
                <div className="text-xs text-white/70">
                  consumidos de {progress.totalCarbs.toFixed(1)}g
                </div>
                <div className="text-xs font-medium text-destructive">
                  Faltam: {(progress.totalCarbs - progress.consumedCarbs).toFixed(1)}g
                </div>
              </div>
            </div>
            
            {/* Gorduras */}
            <div className="text-center p-4 bg-orange-50 dark:bg-orange-950/30 rounded-lg border border-orange-200 dark:border-orange-800">
              <div className="text-sm font-medium text-white mb-1">Gorduras</div>
              <div className="space-y-1">
                <div className="text-lg font-bold text-white">
                  {progress.consumedFat.toFixed(1)}g
                </div>
                <div className="text-xs text-white/70">
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