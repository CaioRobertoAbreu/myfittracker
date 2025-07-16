import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Info, Target, Clock, Zap, FileText } from "lucide-react";
import { TrainingDay } from "@/types/training";

interface TrainingDayViewProps {
  day: TrainingDay;
  weekNumber: number;
  onBack: () => void;
}

export function TrainingDayView({ day, weekNumber, onBack }: TrainingDayViewProps) {
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar aos treinos
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{day.name}</h1>
          <p className="text-muted-foreground">
            Semana {weekNumber} • {day.exercises.length} exercícios
          </p>
        </div>
      </div>

      {/* Exercises List */}
      <div className="space-y-4">
        {day.exercises.map((exercise, index) => (
          <Card 
            key={exercise.id} 
            className="group transition-all duration-300 hover:shadow-lg hover:shadow-training-primary/20 hover:border-training-primary/50"
          >
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="w-8 h-8 rounded-full flex items-center justify-center p-0">
                    {index + 1}
                  </Badge>
                  <span className="text-lg">{exercise.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {exercise.sets}x{exercise.reps}@{exercise.rpe}
                  </Badge>
                  {exercise.technique && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedExercise(
                        selectedExercise === exercise.id ? null : exercise.id
                      )}
                      className="gap-2"
                    >
                      <Info className="h-4 w-4" />
                      {selectedExercise === exercise.id ? "Ocultar" : "Técnica"}
                    </Button>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              {/* Basic Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-training-primary" />
                  <div>
                    <p className="text-sm font-medium">{exercise.sets} séries</p>
                    <p className="text-xs text-muted-foreground">Séries</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-training-accent" />
                  <div>
                    <p className="text-sm font-medium">{exercise.reps} reps</p>
                    <p className="text-xs text-muted-foreground">Repetições</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-training-warning" />
                  <div>
                    <p className="text-sm font-medium">RPE {exercise.rpe}</p>
                    <p className="text-xs text-muted-foreground">Esforço</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-training-success" />
                  <div>
                    <p className="text-sm font-medium">{exercise.progressionType}</p>
                    <p className="text-xs text-muted-foreground">Progressão</p>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {selectedExercise === exercise.id && (
                <div className="space-y-4 animate-scale-in">
                  <Separator />
                  
                  {exercise.technique && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2 text-training-primary">
                        Técnica: {exercise.technique}
                      </h4>
                      {exercise.techniqueDescription && (
                        <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                          {exercise.techniqueDescription}
                        </p>
                      )}
                    </div>
                  )}
                  
                  {exercise.observations && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2 text-training-accent">
                        Observações
                      </h4>
                      <p className="text-sm text-muted-foreground bg-accent/10 p-3 rounded-lg border border-accent/20">
                        {exercise.observations}
                      </p>
                    </div>
                  )}

                  {/* Week Progress Preview */}
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Progresso das Semanas</h4>
                    <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                      {Array.from({ length: 8 }, (_, i) => i + 1).map((week) => {
                        const isDeload = week === 4 || week === 8;
                        const isCurrent = week === weekNumber;
                        
                        return (
                          <div
                            key={week}
                            className={`p-2 text-center text-xs rounded border transition-all ${
                              isCurrent
                                ? "bg-primary text-primary-foreground border-primary"
                                : isDeload
                                ? "bg-warning/10 text-warning border-warning/30"
                                : "bg-muted text-muted-foreground border-border"
                            }`}
                          >
                            S{week}
                            {isDeload && (
                              <div className="text-xs font-medium">Deload</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary */}
      <Card className="mt-8 bg-gradient-to-r from-training-primary/10 to-training-accent/10 border-training-primary/20">
        <CardHeader>
          <CardTitle className="text-center">Resumo do Treino</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-training-primary">
                {day.exercises.length}
              </p>
              <p className="text-sm text-muted-foreground">Exercícios</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-training-accent">
                {day.exercises.reduce((acc, ex) => acc + ex.sets, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Séries Totais</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-training-success">
                {Math.round(day.exercises.reduce((acc, ex) => acc + ex.rpe, 0) / day.exercises.length)}
              </p>
              <p className="text-sm text-muted-foreground">RPE Médio</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-training-warning">
                {day.exercises.filter(ex => ex.technique).length}
              </p>
              <p className="text-sm text-muted-foreground">Com Técnica Especial</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}