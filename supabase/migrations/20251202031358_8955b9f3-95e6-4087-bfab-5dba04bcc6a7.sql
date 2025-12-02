-- Update pricing_configs to match Estimaitor PRD structure
-- This migration replaces TKBSO pricing structure with Estimaitor's margin-based approach

-- Add new columns for Estimaitor pricing structure
ALTER TABLE pricing_configs 
ADD COLUMN IF NOT EXISTS bathroom_target_margin numeric DEFAULT 0.41,
ADD COLUMN IF NOT EXISTS kitchen_target_margin numeric DEFAULT 0.38,
ADD COLUMN IF NOT EXISTS framing_margin numeric DEFAULT 0.54,
ADD COLUMN IF NOT EXISTS plumbing_standard_margin numeric DEFAULT 0.52,
ADD COLUMN IF NOT EXISTS wall_tile_labor_margin numeric DEFAULT 0.47,
ADD COLUMN IF NOT EXISTS waterproofing_margin numeric DEFAULT 0.44,
ADD COLUMN IF NOT EXISTS demo_haul_margin numeric DEFAULT 0.40,
ADD COLUMN IF NOT EXISTS electrical_margin numeric DEFAULT 0.38,
ADD COLUMN IF NOT EXISTS quartz_countertop_margin numeric DEFAULT 0.35;

-- Update existing records with Estimaitor default margins
UPDATE pricing_configs
SET 
  bathroom_target_margin = 0.41,
  kitchen_target_margin = 0.38,
  framing_margin = 0.54,
  plumbing_standard_margin = 0.52,
  wall_tile_labor_margin = 0.47,
  waterproofing_margin = 0.44,
  demo_haul_margin = 0.40,
  electrical_margin = 0.38,
  quartz_countertop_margin = 0.35;

COMMENT ON COLUMN pricing_configs.bathroom_target_margin IS 'Estimaitor target margin for bathroom projects (default 41%)';
COMMENT ON COLUMN pricing_configs.kitchen_target_margin IS 'Estimaitor target margin for kitchen projects (default 38%)';
COMMENT ON COLUMN pricing_configs.framing_margin IS 'Estimaitor margin for framing & carpentry work (default 54%)';
COMMENT ON COLUMN pricing_configs.plumbing_standard_margin IS 'Estimaitor margin for standard plumbing work (default 52%)';
COMMENT ON COLUMN pricing_configs.wall_tile_labor_margin IS 'Estimaitor margin for wall tile labor (default 47%)';
COMMENT ON COLUMN pricing_configs.waterproofing_margin IS 'Estimaitor margin for waterproofing work (default 44%)';
COMMENT ON COLUMN pricing_configs.demo_haul_margin IS 'Estimaitor margin for demo & haul-off (default 40%)';
COMMENT ON COLUMN pricing_configs.electrical_margin IS 'Estimaitor margin for electrical work (default 38%)';
COMMENT ON COLUMN pricing_configs.quartz_countertop_margin IS 'Estimaitor margin for quartz countertops (default 35%)';