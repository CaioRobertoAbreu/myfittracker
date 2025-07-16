import { supabase } from "@/integrations/supabase/client";
import { TrainingPlan, TrainingWeek, TrainingDay, Exercise } from "@/types/training";

export interface DatabaseExercise {
  id: string;
  exercise_id: string;
  name: string;
  sets: number;
  reps: string;
  rpe: number;
  progression_type: string;
  technique: string | null;
  technique_description: string | null;
}

export interface DatabaseExerciseSet {
  id: string;
  exercise_id: string;
  week_number: number;
  set_number: number;
  weight: number | null;
  reps: number | null;
}

export interface DatabaseExerciseObservation {
  id: string;
  exercise_id: string;
  week_number: number;
  observations: string | null;
  is_completed: boolean;
}

// Inicializar dados mock no banco se não existirem
export async function initializeMockData() {
  try {
    console.log('Iniciando verificação de dados existentes...');
    
    // Verificar se já existe um plano de treino
    const { data: existingPlans, error: checkError } = await supabase
      .from('training_plans')
      .select('id')
      .limit(1);

    console.log('Resultado da verificação:', { existingPlans, checkError });

    if (checkError) {
      console.error('Erro ao verificar planos existentes:', checkError);
      throw checkError;
    }

    if (existingPlans && existingPlans.length > 0) {
      console.log('Plano existente encontrado:', existingPlans[0].id);
      return existingPlans[0].id; // Retorna o ID do plano existente
    }

    console.log('Nenhum plano encontrado, criando novo...');

    // Criar plano de treino
    const { data: plan, error: planError } = await supabase
      .from('training_plans')
      .insert({
        user_id: crypto.randomUUID(), // Gerar UUID válido
        name: 'Programa de Hipertrofia - 8 Semanas',
        description: 'Programa focado em hipertrofia com progressão dupla',
        total_weeks: 8,
        current_week: 1
      })
      .select()
      .single();

    if (planError) throw planError;

    // Criar semanas
    const weeks = Array.from({ length: 8 }, (_, i) => ({
      training_plan_id: plan.id,
      week_number: i + 1,
      is_deload: i + 1 === 4 || i + 1 === 8
    }));

    const { data: createdWeeks, error: weeksError } = await supabase
      .from('training_weeks')
      .insert(weeks)
      .select();

    if (weeksError) throw weeksError;

    // Criar dias para cada semana
    const days = [];
    const exercises = [];

    for (const week of createdWeeks) {
      // Dia 1 - Pernas
      const day1 = {
        training_week_id: week.id,
        day_number: 1,
        name: 'Dia 1 - Pernas'
      };
      days.push(day1);

      // Dia 2 - Empurrar  
      const day2 = {
        training_week_id: week.id,
        day_number: 2,
        name: 'Dia 2 - Empurrar'
      };
      days.push(day2);

      // Dia 4 - Pernas (Volume)
      const day4 = {
        training_week_id: week.id,
        day_number: 4,
        name: 'Dia 4 - Pernas (Volume)'
      };
      days.push(day4);

      // Dia 5 - Push/Pull (Volume)
      const day5 = {
        training_week_id: week.id,
        day_number: 5,
        name: 'Dia 5 - Push/Pull (Volume)'
      };
      days.push(day5);
    }

    const { data: createdDays, error: daysError } = await supabase
      .from('training_days')
      .insert(days)
      .select();

    if (daysError) throw daysError;

    // Criar exercícios para cada dia
    for (const day of createdDays) {
      let dayExercises = [];

      if (day.name === 'Dia 1 - Pernas') {
        dayExercises = [
          {
            training_day_id: day.id,
            exercise_id: 'agachamento-pausa',
            name: 'Agachamento (com pausa de 2 segundos)',
            sets: 3,
            reps: '3-5',
            rpe: 8,
            progression_type: 'Progressão Dupla',
            technique: 'Progressão Dupla',
            technique_description: 'Aumente as repetições até atingir o máximo da faixa, depois aumente o peso e volte ao mínimo de repetições. Pausa de 2 segundos na posição inferior.'
          },
          {
            training_day_id: day.id,
            exercise_id: 'rdl-pausa',
            name: 'RDL (com pausa de 2 segundos)',
            sets: 3,
            reps: '3-5',
            rpe: 8,
            progression_type: 'Progressão Dupla',
            technique: 'Progressão Dupla',
            technique_description: 'Aumente as repetições até atingir o máximo da faixa, depois aumente o peso e volte ao mínimo de repetições. Desça até sentir alongamento nos posteriores, pause 2 segundos e retorne.'
          },
          {
            training_day_id: day.id,
            exercise_id: 'pull-through',
            name: 'Pull Through',
            sets: 3,
            reps: '6-8',
            rpe: 8,
            progression_type: 'Progressão Dupla',
            technique: 'Progressão Dupla',
            technique_description: 'Aumente as repetições até atingir o máximo da faixa, depois aumente o peso e volte ao mínimo de repetições. Movimento iniciado pelo quadril, contraindo glúteos no final.'
          },
          {
            training_day_id: day.id,
            exercise_id: 'gemeos-leg-press',
            name: 'Gemeos Leg Press (pausa de 2 segundos)',
            sets: 4,
            reps: '6-8',
            rpe: 8,
            progression_type: 'Progressão Dupla',
            technique: 'Progressão Dupla',
            technique_description: 'Aumente as repetições até atingir o máximo da faixa, depois aumente o peso e volte ao mínimo de repetições. Subir na ponta dos pés, pausar 2 segundos no topo.'
          }
        ];
      } else if (day.name === 'Dia 2 - Empurrar') {
        dayExercises = [
          {
            training_day_id: day.id,
            exercise_id: 'supino-halter',
            name: 'Supino Halter (com pausa de 2 segundos)',
            sets: 3,
            reps: '3-5',
            rpe: 8,
            progression_type: 'Progressão Dupla',
            technique: 'Progressão Dupla',
            technique_description: 'Aumente as repetições até atingir o máximo da faixa, depois aumente o peso e volte ao mínimo de repetições. Desça os halteres até o peito, pause 2 segundos e empurre.'
          },
          {
            training_day_id: day.id,
            exercise_id: 'remada-maquina',
            name: 'Remada na Máquina',
            sets: 3,
            reps: '4-6',
            rpe: 8,
            progression_type: 'Progressão Dupla',
            technique: 'Progressão Dupla',
            technique_description: 'Aumente as repetições até atingir o máximo da faixa, depois aumente o peso e volte ao mínimo de repetições. Puxar até o peito, contrair as escápulas.'
          },
          {
            training_day_id: day.id,
            exercise_id: 'desenvolvimento-unilateral',
            name: 'Desenvolvimento Halter Unilateral em Pé (com pausa de 2 segundos)',
            sets: 2,
            reps: '5-7',
            rpe: 8,
            progression_type: 'Progressão Dupla',
            technique: 'Progressão Dupla',
            technique_description: 'Aumente as repetições até atingir o máximo da faixa, depois aumente o peso e volte ao mínimo de repetições. Empurrar halter acima da cabeça, pausar 2 segundos no topo.'
          },
          {
            training_day_id: day.id,
            exercise_id: 'puxador-aberto',
            name: 'Puxador Aberto',
            sets: 2,
            reps: '6-8',
            rpe: 8,
            progression_type: 'Progressão Dupla',
            technique: 'Progressão Dupla',
            technique_description: 'Aumente as repetições até atingir o máximo da faixa, depois aumente o peso e volte ao mínimo de repetições. Puxar com pegada mais aberta que os ombros.'
          },
          {
            training_day_id: day.id,
            exercise_id: 'elevacao-lateral',
            name: 'Elevação Lateral com Halter',
            sets: 2,
            reps: '10-15',
            rpe: 8,
            progression_type: 'Progressão Dupla',
            technique: 'Progressão Dupla',
            technique_description: 'Aumente as repetições até atingir o máximo da faixa, depois aumente o peso e volte ao mínimo de repetições. Elevar os braços lateralmente até a altura dos ombros.'
          }
        ];
      }
      // ... adicionar mais dias conforme necessário

      if (dayExercises.length > 0) {
        exercises.push(...dayExercises);
      }
    }

    if (exercises.length > 0) {
      const { error: exercisesError } = await supabase
        .from('exercises')
        .insert(exercises);

      if (exercisesError) throw exercisesError;
    }

    return plan.id;
  } catch (error) {
    console.error('Erro ao inicializar dados mock:', error);
    throw error;
  }
}

