-- Create weight entries table for tracking user weight over time
CREATE TABLE IF NOT EXISTS public.weight_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  weight NUMERIC(6,2) NOT NULL,
  recorded_at DATE NOT NULL DEFAULT (now()::date),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.weight_entries ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own weight entries"
ON public.weight_entries
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own weight entries"
ON public.weight_entries
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own weight entries"
ON public.weight_entries
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own weight entries"
ON public.weight_entries
FOR DELETE
USING (auth.uid() = user_id);

-- Trigger to maintain updated_at
CREATE TRIGGER update_weight_entries_updated_at
BEFORE UPDATE ON public.weight_entries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Helpful index
CREATE INDEX IF NOT EXISTS idx_weight_entries_user_date
  ON public.weight_entries (user_id, recorded_at);
