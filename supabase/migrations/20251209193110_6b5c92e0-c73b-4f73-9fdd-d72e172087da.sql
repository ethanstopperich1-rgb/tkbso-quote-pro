-- Add missing pricing config columns for demo, site protection, disposal, etc.
ALTER TABLE public.pricing_configs
  -- Site Protection & Setup
  ADD COLUMN IF NOT EXISTS floor_protection_ramboard_sqft_ic numeric DEFAULT 0.5,
  ADD COLUMN IF NOT EXISTS floor_protection_ramboard_sqft_cp numeric DEFAULT 1.0,
  ADD COLUMN IF NOT EXISTS dust_barrier_zipwall_ic numeric DEFAULT 150,
  ADD COLUMN IF NOT EXISTS dust_barrier_zipwall_cp numeric DEFAULT 300,
  ADD COLUMN IF NOT EXISTS air_scrubber_weekly_ic numeric DEFAULT 200,
  ADD COLUMN IF NOT EXISTS air_scrubber_weekly_cp numeric DEFAULT 350,
  ADD COLUMN IF NOT EXISTS furniture_moving_hourly_ic numeric DEFAULT 45,
  ADD COLUMN IF NOT EXISTS furniture_moving_hourly_cp numeric DEFAULT 85,
  
  -- Standard Demolition
  ADD COLUMN IF NOT EXISTS demo_kitchen_standard_ic numeric DEFAULT 800,
  ADD COLUMN IF NOT EXISTS demo_kitchen_standard_cp numeric DEFAULT 1500,
  ADD COLUMN IF NOT EXISTS demo_bath_standard_ic numeric DEFAULT 600,
  ADD COLUMN IF NOT EXISTS demo_bath_standard_cp numeric DEFAULT 1200,
  ADD COLUMN IF NOT EXISTS demo_soffit_lf_ic numeric DEFAULT 15,
  ADD COLUMN IF NOT EXISTS demo_soffit_lf_cp numeric DEFAULT 30,
  ADD COLUMN IF NOT EXISTS demo_cabinet_deconstruct_ic numeric DEFAULT 500,
  ADD COLUMN IF NOT EXISTS demo_cabinet_deconstruct_cp numeric DEFAULT 900,
  
  -- Heavy/Difficult Demo
  ADD COLUMN IF NOT EXISTS demo_tile_mudset_sqft_ic numeric DEFAULT 6,
  ADD COLUMN IF NOT EXISTS demo_tile_mudset_sqft_cp numeric DEFAULT 12,
  ADD COLUMN IF NOT EXISTS demo_castiron_tub_ic numeric DEFAULT 250,
  ADD COLUMN IF NOT EXISTS demo_castiron_tub_cp numeric DEFAULT 500,
  ADD COLUMN IF NOT EXISTS demo_glueddown_sqft_ic numeric DEFAULT 4,
  ADD COLUMN IF NOT EXISTS demo_glueddown_sqft_cp numeric DEFAULT 8,
  ADD COLUMN IF NOT EXISTS demo_popcorn_ceiling_sqft_ic numeric DEFAULT 3.5,
  ADD COLUMN IF NOT EXISTS demo_popcorn_ceiling_sqft_cp numeric DEFAULT 7,
  
  -- Disposal & Logistics
  ADD COLUMN IF NOT EXISTS dumpster_20yd_ic numeric DEFAULT 550,
  ADD COLUMN IF NOT EXISTS dumpster_20yd_cp numeric DEFAULT 750,
  ADD COLUMN IF NOT EXISTS liveload_haul_ic numeric DEFAULT 400,
  ADD COLUMN IF NOT EXISTS liveload_haul_cp numeric DEFAULT 700,
  ADD COLUMN IF NOT EXISTS difficult_access_fee_ic numeric DEFAULT 300,
  ADD COLUMN IF NOT EXISTS difficult_access_fee_cp numeric DEFAULT 600;