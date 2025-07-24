-- Create table for tracking daily food consumption
CREATE TABLE public.diet_food_consumption (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    diet_id UUID NOT NULL,
    diet_meal_food_id UUID NOT NULL,
    consumption_date DATE NOT NULL,
    is_consumed BOOLEAN NOT NULL DEFAULT false,
    consumed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, diet_meal_food_id, consumption_date)
);

-- Enable Row Level Security
ALTER TABLE public.diet_food_consumption ENABLE ROW LEVEL SECURITY;

-- Create policies for diet food consumption
CREATE POLICY "Users can view their own food consumption" 
ON public.diet_food_consumption 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own food consumption" 
ON public.diet_food_consumption 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own food consumption" 
ON public.diet_food_consumption 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own food consumption" 
ON public.diet_food_consumption 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add foreign key constraints
ALTER TABLE public.diet_food_consumption 
ADD CONSTRAINT diet_food_consumption_diet_id_fkey 
FOREIGN KEY (diet_id) REFERENCES public.diets(id) ON DELETE CASCADE;

ALTER TABLE public.diet_food_consumption 
ADD CONSTRAINT diet_food_consumption_diet_meal_food_id_fkey 
FOREIGN KEY (diet_meal_food_id) REFERENCES public.diet_meal_foods(id) ON DELETE CASCADE;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_diet_food_consumption_updated_at
    BEFORE UPDATE ON public.diet_food_consumption
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_diet_food_consumption_user_date ON public.diet_food_consumption(user_id, consumption_date);
CREATE INDEX idx_diet_food_consumption_diet_date ON public.diet_food_consumption(diet_id, consumption_date);