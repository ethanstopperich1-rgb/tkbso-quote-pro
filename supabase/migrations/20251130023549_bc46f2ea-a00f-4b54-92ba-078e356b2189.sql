-- Add comprehensive material allowances and additional packages to pricing_configs

ALTER TABLE public.pricing_configs 
  -- Material Allowances (client-facing)
  ADD COLUMN IF NOT EXISTS tile_material_allowance_cp_per_sqft numeric DEFAULT 7.85,
  ADD COLUMN IF NOT EXISTS plumbing_fixture_allowance_cp numeric DEFAULT 1350,
  ADD COLUMN IF NOT EXISTS mirror_allowance_cp numeric DEFAULT 500,
  ADD COLUMN IF NOT EXISTS lighting_fixture_allowance_cp numeric DEFAULT 400,
  ADD COLUMN IF NOT EXISTS hardware_allowance_per_pull_cp numeric DEFAULT 15,
  ADD COLUMN IF NOT EXISTS toilet_allowance_cp numeric DEFAULT 450,
  ADD COLUMN IF NOT EXISTS sink_faucet_allowance_cp numeric DEFAULT 350,
  
  -- Dumpster/Haul
  ADD COLUMN IF NOT EXISTS dumpster_bath_ic numeric DEFAULT 400,
  ADD COLUMN IF NOT EXISTS dumpster_bath_cp numeric DEFAULT 750,
  ADD COLUMN IF NOT EXISTS dumpster_kitchen_ic numeric DEFAULT 825,
  ADD COLUMN IF NOT EXISTS dumpster_kitchen_cp numeric DEFAULT 1400,
  
  -- Additional Plumbing Packages
  ADD COLUMN IF NOT EXISTS plumbing_tub_to_shower_ic numeric DEFAULT 2550,
  ADD COLUMN IF NOT EXISTS plumbing_tub_to_shower_cp numeric DEFAULT 4200,
  ADD COLUMN IF NOT EXISTS plumbing_smart_valve_ic numeric DEFAULT 1350,
  ADD COLUMN IF NOT EXISTS plumbing_smart_valve_cp numeric DEFAULT 2450,
  ADD COLUMN IF NOT EXISTS plumbing_linear_drain_ic numeric DEFAULT 750,
  ADD COLUMN IF NOT EXISTS plumbing_linear_drain_cp numeric DEFAULT 1550,
  ADD COLUMN IF NOT EXISTS plumbing_toilet_relocation_cp numeric DEFAULT 950,
  
  -- Framing & Structure
  ADD COLUMN IF NOT EXISTS framing_standard_ic numeric DEFAULT 550,
  ADD COLUMN IF NOT EXISTS framing_standard_cp numeric DEFAULT 1200,
  ADD COLUMN IF NOT EXISTS framing_pony_wall_ic numeric DEFAULT 450,
  ADD COLUMN IF NOT EXISTS framing_pony_wall_cp numeric DEFAULT 850,
  
  -- Floor Prep/Leveling
  ADD COLUMN IF NOT EXISTS floor_leveling_small_ic numeric DEFAULT 300,
  ADD COLUMN IF NOT EXISTS floor_leveling_small_cp numeric DEFAULT 500,
  ADD COLUMN IF NOT EXISTS floor_leveling_bath_ic numeric DEFAULT 550,
  ADD COLUMN IF NOT EXISTS floor_leveling_bath_cp numeric DEFAULT 900,
  ADD COLUMN IF NOT EXISTS floor_leveling_kitchen_ic numeric DEFAULT 900,
  ADD COLUMN IF NOT EXISTS floor_leveling_kitchen_cp numeric DEFAULT 1450,
  
  -- Additional Electrical
  ADD COLUMN IF NOT EXISTS electrical_microwave_circuit_cp numeric DEFAULT 550,
  ADD COLUMN IF NOT EXISTS electrical_hood_relocation_cp numeric DEFAULT 550,
  ADD COLUMN IF NOT EXISTS electrical_dishwasher_disposal_cp numeric DEFAULT 465,
  
  -- Additional Glass
  ADD COLUMN IF NOT EXISTS glass_90_return_ic numeric DEFAULT 1425,
  ADD COLUMN IF NOT EXISTS glass_90_return_cp numeric DEFAULT 2775,
  
  -- Additional Vanity/Counter
  ADD COLUMN IF NOT EXISTS vanity_only_48_cp numeric DEFAULT 1550,
  ADD COLUMN IF NOT EXISTS quartz_sink_cutout_cp numeric DEFAULT 250,
  ADD COLUMN IF NOT EXISTS quartz_faucet_drill_cp numeric DEFAULT 150;