import { supabase } from "@/integrations/supabase/client";
import { Diet, CreateDietRequest, UpdateDietRequest, NutritionSummary, DietFoodConsumption, DailyProgress } from "@/types/diet";
import { format } from "date-fns";

export const dietService = {
  async getAllDiets(): Promise<Diet[]> {
    const { data: diets, error } = await supabase
      .from("diets")
      .select(`
        *,
        diet_meals (
          *,
          diet_meal_foods (*)
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Error fetching diets: ${error.message}`);
    }

    return diets.map(diet => ({
      id: diet.id,
      name: diet.name,
      description: diet.description,
      userId: diet.user_id,
      startDate: diet.start_date,
      isExpired: diet.is_expired,
      createdAt: diet.created_at,
      updatedAt: diet.updated_at,
      meals: diet.diet_meals
        .sort((a: any, b: any) => a.order_number - b.order_number)
        .map((meal: any) => ({
          id: meal.id,
          dietId: meal.diet_id,
          name: meal.name,
          orderNumber: meal.order_number,
          createdAt: meal.created_at,
          updatedAt: meal.updated_at,
          foods: meal.diet_meal_foods.map((food: any) => ({
            id: food.id,
            dietMealId: food.diet_meal_id,
            foodName: food.food_name,
            quantity: food.quantity,
            protein: (Number(food.protein_animal) || 0) + (Number(food.protein_vegetable) || 0),
            carbs: Number(food.carbs) || 0,
            fat: Number(food.fat) || 0,
            createdAt: food.created_at,
            updatedAt: food.updated_at,
          }))
        }))
    }));
  },

  async getDietById(id: string): Promise<Diet | null> {
    const { data: diet, error } = await supabase
      .from("diets")
      .select(`
        *,
        diet_meals (
          *,
          diet_meal_foods (*)
        )
      `)
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Error fetching diet: ${error.message}`);
    }

    return {
      id: diet.id,
      name: diet.name,
      description: diet.description,
      userId: diet.user_id,
      startDate: diet.start_date,
      isExpired: diet.is_expired,
      createdAt: diet.created_at,
      updatedAt: diet.updated_at,
      meals: diet.diet_meals
        .sort((a: any, b: any) => a.order_number - b.order_number)
        .map((meal: any) => ({
          id: meal.id,
          dietId: meal.diet_id,
          name: meal.name,
          orderNumber: meal.order_number,
          createdAt: meal.created_at,
          updatedAt: meal.updated_at,
          foods: meal.diet_meal_foods.map((food: any) => ({
            id: food.id,
            dietMealId: food.diet_meal_id,
            foodName: food.food_name,
            quantity: food.quantity,
            protein: (Number(food.protein_animal) || 0) + (Number(food.protein_vegetable) || 0),
            carbs: Number(food.carbs) || 0,
            fat: Number(food.fat) || 0,
            createdAt: food.created_at,
            updatedAt: food.updated_at,
          }))
        }))
    };
  },

  async createDiet(request: CreateDietRequest): Promise<Diet> {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      throw new Error('User must be authenticated to create a diet');
    }

    // Create the diet
    const { data: diet, error: dietError } = await supabase
      .from("diets")
      .insert({
        name: request.name,
        description: request.description,
        start_date: request.startDate,
        user_id: user.id,
      })
      .select()
      .single();

    if (dietError) {
      throw new Error(`Error creating diet: ${dietError.message}`);
    }

    // Create meals
    for (const mealData of request.meals) {
      const { data: meal, error: mealError } = await supabase
        .from("diet_meals")
        .insert({
          diet_id: diet.id,
          name: mealData.name,
          order_number: mealData.orderNumber,
        })
        .select()
        .single();

      if (mealError) {
        throw new Error(`Error creating meal: ${mealError.message}`);
      }

      // Create foods for this meal
      if (mealData.foods.length > 0) {
        const { error: foodsError } = await supabase
          .from("diet_meal_foods")
          .insert(
            mealData.foods.map(food => ({
              diet_meal_id: meal.id,
              food_name: food.foodName,
              quantity: food.quantity,
              protein_animal: food.protein,
              protein_vegetable: 0,
              carbs: food.carbs,
              fat: food.fat,
            }))
          );

        if (foodsError) {
          throw new Error(`Error creating foods: ${foodsError.message}`);
        }
      }
    }

    return this.getDietById(diet.id) as Promise<Diet>;
  },

  async updateDiet(request: UpdateDietRequest): Promise<Diet> {
    // Update the diet
    const { error: dietError } = await supabase
      .from("diets")
      .update({
        name: request.name,
        description: request.description,
        start_date: request.startDate,
      })
      .eq("id", request.id);

    if (dietError) {
      throw new Error(`Error updating diet: ${dietError.message}`);
    }

    // Delete existing meals and foods (cascade will handle foods)
    const { error: deleteMealsError } = await supabase
      .from("diet_meals")
      .delete()
      .eq("diet_id", request.id);

    if (deleteMealsError) {
      throw new Error(`Error deleting existing meals: ${deleteMealsError.message}`);
    }

    // Create new meals
    for (const mealData of request.meals) {
      const { data: meal, error: mealError } = await supabase
        .from("diet_meals")
        .insert({
          diet_id: request.id,
          name: mealData.name,
          order_number: mealData.orderNumber,
        })
        .select()
        .single();

      if (mealError) {
        throw new Error(`Error creating meal: ${mealError.message}`);
      }

      // Create foods for this meal
      if (mealData.foods.length > 0) {
        const { error: foodsError } = await supabase
          .from("diet_meal_foods")
          .insert(
            mealData.foods.map(food => ({
              diet_meal_id: meal.id,
              food_name: food.foodName,
              quantity: food.quantity,
              protein_animal: food.protein,
              protein_vegetable: 0,
              carbs: food.carbs,
              fat: food.fat,
            }))
          );

        if (foodsError) {
          throw new Error(`Error creating foods: ${foodsError.message}`);
        }
      }
    }

    return this.getDietById(request.id) as Promise<Diet>;
  },

  async deleteDiet(id: string): Promise<void> {
    const { error } = await supabase
      .from("diets")
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(`Error deleting diet: ${error.message}`);
    }
  },

  calculateNutritionSummary(diet: Diet): NutritionSummary {
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    diet.meals.forEach(meal => {
      meal.foods.forEach(food => {
        totalProtein += food.protein;
        totalCarbs += food.carbs;
        totalFat += food.fat;
      });
    });

    // Calculate calories (4 kcal/g for protein and carbs, 9 kcal/g for fat)
    const totalCalories = (totalProtein * 4) + (totalCarbs * 4) + (totalFat * 9);

    // Calculate percentages
    const proteinPercentage = totalCalories > 0 ? ((totalProtein * 4) / totalCalories) * 100 : 0;
    const carbsPercentage = totalCalories > 0 ? ((totalCarbs * 4) / totalCalories) * 100 : 0;
    const fatPercentage = totalCalories > 0 ? ((totalFat * 9) / totalCalories) * 100 : 0;

    return {
      totalProtein,
      totalCarbs,
      totalFat,
      totalCalories,
      proteinPercentage,
      carbsPercentage,
      fatPercentage,
    };
  },

  async markDietAsExpired(id: string): Promise<void> {
    const { error } = await supabase
      .from("diets")
      .update({ is_expired: true })
      .eq("id", id);

    if (error) {
      throw new Error(`Error marking diet as expired: ${error.message}`);
    }
  },

  async markDietAsActive(id: string): Promise<void> {
    const { error } = await supabase
      .from("diets")
      .update({ is_expired: false })
      .eq("id", id);

    if (error) {
      throw new Error(`Error marking diet as active: ${error.message}`);
    }
  },

  // Food consumption tracking functions
  async getDailyConsumption(dietId: string, date: Date): Promise<DietFoodConsumption[]> {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      throw new Error('User must be authenticated');
    }

    const dateString = format(date, 'yyyy-MM-dd');
    
    const { data, error } = await supabase
      .from("diet_food_consumption")
      .select("*")
      .eq("diet_id", dietId)
      .eq("user_id", user.id)
      .eq("consumption_date", dateString);

    if (error) {
      throw new Error(`Error fetching daily consumption: ${error.message}`);
    }

    return data.map(item => ({
      id: item.id,
      userId: item.user_id,
      dietId: item.diet_id,
      dietMealFoodId: item.diet_meal_food_id,
      consumptionDate: item.consumption_date,
      isConsumed: item.is_consumed,
      consumedAt: item.consumed_at,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));
  },

  async toggleFoodConsumption(dietId: string, foodId: string, date: Date): Promise<void> {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      throw new Error('User must be authenticated');
    }

    const dateString = format(date, 'yyyy-MM-dd');
    
    // Check if consumption record exists
    const { data: existing, error: selectError } = await supabase
      .from("diet_food_consumption")
      .select("*")
      .eq("diet_id", dietId)
      .eq("user_id", user.id)
      .eq("diet_meal_food_id", foodId)
      .eq("consumption_date", dateString)
      .maybeSingle();

    if (selectError) {
      throw new Error(`Error checking consumption: ${selectError.message}`);
    }

    if (existing) {
      // Update existing record
      const { error: updateError } = await supabase
        .from("diet_food_consumption")
        .update({
          is_consumed: !existing.is_consumed,
          consumed_at: !existing.is_consumed ? new Date().toISOString() : null,
        })
        .eq("id", existing.id);

      if (updateError) {
        throw new Error(`Error updating consumption: ${updateError.message}`);
      }
    } else {
      // Create new record
      const { error: insertError } = await supabase
        .from("diet_food_consumption")
        .insert({
          user_id: user.id,
          diet_id: dietId,
          diet_meal_food_id: foodId,
          consumption_date: dateString,
          is_consumed: true,
          consumed_at: new Date().toISOString(),
        });

      if (insertError) {
        throw new Error(`Error creating consumption: ${insertError.message}`);
      }
    }
  },

  async resetDayProgress(dietId: string, date: Date): Promise<void> {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      throw new Error('User must be authenticated');
    }

    const dateString = format(date, 'yyyy-MM-dd');
    
    const { error } = await supabase
      .from("diet_food_consumption")
      .delete()
      .eq("diet_id", dietId)
      .eq("user_id", user.id)
      .eq("consumption_date", dateString);

    if (error) {
      throw new Error(`Error resetting day progress: ${error.message}`);
    }
  },

  async getDailyProgress(diet: Diet, date: Date): Promise<DailyProgress> {
    const consumption = await this.getDailyConsumption(diet.id, date);
    const consumptionMap = new Map(consumption.map(c => [c.dietMealFoodId, c.isConsumed]));

    let consumedProtein = 0;
    let consumedCarbs = 0;
    let consumedFat = 0;

    const totalNutrition = this.calculateNutritionSummary(diet);

    diet.meals.forEach(meal => {
      meal.foods.forEach(food => {
        if (consumptionMap.get(food.id)) {
          consumedProtein += food.protein;
          consumedCarbs += food.carbs;
          consumedFat += food.fat;
        }
      });
    });

    const consumedCalories = (consumedProtein * 4) + (consumedCarbs * 4) + (consumedFat * 9);
    
    const progressPercentage = totalNutrition.totalCalories > 0 
      ? (consumedCalories / totalNutrition.totalCalories) * 100 
      : 0;

    return {
      consumedProtein,
      consumedCarbs,
      consumedFat,
      consumedCalories,
      totalProtein: totalNutrition.totalProtein,
      totalCarbs: totalNutrition.totalCarbs,
      totalFat: totalNutrition.totalFat,
      totalCalories: totalNutrition.totalCalories,
      progressPercentage,
    };
  },

  async addFoodToMeal(mealId: string, food: {
    foodName: string;
    quantity: string;
    protein: number;
    carbs: number;
    fat: number;
  }): Promise<void> {
    const { error } = await supabase
      .from("diet_meal_foods")
      .insert({
        diet_meal_id: mealId,
        food_name: food.foodName,
        quantity: food.quantity,
        protein_animal: food.protein,
        protein_vegetable: 0,
        carbs: food.carbs,
        fat: food.fat,
      });

    if (error) {
      throw new Error(`Error adding food to meal: ${error.message}`);
    }
  },
};