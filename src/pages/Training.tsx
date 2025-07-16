import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Calendar, Dumbbell, Plus, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { TrainingPlan } from "@/types/training";
import { TrainingDayView } from "@/components/TrainingDayView";
import { WeekProgress } from "@/components/WeekProgress";

// Mock data based on the provided spreadsheet
const mockTrainingPlan: TrainingPlan = {
  id: "1",
  name: "Programa de Hipertrofia - 8 Semanas",
  description: "Programa focado em hipertrofia com progressão dupla",
  totalWeeks: 8,
  currentWeek: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  weeks: [
    {
      id: "week-1",
      weekNumber: 1,
      isDeload: false,
      days: [
        {
          id: "day-1-1",
          dayNumber: 1,
          name: "Dia 1 - Pernas",
          exercises: [
            {
              id: "ex-1",
              name: "Agachamento (com pausa de 2 segundos)",
              sets: 3,
              reps: "3-5",
              rpe: 8,
              progressionType: "Progressão Dupla",
              technique: "Pausa controlada",
              techniqueDescription: "Desça controladamente e faça uma pausa de 2 segundos no fundo antes de subir",
              observations: "Manter a coluna neutra durante todo o movimento"
            },
            {
              id: "ex-2",
              name: "RDL (com pausa de 2 segundos)",
              sets: 3,
              reps: "3-5",
              rpe: 8,
              progressionType: "Progressão Dupla",
              technique: "Romanian Deadlift com pausa",
              techniqueDescription: "Desça até sentir alongamento nos posteriores, pause 2 segundos e retorne",
              observations: "Manter joelhos levemente flexionados"
            },
            {
              id: "ex-3",
              name: "Pull Through",
              sets: 3,
              reps: "6-8",
              rpe: 8,
              progressionType: "Progressão Dupla",
              technique: "Movimento de quadril",
              techniqueDescription: "Movimento iniciado pelo quadril, contraindo glúteos no final",
              observations: "Foco na ativação dos glúteos"
            },
            {
              id: "ex-4",
              name: "Gemeos Leg Press (pausa de 2 segundos)",
              sets: 4,
              reps: "6-8",
              rpe: 8,
              progressionType: "Progressão Dupla",
              technique: "Contração mantida",
              techniqueDescription: "Subir na ponta dos pés, pausar 2 segundos no topo",
              observations: "Amplitude completa de movimento"
            }
          ]
        },
        {
          id: "day-1-2",
          dayNumber: 2,
          name: "Dia 2 - Empurrar",
          exercises: [
            {
              id: "ex-5",
              name: "Supino Halter (com pausa de 2 segundos)",
              sets: 3,
              reps: "3-5",
              rpe: 8,
              progressionType: "Progressão Dupla",
              technique: "Pausa no peito",
              techniqueDescription: "Desça os halteres até o peito, pause 2 segundos e empurre",
              observations: "Manter escápulas retraídas"
            },
            {
              id: "ex-6",
              name: "Remada na Máquina",
              sets: 3,
              reps: "4-6",
              rpe: 8,
              progressionType: "Progressão Dupla",
              technique: "Puxada controlada",
              techniqueDescription: "Puxar até o peito, contrair as escápulas",
              observations: "Evitar balanço do tronco"
            },
            {
              id: "ex-7",
              name: "Desenvolvimento Halter Unilateral em Pé (com pausa de 2 segundos)",
              sets: 2,
              reps: "5-7",
              rpe: 8,
              progressionType: "Progressão Dupla",
              technique: "Unilateral com pausa",
              techniqueDescription: "Empurrar halter acima da cabeça, pausar 2 segundos no topo",
              observations: "Manter core contraído para estabilidade"
            },
            {
              id: "ex-8",
              name: "Puxador Aberto",
              sets: 2,
              reps: "6-8",
              rpe: 8,
              progressionType: "Progressão Dupla",
              technique: "Pegada aberta",
              techniqueDescription: "Puxar com pegada mais aberta que os ombros",
              observations: "Foco na contração dos dorsais"
            },
            {
              id: "ex-9",
              name: "Elevação Lateral com Halter",
              sets: 2,
              reps: "10-15",
              rpe: 8,
              progressionType: "Progressão Dupla",
              technique: "Movimento lateral",
              techniqueDescription: "Elevar os braços lateralmente até a altura dos ombros",
              observations: "Controlar a descida do movimento"
            }
          ]
        },
        {
          id: "day-1-4",
          dayNumber: 4,
          name: "Dia 4 - Pernas (Volume)",
          exercises: [
            {
              id: "ex-10",
              name: "Elevação de Quadril Guiado",
              sets: 3,
              reps: "6-8",
              rpe: 8,
              progressionType: "Progressão Dupla",
              technique: "Hip Thrust",
              techniqueDescription: "Elevar o quadril contraindo os glúteos",
              observations: "Pausa de 1 segundo no topo"
            },
            {
              id: "ex-11",
              name: "Agachamento Frontal com Halter (com pausa de 5 segundos)",
              sets: 3,
              reps: "6-8",
              rpe: 8,
              progressionType: "Progressão Dupla",
              technique: "Front Squat com pausa longa",
              techniqueDescription: "Agachamento com halter na frente, pausa de 5 segundos embaixo",
              observations: "Manter o tronco ereto durante toda a pausa"
            },
            {
              id: "ex-12",
              name: "Cadeira Extensora",
              sets: 3,
              reps: "8-12",
              rpe: 8,
              progressionType: "Progressão Dupla",
              technique: "Extensão controlada",
              techniqueDescription: "Estender as pernas controladamente",
              observations: "Pausa de 1 segundo no topo"
            },
            {
              id: "ex-13",
              name: "Cadeira Flexora",
              sets: 3,
              reps: "8-12",
              rpe: 8,
              progressionType: "Progressão Dupla",
              technique: "Flexão controlada",
              techniqueDescription: "Flexionar as pernas até o máximo",
              observations: "Controlar a fase excêntrica"
            },
            {
              id: "ex-14",
              name: "Gemeos Leg Press (pausa de 2 segundos)",
              sets: 4,
              reps: "10-15",
              rpe: 8,
              progressionType: "Progressão Dupla",
              technique: "Contração mantida",
              techniqueDescription: "Subir na ponta dos pés, pausar 2 segundos no topo",
              observations: "Volume maior que o Dia 1"
            }
          ]
        },
        {
          id: "day-1-5",
          dayNumber: 5,
          name: "Dia 5 - Push/Pull (Volume)",
          exercises: [
            {
              id: "ex-15",
              name: "Supino Halter (com pausa de 2 segundos)",
              sets: 3,
              reps: "6-10",
              rpe: 8,
              progressionType: "Progressão Dupla",
              technique: "Pausa no peito",
              techniqueDescription: "Versão com maior volume que o Dia 2",
              observations: "Foco na contração máxima"
            },
            {
              id: "ex-16",
              name: "Remada na Polia",
              sets: 3,
              reps: "6-10",
              rpe: 8,
              progressionType: "Progressão Dupla",
              technique: "Puxada na polia",
              techniqueDescription: "Puxar a polia até o abdome",
              observations: "Manter postura ereta"
            },
            {
              id: "ex-17",
              name: "Desenvolvimento Halter Unilateral em Pé (com pausa de 2 segundos)",
              sets: 2,
              reps: "8-12",
              rpe: 8,
              progressionType: "Progressão Dupla",
              technique: "Unilateral com pausa",
              techniqueDescription: "Versão com maior volume",
              observations: "Alternar braços a cada série"
            },
            {
              id: "ex-18",
              name: "Puxador Diagonal na Polia",
              sets: 2,
              reps: "8-12",
              rpe: 8,
              progressionType: "Progressão Dupla",
              technique: "Puxada diagonal",
              techniqueDescription: "Puxar em ângulo diagonal",
              observations: "Variar ângulo de puxada"
            },
            {
              id: "ex-19",
              name: "Triceps Francês Unilateral na Polia",
              sets: 2,
              reps: "8-12",
              rpe: 8,
              progressionType: "Progressão Dupla",
              technique: "Francês unilateral",
              techniqueDescription: "Extensão de tríceps com um braço",
              observations: "Manter cotovelo fixo"
            },
            {
              id: "ex-20",
              name: "Rosca Martelo na Polia",
              sets: 2,
              reps: "8-12",
              rpe: 8,
              progressionType: "Progressão Dupla",
              technique: "Rosca martelo",
              techniqueDescription: "Flexão de bíceps com pegada neutra",
              observations: "Controlar a descida"
            }
          ]
        }
      ]
    }
  ]
};