// Buscar plano de treino
export async function getTrainingPlan(): Promise<TrainingPlan | null> {
  try {
    console.log('Buscando plano de treino...');
    
    const { data: plans, error } = await supabase
      .from('training_plans')
      .select(`
        *,
        weeks:training_weeks(
          *,
          days:training_days(
            *,
            exercises(*)
          )
        )
      `)
      .limit(1);

    console.log('Resultado da busca:', { plans, error });

    if (error) {
      console.error('Erro na query:', error);
      throw error;
    }
    
    if (!plans || plans.length === 0) {
      console.log('Nenhum plano encontrado');
      return null;
    }

    const plan = plans[0];
    
    // Converter para o formato esperado pelo frontend
    const trainingPlan: TrainingPlan = {
      id: plan.id,
      name: plan.name,
      description: plan.description,
      totalWeeks: plan.total_weeks,
      currentWeek: plan.current_week,
      createdAt: new Date(plan.created_at),
      updatedAt: new Date(plan.updated_at),
      weeks: plan.weeks.map((week: any) => ({
        id: week.id,
        weekNumber: week.week_number,
        isDeload: week.is_deload,
        days: week.days.map((day: any) => ({
          id: day.id,
          dayNumber: day.day_number,
          name: day.name,
          exercises: day.exercises.map((ex: any) => ({
            id: ex.id,
            name: ex.name,
            sets: ex.sets,
            reps: ex.reps,
            rpe: ex.rpe,
            progressionType: ex.progression_type,
            technique: ex.technique,
            techniqueDescription: ex.technique_description
          }))
        }))
      }))
    };

    return trainingPlan;
  } catch (error) {
    console.error('Erro ao buscar plano de treino:', error);
    return null;
  }
}

