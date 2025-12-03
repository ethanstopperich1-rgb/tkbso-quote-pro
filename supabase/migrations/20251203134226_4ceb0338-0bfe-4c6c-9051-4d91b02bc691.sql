-- Add management fee fields to pricing_configs (default rate)
ALTER TABLE public.pricing_configs
ADD COLUMN IF NOT EXISTS management_fee_percent numeric DEFAULT 0.15;

-- Add management fee fields to estimates (per-project toggle)
ALTER TABLE public.estimates
ADD COLUMN IF NOT EXISTS include_management_fee boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS management_fee_percent numeric DEFAULT 0.15,
ADD COLUMN IF NOT EXISTS management_fee_ic numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS management_fee_cp numeric DEFAULT 0;