export default function Training() {
  const navigate = useNavigate();
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const currentWeek = mockTrainingPlan.weeks.find(w => w.weekNumber === selectedWeek);
  const activeDays = currentWeek?.days.filter(day => day.exercises.length > 0) || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {mockTrainingPlan.name}
                </h1>
                <p className="text-muted-foreground">
                  {mockTrainingPlan.description}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="gap-2">
                <Calendar className="h-3 w-3" />
                Semana {mockTrainingPlan.currentWeek} de {mockTrainingPlan.totalWeeks}
              </Badge>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Novo Treino
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {!selectedDay ? (
          <>
            {/* Week Progress Overview */}
            <WeekProgress 
              currentWeek={selectedWeek}
              totalWeeks={mockTrainingPlan.totalWeeks}
              onWeekChange={setSelectedWeek}
            />

            {/* Training Days Grid */}
            <div className="mt-8">
              <div className="flex items-center gap-2 mb-6">
                <Dumbbell className="h-5 w-5 text-training-primary" />
                <h2 className="text-xl font-semibold">
                  Treinos da Semana {selectedWeek}
                  {currentWeek?.isDeload && (
                    <Badge variant="outline" className="ml-2">
                      Deload
                    </Badge>
                  )}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeDays.map((day) => (
                  <Card
                    key={day.id}
                    className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-training-primary/20 hover:border-training-primary/50 animate-fade-in"
                    onClick={() => setSelectedDay(day.id)}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center justify-between">
                        <span className="text-lg">{day.name}</span>
                        <Badge variant="secondary">
                          {day.exercises.length} exercícios
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {day.exercises.slice(0, 3).map((exercise, idx) => (
                          <div
                            key={exercise.id}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="text-muted-foreground truncate">
                              {exercise.name}
                            </span>
                            <Badge variant="outline">
                              {exercise.sets}x{exercise.reps}@{exercise.rpe}
                            </Badge>
                          </div>
                        ))}
                        {day.exercises.length > 3 && (
                          <div className="text-xs text-muted-foreground text-center">
                            +{day.exercises.length - 3} exercícios
                          </div>
                        )}
                      </div>
                      <div className="mt-4 flex items-center gap-2">
                        <Target className="h-4 w-4 text-training-primary" />
                        <span className="text-sm text-muted-foreground">
                          Clique para ver detalhes
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </>
        ) : (
          <TrainingDayView
            day={activeDays.find(d => d.id === selectedDay)!}
            weekNumber={selectedWeek}
            onBack={() => setSelectedDay(null)}
          />
        )}
      </div>
    </div>
  );
}