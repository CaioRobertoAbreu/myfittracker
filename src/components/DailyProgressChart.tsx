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

        </div>
      </CardContent>
    </Card>
  );
};