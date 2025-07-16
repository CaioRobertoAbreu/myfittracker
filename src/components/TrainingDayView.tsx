import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Target, Clock, Zap, FileText, Plus, Minus, Check, CheckCircle2 } from "lucide-react";
import { TrainingDay, ExerciseSet } from "@/types/training";
import { 
  saveExerciseSets, 
  getExerciseSets, 
  saveExerciseObservation, 
  getExerciseObservation 
} from "@/services/trainingService";

interface TrainingDayViewProps {
  day: TrainingDay;
  weekNumber: number;
  onBack: () => void;
}

export function TrainingDayView({ day, weekNumber, onBack }: TrainingDayViewProps) {
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [exerciseData, setExerciseData] = useState<{[key: string]: {
    observations: string;
    performedSets: ExerciseSet[];
    showObservations: boolean;
    completed: boolean;
  }}>(
    Object.fromEntries(
      day.exercises.map(ex => [
        ex.id, 
        {
          observations: "",
          performedSets: Array.from({ length: ex.sets }, (_, i) => ({
            setNumber: i + 1,
            weight: 0,
            reps: 0
          })),
          showObservations: false,
          completed: false
        }
      ])
    )
  );

  const [previousWeekData, setPreviousWeekData] = useState<{[key: string]: {
    sets: ExerciseSet[] | null;
    observations: string;
  }}>({});

  // Carrega dados salvos do Supabase
  useEffect(() => {
    async function loadExerciseData() {
      const newData = { ...exerciseData };
      const newPreviousData: {[key: string]: { sets: ExerciseSet[] | null; observations: string }} = {};
      
      for (const exercise of day.exercises) {
        try {
          // Carregar séries da semana atual
          const sets = await getExerciseSets(exercise.id, weekNumber);
          if (sets.length > 0) {
            newData[exercise.id].performedSets = sets;
          }
          
          // Carregar observações e status da semana atual
          const observation = await getExerciseObservation(exercise.id, weekNumber);
          newData[exercise.id].observations = observation.observations;
          newData[exercise.id].completed = observation.isCompleted;

          // Carregar dados da semana anterior
          if (weekNumber > 1) {
            const previousSets = await getExerciseSets(exercise.id, weekNumber - 1);
            const previousObservation = await getExerciseObservation(exercise.id, weekNumber - 1);
            
            newPreviousData[exercise.id] = {
              sets: previousSets.length > 0 ? previousSets : null,
              observations: previousObservation.observations
            };
          }
        } catch (error) {
          console.error(`Erro ao carregar dados do exercício ${exercise.id}:`, error);
        }
      }
      
      setExerciseData(newData);
      setPreviousWeekData(newPreviousData);
    }

    loadExerciseData();
  }, [day.exercises, weekNumber]);

  // Helper para acessar dados da semana anterior
  const getPreviousWeekData = (exerciseId: string) => {
    return previousWeekData[exerciseId]?.sets || null;
  };

  const getPreviousObservation = (exerciseId: string) => {
    return previousWeekData[exerciseId]?.observations || "";
  };

  const updateObservations = async (exerciseId: string, value: string) => {
    setExerciseData(prev => ({
      ...prev,
      [exerciseId]: {
        ...prev[exerciseId],
        observations: value
      }
    }));

    // Salvar no Supabase
    try {
      await saveExerciseObservation(
        exerciseId, 
        weekNumber, 
        value, 
        exerciseData[exerciseId]?.completed || false
      );
    } catch (error) {
      console.error('Erro ao salvar observação:', error);
    }
  };

  const toggleObservations = (exerciseId: string) => {
    setExerciseData(prev => ({
      ...prev,
      [exerciseId]: {
        ...prev[exerciseId],
        showObservations: !prev[exerciseId].showObservations
      }
    }));
  };

  const toggleExerciseCompletion = async (exerciseId: string) => {
    const newCompleted = !exerciseData[exerciseId].completed;
    
    setExerciseData(prev => ({
      ...prev,
      [exerciseId]: {
        ...prev[exerciseId],
        completed: newCompleted
      }
    }));

    // Salvar no Supabase
    try {
      await saveExerciseObservation(
        exerciseId, 
        weekNumber, 
        exerciseData[exerciseId]?.observations || '', 
        newCompleted
      );
    } catch (error) {
      console.error('Erro ao salvar status de conclusão:', error);
    }
  };

  const formatPerformedSets = (sets: ExerciseSet[]) => {
    const completedSets = sets.filter(set => set.reps > 0 && set.weight > 0);
    if (completedSets.length === 0) return "Nenhuma série registrada";
    
    return completedSets
      .map(set => `${set.reps} reps x ${set.weight} kg`)
      .join(' / ');
  };


  const keepPreviousObservation = async (exerciseId: string) => {
    const previousObs = getPreviousObservation(exerciseId);
    if (previousObs) {
      setExerciseData(prev => ({
        ...prev,
        [exerciseId]: {
          ...prev[exerciseId],
          observations: previousObs
        }
      }));

      // Salvar no Supabase
      try {
        await saveExerciseObservation(
          exerciseId, 
          weekNumber, 
          previousObs, 
          exerciseData[exerciseId]?.completed || false
        );
      } catch (error) {
        console.error('Erro ao salvar observação:', error);
      }
    }
  };

  const updateSet = async (exerciseId: string, setIndex: number, field: 'weight' | 'reps', value: number) => {
    const newData = {
      ...exerciseData,
      [exerciseId]: {
        ...exerciseData[exerciseId],
        performedSets: exerciseData[exerciseId].performedSets.map((set, idx) => 
          idx === setIndex ? { ...set, [field]: value } : set
        )
      }
    };
    
    setExerciseData(newData);

    // Salvar no Supabase com debounce
    try {
      await saveExerciseSets(exerciseId, weekNumber, newData[exerciseId].performedSets);
    } catch (error) {
      console.error('Erro ao salvar séries:', error);
    }
  };

  const addSet = (exerciseId: string) => {
    setExerciseData(prev => {
      const currentSets = prev[exerciseId].performedSets;
      return {
        ...prev,
        [exerciseId]: {
          ...prev[exerciseId],
          performedSets: [
            ...currentSets,
            {
              setNumber: currentSets.length + 1,
              weight: 0,
              reps: 0
            }
          ]
        }
      };
    });
  };

  const removeSet = (exerciseId: string, setIndex: number) => {
    setExerciseData(prev => ({
      ...prev,
      [exerciseId]: {
        ...prev[exerciseId],
        performedSets: prev[exerciseId].performedSets
          .filter((_, idx) => idx !== setIndex)
          .map((set, idx) => ({ ...set, setNumber: idx + 1 }))
      }
    }));
  };

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
            className={`group transition-all duration-300 hover:shadow-lg hover:shadow-training-primary/20 hover:border-training-primary/50 cursor-pointer ${
              exerciseData[exercise.id]?.completed 
                ? 'bg-training-success/5 border-training-success/50' 
                : ''
            }`}
            onClick={() => setSelectedExercise(
              selectedExercise === exercise.id ? null : exercise.id
            )}
          >
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className={`w-8 h-8 rounded-full flex items-center justify-center p-0 ${
                    exerciseData[exercise.id]?.completed ? 'bg-training-success text-white' : ''
                  }`}>
                    {exerciseData[exercise.id]?.completed ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      index + 1
                    )}
                  </Badge>
                  <span className={`text-lg ${exerciseData[exercise.id]?.completed ? 'line-through text-muted-foreground' : ''}`}>
                    {exercise.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={exerciseData[exercise.id]?.completed ? "default" : "outline"}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExerciseCompletion(exercise.id);
                    }}
                    className={`gap-1 ${
                      exerciseData[exercise.id]?.completed 
                        ? 'bg-training-success hover:bg-training-success/80 text-white' 
                        : ''
                    }`}
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    {exerciseData[exercise.id]?.completed ? 'Concluído' : 'Marcar'}
                  </Button>
                  <Badge variant="outline">
                    {exercise.sets}x{exercise.reps}@{exercise.rpe}
                  </Badge>
                  <Badge className="bg-training-warning/20 text-training-warning border-training-warning/30">
                    {exercise.technique}
                  </Badge>
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

              {/* Previous Week Summary */}
              {weekNumber > 1 && (
                <div className="mt-3 p-3 bg-muted/30 rounded-lg border-l-4 border-training-accent/50">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Semana Anterior ({weekNumber - 1}):</p>
                  
                  {(() => {
                    const previousSets = getPreviousWeekData(exercise.id);
                     return previousSets && previousSets.length > 0 ? (
                       <div className="mb-2">
                         <p className="text-xs text-muted-foreground mb-1">Séries realizadas:</p>
                         <div className="flex flex-wrap gap-1">
                           {previousSets
                             .filter(set => set.reps > 0 && set.weight > 0)
                             .map((set, idx) => (
                               <span key={idx} className="text-xs bg-background/50 px-2 py-1 rounded border">
                                 S{idx + 1}: {set.reps} × {set.weight}kg
                               </span>
                             ))}
                           {previousSets.filter(set => set.reps > 0 && set.weight > 0).length === 0 && (
                             <span className="text-xs text-muted-foreground italic">Nenhuma série registrada</span>
                           )}
                         </div>
                       </div>
                    ) : (
                      <div className="mb-2">
                        <p className="text-xs text-muted-foreground mb-1">Séries realizadas:</p>
                        <p className="text-sm text-muted-foreground italic">Nenhuma série registrada na semana anterior</p>
                      </div>
                    );
                  })()}
                  
                  {(() => {
                    const previousObs = getPreviousObservation(exercise.id);
                    return previousObs ? (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Observação:</p>
                        <p className="text-xs text-muted-foreground italic">"{previousObs}"</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Observação:</p>
                        <p className="text-xs text-muted-foreground italic">Nenhuma observação na semana anterior</p>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Expanded Details */}
              {selectedExercise === exercise.id && (
                <div className="space-y-6 animate-scale-in" onClick={(e) => e.stopPropagation()}>
                  <Separator />
                  
                  {/* Technique Description */}
                  {exercise.techniqueDescription && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2 text-training-primary">
                        Técnica: {exercise.technique}
                      </h4>
                      <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                        {exercise.techniqueDescription}
                      </p>
                    </div>
                  )}

                   {/* Previous Week History */}
                   {(() => {
                     const previousSets = getPreviousWeekData(exercise.id);
                     return previousSets && (
                       <div>
                         <h4 className="font-semibold text-sm mb-3 text-training-accent">Semana Anterior</h4>
                         <div className="bg-muted/20 p-3 rounded-lg">
                           <div className="flex items-center gap-2 mb-2">
                             <span className="text-xs font-medium text-muted-foreground">
                               Semana {weekNumber - 1}
                             </span>
                           </div>
                           <div className="grid grid-cols-3 gap-2">
                             {previousSets.map((prevSet, prevSetIndex) => (
                               <div key={prevSetIndex} className="text-xs bg-background/50 p-2 rounded border">
                                 <span className="font-medium">S{prevSetIndex + 1}:</span> {prevSet.reps} reps @ {prevSet.weight}kg
                               </div>
                             ))}
                           </div>
                         </div>
                       </div>
                     );
                   })()}

                   {/* Previous Observation */}
                   {(() => {
                     const previousObs = getPreviousObservation(exercise.id);
                     return previousObs && (
                       <div>
                         <h4 className="font-semibold text-sm mb-2 text-muted-foreground">Observação Anterior</h4>
                         <div className="bg-muted/20 p-3 rounded-lg border-l-4 border-training-accent/50">
                           <p className="text-xs text-muted-foreground italic">
                             "{previousObs}"
                           </p>
                         </div>
                       </div>
                     );
                   })()}

                  {/* Sets Performance Tracking */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-sm">Registro das Séries</h4>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            addSet(exercise.id);
                          }}
                          className="gap-1"
                        >
                          <Plus className="h-3 w-3" />
                          Série
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {exerciseData[exercise.id]?.performedSets.map((set, setIndex) => (
                        <div key={setIndex} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                          <span className="text-sm font-medium w-16">Série {set.setNumber}</span>
                          <div className="flex items-center gap-2">
                            <label className="text-xs text-muted-foreground">Reps:</label>
                            <Input
                              type="number"
                              value={set.reps || ""}
                              onChange={(e) => updateSet(exercise.id, setIndex, 'reps', parseInt(e.target.value) || 0)}
                              className="w-16 h-8 text-sm"
                              placeholder="0"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="text-xs text-muted-foreground">Peso:</label>
                            <Input
                              type="number"
                              value={set.weight || ""}
                              onChange={(e) => updateSet(exercise.id, setIndex, 'weight', parseFloat(e.target.value) || 0)}
                              className="w-20 h-8 text-sm"
                              placeholder="kg"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                          {exerciseData[exercise.id]?.performedSets.length > exercise.sets && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeSet(exercise.id, setIndex);
                              }}
                              className="text-destructive hover:text-destructive"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Observations */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-sm text-training-accent">
                        Observações
                      </h4>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          keepPreviousObservation(exercise.id);
                        }}
                        className="text-xs gap-1"
                      >
                        Manter observação anterior
                      </Button>
                    </div>
                    
                     <Textarea
                       value={exerciseData[exercise.id]?.observations || ""}
                       onChange={(e) => updateObservations(exercise.id, e.target.value)}
                       placeholder="Clique para adicionar uma observação se houver..."
                       className="min-h-[80px] resize-none"
                       onClick={(e) => e.stopPropagation()}
                     />
                  </div>

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
                                ? "bg-training-primary text-primary-foreground border-training-primary"
                                : isDeload
                                ? "bg-training-warning/10 text-training-warning border-training-warning/30"
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