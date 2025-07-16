import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Plus, Trash2, Calendar, Target, Dumbbell } from 'lucide-react';
import { ExerciseForm } from '@/components/ExerciseForm';
import { createTrainingPlan } from '@/services/trainingService';
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

export default function CreateTraining() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [totalWeeks, setTotalWeeks] = useState(8);
  const [days, setDays] = useState<TrainingDay[]>([
    {
      id: 'day-1',
      dayNumber: 1,
      name: 'Dia 1',
      exercises: []
    }
  ]);

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
    console.log('🏋️ Adicionando exercício:', { dayId, exercise });
    const updatedDays = days.map(day =>
      day.id === dayId
        ? { ...day, exercises: [...day.exercises, exercise] }
        : day
    );
    console.log('📅 Estado atualizado dos dias:', updatedDays);
    setDays(updatedDays);
  };

  const removeExerciseFromDay = (dayId: string, exerciseId: string) => {
    setDays(days.map(day =>
      day.id === dayId
        ? { ...day, exercises: day.exercises.filter(ex => ex.id !== exerciseId) }
        : day
    ));
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

    setLoading(true);
    try {
      const planId = await createTrainingPlan({
        name: name.trim(),
        description: description.trim() || null,
        totalWeeks,
        days
      });

      toast({
        title: "Sucesso!",
        description: "Treino criado com sucesso"
      });

      navigate('/treinos');
    } catch (error) {
      console.error('Erro ao criar treino:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar treino. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

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
            <h1 className="text-3xl font-bold text-foreground">Criar Novo Treino</h1>
            <p className="text-muted-foreground">Configure seu plano de treinamento personalizado</p>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <Label htmlFor="weeks">Duração (semanas)</Label>
                  <Input
                    id="weeks"
                    type="number"
                    min="1"
                    max="52"
                    value={totalWeeks}
                    onChange={(e) => setTotalWeeks(parseInt(e.target.value) || 8)}
                  />
                </div>
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
                    {day.exercises.map((exercise) => (
                      <div
                        key={exercise.id}
                        className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="font-medium">{exercise.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {exercise.sets} séries • {exercise.reps} reps • RPE {exercise.rpe}
                            {exercise.technique && ` • ${exercise.technique}`}
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeExerciseFromDay(day.id, exercise.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    
                    <ExerciseForm
                      onAddExercise={(exercise) => addExerciseToDay(day.id, exercise)}
                    />
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
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Criando...
                </>
              ) : (
                <>
                  <Dumbbell className="h-4 w-4 mr-2" />
                  Criar Treino
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}