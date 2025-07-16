import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface WeekProgressProps {
  currentWeek: number;
  totalWeeks: number;
  onWeekChange: (week: number) => void;
}

export function WeekProgress({ currentWeek, totalWeeks, onWeekChange }: WeekProgressProps) {
  const weeks = Array.from({ length: totalWeeks }, (_, i) => i + 1);
  const deloadWeeks = [4, 8]; // Semanas de deload

  return (
    <div className="bg-card/50 backdrop-blur rounded-lg border border-border p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Progresso das Semanas</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onWeekChange(Math.max(1, currentWeek - 1))}
            disabled={currentWeek === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onWeekChange(Math.min(totalWeeks, currentWeek + 1))}
            disabled={currentWeek === totalWeeks}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
        {weeks.map((week) => {
          const isDeload = deloadWeeks.includes(week);
          const isCurrent = week === currentWeek;
          const isPast = week < currentWeek;

          return (
            <Button
              key={week}
              variant={isCurrent ? "default" : isPast ? "secondary" : "outline"}
              size="sm"
              onClick={() => onWeekChange(week)}
              className={`relative h-12 flex flex-col items-center justify-center text-xs transition-all duration-200 ${
                isCurrent ? "ring-2 ring-training-primary animate-glow" : ""
              }`}
            >
              <span className="font-medium">S{week}</span>
              {isDeload && (
                <Badge 
                  variant="outline" 
                  className="absolute -top-1 -right-1 px-1 py-0 text-xs h-auto min-h-0"
                >
                  D
                </Badge>
              )}
            </Button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-center gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-primary"></div>
          <span>Atual</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-secondary"></div>
          <span>Concluída</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded border border-border"></div>
          <span>Pendente</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-1 py-0 text-xs h-auto min-h-0">
            D
          </Badge>
          <span>Deload</span>
        </div>
      </div>
    </div>
  );
}