-- Add new flooring and structure fields
ALTER TABLE public.pricing_configs 
ADD COLUMN IF NOT EXISTS lvp_ic_per_sqft numeric DEFAULT 2.5,
ADD COLUMN IF NOT EXISTS lvp_cp_per_sqft numeric DEFAULT 4.5,
ADD COLUMN IF NOT EXISTS barrier_ic_per_sqft numeric DEFAULT 1.0,
ADD COLUMN IF NOT EXISTS barrier_cp_per_sqft numeric DEFAULT 2.0,
ADD COLUMN IF NOT EXISTS floor_leveling_ls_ic numeric DEFAULT 500,
ADD COLUMN IF NOT EXISTS floor_leveling_ls_cp numeric DEFAULT 850,
ADD COLUMN IF NOT EXISTS niche_ic_each numeric DEFAULT 300,
ADD COLUMN IF NOT EXISTS niche_cp_each numeric DEFAULT 550;