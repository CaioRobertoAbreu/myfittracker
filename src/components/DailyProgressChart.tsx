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
              <div className="text-xs text-muted-foreground">
                de {Math.round(progress.totalCalories)} kcal
              </div>
            </div>
            
            <div className="text-center p-3 bg-secondary/10 rounded">
              <div className="text-lg font-bold text-secondary">
                {(progress.consumedProteinAnimal + progress.consumedProteinVegetable).toFixed(1)}g
              </div>
              <div className="text-xs text-muted-foreground">
                de {(progress.totalProteinAnimal + progress.totalProteinVegetable).toFixed(1)}g proteína
              </div>
            </div>
            
            <div className="text-center p-3 bg-accent/10 rounded">
              <div className="text-lg font-bold text-accent">
                {progress.consumedCarbs.toFixed(1)}g
              </div>
              <div className="text-xs text-muted-foreground">
                de {progress.totalCarbs.toFixed(1)}g carbs
              </div>
            </div>
            
            <div className="text-center p-3 bg-muted/50 rounded">
              <div className="text-lg font-bold">
                {progress.consumedFat.toFixed(1)}g
              </div>
              <div className="text-xs text-muted-foreground">
                de {progress.totalFat.toFixed(1)}g gordura
              </div>
            </div>
          </div>

          {/* Barras de progresso individuais */}
          <div className="space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Proteína</span>
                <span>
                  {((progress.consumedProteinAnimal + progress.consumedProteinVegetable) / (progress.totalProteinAnimal + progress.totalProteinVegetable) * 100).toFixed(0)}%
                </span>
              </div>
              <Progress 
                value={(progress.consumedProteinAnimal + progress.consumedProteinVegetable) / (progress.totalProteinAnimal + progress.totalProteinVegetable) * 100} 
                className="h-2"
              />
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Carboidratos</span>
                <span>
                  {(progress.consumedCarbs / progress.totalCarbs * 100).toFixed(0)}%
                </span>
              </div>
              <Progress 
                value={progress.consumedCarbs / progress.totalCarbs * 100} 
                className="h-2"
              />
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Gorduras</span>
                <span>
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