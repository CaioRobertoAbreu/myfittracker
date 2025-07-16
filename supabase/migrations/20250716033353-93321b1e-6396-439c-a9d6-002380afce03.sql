-- Fix critical RLS policies to properly secure user data

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Allow all access to diets" ON public.diets;
DROP POLICY IF EXISTS "Allow all access to diet_meals" ON public.diet_meals;
DROP POLICY IF EXISTS "Allow all access to diet_meal_foods" ON public.diet_meal_foods;
DROP POLICY IF EXISTS "Allow all access to training_plans" ON public.training_plans;
DROP POLICY IF EXISTS "Allow all access to training_weeks" ON public.training_weeks;
DROP POLICY IF EXISTS "Allow all access to training_days" ON public.training_days;
DROP POLICY IF EXISTS "Allow all access to exercises" ON public.exercises;
DROP POLICY IF EXISTS "Allow all access to exercise_sets" ON public.exercise_sets;
DROP POLICY IF EXISTS "Allow all access to exercise_observations" ON public.exercise_observations;

-- Create secure RLS policies for diets
CREATE POLICY "Users can view their own diets" ON public.diets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own diets" ON public.diets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own diets" ON public.diets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own diets" ON public.diets
  FOR DELETE USING (auth.uid() = user_id);

-- Create secure RLS policies for diet_meals (through diet ownership)
CREATE POLICY "Users can view their own diet meals" ON public.diet_meals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.diets 
      WHERE diets.id = diet_meals.diet_id 
      AND diets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create diet meals for their diets" ON public.diet_meals
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.diets 
      WHERE diets.id = diet_meals.diet_id 
      AND diets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own diet meals" ON public.diet_meals
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.diets 
      WHERE diets.id = diet_meals.diet_id 
      AND diets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own diet meals" ON public.diet_meals
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.diets 
      WHERE diets.id = diet_meals.diet_id 
      AND diets.user_id = auth.uid()
    )
  );

-- Create secure RLS policies for diet_meal_foods (through diet meal ownership)
CREATE POLICY "Users can view their own diet meal foods" ON public.diet_meal_foods
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.diet_meals 
      JOIN public.diets ON diets.id = diet_meals.diet_id
      WHERE diet_meals.id = diet_meal_foods.diet_meal_id 
      AND diets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create diet meal foods for their meals" ON public.diet_meal_foods
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.diet_meals 
      JOIN public.diets ON diets.id = diet_meals.diet_id
      WHERE diet_meals.id = diet_meal_foods.diet_meal_id 
      AND diets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own diet meal foods" ON public.diet_meal_foods
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.diet_meals 
      JOIN public.diets ON diets.id = diet_meals.diet_id
      WHERE diet_meals.id = diet_meal_foods.diet_meal_id 
      AND diets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own diet meal foods" ON public.diet_meal_foods
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.diet_meals 
      JOIN public.diets ON diets.id = diet_meals.diet_id
      WHERE diet_meals.id = diet_meal_foods.diet_meal_id 
      AND diets.user_id = auth.uid()
    )
  );

-- Create secure RLS policies for training_plans
CREATE POLICY "Users can view their own training plans" ON public.training_plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own training plans" ON public.training_plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own training plans" ON public.training_plans
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own training plans" ON public.training_plans
  FOR DELETE USING (auth.uid() = user_id);

-- Create secure RLS policies for training_weeks (through training plan ownership)
CREATE POLICY "Users can view their own training weeks" ON public.training_weeks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.training_plans 
      WHERE training_plans.id = training_weeks.training_plan_id 
      AND training_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create training weeks for their plans" ON public.training_weeks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.training_plans 
      WHERE training_plans.id = training_weeks.training_plan_id 
      AND training_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own training weeks" ON public.training_weeks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.training_plans 
      WHERE training_plans.id = training_weeks.training_plan_id 
      AND training_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own training weeks" ON public.training_weeks
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.training_plans 
      WHERE training_plans.id = training_weeks.training_plan_id 
      AND training_plans.user_id = auth.uid()
    )
  );

-- Create secure RLS policies for training_days (through training week ownership)
CREATE POLICY "Users can view their own training days" ON public.training_days
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.training_weeks 
      JOIN public.training_plans ON training_plans.id = training_weeks.training_plan_id
      WHERE training_weeks.id = training_days.training_week_id 
      AND training_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create training days for their weeks" ON public.training_days
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.training_weeks 
      JOIN public.training_plans ON training_plans.id = training_weeks.training_plan_id
      WHERE training_weeks.id = training_days.training_week_id 
      AND training_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own training days" ON public.training_days
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.training_weeks 
      JOIN public.training_plans ON training_plans.id = training_weeks.training_plan_id
      WHERE training_weeks.id = training_days.training_week_id 
      AND training_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own training days" ON public.training_days
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.training_weeks 
      JOIN public.training_plans ON training_plans.id = training_weeks.training_plan_id
      WHERE training_weeks.id = training_days.training_week_id 
      AND training_plans.user_id = auth.uid()
    )
  );

