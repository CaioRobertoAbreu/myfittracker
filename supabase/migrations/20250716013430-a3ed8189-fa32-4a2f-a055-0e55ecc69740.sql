-- Create training plans table
CREATE TABLE public.training_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  total_weeks INTEGER NOT NULL,
  current_week INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create training weeks table
CREATE TABLE public.training_weeks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  training_plan_id UUID NOT NULL REFERENCES public.training_plans(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  is_deload BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create training days table
CREATE TABLE public.training_days (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  training_week_id UUID NOT NULL REFERENCES public.training_weeks(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create exercises table
CREATE TABLE public.exercises (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  training_day_id UUID NOT NULL REFERENCES public.training_days(id) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL, -- original exercise ID from mock data
  name TEXT NOT NULL,
  sets INTEGER NOT NULL,
  reps TEXT NOT NULL,
  rpe INTEGER NOT NULL,
  progression_type TEXT NOT NULL,
  technique TEXT,
  technique_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create exercise sets table (performed sets)
CREATE TABLE public.exercise_sets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  set_number INTEGER NOT NULL,
  weight DECIMAL(5,2),
  reps INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create exercise observations table
CREATE TABLE public.exercise_observations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  observations TEXT,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(exercise_id, week_number)
);

-- Enable Row Level Security
ALTER TABLE public.training_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_observations ENABLE ROW LEVEL SECURITY;

-- Create policies for user access (temporarily allow all access for testing)
CREATE POLICY "Allow all access to training_plans" ON public.training_plans FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to training_weeks" ON public.training_weeks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to training_days" ON public.training_days FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to exercises" ON public.exercises FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to exercise_sets" ON public.exercise_sets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to exercise_observations" ON public.exercise_observations FOR ALL USING (true) WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_training_plans_updated_at
  BEFORE UPDATE ON public.training_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_training_weeks_updated_at
  BEFORE UPDATE ON public.training_weeks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_training_days_updated_at
  BEFORE UPDATE ON public.training_days
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_exercises_updated_at
  BEFORE UPDATE ON public.exercises
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_exercise_sets_updated_at
  BEFORE UPDATE ON public.exercise_sets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_exercise_observations_updated_at
  BEFORE UPDATE ON public.exercise_observations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_training_weeks_plan_id ON public.training_weeks(training_plan_id);
CREATE INDEX idx_training_days_week_id ON public.training_days(training_week_id);
CREATE INDEX idx_exercises_day_id ON public.exercises(training_day_id);
CREATE INDEX idx_exercise_sets_exercise_week ON public.exercise_sets(exercise_id, week_number);
CREATE INDEX idx_exercise_observations_exercise_week ON public.exercise_observations(exercise_id, week_number);