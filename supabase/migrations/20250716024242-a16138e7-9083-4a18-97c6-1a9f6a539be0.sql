-- Create diets table
CREATE TABLE public.diets (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create diet_meals table (refeições)
CREATE TABLE public.diet_meals (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    diet_id UUID NOT NULL,
    name TEXT NOT NULL,
    order_number INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create diet_meal_foods table (alimentos de cada refeição)
CREATE TABLE public.diet_meal_foods (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    diet_meal_id UUID NOT NULL,
    food_name TEXT NOT NULL,
    quantity TEXT NOT NULL,
    protein_animal NUMERIC DEFAULT 0,
    protein_vegetable NUMERIC DEFAULT 0,
    carbs NUMERIC DEFAULT 0,
    fat NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.diets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diet_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diet_meal_foods ENABLE ROW LEVEL SECURITY;

-- Create policies for diets
CREATE POLICY "Allow all access to diets" ON public.diets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to diet_meals" ON public.diet_meals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to diet_meal_foods" ON public.diet_meal_foods FOR ALL USING (true) WITH CHECK (true);

-- Add foreign key constraints
ALTER TABLE public.diet_meals ADD CONSTRAINT diet_meals_diet_id_fkey FOREIGN KEY (diet_id) REFERENCES public.diets(id) ON DELETE CASCADE;
ALTER TABLE public.diet_meal_foods ADD CONSTRAINT diet_meal_foods_diet_meal_id_fkey FOREIGN KEY (diet_meal_id) REFERENCES public.diet_meals(id) ON DELETE CASCADE;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_diets_updated_at
    BEFORE UPDATE ON public.diets
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_diet_meals_updated_at
    BEFORE UPDATE ON public.diet_meals
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_diet_meal_foods_updated_at
    BEFORE UPDATE ON public.diet_meal_foods
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();