-- Create secure RLS policies for exercises (through training day ownership)
CREATE POLICY "Users can view their own exercises" ON public.exercises
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.training_days 
      JOIN public.training_weeks ON training_weeks.id = training_days.training_week_id
      JOIN public.training_plans ON training_plans.id = training_weeks.training_plan_id
      WHERE training_days.id = exercises.training_day_id 
      AND training_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create exercises for their days" ON public.exercises
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.training_days 
      JOIN public.training_weeks ON training_weeks.id = training_days.training_week_id
      JOIN public.training_plans ON training_plans.id = training_weeks.training_plan_id
      WHERE training_days.id = exercises.training_day_id 
      AND training_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own exercises" ON public.exercises
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.training_days 
      JOIN public.training_weeks ON training_weeks.id = training_days.training_week_id
      JOIN public.training_plans ON training_plans.id = training_weeks.training_plan_id
      WHERE training_days.id = exercises.training_day_id 
      AND training_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own exercises" ON public.exercises
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.training_days 
      JOIN public.training_weeks ON training_weeks.id = training_days.training_week_id
      JOIN public.training_plans ON training_plans.id = training_weeks.training_plan_id
      WHERE training_days.id = exercises.training_day_id 
      AND training_plans.user_id = auth.uid()
    )
  );

-- Create secure RLS policies for exercise_sets (through exercise ownership)
CREATE POLICY "Users can view their own exercise sets" ON public.exercise_sets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.exercises 
      JOIN public.training_days ON training_days.id = exercises.training_day_id
      JOIN public.training_weeks ON training_weeks.id = training_days.training_week_id
      JOIN public.training_plans ON training_plans.id = training_weeks.training_plan_id
      WHERE exercises.id = exercise_sets.exercise_id 
      AND training_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create exercise sets for their exercises" ON public.exercise_sets
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.exercises 
      JOIN public.training_days ON training_days.id = exercises.training_day_id
      JOIN public.training_weeks ON training_weeks.id = training_days.training_week_id
      JOIN public.training_plans ON training_plans.id = training_weeks.training_plan_id
      WHERE exercises.id = exercise_sets.exercise_id 
      AND training_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own exercise sets" ON public.exercise_sets
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.exercises 
      JOIN public.training_days ON training_days.id = exercises.training_day_id
      JOIN public.training_weeks ON training_weeks.id = training_days.training_week_id
      JOIN public.training_plans ON training_plans.id = training_weeks.training_plan_id
      WHERE exercises.id = exercise_sets.exercise_id 
      AND training_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own exercise sets" ON public.exercise_sets
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.exercises 
      JOIN public.training_days ON training_days.id = exercises.training_day_id
      JOIN public.training_weeks ON training_weeks.id = training_days.training_week_id
      JOIN public.training_plans ON training_plans.id = training_weeks.training_plan_id
      WHERE exercises.id = exercise_sets.exercise_id 
      AND training_plans.user_id = auth.uid()
    )
  );

-- Create secure RLS policies for exercise_observations (through exercise ownership)
CREATE POLICY "Users can view their own exercise observations" ON public.exercise_observations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.exercises 
      JOIN public.training_days ON training_days.id = exercises.training_day_id
      JOIN public.training_weeks ON training_weeks.id = training_days.training_week_id
      JOIN public.training_plans ON training_plans.id = training_weeks.training_plan_id
      WHERE exercises.id = exercise_observations.exercise_id 
      AND training_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create exercise observations for their exercises" ON public.exercise_observations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.exercises 
      JOIN public.training_days ON training_days.id = exercises.training_day_id
      JOIN public.training_weeks ON training_weeks.id = training_days.training_week_id
      JOIN public.training_plans ON training_plans.id = training_weeks.training_plan_id
      WHERE exercises.id = exercise_observations.exercise_id 
      AND training_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own exercise observations" ON public.exercise_observations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.exercises 
      JOIN public.training_days ON training_days.id = exercises.training_day_id
      JOIN public.training_weeks ON training_weeks.id = training_days.training_week_id
      JOIN public.training_plans ON training_plans.id = training_weeks.training_plan_id
      WHERE exercises.id = exercise_observations.exercise_id 
      AND training_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own exercise observations" ON public.exercise_observations
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.exercises 
      JOIN public.training_days ON training_days.id = exercises.training_day_id
      JOIN public.training_weeks ON training_weeks.id = training_days.training_week_id
      JOIN public.training_plans ON training_plans.id = training_weeks.training_plan_id
      WHERE exercises.id = exercise_observations.exercise_id 
      AND training_plans.user_id = auth.uid()
    )
  );

-- Fix the update_updated_at_column function security
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;