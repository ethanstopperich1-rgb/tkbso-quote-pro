-- Add quartz slab material allowance (Level 1 at $1000 per slab)
ALTER TABLE public.pricing_configs 
ADD COLUMN IF NOT EXISTS quartz_slab_level1_allowance_cp numeric DEFAULT 1000;