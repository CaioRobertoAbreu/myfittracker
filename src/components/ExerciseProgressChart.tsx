import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Activity, TrendingUp, Weight } from "lucide-react";
import { getExerciseSets } from "@/services/trainingService";
import { Exercise } from "@/types/training";

interface ExerciseProgressChartProps {
  exercises: Exercise[];
  totalWeeks: number;
}

interface ProgressData {
  week: number;
  maxWeight: number;
  totalVolume: number;
  avgReps: number;
}

const chartConfig = {
  maxWeight: {
    label: "Peso Máximo (kg)",
    color: "hsl(var(--primary))",
  },
  totalVolume: {
    label: "Volume Total (kg)",
    color: "hsl(var(--secondary))",
  },
  avgReps: {
    label: "Reps Médias",
    color: "hsl(var(--accent))",
  },
};

export function ExerciseProgressChart({ exercises, totalWeeks }: ExerciseProgressChartProps) {
  const [selectedExercise, setSelectedExercise] = useState<string>("");
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [loading, setLoading] = useState(false);

  // Selecionar primeiro exercício por padrão
  useEffect(() => {
    if (exercises.length > 0 && !selectedExercise) {
      setSelectedExercise(exercises[0].id);
    }
  }, [exercises, selectedExercise]);

  // Carregar dados de progresso quando exercício muda
  useEffect(() => {
    if (!selectedExercise) return;

    async function loadProgressData() {
      setLoading(true);
      try {
        const data: ProgressData[] = [];
        
        for (let week = 1; week <= totalWeeks; week++) {
          const sets = await getExerciseSets(selectedExercise, week);
          
          if (sets.length > 0) {
            const validSets = sets.filter(set => set.weight !== null && set.reps !== null);
            
            if (validSets.length > 0) {
              const weights = validSets.map(set => set.weight!);
              const reps = validSets.map(set => set.reps!);
              
              const maxWeight = Math.max(...weights);
              const totalVolume = validSets.reduce((sum, set) => sum + (set.weight! * set.reps!), 0);
              const avgReps = reps.reduce((sum, rep) => sum + rep, 0) / reps.length;
              
              data.push({
                week,
                maxWeight,
                totalVolume,
                avgReps: Math.round(avgReps * 10) / 10
              });
            } else {
              // Adicionar semana com dados vazios se não há sets válidos
              data.push({
                week,
                maxWeight: 0,
                totalVolume: 0,
                avgReps: 0
              });
            }
          } else {
            // Adicionar semana com dados vazios se não há sets
            data.push({
              week,
              maxWeight: 0,
              totalVolume: 0,
              avgReps: 0
            });
          }
        }
        
        setProgressData(data);
      } catch (error) {
        console.error('Erro ao carregar dados de progresso:', error);
      } finally {
        setLoading(false);
      }
    }

    loadProgressData();
  }, [selectedExercise, totalWeeks]);

  const selectedExerciseData = exercises.find(ex => ex.id === selectedExercise);
  const hasData = progressData.some(data => data.maxWeight > 0 || data.totalVolume > 0);

  const calculateProgress = () => {
    const dataWithValues = progressData.filter(data => data.maxWeight > 0 || data.totalVolume > 0);
    if (dataWithValues.length < 2) return null;
    
    const firstWeek = dataWithValues[0];
    const lastWeek = dataWithValues[dataWithValues.length - 1];
    
    const weightProgress = ((lastWeek.maxWeight - firstWeek.maxWeight) / firstWeek.maxWeight) * 100;
    const volumeProgress = ((lastWeek.totalVolume - firstWeek.totalVolume) / firstWeek.totalVolume) * 100;
    
    return {
      weightProgress: Math.round(weightProgress * 10) / 10,
      volumeProgress: Math.round(volumeProgress * 10) / 10,
      weightGain: lastWeek.maxWeight - firstWeek.maxWeight,
      volumeGain: lastWeek.totalVolume - firstWeek.totalVolume
    };
  };

  const progress = calculateProgress();

  return (
    <div className="space-y-6">
      {/* Seleção de Exercício */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Evolução do Exercício
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedExercise} onValueChange={setSelectedExercise}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione um exercício" />
            </SelectTrigger>
            <SelectContent>
              {exercises.map((exercise) => (
                <SelectItem key={exercise.id} value={exercise.id}>
                  {exercise.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedExerciseData && (
        <>
          {/* Resumo do Progresso */}
          {progress && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Progresso de Peso</p>
                      <p className="text-2xl font-bold">
                        {progress.weightProgress > 0 ? '+' : ''}{progress.weightProgress}%
                      </p>
                      <p className="text-sm text-muted-foreground">
                        +{progress.weightGain}kg
                      </p>
                    </div>
                    <TrendingUp className={`h-8 w-8 ${progress.weightProgress > 0 ? 'text-green-500' : 'text-red-500'}`} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Progresso de Volume</p>
                      <p className="text-2xl font-bold">
                        {progress.volumeProgress > 0 ? '+' : ''}{progress.volumeProgress}%
                      </p>
                      <p className="text-sm text-muted-foreground">
                        +{Math.round(progress.volumeGain)}kg total
                      </p>
                    </div>
                    <Weight className={`h-8 w-8 ${progress.volumeProgress > 0 ? 'text-green-500' : 'text-red-500'}`} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Peso Atual</p>
                    <p className="text-2xl font-bold">
                      {progressData.filter(d => d.maxWeight > 0).slice(-1)[0]?.maxWeight || 0}kg
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Volume Atual</p>
                    <p className="text-2xl font-bold">
                      {Math.round(progressData.filter(d => d.totalVolume > 0).slice(-1)[0]?.totalVolume || 0)}kg
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Gráfico de Peso Máximo */}
          <Card>
            <CardHeader>
              <CardTitle>Evolução do Peso Máximo</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{selectedExerciseData.name}</Badge>
                <Badge variant="secondary">{selectedExerciseData.reps} reps @ RPE {selectedExerciseData.rpe}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : hasData ? (
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={progressData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="week" 
                        tickFormatter={(value) => `Sem ${value}`}
                      />
                      <YAxis 
                        domain={[0, 'dataMax + 5']}
                        tickFormatter={(value) => `${value}kg`}
                      />
                      <ChartTooltip 
                        content={<ChartTooltipContent />}
                        labelFormatter={(value) => `Semana ${value}`}
                        formatter={(value: number) => {
                          if (value === 0) return ['Sem dados', 'Peso Máximo'];
                          return [`${value}kg`, 'Peso Máximo'];
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="maxWeight"
                        stroke="hsl(var(--primary))"
                        strokeWidth={3}
                        dot={(props) => {
                          const { cx, cy, payload } = props;
                          if (payload.maxWeight === 0) {
                            return <circle cx={cx} cy={cy} r={4} fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth={2} />;
                          }
                          return <circle cx={cx} cy={cy} r={6} fill="hsl(var(--primary))" strokeWidth={2} />;
                        }}
                        activeDot={{ r: 8 }}
                        connectNulls={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <p>Nenhum dado de treino registrado ainda</p>
                    <p className="text-sm mt-2">Registre seus treinos para visualizar a evolução</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Gráfico de Volume Total */}
          <Card>
            <CardHeader>
              <CardTitle>Evolução do Volume Total</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : hasData ? (
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={progressData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="week" 
                        tickFormatter={(value) => `Sem ${value}`}
                      />
                      <YAxis 
                        domain={[0, 'dataMax + 50']}
                        tickFormatter={(value) => `${value}kg`}
                      />
                      <ChartTooltip 
                        content={<ChartTooltipContent />}
                        labelFormatter={(value) => `Semana ${value}`}
                        formatter={(value: number) => {
                          if (value === 0) return ['Sem dados', 'Volume Total'];
                          return [`${Math.round(value)}kg`, 'Volume Total'];
                        }}
                      />
                      <Bar
                        dataKey="totalVolume"
                        fill="hsl(var(--secondary))"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <p>Nenhum dado de treino registrado ainda</p>
                    <p className="text-sm mt-2">Registre seus treinos para visualizar a evolução</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}