// Salvar séries de um exercício
export async function saveExerciseSets(exerciseId: string, weekNumber: number, sets: Array<{setNumber: number, weight: number | null, reps: number | null}>) {
  try {
    // Primeiro, remover séries existentes para esta semana
    await supabase
      .from('exercise_sets')
      .delete()
      .eq('exercise_id', exerciseId)
      .eq('week_number', weekNumber);

    // Inserir novas séries (apenas as que têm valores válidos)
    const validSets = sets.filter(set => set.weight !== null && set.reps !== null);
    
    if (validSets.length > 0) {
      const { error } = await supabase
        .from('exercise_sets')
        .insert(
          validSets.map(set => ({
            exercise_id: exerciseId,
            week_number: weekNumber,
            set_number: set.setNumber,
            weight: set.weight,
            reps: set.reps
          }))
        );

      if (error) throw error;
    }
  } catch (error) {
    console.error('Erro ao salvar séries:', error);
    throw error;
  }
}

// Buscar séries de um exercício
export async function getExerciseSets(exerciseId: string, weekNumber: number): Promise<Array<{setNumber: number, weight: number | null, reps: number | null}>> {
  try {
    console.log(`🔍 Buscando séries no banco:`, { exerciseId, weekNumber });
    
    // Primeiro busca o exercise_id baseado no id do exercício
    const { data: exerciseData, error: exerciseError } = await supabase
      .from('exercises')
      .select('exercise_id')
      .eq('id', exerciseId)
      .single();
    
    if (exerciseError) throw exerciseError;
    
    // Agora busca séries baseado no exercise_id e semana
    const { data, error } = await supabase
      .from('exercise_sets')
      .select(`
        *,
        exercises!inner(exercise_id)
      `)
      .eq('exercises.exercise_id', exerciseData.exercise_id)
      .eq('week_number', weekNumber)
      .order('set_number');

    console.log(`📊 Resultado da query exercise_sets:`, { data, error, exerciseId, weekNumber });

    if (error) throw error;

    const result = data?.map(set => ({
      setNumber: set.set_number,
      weight: set.weight,
      reps: set.reps
    })) || [];
    
    console.log(`✅ Séries processadas:`, result);
    return result;
  } catch (error) {
    console.error('Erro ao buscar séries:', error);
    return [];
  }
}

// Salvar observação e status de conclusão
export async function saveExerciseObservation(exerciseId: string, weekNumber: number, observations: string, isCompleted: boolean) {
  try {
    const { error } = await supabase
      .from('exercise_observations')
      .upsert({
        exercise_id: exerciseId,
        week_number: weekNumber,
        observations,
        is_completed: isCompleted
      }, {
        onConflict: 'exercise_id,week_number'
      });

    if (error) throw error;
  } catch (error) {
    console.error('Erro ao salvar observação:', error);
    throw error;
  }
}

// Buscar observação de um exercício
export async function getExerciseObservation(exerciseId: string, weekNumber: number): Promise<{observations: string, isCompleted: boolean}> {
  try {
    console.log(`🔍 Buscando observação no banco:`, { exerciseId, weekNumber });
    
    // Primeiro busca o exercise_id baseado no id do exercício
    const { data: exerciseData, error: exerciseError } = await supabase
      .from('exercises')
      .select('exercise_id')
      .eq('id', exerciseId)
      .single();
    
    if (exerciseError) throw exerciseError;
    
    // Agora busca observações baseado no exercise_id e semana
    const { data, error } = await supabase
      .from('exercise_observations')
      .select(`
        *,
        exercises!inner(exercise_id)
      `)
      .eq('exercises.exercise_id', exerciseData.exercise_id)
      .eq('week_number', weekNumber)
      .single();

    console.log(`📝 Resultado da query exercise_observations:`, { data, error, exerciseId, weekNumber });

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found

    const result = {
      observations: data?.observations || '',
      isCompleted: data?.is_completed || false
    };
    
    console.log(`✅ Observação processada:`, result);
    return result;
  } catch (error) {
    console.error('Erro ao buscar observação:', error);
    return { observations: '', isCompleted: false };
  }
}