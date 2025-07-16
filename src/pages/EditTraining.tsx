import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Save, Calendar, Target, Dumbbell, Plus, Trash2, Edit, MoveUp, MoveDown } from 'lucide-react';
import { ExerciseForm } from '@/components/ExerciseForm';
import { getTrainingPlan, updateTrainingPlan } from '@/services/trainingService';
import { useToast } from '@/hooks/use-toast';

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  rpe: number;
  progressionType: string;
  technique?: string;
  techniqueDescription?: string;
}

interface TrainingDay {
  id: string;
  dayNumber: number;
  name: string;
  exercises: Exercise[];
}

export default function EditTraining() {
  const navigate = useNavigate();
  const { planId } = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingExercise, setEditingExercise] = useState<{dayId: string, exerciseId: string} | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [totalWeeks, setTotalWeeks] = useState(8);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [days, setDays] = useState<TrainingDay[]>([]);

  useEffect(() => {
    if (!planId) {
      navigate('/treinos');
      return;
    }
    loadTrainingData();
  }, [planId]);

  const loadTrainingData = async () => {
    try {
      const plan = await getTrainingPlan(planId!);
      if (!plan) {
        toast({
          title: "Erro",
          description: "Treino não encontrado",
          variant: "destructive"
        });
        navigate('/treinos');
        return;
      }

      // Preencher formulário com dados existentes
      setName(plan.name);
      setDescription(plan.description || '');
      setTotalWeeks(plan.totalWeeks);
      setStartDate(plan.startDate.toISOString().split('T')[0]);
      setEndDate(plan.endDate.toISOString().split('T')[0]);
      
      // Converter exercícios do formato de semanas para formato de edição
      // Pegamos os exercícios da primeira semana como template
      if (plan.weeks.length > 0) {
        const firstWeek = plan.weeks[0];
        setDays(firstWeek.days.map(day => ({
          id: day.id,
          dayNumber: day.dayNumber,
          name: day.name,
          exercises: day.exercises.map(ex => ({
            id: ex.id,
            name: ex.name,
            sets: ex.sets,
            reps: ex.reps,
            rpe: ex.rpe,
            progressionType: ex.progressionType,
            technique: ex.technique,
            techniqueDescription: ex.techniqueDescription
          }))
        })));
      }
    } catch (error) {
      console.error('Erro ao carregar treino:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do treino",
        variant: "destructive"
      });
      navigate('/treinos');
    } finally {
      setLoading(false);
    }
  };

  // Atualizar data de fim quando semanas mudarem
  const updateEndDate = (weeks: number) => {
    setTotalWeeks(weeks);
    const end = new Date(startDate);
    end.setDate(end.getDate() + (weeks * 7));
    setEndDate(end.toISOString().split('T')[0]);
  };

  const addDay = () => {
    const newDay: TrainingDay = {
      id: `day-${days.length + 1}`,
      dayNumber: days.length + 1,
      name: `Dia ${days.length + 1}`,
      exercises: []
    };
    setDays([...days, newDay]);
  };

  const removeDay = (dayId: string) => {
    if (days.length > 1) {
      setDays(days.filter(day => day.id !== dayId));
    }
  };

  const updateDayName = (dayId: string, newName: string) => {
    setDays(days.map(day =>
      day.id === dayId ? { ...day, name: newName } : day
    ));
  };

  const addExerciseToDay = (dayId: string, exercise: Exercise) => {
    setDays(days.map(day =>
      day.id === dayId
        ? { ...day, exercises: [...day.exercises, exercise] }
        : day
    ));
  };

  const removeExerciseFromDay = (dayId: string, exerciseId: string) => {
    setDays(days.map(day =>
      day.id === dayId
        ? { ...day, exercises: day.exercises.filter(ex => ex.id !== exerciseId) }
        : day
    ));
  };

  const updateExercise = (dayId: string, exerciseId: string, updatedExercise: Exercise) => {
    setDays(days.map(day =>
      day.id === dayId
        ? { 
            ...day, 
            exercises: day.exercises.map(ex => 
              ex.id === exerciseId ? updatedExercise : ex
            ) 
          }
        : day
    ));
    setEditingExercise(null);
  };

  const moveExerciseUp = (dayId: string, exerciseIndex: number) => {
    if (exerciseIndex === 0) return;
    
    setDays(days.map(day => {
      if (day.id === dayId) {
        const newExercises = [...day.exercises];
        [newExercises[exerciseIndex - 1], newExercises[exerciseIndex]] = 
        [newExercises[exerciseIndex], newExercises[exerciseIndex - 1]];
        return { ...day, exercises: newExercises };
      }
      return day;
    }));
  };

  const moveExerciseDown = (dayId: string, exerciseIndex: number) => {
    const day = days.find(d => d.id === dayId);
    if (!day || exerciseIndex === day.exercises.length - 1) return;
    
    setDays(days.map(d => {
      if (d.id === dayId) {
        const newExercises = [...d.exercises];
        [newExercises[exerciseIndex], newExercises[exerciseIndex + 1]] = 
        [newExercises[exerciseIndex + 1], newExercises[exerciseIndex]];
        return { ...d, exercises: newExercises };
      }
      return d;
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Erro",
        description: "Nome do treino é obrigatório",
        variant: "destructive"
      });
      return;
    }

    if (days.some(day => day.exercises.length === 0)) {
      toast({
        title: "Erro", 
        description: "Todos os dias devem ter pelo menos um exercício",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      await updateTrainingPlan(planId!, {
        name: name.trim(),
        description: description.trim() || null,
        totalWeeks,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        days
      });

      toast({
        title: "Sucesso!",
        description: "Treino atualizado com sucesso"
      });

      navigate('/treinos');
    } catch (error) {
      console.error('Erro ao atualizar treino:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar treino. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando treino...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/treinos')}
            className="hover:bg-muted/50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Editar Treino</h1>
            <p className="text-muted-foreground">Modifique as configurações do seu plano de treinamento</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Informações Básicas
              </CardTitle>
              <CardDescription>
                Defina as informações principais do seu treino
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Treino *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Programa de Hipertrofia"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="startDate">Data de Início</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      const end = new Date(e.target.value);
                      end.setDate(end.getDate() + (totalWeeks * 7));
                      setEndDate(end.toISOString().split('T')[0]);
                    }}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="weeks">Duração (semanas)</Label>
                  <Input
                    id="weeks"
                    type="number"
                    min="1"
                    max="52"
                    value={totalWeeks}
                    onChange={(e) => updateEndDate(parseInt(e.target.value) || 8)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="endDate">Data de Fim (calculada)</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Descreva os objetivos e características do treino..."
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Training Days */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Dias de Treino
                  </CardTitle>
                  <CardDescription>
                    Configure os dias da semana e exercícios
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addDay}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Adicionar Dia
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {days.map((day, dayIndex) => (
                <div key={day.id} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="bg-primary/10 text-primary">
                        Dia {day.dayNumber}
                      </Badge>
                      <Input
                        value={day.name}
                        onChange={(e) => updateDayName(day.id, e.target.value)}
                        className="w-64"
                        placeholder="Nome do dia"
                      />
                    </div>
                    {days.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDay(day.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {/* Exercises for this day */}
                  <div className="ml-4 space-y-3">
                    {day.exercises.map((exercise, exerciseIndex) => (
                      <div key={exercise.id}>
                        {editingExercise?.dayId === day.id && editingExercise?.exerciseId === exercise.id ? (
                          <ExerciseForm
                            initialExercise={exercise}
                            onAddExercise={(updatedExercise) => updateExercise(day.id, exercise.id, updatedExercise)}
                            onCancel={() => setEditingExercise(null)}
                            isEditing={true}
                          />
                        ) : (
                          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                            <div className="flex-1">
                              <div className="font-medium">{exercise.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {exercise.sets} séries • {exercise.reps} reps • RPE {exercise.rpe}
                                {exercise.technique && ` • ${exercise.technique}`}
                              </div>
                              {exercise.techniqueDescription && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  {exercise.techniqueDescription}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {/* Move Up/Down buttons */}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => moveExerciseUp(day.id, exerciseIndex)}
                                disabled={exerciseIndex === 0}
                                className="p-1 h-8 w-8"
                              >
                                <MoveUp className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => moveExerciseDown(day.id, exerciseIndex)}
                                disabled={exerciseIndex === day.exercises.length - 1}
                                className="p-1 h-8 w-8"
                              >
                                <MoveDown className="h-4 w-4" />
                              </Button>
                              
                              {/* Edit button */}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingExercise({dayId: day.id, exerciseId: exercise.id})}
                                className="p-1 h-8 w-8"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              
                              {/* Remove button */}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeExerciseFromDay(day.id, exercise.id)}
                                className="text-destructive hover:text-destructive p-1 h-8 w-8"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {!editingExercise && (
                      <ExerciseForm
                        onAddExercise={(exercise) => addExerciseToDay(day.id, exercise)}
                      />
                    )}
                  </div>

                  {dayIndex < days.length - 1 && <Separator />}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/treinos')}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}