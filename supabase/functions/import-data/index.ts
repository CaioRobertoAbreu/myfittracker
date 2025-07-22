import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.51.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ImportData {
  export_info: {
    exported_at: string;
    user_id: string;
    user_email: string;
    version: string;
  };
  profile: any;
  training_data: {
    training_plans: any[];
    training_weeks: any[];
    training_days: any[];
    exercises: any[];
    exercise_sets: any[];
    exercise_observations: any[];
  };
  diet_data: {
    diets: any[];
    diet_meals: any[];
    diet_meal_foods: any[];
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Authorization header is required");
    }

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        auth: {
          persistSession: false,
        },
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    );

    // Get user from auth header
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error("Invalid authentication");
    }

    console.log("Importing data for user:", user.id);

    // Parse the JSON data from request body
    const importData: ImportData = await req.json();

    if (!importData.export_info || !importData.training_data || !importData.diet_data) {
      throw new Error("Invalid backup file format");
    }

    console.log("Import data structure:", {
      training_plans: importData.training_data.training_plans?.length || 0,
      training_weeks: importData.training_data.training_weeks?.length || 0,
      training_days: importData.training_data.training_days?.length || 0,
      exercises: importData.training_data.exercises?.length || 0,
      exercise_sets: importData.training_data.exercise_sets?.length || 0,
      exercise_observations: importData.training_data.exercise_observations?.length || 0,
      diets: importData.diet_data.diets?.length || 0,
      diet_meals: importData.diet_data.diet_meals?.length || 0,
      diet_meal_foods: importData.diet_data.diet_meal_foods?.length || 0
    });

    // Maps to store old ID -> new ID mappings
    const planIdMap = new Map<string, string>();
    const weekIdMap = new Map<string, string>();
    const dayIdMap = new Map<string, string>();
    const exerciseIdMap = new Map<string, string>();
    const dietIdMap = new Map<string, string>();
    const mealIdMap = new Map<string, string>();

    // Import training plans
    if (importData.training_data.training_plans?.length > 0) {
      console.log("Importing training plans...");
      for (const plan of importData.training_data.training_plans) {
        const { data: newPlan, error } = await supabase
          .from("training_plans")
          .insert([{
            user_id: user.id,
            name: plan.name,
            description: plan.description,
            start_date: plan.start_date,
            end_date: plan.end_date,
            total_weeks: plan.total_weeks,
            current_week: plan.current_week || 1,
            is_expired: plan.is_expired || false
          }])
          .select()
          .single();

        if (error) {
          console.error("Error importing training plan:", error);
          throw error;
        }

        planIdMap.set(plan.id, newPlan.id);
      }
    }

    // Import training weeks
    if (importData.training_data.training_weeks?.length > 0) {
      console.log("Importing training weeks...");
      for (const week of importData.training_data.training_weeks) {
        const newPlanId = planIdMap.get(week.training_plan_id);
        if (!newPlanId) continue;

        const { data: newWeek, error } = await supabase
          .from("training_weeks")
          .insert([{
            training_plan_id: newPlanId,
            week_number: week.week_number,
            is_deload: week.is_deload || false
          }])
          .select()
          .single();

        if (error) {
          console.error("Error importing training week:", error);
          throw error;
        }

        weekIdMap.set(week.id, newWeek.id);
      }
    }

    // Import training days
    if (importData.training_data.training_days?.length > 0) {
      console.log("Importing training days...");
      for (const day of importData.training_data.training_days) {
        const newWeekId = weekIdMap.get(day.training_week_id);
        if (!newWeekId) continue;

        const { data: newDay, error } = await supabase
          .from("training_days")
          .insert([{
            training_week_id: newWeekId,
            day_number: day.day_number,
            name: day.name
          }])
          .select()
          .single();

        if (error) {
          console.error("Error importing training day:", error);
          throw error;
        }

        dayIdMap.set(day.id, newDay.id);
      }
    }

    // Import exercises
    if (importData.training_data.exercises?.length > 0) {
      console.log("Importing exercises...");
      for (const exercise of importData.training_data.exercises) {
        const newDayId = dayIdMap.get(exercise.training_day_id);
        if (!newDayId) continue;

        const { data: newExercise, error } = await supabase
          .from("exercises")
          .insert([{
            training_day_id: newDayId,
            name: exercise.name,
            exercise_id: exercise.exercise_id,
            sets: exercise.sets,
            reps: exercise.reps,
            rpe: exercise.rpe,
            progression_type: exercise.progression_type,
            technique: exercise.technique,
            technique_description: exercise.technique_description
          }])
          .select()
          .single();

        if (error) {
          console.error("Error importing exercise:", error);
          throw error;
        }

        exerciseIdMap.set(exercise.id, newExercise.id);
      }
    }

    // Import exercise sets
    if (importData.training_data.exercise_sets?.length > 0) {
      console.log("Importing exercise sets...");
      for (const set of importData.training_data.exercise_sets) {
        const newExerciseId = exerciseIdMap.get(set.exercise_id);
        if (!newExerciseId) continue;

        const { error } = await supabase
          .from("exercise_sets")
          .insert([{
            exercise_id: newExerciseId,
            week_number: set.week_number,
            set_number: set.set_number,
            weight: set.weight,
            reps: set.reps
          }]);

        if (error) {
          console.error("Error importing exercise set:", error);
          throw error;
        }
      }
    }

    // Import exercise observations
    if (importData.training_data.exercise_observations?.length > 0) {
      console.log("Importing exercise observations...");
      for (const observation of importData.training_data.exercise_observations) {
        const newExerciseId = exerciseIdMap.get(observation.exercise_id);
        if (!newExerciseId) continue;

        const { error } = await supabase
          .from("exercise_observations")
          .insert([{
            exercise_id: newExerciseId,
            week_number: observation.week_number,
            observations: observation.observations,
            is_completed: observation.is_completed || false
          }]);

        if (error) {
          console.error("Error importing exercise observation:", error);
          throw error;
        }
      }
    }

    // Import diets
    if (importData.diet_data.diets?.length > 0) {
      console.log("Importing diets...");
      for (const diet of importData.diet_data.diets) {
        const { data: newDiet, error } = await supabase
          .from("diets")
          .insert([{
            user_id: user.id,
            name: diet.name,
            description: diet.description,
            start_date: diet.start_date,
            is_expired: diet.is_expired || false
          }])
          .select()
          .single();

        if (error) {
          console.error("Error importing diet:", error);
          throw error;
        }

        dietIdMap.set(diet.id, newDiet.id);
      }
    }

    // Import diet meals
    if (importData.diet_data.diet_meals?.length > 0) {
      console.log("Importing diet meals...");
      for (const meal of importData.diet_data.diet_meals) {
        const newDietId = dietIdMap.get(meal.diet_id);
        if (!newDietId) continue;

        const { data: newMeal, error } = await supabase
          .from("diet_meals")
          .insert([{
            diet_id: newDietId,
            name: meal.name,
            order_number: meal.order_number
          }])
          .select()
          .single();

        if (error) {
          console.error("Error importing diet meal:", error);
          throw error;
        }

        mealIdMap.set(meal.id, newMeal.id);
      }
    }

    // Import diet meal foods
    if (importData.diet_data.diet_meal_foods?.length > 0) {
      console.log("Importing diet meal foods...");
      for (const food of importData.diet_data.diet_meal_foods) {
        const newMealId = mealIdMap.get(food.diet_meal_id);
        if (!newMealId) continue;

        const { error } = await supabase
          .from("diet_meal_foods")
          .insert([{
            diet_meal_id: newMealId,
            food_name: food.food_name,
            quantity: food.quantity,
            protein_animal: food.protein_animal || 0,
            protein_vegetable: food.protein_vegetable || 0,
            carbs: food.carbs || 0,
            fat: food.fat || 0
          }]);

        if (error) {
          console.error("Error importing diet meal food:", error);
          throw error;
        }
      }
    }

    // Update profile if exists in backup
    if (importData.profile && importData.profile.username) {
      console.log("Updating profile...");
      const { error } = await supabase
        .from("profiles")
        .upsert([{
          user_id: user.id,
          username: importData.profile.username
        }]);

      if (error) {
        console.error("Error updating profile:", error);
        // Don't throw error for profile, it's optional
      }
    }

    console.log("Import completed successfully");

    return new Response(JSON.stringify({
      success: true,
      message: "Dados importados com sucesso",
      imported: {
        training_plans: importData.training_data.training_plans?.length || 0,
        training_weeks: importData.training_data.training_weeks?.length || 0,
        training_days: importData.training_data.training_days?.length || 0,
        exercises: importData.training_data.exercises?.length || 0,
        exercise_sets: importData.training_data.exercise_sets?.length || 0,
        exercise_observations: importData.training_data.exercise_observations?.length || 0,
        diets: importData.diet_data.diets?.length || 0,
        diet_meals: importData.diet_data.diet_meals?.length || 0,
        diet_meal_foods: importData.diet_data.diet_meal_foods?.length || 0
      }
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error in import-data function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Erro interno do servidor",
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);