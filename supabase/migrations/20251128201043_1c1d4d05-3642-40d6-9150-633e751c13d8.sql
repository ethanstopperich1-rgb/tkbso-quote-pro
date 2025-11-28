-- Add payment split fields to pricing_configs
ALTER TABLE public.pricing_configs 
ADD COLUMN IF NOT EXISTS payment_split_deposit NUMERIC DEFAULT 0.65,
ADD COLUMN IF NOT EXISTS payment_split_progress NUMERIC DEFAULT 0.25,
ADD COLUMN IF NOT EXISTS payment_split_final NUMERIC DEFAULT 0.10;