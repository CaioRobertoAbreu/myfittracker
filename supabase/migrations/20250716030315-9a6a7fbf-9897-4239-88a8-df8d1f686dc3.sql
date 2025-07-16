-- Add start_date and is_expired fields to diets table
ALTER TABLE public.diets 
ADD COLUMN start_date DATE,
ADD COLUMN is_expired BOOLEAN NOT NULL DEFAULT false;