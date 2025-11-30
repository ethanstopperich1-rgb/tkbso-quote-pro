-- Add material allowance fields to pricing_configs
ALTER TABLE public.pricing_configs 
  ADD COLUMN IF NOT EXISTS tile_material_allowance_cp_per_sqft numeric DEFAULT 7.85,
  ADD COLUMN IF NOT EXISTS plumbing_fixture_allowance_cp numeric DEFAULT 1350,
  ADD COLUMN IF NOT EXISTS mirror_lighting_allowance_cp numeric DEFAULT 800;