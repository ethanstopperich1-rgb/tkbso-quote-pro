-- Add new pricing columns for TKBSO trade allowances
-- Waterproofing
ALTER TABLE pricing_configs ADD COLUMN IF NOT EXISTS waterproofing_ic_per_sqft numeric DEFAULT 5;
ALTER TABLE pricing_configs ADD COLUMN IF NOT EXISTS waterproofing_cp_per_sqft numeric DEFAULT 8;

-- Demo packages (fixed costs)
ALTER TABLE pricing_configs ADD COLUMN IF NOT EXISTS demo_shower_only_ic numeric DEFAULT 800;
ALTER TABLE pricing_configs ADD COLUMN IF NOT EXISTS demo_shower_only_cp numeric DEFAULT 1300;
ALTER TABLE pricing_configs ADD COLUMN IF NOT EXISTS demo_small_bath_ic numeric DEFAULT 1100;
ALTER TABLE pricing_configs ADD COLUMN IF NOT EXISTS demo_small_bath_cp numeric DEFAULT 1800;
ALTER TABLE pricing_configs ADD COLUMN IF NOT EXISTS demo_large_bath_ic numeric DEFAULT 1500;
ALTER TABLE pricing_configs ADD COLUMN IF NOT EXISTS demo_large_bath_cp numeric DEFAULT 2400;
ALTER TABLE pricing_configs ADD COLUMN IF NOT EXISTS demo_kitchen_ic numeric DEFAULT 1400;
ALTER TABLE pricing_configs ADD COLUMN IF NOT EXISTS demo_kitchen_cp numeric DEFAULT 2250;

-- Plumbing packages (fixed costs)
ALTER TABLE pricing_configs ADD COLUMN IF NOT EXISTS plumbing_shower_standard_ic numeric DEFAULT 1800;
ALTER TABLE pricing_configs ADD COLUMN IF NOT EXISTS plumbing_shower_standard_cp numeric DEFAULT 2900;
ALTER TABLE pricing_configs ADD COLUMN IF NOT EXISTS plumbing_extra_head_ic numeric DEFAULT 450;
ALTER TABLE pricing_configs ADD COLUMN IF NOT EXISTS plumbing_extra_head_cp numeric DEFAULT 725;
ALTER TABLE pricing_configs ADD COLUMN IF NOT EXISTS plumbing_tub_freestanding_ic numeric DEFAULT 2400;
ALTER TABLE pricing_configs ADD COLUMN IF NOT EXISTS plumbing_tub_freestanding_cp numeric DEFAULT 3900;
ALTER TABLE pricing_configs ADD COLUMN IF NOT EXISTS plumbing_toilet_ic numeric DEFAULT 350;
ALTER TABLE pricing_configs ADD COLUMN IF NOT EXISTS plumbing_toilet_cp numeric DEFAULT 565;

-- Electrical packages
ALTER TABLE pricing_configs ADD COLUMN IF NOT EXISTS electrical_vanity_light_ic numeric DEFAULT 200;
ALTER TABLE pricing_configs ADD COLUMN IF NOT EXISTS electrical_vanity_light_cp numeric DEFAULT 325;
ALTER TABLE pricing_configs ADD COLUMN IF NOT EXISTS electrical_small_package_ic numeric DEFAULT 250;
ALTER TABLE pricing_configs ADD COLUMN IF NOT EXISTS electrical_small_package_cp numeric DEFAULT 400;
ALTER TABLE pricing_configs ADD COLUMN IF NOT EXISTS electrical_kitchen_package_ic numeric DEFAULT 950;
ALTER TABLE pricing_configs ADD COLUMN IF NOT EXISTS electrical_kitchen_package_cp numeric DEFAULT 1550;

-- Paint packages
ALTER TABLE pricing_configs ADD COLUMN IF NOT EXISTS paint_patch_bath_ic numeric DEFAULT 600;
ALTER TABLE pricing_configs ADD COLUMN IF NOT EXISTS paint_patch_bath_cp numeric DEFAULT 1000;
ALTER TABLE pricing_configs ADD COLUMN IF NOT EXISTS paint_full_bath_ic numeric DEFAULT 1000;
ALTER TABLE pricing_configs ADD COLUMN IF NOT EXISTS paint_full_bath_cp numeric DEFAULT 1600;

-- Glass packages (fixed costs for standard sizes)
ALTER TABLE pricing_configs ADD COLUMN IF NOT EXISTS glass_shower_standard_ic numeric DEFAULT 1200;
ALTER TABLE pricing_configs ADD COLUMN IF NOT EXISTS glass_shower_standard_cp numeric DEFAULT 2000;
ALTER TABLE pricing_configs ADD COLUMN IF NOT EXISTS glass_panel_only_ic numeric DEFAULT 800;
ALTER TABLE pricing_configs ADD COLUMN IF NOT EXISTS glass_panel_only_cp numeric DEFAULT 1300;

