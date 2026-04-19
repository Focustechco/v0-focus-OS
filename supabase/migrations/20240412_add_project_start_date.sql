-- Add data_inicio to projects table
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS data_inicio DATE;

-- Update existing records with a default value (e.g., created_at date)
UPDATE public.projects SET data_inicio = created_at::date WHERE data_inicio IS NULL;

-- Ensure delivery_date is used as data_fim in our logic
-- No changes needed to delivery_date column itself.
