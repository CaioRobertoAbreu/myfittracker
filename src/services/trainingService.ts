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
export async function getTrainingPlan(planId?: string): Promise<TrainingPlan | null> {
  try {
    console.log('Buscando plano de treino...', { planId });
    
    let query = supabase
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
      `);
      
    if (planId) {
      query = query.eq('id', planId);
    } else {
      query = query.limit(1);
    }
    
    const { data: plans, error } = await query;

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
      startDate: new Date(plan.start_date),
      endDate: new Date(plan.end_date),
      isExpired: plan.is_expired,
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

// Criar novo plano de treino
export async function createTrainingPlan(planData: {
  name: string;
  description: string | null;
  totalWeeks: number;
  startDate: Date;
  endDate: Date;
  days: Array<{
    id: string;
    dayNumber: number;
    name: string;
    exercises: Array<{
      id: string;
      name: string;
      sets: number;
      reps: string;
      rpe: number;
      progressionType: string;
      technique?: string;
      techniqueDescription?: string;
    }>;
  }>;
}): Promise<string> {
  try {
    // Criar plano de treino
    const { data: plan, error: planError } = await supabase
      .from('training_plans')
      .insert({
        user_id: crypto.randomUUID(), // Gerar UUID válido
        name: planData.name,
        description: planData.description,
        total_weeks: planData.totalWeeks,
        current_week: 1,
        start_date: planData.startDate.toISOString().split('T')[0],
        end_date: planData.endDate.toISOString().split('T')[0],
        is_expired: false
      })
      .select()
      .single();

    if (planError) throw planError;

    // Criar semanas
    const weeks = Array.from({ length: planData.totalWeeks }, (_, i) => ({
      training_plan_id: plan.id,
      week_number: i + 1,
      is_deload: false // Por padrão, sem deload
    }));

    const { data: createdWeeks, error: weeksError } = await supabase
      .from('training_weeks')
      .insert(weeks)
      .select();

    if (weeksError) throw weeksError;

    // Criar dias e exercícios para cada semana
    const allDays = [];
    const allExercises = [];

    for (const week of createdWeeks) {
      for (const dayData of planData.days) {
        // Criar dia
        const dayToCreate = {
          training_week_id: week.id,
          day_number: dayData.dayNumber,
          name: dayData.name
        };
        allDays.push(dayToCreate);
      }
    }

    // Inserir todos os dias
    const { data: createdDays, error: daysError } = await supabase
      .from('training_days')
      .insert(allDays)
      .select();

    if (daysError) throw daysError;

    // Criar exercícios
    for (let weekIndex = 0; weekIndex < createdWeeks.length; weekIndex++) {
      for (let dayIndex = 0; dayIndex < planData.days.length; dayIndex++) {
        const dayData = planData.days[dayIndex];
        const createdDay = createdDays[weekIndex * planData.days.length + dayIndex];

        for (const exerciseData of dayData.exercises) {
          allExercises.push({
            training_day_id: createdDay.id,
            exercise_id: exerciseData.id,
            name: exerciseData.name,
            sets: exerciseData.sets,
            reps: exerciseData.reps,
            rpe: exerciseData.rpe,
            progression_type: exerciseData.progressionType,
            technique: exerciseData.technique || null,
            technique_description: exerciseData.techniqueDescription || null
          });
        }
      }
    }

    // Inserir todos os exercícios
    if (allExercises.length > 0) {
      const { error: exercisesError } = await supabase
        .from('exercises')
        .insert(allExercises);

      if (exercisesError) throw exercisesError;
    }

    return plan.id;
  } catch (error) {
    console.error('Erro ao criar plano de treino:', error);
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

// Atualizar status de vencido do treino
export async function updateTrainingExpiredStatus(planId: string, isExpired: boolean): Promise<void> {
  try {
    const { error } = await supabase
      .from('training_plans')
      .update({ is_expired: isExpired })
      .eq('id', planId);

    if (error) throw error;
  } catch (error) {
    console.error('Erro ao atualizar status de vencido:', error);
    throw error;
  }
}

// Deletar treino completo
export async function deleteTrainingPlan(planId: string): Promise<void> {
  try {
    // Buscar todas as semanas deste plano
    const { data: weeks, error: weeksError } = await supabase
      .from('training_weeks')
      .select('id')
      .eq('training_plan_id', planId);

    if (weeksError) throw weeksError;

    if (weeks && weeks.length > 0) {
      const weekIds = weeks.map(w => w.id);

      // Buscar todos os dias dessas semanas
      const { data: days, error: daysError } = await supabase
        .from('training_days')
        .select('id')
        .in('training_week_id', weekIds);

      if (daysError) throw daysError;

      if (days && days.length > 0) {
        const dayIds = days.map(d => d.id);

        // Buscar todos os exercícios desses dias
        const { data: exercises, error: exercisesError } = await supabase
          .from('exercises')
          .select('id')
          .in('training_day_id', dayIds);

        if (exercisesError) throw exercisesError;

        if (exercises && exercises.length > 0) {
          const exerciseIds = exercises.map(e => e.id);

          // Deletar observações dos exercícios
          const { error: obsError } = await supabase
            .from('exercise_observations')
            .delete()
            .in('exercise_id', exerciseIds);

          if (obsError) throw obsError;

          // Deletar séries dos exercícios
          const { error: setsError } = await supabase
            .from('exercise_sets')
            .delete()
            .in('exercise_id', exerciseIds);

          if (setsError) throw setsError;

          // Deletar exercícios
          const { error: exercisesDeleteError } = await supabase
            .from('exercises')
            .delete()
            .in('training_day_id', dayIds);

          if (exercisesDeleteError) throw exercisesDeleteError;
        }

        // Deletar dias
        const { error: daysDeleteError } = await supabase
          .from('training_days')
          .delete()
          .in('training_week_id', weekIds);

        if (daysDeleteError) throw daysDeleteError;
      }

      // Deletar semanas
      const { error: weeksDeleteError } = await supabase
        .from('training_weeks')
        .delete()
        .eq('training_plan_id', planId);

      if (weeksDeleteError) throw weeksDeleteError;
    }

    // Deletar o plano de treino
    const { error: planError } = await supabase
      .from('training_plans')
      .delete()
      .eq('id', planId);

    if (planError) throw planError;
  } catch (error) {
    console.error('Erro ao deletar plano de treino:', error);
    throw error;
  }
}

// Atualizar plano de treino existente
export async function updateTrainingPlan(planId: string, planData: {
  name: string;
  description: string | null;
  totalWeeks: number;
  startDate: Date;
  endDate: Date;
  days: Array<{
    id: string;
    dayNumber: number;
    name: string;
    exercises: Array<{
      id: string;
      name: string;
      sets: number;
      reps: string;
      rpe: number;
      progressionType: string;
      technique?: string;
      techniqueDescription?: string;
    }>;
  }>;
}): Promise<void> {
  try {
    // Atualizar informações básicas do plano
    const { error: planError } = await supabase
      .from('training_plans')
      .update({
        name: planData.name,
        description: planData.description,
        total_weeks: planData.totalWeeks,
        start_date: planData.startDate.toISOString().split('T')[0],
        end_date: planData.endDate.toISOString().split('T')[0]
      })
      .eq('id', planId);

    if (planError) throw planError;

    // Buscar semanas existentes
    const { data: existingWeeks, error: weeksError } = await supabase
      .from('training_weeks')
      .select('id, week_number')
      .eq('training_plan_id', planId)
      .order('week_number');

    if (weeksError) throw weeksError;

    // Se o número de semanas mudou, ajustar
    if (existingWeeks.length !== planData.totalWeeks) {
      if (existingWeeks.length < planData.totalWeeks) {
        // Adicionar semanas faltantes
        const newWeeks = [];
        for (let i = existingWeeks.length + 1; i <= planData.totalWeeks; i++) {
          newWeeks.push({
            training_plan_id: planId,
            week_number: i,
            is_deload: false
          });
        }
        
        const { error: newWeeksError } = await supabase
          .from('training_weeks')
          .insert(newWeeks);
          
        if (newWeeksError) throw newWeeksError;
      } else {
        // Remover semanas extras (começando da última)
        const weeksToRemove = existingWeeks.slice(planData.totalWeeks);
        const weekIdsToRemove = weeksToRemove.map(w => w.id);
        
        // Deletar dados associados às semanas que serão removidas
        await deleteWeeksData(weekIdsToRemove);
      }
    }

    // Atualizar estrutura de dias para a primeira semana (template)
    // Buscar a primeira semana atualizada
    const { data: firstWeek, error: firstWeekError } = await supabase
      .from('training_weeks')
      .select('id')
      .eq('training_plan_id', planId)
      .eq('week_number', 1)
      .single();

    if (firstWeekError) throw firstWeekError;

    // Deletar dias e exercícios existentes da primeira semana
    await deleteWeekData(firstWeek.id);

    // Criar novos dias e exercícios para a primeira semana
    const newDays = [];
    for (const dayData of planData.days) {
      newDays.push({
        training_week_id: firstWeek.id,
        day_number: dayData.dayNumber,
        name: dayData.name
      });
    }

    const { data: createdDays, error: daysError } = await supabase
      .from('training_days')
      .insert(newDays)
      .select();

    if (daysError) throw daysError;

    // Criar exercícios para os novos dias
    const newExercises = [];
    for (let dayIndex = 0; dayIndex < planData.days.length; dayIndex++) {
      const dayData = planData.days[dayIndex];
      const createdDay = createdDays[dayIndex];

      for (const exerciseData of dayData.exercises) {
        newExercises.push({
          training_day_id: createdDay.id,
          exercise_id: exerciseData.id,
          name: exerciseData.name,
          sets: exerciseData.sets,
          reps: exerciseData.reps,
          rpe: exerciseData.rpe,
          progression_type: exerciseData.progressionType,
          technique: exerciseData.technique || null,
          technique_description: exerciseData.techniqueDescription || null
        });
      }
    }

    if (newExercises.length > 0) {
      const { error: exercisesError } = await supabase
        .from('exercises')
        .insert(newExercises);

      if (exercisesError) throw exercisesError;
    }

    // Replicar a estrutura para todas as outras semanas
    await replicateWeekStructure(planId, firstWeek.id, planData.totalWeeks);

  } catch (error) {
    console.error('Erro ao atualizar plano de treino:', error);
    throw error;
  }
}

// Função auxiliar para deletar dados de uma semana específica
async function deleteWeekData(weekId: string) {
  // Buscar dias da semana
  const { data: days, error: daysError } = await supabase
    .from('training_days')
    .select('id')
    .eq('training_week_id', weekId);

  if (daysError) throw daysError;

  if (days && days.length > 0) {
    const dayIds = days.map(d => d.id);

    // Buscar exercícios dos dias
    const { data: exercises, error: exercisesError } = await supabase
      .from('exercises')
      .select('id')
      .in('training_day_id', dayIds);

    if (exercisesError) throw exercisesError;

    if (exercises && exercises.length > 0) {
      const exerciseIds = exercises.map(e => e.id);

      // Deletar observações e séries
      await supabase.from('exercise_observations').delete().in('exercise_id', exerciseIds);
      await supabase.from('exercise_sets').delete().in('exercise_id', exerciseIds);
      
      // Deletar exercícios
      await supabase.from('exercises').delete().in('training_day_id', dayIds);
    }

    // Deletar dias
    await supabase.from('training_days').delete().eq('training_week_id', weekId);
  }
}

// Função auxiliar para deletar dados de múltiplas semanas
async function deleteWeeksData(weekIds: string[]) {
  for (const weekId of weekIds) {
    await deleteWeekData(weekId);
  }
  
  // Deletar as semanas
  await supabase.from('training_weeks').delete().in('id', weekIds);
}

// Função auxiliar para replicar estrutura da primeira semana para as outras
async function replicateWeekStructure(planId: string, templateWeekId: string, totalWeeks: number) {
  // Buscar estrutura da primeira semana
  const { data: templateDays, error: templateError } = await supabase
    .from('training_days')
    .select(`
      *,
      exercises(*)
    `)
    .eq('training_week_id', templateWeekId);

  if (templateError) throw templateError;

  // Buscar todas as outras semanas
  const { data: otherWeeks, error: otherWeeksError } = await supabase
    .from('training_weeks')
    .select('id')
    .eq('training_plan_id', planId)
    .neq('id', templateWeekId)
    .order('week_number');

  if (otherWeeksError) throw otherWeeksError;

  // Replicar para cada semana
  for (const week of otherWeeks) {
    // Deletar estrutura existente
    await deleteWeekData(week.id);

    // Criar nova estrutura baseada no template
    const newDays = [];
    for (const templateDay of templateDays) {
      newDays.push({
        training_week_id: week.id,
        day_number: templateDay.day_number,
        name: templateDay.name
      });
    }

    const { data: createdDays, error: daysError } = await supabase
      .from('training_days')
      .insert(newDays)
      .select();

    if (daysError) throw daysError;

    // Criar exercícios
    const newExercises = [];
    for (let dayIndex = 0; dayIndex < templateDays.length; dayIndex++) {
      const templateDay = templateDays[dayIndex];
      const createdDay = createdDays[dayIndex];

      for (const exercise of templateDay.exercises) {
        newExercises.push({
          training_day_id: createdDay.id,
          exercise_id: exercise.exercise_id,
          name: exercise.name,
          sets: exercise.sets,
          reps: exercise.reps,
          rpe: exercise.rpe,
          progression_type: exercise.progression_type,
          technique: exercise.technique,
          technique_description: exercise.technique_description
        });
      }
    }

    if (newExercises.length > 0) {
      const { error: exercisesError } = await supabase
        .from('exercises')
        .insert(newExercises);

      if (exercisesError) throw exercisesError;
    }
  }
}