-- Vanity bundles (fixed costs)
ALTER TABLE pricing_configs ADD COLUMN IF NOT EXISTS vanity_48_bundle_ic numeric DEFAULT 1600;
ALTER TABLE pricing_configs ADD COLUMN IF NOT EXISTS vanity_48_bundle_cp numeric DEFAULT 2600;
ALTER TABLE pricing_configs ADD COLUMN IF NOT EXISTS vanity_60_bundle_ic numeric DEFAULT 2200;
ALTER TABLE pricing_configs ADD COLUMN IF NOT EXISTS vanity_60_bundle_cp numeric DEFAULT 3500;

-- Update existing rates to match TKBSO standards
UPDATE pricing_configs SET
  -- Tile rates (IC based on what TKBSO pays subs)
  tile_wall_ic_per_sqft = 21,
  tile_wall_cp_per_sqft = 34,
  tile_floor_ic_per_sqft = 4.5,
  tile_floor_cp_per_sqft = 7.25,
  tile_shower_floor_ic_per_sqft = 5,
  tile_shower_floor_cp_per_sqft = 8,
  
  -- Cement board
  cement_board_ic_per_sqft = 3,
  cement_board_cp_per_sqft = 4.85,
  
  -- Quartz
  quartz_ic_per_sqft = 15,
  quartz_cp_per_sqft = 50,
  
  -- Lighting
  recessed_can_ic_each = 65,
  recessed_can_cp_each = 110,
  
  -- Glass (per sqft fallback)
  frameless_glass_ic_per_sqft = 45,
  frameless_glass_cp_per_sqft = 75,
  
  -- Minimums (realistic for tile jobs)
  min_job_ic = 8000,
  min_job_cp = 13000,
  
  -- Target margin
  target_margin = 0.38,
  
  -- Update bath/kitchen per-sqft for sanity checks (not primary calculation)
  bath_ic_per_sqft = 230,
  bath_cp_per_sqft = 370,
  kitchen_ic_per_sqft = 115,
  kitchen_cp_per_sqft = 185
WHERE true;

-- Add job state columns for tracking included scopes
ALTER TABLE estimates ADD COLUMN IF NOT EXISTS include_demo boolean DEFAULT true;
ALTER TABLE estimates ADD COLUMN IF NOT EXISTS include_plumbing boolean DEFAULT true;
ALTER TABLE estimates ADD COLUMN IF NOT EXISTS include_electrical boolean DEFAULT false;
ALTER TABLE estimates ADD COLUMN IF NOT EXISTS include_paint boolean DEFAULT false;
ALTER TABLE estimates ADD COLUMN IF NOT EXISTS include_glass boolean DEFAULT false;
ALTER TABLE estimates ADD COLUMN IF NOT EXISTS include_waterproofing boolean DEFAULT true;
ALTER TABLE estimates ADD COLUMN IF NOT EXISTS num_toilets integer DEFAULT 0;
ALTER TABLE estimates ADD COLUMN IF NOT EXISTS num_vanity_lights integer DEFAULT 0;
ALTER TABLE estimates ADD COLUMN IF NOT EXISTS glass_type text DEFAULT 'none';
ALTER TABLE estimates ADD COLUMN IF NOT EXISTS vanity_size text DEFAULT 'none';

-- Demo/plumbing/paint IC/CP tracking
ALTER TABLE estimates ADD COLUMN IF NOT EXISTS demo_ic_total numeric DEFAULT 0;
ALTER TABLE estimates ADD COLUMN IF NOT EXISTS demo_cp_total numeric DEFAULT 0;
ALTER TABLE estimates ADD COLUMN IF NOT EXISTS plumbing_ic_total numeric DEFAULT 0;
ALTER TABLE estimates ADD COLUMN IF NOT EXISTS plumbing_cp_total numeric DEFAULT 0;
ALTER TABLE estimates ADD COLUMN IF NOT EXISTS waterproofing_ic_total numeric DEFAULT 0;
ALTER TABLE estimates ADD COLUMN IF NOT EXISTS waterproofing_cp_total numeric DEFAULT 0;
ALTER TABLE estimates ADD COLUMN IF NOT EXISTS paint_ic_total numeric DEFAULT 0;
ALTER TABLE estimates ADD COLUMN IF NOT EXISTS paint_cp_total numeric DEFAULT 0;