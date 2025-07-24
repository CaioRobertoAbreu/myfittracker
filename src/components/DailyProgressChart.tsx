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

          {/* Calorias */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="text-center p-3 bg-primary/10 rounded">
              <div className="text-lg font-bold text-primary">
                {Math.round(progress.consumedCalories)}
              </div>
              <div className="text-xs text-foreground/80">
                de {Math.round(progress.totalCalories)} kcal
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Restam: {Math.round(progress.totalCalories - progress.consumedCalories)} kcal
              </div>
            </div>
            
            <div className="text-center p-3 bg-green-50 dark:bg-green-950/30 rounded">
              <div className="text-lg font-bold text-green-700 dark:text-green-400">
                {(progress.consumedProteinAnimal + progress.consumedProteinVegetable).toFixed(1)}g
              </div>
              <div className="text-xs text-foreground/80">
                de {(progress.totalProteinAnimal + progress.totalProteinVegetable).toFixed(1)}g proteína
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Restam: {((progress.totalProteinAnimal + progress.totalProteinVegetable) - (progress.consumedProteinAnimal + progress.consumedProteinVegetable)).toFixed(1)}g
              </div>
            </div>
            
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/30 rounded">
              <div className="text-lg font-bold text-blue-700 dark:text-blue-400">
                {progress.consumedCarbs.toFixed(1)}g
              </div>
              <div className="text-xs text-foreground/80">
                de {progress.totalCarbs.toFixed(1)}g carbs
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Restam: {(progress.totalCarbs - progress.consumedCarbs).toFixed(1)}g
              </div>
            </div>
            
            <div className="text-center p-3 bg-orange-50 dark:bg-orange-950/30 rounded">
              <div className="text-lg font-bold text-orange-700 dark:text-orange-400">
                {progress.consumedFat.toFixed(1)}g
              </div>
              <div className="text-xs text-foreground/80">
                de {progress.totalFat.toFixed(1)}g gordura
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Restam: {(progress.totalFat - progress.consumedFat).toFixed(1)}g
              </div>
            </div>
          </div>

          {/* Barras de progresso individuais */}
          <div className="space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between text-sm text-foreground">
                <span className="font-medium text-green-700 dark:text-green-400">Proteína</span>
                <span className="font-medium">
                  {((progress.consumedProteinAnimal + progress.consumedProteinVegetable) / (progress.totalProteinAnimal + progress.totalProteinVegetable) * 100).toFixed(0)}%
                </span>
              </div>
              <Progress 
                value={(progress.consumedProteinAnimal + progress.consumedProteinVegetable) / (progress.totalProteinAnimal + progress.totalProteinVegetable) * 100} 
                className="h-2"
              />
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-sm text-foreground">
                <span className="font-medium text-blue-700 dark:text-blue-400">Carboidratos</span>
                <span className="font-medium">
                  {(progress.consumedCarbs / progress.totalCarbs * 100).toFixed(0)}%
                </span>
              </div>
              <Progress 
                value={progress.consumedCarbs / progress.totalCarbs * 100} 
                className="h-2"
              />
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-sm text-foreground">
                <span className="font-medium text-orange-700 dark:text-orange-400">Gorduras</span>
                <span className="font-medium">
                  {(progress.consumedFat / progress.totalFat * 100).toFixed(0)}%
                </span>
              </div>
              <Progress 
                value={progress.consumedFat / progress.totalFat * 100} 
                className="h-2"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};