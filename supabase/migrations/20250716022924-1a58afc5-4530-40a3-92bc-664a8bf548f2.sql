-- Adicionar campos de data e status ao training_plans
ALTER TABLE public.training_plans 
ADD COLUMN start_date DATE,
ADD COLUMN end_date DATE,
ADD COLUMN is_expired BOOLEAN NOT NULL DEFAULT false;

-- Atualizar planos existentes para ter start_date como hoje e end_date calculada
UPDATE public.training_plans 
SET 
  start_date = CURRENT_DATE,
  end_date = CURRENT_DATE + (total_weeks * 7),
  is_expired = false
WHERE start_date IS NULL;