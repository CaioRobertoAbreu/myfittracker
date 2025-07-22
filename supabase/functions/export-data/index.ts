import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.51.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    console.log("Exporting data for user:", user.id);

    // Fetch all training data
    const { data: trainingPlans, error: trainingPlansError } = await supabase
      .from("training_plans")
      .select("*")
      .eq("user_id", user.id);

    if (trainingPlansError) {
      console.error("Error fetching training plans:", trainingPlansError);
      throw trainingPlansError;
    }

    // Fetch training weeks for all plans
    const planIds = trainingPlans?.map(plan => plan.id) || [];
    const { data: trainingWeeks, error: trainingWeeksError } = await supabase
      .from("training_weeks")
      .select("*")
      .in("training_plan_id", planIds);

    if (trainingWeeksError) {
      console.error("Error fetching training weeks:", trainingWeeksError);
      throw trainingWeeksError;
    }

    // Fetch training days for all weeks
    const weekIds = trainingWeeks?.map(week => week.id) || [];
    const { data: trainingDays, error: trainingDaysError } = await supabase
      .from("training_days")
      .select("*")
      .in("training_week_id", weekIds);

    if (trainingDaysError) {
      console.error("Error fetching training days:", trainingDaysError);
      throw trainingDaysError;
    }

    // Fetch exercises for all days
    const dayIds = trainingDays?.map(day => day.id) || [];
    const { data: exercises, error: exercisesError } = await supabase
      .from("exercises")
      .select("*")
      .in("training_day_id", dayIds);

    if (exercisesError) {
      console.error("Error fetching exercises:", exercisesError);
      throw exercisesError;
    }

    // Fetch exercise sets for all exercises
    const exerciseIds = exercises?.map(exercise => exercise.id) || [];
    const { data: exerciseSets, error: exerciseSetsError } = await supabase
      .from("exercise_sets")
      .select("*")
      .in("exercise_id", exerciseIds);

    if (exerciseSetsError) {
      console.error("Error fetching exercise sets:", exerciseSetsError);
      throw exerciseSetsError;
    }

    // Fetch exercise observations for all exercises
    const { data: exerciseObservations, error: exerciseObservationsError } = await supabase
      .from("exercise_observations")
      .select("*")
      .in("exercise_id", exerciseIds);

    if (exerciseObservationsError) {
      console.error("Error fetching exercise observations:", exerciseObservationsError);
      throw exerciseObservationsError;
    }

    // Fetch all diet data
    const { data: diets, error: dietsError } = await supabase
      .from("diets")
      .select("*")
      .eq("user_id", user.id);

    if (dietsError) {
      console.error("Error fetching diets:", dietsError);
      throw dietsError;
    }

    // Fetch diet meals for all diets
    const dietIds = diets?.map(diet => diet.id) || [];
    const { data: dietMeals, error: dietMealsError } = await supabase
      .from("diet_meals")
      .select("*")
      .in("diet_id", dietIds);

    if (dietMealsError) {
      console.error("Error fetching diet meals:", dietMealsError);
      throw dietMealsError;
    }

    // Fetch diet meal foods for all meals
    const mealIds = dietMeals?.map(meal => meal.id) || [];
    const { data: dietMealFoods, error: dietMealFoodsError } = await supabase
      .from("diet_meal_foods")
      .select("*")
      .in("diet_meal_id", mealIds);

    if (dietMealFoodsError) {
      console.error("Error fetching diet meal foods:", dietMealFoodsError);
      throw dietMealFoodsError;
    }

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      // Don't throw error for profile, it's optional
    }

    // Structure the backup data
    const backupData = {
      export_info: {
        exported_at: new Date().toISOString(),
        user_id: user.id,
        user_email: user.email,
        version: "1.0"
      },
      profile: profile || null,
      training_data: {
        training_plans: trainingPlans || [],
        training_weeks: trainingWeeks || [],
        training_days: trainingDays || [],
        exercises: exercises || [],
        exercise_sets: exerciseSets || [],
        exercise_observations: exerciseObservations || []
      },
      diet_data: {
        diets: diets || [],
        diet_meals: dietMeals || [],
        diet_meal_foods: dietMealFoods || []
      }
    };

    console.log("Backup data structure:", {
      training_plans: trainingPlans?.length || 0,
      training_weeks: trainingWeeks?.length || 0,
      training_days: trainingDays?.length || 0,
      exercises: exercises?.length || 0,
      exercise_sets: exerciseSets?.length || 0,
      exercise_observations: exerciseObservations?.length || 0,
      diets: diets?.length || 0,
      diet_meals: dietMeals?.length || 0,
      diet_meal_foods: dietMealFoods?.length || 0
    });

    return new Response(JSON.stringify(backupData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="fittracker-backup-${new Date().toISOString().split('T')[0]}.json"`,
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error in export-data function:", error);
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